'use client';

import React, { useState, useEffect } from 'react';
import api from '../../api';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import ProtectedRoute from '../../components/ProtectedRoute';

function LeaderboardsContent() {
  useDocumentMetadata({
    title: 'Leaderboards & Rankings',
    description: 'See how you rank against other members in workouts, streak duration, and overall fitness consistency.'
  });

  const [scope, setScope] = useState('national');
  const [category, setCategory] = useState('fat_loss');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [scope, category]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/leaderboards/${scope}/${category}`);
      const data = response.data;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.leaderboard)
          ? data.leaderboard
          : Array.isArray(data?.data)
            ? data.data
            : [];
      setLeaderboard(list);
    } catch (error) {
      console.error('Error:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🏆 Leaderboards</h1>
        <p className="text-gray-600 mb-8">Compete and rank against others</p>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scope</label>
              <select
                id="leaderboard-scope"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="national">National</option>
                <option value="city">City</option>
                <option value="college">College</option>
                <option value="company">Company</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                id="leaderboard-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="fat_loss">Top Fat Loss</option>
                <option value="muscle_gain">Top Muscle Gain</option>
                <option value="consistency">Most Consistent</option>
                <option value="streak">Longest Streak</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Rank</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">City</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Score</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-600">
                    Loading...
                  </td>
                </tr>
              ) : leaderboard.length > 0 ? (
                leaderboard.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-lg font-bold text-blue-600">#{idx + 1}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{entry.user_name}</td>
                    <td className="px-6 py-4 text-gray-600">{entry.city || 'N/A'}</td>
                    <td className="px-6 py-4 text-lg font-bold">{entry.score}</td>
                    <td className="px-6 py-4 text-green-600 font-semibold">{entry.progress}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-600">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function Leaderboards() {
  return (
    <ProtectedRoute>
      <LeaderboardsContent />
    </ProtectedRoute>
  );
}
