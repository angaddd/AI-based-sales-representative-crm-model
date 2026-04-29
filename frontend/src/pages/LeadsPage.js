import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadsAPI, companyUsersAPI } from '../services/api';

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ temperature: '', status: '' });
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, [filters]);

  const fetchLeads = async () => {
    try {
      const res = await leadsAPI.getAll(filters);
      setLeads(res.data.results || res.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await companyUsersAPI.getAll();
      setUsers(res.data.results || res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAssign = async (leadId, userId) => {
    try {
      await leadsAPI.assign(leadId, userId);
      fetchLeads();
    } catch (error) {
      console.error('Error assigning lead:', error);
    }
  };

  const getTemperatureColor = (temperature) => {
    switch (temperature) {
      case 'hot':
        return 'bg-red-100 text-red-800';
      case 'warm':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
        <p className="text-gray-600 mt-1">{leads.length} total leads</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Temperature</label>
            <select
              value={filters.temperature}
              onChange={(e) => setFilters({ ...filters, temperature: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Temp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visits</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{lead.full_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{lead.email}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{lead.score}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTemperatureColor(lead.temperature)}`}>
                    {lead.temperature_display}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{lead.total_visits}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {lead.assigned_to_display?.user_first_name} {lead.assigned_to_display?.user_last_name}
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadsPage;
