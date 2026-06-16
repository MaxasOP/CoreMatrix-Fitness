'use client';

import React, { useState, useEffect } from 'react';
import api from '../../api';
import ProtectedRoute from '../../components/ProtectedRoute';

function YogaContent() {
  const [streak, setStreak] = useState(0);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(false);

  const yogaPrograms = [
    { id: 1, name: 'Stress Relief', duration: '30 days', level: 'beginner', emoji: '🧘' },
    { id: 2, name: 'Back Pain', duration: '30 days', level: 'beginner', emoji: '🔙' },
    { id: 3, name: 'Weight Loss', duration: '60 days', level: 'intermediate', emoji: '⚖️' },
    { id: 4, name: 'Flexibility', duration: '30 days', level: 'intermediate', emoji: '🤸' },
    { id: 5, name: 'Office Workers', duration: '21 days', level: 'beginner', emoji: '💼' },
    { id: 6, name: 'Senior Citizens', duration: '30 days', level: 'easy', emoji: '👴' }
  ];

  useEffect(() => {
    fetchYogaData();
  }, []);

  const fetchYogaData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/yoga/streak');
      setStreak(response.data?.streak || 0);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeSession = async () => {
    try {
      await api.put('/yoga/streak', { completed: true });
      fetchYogaData();
      alert('Great! Your streak continues 🔥');
    } catch (error) {
      alert('Error updating streak');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🧘 Yoga Ecosystem</h1>
        <p className="text-gray-600 mb-8">Flexible, balanced, and mindful practice</p>

        {/* Streak Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Current Streak</p>
              <p className="text-4xl font-bold text-orange-600 mt-2">{streak} 🔥</p>
              <p className="text-gray-600 mt-1">Keep it going!</p>
            </div>
            <div className="text-right">
              <button
                onClick={completeSession}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-semibold"
              >
                ✓ Complete Today
              </button>
            </div>
          </div>
        </div>

        {/* Yoga Programs */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Programs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {yogaPrograms.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                onSelect={() => setSelectedProgram(program)}
              />
            ))}
          </div>
        </div>

        {/* Program Details Modal */}
        {selectedProgram && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 mt-8">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
              <div className="text-6xl mb-4 text-center">{selectedProgram.emoji}</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedProgram.name}</h2>
              <div className="space-y-3 mb-6">
                <p>
                  <span className="text-gray-600">Duration:</span>
                  <span className="ml-2 font-semibold">{selectedProgram.duration}</span>
                </p>
                <p>
                  <span className="text-gray-600">Level:</span>
                  <span className="ml-2 font-semibold capitalize">{selectedProgram.level}</span>
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Start Program
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const ProgramCard = ({ program, onSelect }) => (
  <div
    onClick={onSelect}
    className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition"
  >
    <div className="text-5xl mb-4">{program.emoji}</div>
    <h3 className="text-lg font-bold text-gray-900">{program.name}</h3>
    <p className="text-sm text-gray-600 mt-2">{program.duration}</p>
    <div className="mt-4">
      <span className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
        {program.level}
      </span>
    </div>
  </div>
);

export default function Yoga() {
  return (
    <ProtectedRoute>
      <YogaContent />
    </ProtectedRoute>
  );
}
