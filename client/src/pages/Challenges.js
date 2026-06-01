// Challenges Page
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [userChallenges, setUserChallenges] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/challenges`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChallenges(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/challenges/${challengeId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Joined challenge successfully!');
      fetchChallenges();
    } catch (error) {
      alert('Error joining challenge');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🎯 Challenges</h1>
        <p className="text-gray-600 mb-8">Join challenges and compete with others</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Active Challenges */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Challenges</h2>
            <div className="space-y-4">
              {challenges
                ?.filter((c) => c.status === 'active')
                .map((challenge) => (
                  <ChallengeCard
                    key={challenge._id}
                    challenge={challenge}
                    onJoin={() => joinChallenge(challenge._id)}
                  />
                ))}
            </div>
          </div>

          {/* My Challenges */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Challenges</h2>
            <div className="space-y-4">
              {challenges
                ?.filter((c) => c.participants?.includes(localStorage.getItem('userId')))
                .map((challenge) => (
                  <MyChallengeCard key={challenge._id} challenge={challenge} />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChallengeCard = ({ challenge, onJoin }) => (
  <div className="bg-white rounded-lg shadow-lg p-4">
    <h3 className="text-lg font-bold text-gray-900">{challenge.title}</h3>
    <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
    <div className="mt-3 space-y-2 text-sm">
      <p>
        <span className="text-gray-600">Duration:</span>
        <span className="ml-2 font-semibold">{challenge.duration_days} days</span>
      </p>
      <p>
        <span className="text-gray-600">Participants:</span>
        <span className="ml-2 font-semibold">{challenge.participants?.length || 0}</span>
      </p>
      <p>
        <span className="text-gray-600">Prize:</span>
        <span className="ml-2 font-semibold text-green-600">₹{challenge.prize_pool || 0}</span>
      </p>
    </div>
    <button
      onClick={onJoin}
      className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
    >
      Join Challenge
    </button>
  </div>
);

const MyChallengeCard = ({ challenge }) => (
  <div className="bg-green-50 rounded-lg shadow-lg p-4 border-l-4 border-green-600">
    <h3 className="text-lg font-bold text-gray-900">{challenge.title}</h3>
    <div className="mt-4">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-600">Progress</span>
        <span className="font-bold">{challenge.user_progress}%</span>
      </div>
      <div className="w-full bg-gray-300 rounded-full h-2">
        <div
          className="bg-green-600 h-2 rounded-full"
          style={{ width: `${challenge.user_progress || 0}%` }}
        />
      </div>
    </div>
    <button className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
      Update Progress
    </button>
  </div>
);

export default Challenges;
