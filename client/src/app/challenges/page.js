'use client';

import React, { useState, useEffect, useContext } from 'react';
import api from '../../api';
import { AuthContext } from '../../AuthContext';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import ProtectedRoute from '../../components/ProtectedRoute';

const typeConfig = {
  steps: { label: 'Steps', color: 'bg-blue-100 text-blue-700' },
  yoga: { label: 'Yoga', color: 'bg-purple-100 text-purple-700' },
  pushups: { label: 'Push-ups', color: 'bg-orange-100 text-orange-700' },
  fat_loss: { label: 'Fat Loss', color: 'bg-green-100 text-green-700' },
};

function getTypeBadge(type) {
  const config = typeConfig[type] || { label: type, color: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow p-5 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-full bg-gray-100 rounded mb-1" />
      <div className="h-4 w-5/6 bg-gray-100 rounded mb-4" />
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="h-10 bg-gray-100 rounded" />
        <div className="h-10 bg-gray-100 rounded" />
        <div className="h-10 bg-gray-100 rounded" />
      </div>
      <div className="h-10 bg-gray-200 rounded-lg" />
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="bg-white rounded-lg shadow p-10 text-center">
      <div className="text-5xl mb-3">🏆</div>
      <p className="text-gray-500 text-lg">{message}</p>
    </div>
  );
}

function ChallengesContent() {
  const { user } = useContext(AuthContext);
  useDocumentMetadata({
    title: 'Fitness Challenges',
    description: 'Join exciting fitness challenges, push your limits, and earn rewards for hitting training milestones.'
  });

  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [leavingId, setLeavingId] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('cmUser');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUserId(parsed.id || parsed._id || parsed.userId);
        } catch (e) {}
      }
      if (!userId) {
        setUserId(localStorage.getItem('userId'));
      }
    }
  }, [user]);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const response = await api.get('/challenges');
      setChallenges(response.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId) => {
    try {
      await api.post(`/challenges/${challengeId}/join`, {});
      alert('Joined challenge successfully!');
      fetchChallenges();
    } catch (error) {
      alert('Error joining challenge');
    }
  };

  const leaveChallenge = async (challengeId) => {
    if (!window.confirm('Are you sure you want to leave this challenge?')) return;
    setLeavingId(challengeId);
    try {
      await api.post(`/challenges/${challengeId}/leave`, {});
      alert('Left challenge successfully.');
      fetchChallenges();
    } catch (error) {
      alert('Error leaving challenge');
    } finally {
      setLeavingId(null);
    }
  };

  const activeChallenges = challenges?.filter((c) => c.status === 'active') || [];
  const myChallenges = challenges?.filter((c) => userId && c.participants?.includes(userId)) || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">🎯 Challenges</h1>
        <p className="text-gray-600 mb-8">Join challenges and compete with others</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Active Challenges */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Active Challenges</h2>
            <div className="space-y-4">
              {loading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : activeChallenges.length === 0 ? (
                <EmptyState message="No active challenges right now. Check back soon!" />
              ) : (
                activeChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge._id || challenge.id}
                    challenge={challenge}
                    userId={userId}
                    onJoin={() => joinChallenge(challenge._id || challenge.id)}
                  />
                ))
              )}
            </div>
          </section>

          {/* My Challenges */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">My Challenges</h2>
            <div className="space-y-4">
              {loading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : myChallenges.length === 0 ? (
                <EmptyState message="You haven't joined any challenges yet. Get started!" />
              ) : (
                myChallenges.map((challenge) => (
                  <MyChallengeCard
                    key={challenge._id || challenge.id}
                    challenge={challenge}
                    onLeave={() => leaveChallenge(challenge._id || challenge.id)}
                    leaving={leavingId === (challenge._id || challenge.id)}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const ChallengeCard = ({ challenge, userId, onJoin }) => {
  const isJoined = userId && challenge.participants?.includes(userId);
  const endDate = formatDate(challenge.end_date);

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-5">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {getTypeBadge(challenge.type)}
        {challenge.status && (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 capitalize">
            {challenge.status}
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mt-2">{challenge.title}</h3>
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{challenge.description}</p>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <div className="bg-gray-50 rounded-lg p-2.5 text-center">
          <p className="text-gray-500 text-xs">Duration</p>
          <p className="font-bold text-gray-900">{challenge.duration_days}d</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5 text-center">
          <p className="text-gray-500 text-xs">Participants</p>
          <p className="font-bold text-gray-900">{challenge.participants?.length || 0}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5 text-center col-span-2 sm:col-span-1">
          <p className="text-gray-500 text-xs">Prize</p>
          <p className="font-bold text-green-600">₹{challenge.prize_pool || 0}</p>
        </div>
      </div>

      {endDate && (
        <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Ends {endDate}
        </p>
      )}

      {challenge.rules && (
        <p className="text-xs text-gray-400 mt-2 italic">Rule: {challenge.rules}</p>
      )}

      <button
        onClick={onJoin}
        disabled={isJoined}
        className={`w-full mt-4 py-2.5 rounded-lg font-semibold transition-colors ${
          isJoined
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-[#ff5a1f] text-white hover:bg-[#e54d12]'
        }`}
      >
        {isJoined ? '✓ Already Joined' : 'Join Challenge'}
      </button>
    </div>
  );
};

const MyChallengeCard = ({ challenge, onLeave, leaving }) => {
  const endDate = formatDate(challenge.end_date);
  const progress = challenge.user_progress || 0;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-5 border-l-4 border-[#ff5a1f]">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {getTypeBadge(challenge.type)}
          {challenge.status && (
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 capitalize">
              {challenge.status}
            </span>
          )}
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900">{challenge.title}</h3>
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{challenge.description}</p>

      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-gray-600">Progress</span>
          <span className="font-bold text-[#ff5a1f]">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-[#ff5a1f] h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>{challenge.participants?.length || 0} participant{challenge.participants?.length !== 1 ? 's' : ''}</span>
        {endDate && <span>Ends {endDate}</span>}
      </div>

      <div className="mt-4 flex gap-2">
        <button className="flex-1 bg-[#ff5a1f] text-white py-2.5 rounded-lg font-semibold hover:bg-[#e54d12] transition-colors">
          Update Progress
        </button>
        <button
          onClick={onLeave}
          disabled={leaving}
          className="px-4 py-2.5 rounded-lg font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {leaving ? '...' : 'Leave'}
        </button>
      </div>
    </div>
  );
};

export default function Challenges() {
  return (
    <ProtectedRoute>
      <ChallengesContent />
    </ProtectedRoute>
  );
}
