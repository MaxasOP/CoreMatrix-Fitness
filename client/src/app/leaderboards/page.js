'use client';

import React, { useState, useEffect } from 'react';
import api from '../../api';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import ProtectedRoute from '../../components/ProtectedRoute';

const CATEGORY_ICONS = {
  fat_loss: '🔥',
  muscle_gain: '💪',
  consistency: '📊',
  streak: '⚡',
};

const CATEGORY_LABELS = {
  fat_loss: 'Fat Loss',
  muscle_gain: 'Muscle Gain',
  consistency: 'Consistency',
  streak: 'Streak',
};

const PERIODS = [
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
  { value: 'all_time', label: 'All Time' },
];

const CURRENT_USER_ID = null; // Set from auth context when available

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function PodiumCard({ entry, rank, isCurrentUser }) {
  const podiumStyles = {
    1: {
      borderColor: 'border-yellow-400',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      badgeBg: 'bg-yellow-400',
      badgeText: 'text-yellow-900',
      crown: '👑',
      ringColor: 'ring-yellow-400',
    },
    2: {
      borderColor: 'border-gray-300',
      bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
      badgeBg: 'bg-gray-300',
      badgeText: 'text-gray-800',
      crown: '🥈',
      ringColor: 'ring-gray-300',
    },
    3: {
      borderColor: 'border-amber-600',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-100',
      badgeBg: 'bg-amber-600',
      badgeText: 'text-white',
      crown: '🥉',
      ringColor: 'ring-amber-500',
    },
  };

  const style = podiumStyles[rank] || podiumStyles[3];

  return (
    <div
      className={`relative ${style.bgColor} ${style.borderColor} border-2 rounded-lg shadow-lg p-5 flex flex-col items-center transition-transform hover:scale-105 ${
        isCurrentUser ? 'ring-4 ' + style.ringColor : ''
      }`}
    >
      <div
        className={`absolute -top-3 -left-3 w-8 h-8 ${style.badgeBg} ${style.badgeText} rounded-full flex items-center justify-center font-bold text-sm shadow`}
      >
        {rank}
      </div>
      <div className="text-2xl mb-2">{style.crown}</div>
      <div
        className={`w-14 h-14 ${
          rank === 1 ? 'bg-yellow-200' : rank === 2 ? 'bg-gray-200' : 'bg-amber-200'
        } rounded-full flex items-center justify-center text-lg font-bold text-gray-700 mb-3 ring-2 ${
          style.ringColor
        }`}
      >
        {getInitials(entry.user_name)}
      </div>
      <p className="font-semibold text-gray-900 text-center text-sm truncate w-full">
        {entry.user_name}
      </p>
      {isCurrentUser && (
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1 font-medium">
          You
        </span>
      )}
      <p className="text-xs text-gray-500 mt-1">{entry.city || 'N/A'}</p>
      <div className="mt-3 text-center">
        <p className="text-xl font-bold text-gray-900">{entry.score}</p>
        <p className="text-xs text-green-600 font-medium">{entry.progress}</p>
      </div>
    </div>
  );
}

function EmptyState({ category }) {
  return (
    <div className="bg-white rounded-lg shadow p-12 flex flex-col items-center justify-center text-center">
      <div className="w-32 h-32 mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <svg
          className="w-16 h-16 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">No rankings yet</h3>
      <p className="text-gray-500 max-w-sm">
        Be the first to earn a spot on the <strong>{CATEGORY_LABELS[category]}</strong> leaderboard!
        Start your fitness journey today.
      </p>
      <div className="mt-6 flex gap-3">
        <span className="text-3xl">{CATEGORY_ICONS[category]}</span>
        <span className="text-3xl animate-bounce">{CATEGORY_ICONS[category]}</span>
        <span className="text-3xl">{CATEGORY_ICONS[category]}</span>
      </div>
    </div>
  );
}

function LeaderboardsContent() {
  useDocumentMetadata({
    title: 'Leaderboards & Rankings',
    description: 'See how you rank against other members in workouts, streak duration, and overall fitness consistency.',
  });

  const [scope, setScope] = useState('national');
  const [category, setCategory] = useState('fat_loss');
  const [period, setPeriod] = useState('weekly');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [scope, category, period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/leaderboards/${scope}/${category}?period=${period}`);
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

  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  const isCurrentUser = (entry) => {
    if (!CURRENT_USER_ID) return false;
    return entry.user_id === CURRENT_USER_ID;
  };

  const currentUserData = leaderboard.find(isCurrentUser);
  const currentUserId = leaderboard.findIndex(isCurrentUser);
  const isCurrentUserInTop3 = currentUserId >= 0 && currentUserId < 3;

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🏆 Leaderboards</h1>
        <p className="text-gray-600 mb-8">Compete and rank against others</p>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <option value="fat_loss">🔥 Fat Loss</option>
                <option value="muscle_gain">💪 Muscle Gain</option>
                <option value="consistency">📊 Consistency</option>
                <option value="streak">⚡ Streak</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
              <div className="flex rounded-lg border overflow-hidden">
                {PERIODS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPeriod(p.value)}
                    className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                      period === p.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-12 flex items-center justify-center">
            <div className="flex items-center gap-3 text-gray-500">
              <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span>Loading leaderboard...</span>
            </div>
          </div>
        ) : leaderboard.length === 0 ? (
          <EmptyState category={category} />
        ) : (
          <>
            {/* Podium for Top 3 */}
            {topThree.length >= 3 && (
              <div className="mb-8">
                <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto items-end">
                  {/* 2nd place */}
                  <div className="order-1">
                    <PodiumCard entry={topThree[1]} rank={2} isCurrentUser={isCurrentUser(topThree[1])} />
                  </div>
                  {/* 1st place */}
                  <div className="order-0 md:order-1 lg:order-1 md:-mt-4">
                    <PodiumCard entry={topThree[0]} rank={1} isCurrentUser={isCurrentUser(topThree[0])} />
                  </div>
                  {/* 3rd place */}
                  <div className="order-2">
                    <PodiumCard entry={topThree[2]} rank={3} isCurrentUser={isCurrentUser(topThree[2])} />
                  </div>
                </div>
              </div>
            )}

            {/* Your Rank highlight (if not in top 3) */}
            {currentUserData && !isCurrentUserInTop3 && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg shadow p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">
                      {getInitials(currentUserData.user_name)}
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900">Your Rank</p>
                      <p className="text-sm text-blue-600">{currentUserData.user_name} • {currentUserData.city || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-700">#{currentUserId + 1}</p>
                    <p className="text-sm text-green-600 font-medium">{currentUserData.score} pts</p>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span>{CATEGORY_ICONS[category]}</span>
                  {CATEGORY_LABELS[category]} Rankings
                </h2>
                <span className="text-sm text-gray-500">{leaderboard.length} participants</span>
              </div>
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
                  {restOfLeaderboard.map((entry, idx) => {
                    const actualRank = idx + 4;
                    const entryIsCurrentUser = isCurrentUser(entry);
                    return (
                      <tr
                        key={idx}
                        className={`${
                          entryIsCurrentUser
                            ? 'bg-blue-50 border-l-4 border-l-blue-500'
                            : idx % 2 === 0
                              ? 'bg-white'
                              : 'bg-gray-50'
                        } hover:bg-blue-50 transition-colors`}
                      >
                        <td className="px-6 py-4 text-lg font-bold text-blue-600">#{actualRank}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                entryIsCurrentUser
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {getInitials(entry.user_name)}
                            </div>
                            <span className="font-semibold text-gray-900">
                              {entry.user_name}
                              {entryIsCurrentUser && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{entry.city || 'N/A'}</td>
                        <td className="px-6 py-4 text-lg font-bold">{entry.score}</td>
                        <td className="px-6 py-4 text-green-600 font-semibold">{entry.progress}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
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
