import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { leadsAPI } from '../services/api';

const LeadDetailPage = () => {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      const res = await leadsAPI.getOne(id);
      setLead(res.data);
    } catch (error) {
      console.error('Error fetching lead:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!lead) {
    return <div className="text-center py-8">Lead not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{lead.full_name}</h1>
            <p className="text-gray-600 mt-1">{lead.email}</p>
            {lead.phone && <p className="text-gray-600">{lead.phone}</p>}
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-gray-900">{lead.score}</p>
            <p className="text-sm text-gray-600">Lead Score</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
              lead.temperature === 'hot' ? 'bg-red-100 text-red-800' :
              lead.temperature === 'warm' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {lead.temperature_display}
            </span>
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Visits</p>
          <p className="text-3xl font-bold text-gray-900">{lead.total_visits}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Clicks</p>
          <p className="text-3xl font-bold text-gray-900">{lead.total_clicks}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Time Spent</p>
          <p className="text-3xl font-bold text-gray-900">{Math.round(lead.time_spent_seconds / 60)}m</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Conversion Rate</p>
          <p className="text-3xl font-bold text-gray-900">{(lead.conversion_rate * 100).toFixed(0)}%</p>
        </div>
      </div>

      {/* Timeline of Events */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Timeline</h2>
        <div className="space-y-4">
          {lead.events && lead.events.length > 0 ? (
            lead.events.map((event) => (
              <div key={event.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="font-medium text-gray-900">{event.event_type_display}</p>
                {event.element_text && <p className="text-sm text-gray-600">{event.element_text}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No events recorded</p>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {lead.recommendations && lead.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">AI Recommendations</h2>
          <div className="space-y-4">
            {lead.recommendations.map((rec) => (
              <div key={rec.id} className="border border-gray-200 rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                    <p className="text-xs text-gray-500 mt-2">Confidence: {(rec.confidence_score * 100).toFixed(0)}%</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    rec.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {rec.priority_display}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetailPage;
