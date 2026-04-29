import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { leadsAPI, recommendationsAPI } from '../services/api';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const DashboardPage = () => {
  const { user, company } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, recommendationsRes] = await Promise.all([
        leadsAPI.getAnalytics(30),
        recommendationsAPI.getAll(),
      ]);
      setAnalytics(analyticsRes.data);
      setRecommendations(recommendationsRes.data.results || recommendationsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.first_name}!</p>
        <p className="text-sm text-gray-500 mt-2">{company?.name}</p>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Leads', value: analytics.total_leads, color: 'blue' },
            { label: 'Hot Leads', value: analytics.hot_leads, color: 'red' },
            { label: 'Warm Leads', value: analytics.warm_leads, color: 'yellow' },
            { label: 'Cold Leads', value: analytics.cold_leads, color: 'gray' },
          ].map((metric) => (
            <div key={metric.label} className={`bg-${metric.color}-50 rounded-lg p-6 border-l-4 border-${metric.color}-500`}>
              <p className="text-sm font-medium text-gray-600">{metric.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{metric.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {['overview', 'analytics', 'recommendations'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && analytics && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Distribution by Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(analytics.by_status).map(([status, count]) => ({
                    status: status.charAt(0).toUpperCase() + status.slice(1),
                    count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.avg_score?.toFixed(1) || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{(analytics.avg_conversion_rate * 100)?.toFixed(1) || 0}%</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Recommendations</h3>
              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                          <p className="text-xs text-gray-500 mt-2">Confidence: {(rec.confidence_score * 100)?.toFixed(0)}%</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          rec.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {rec.priority_display}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => {/* Action handler */}}
                          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          Action
                        </button>
                        <button
                          onClick={() => {/* Dismiss handler */}}
                          className="text-sm bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No active recommendations</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
