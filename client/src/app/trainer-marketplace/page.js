'use client';

import React, { useState, useEffect } from 'react';
import api from '../../api';
import ProtectedRoute from '../../components/ProtectedRoute';

function TrainerMarketplaceContent() {
  const [trainers, setTrainers] = useState([]);
  const [filters, setFilters] = useState({
    specialization: 'all',
    type: 'all'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrainers();
  }, [filters]);

  const fetchTrainers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/trainers/nearby');
      setTrainers(response.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const bookTrainer = async (trainerId) => {
    try {
      await api.post(`/trainers/${trainerId}/book`, { date: new Date().toISOString() });
      alert('Booking request sent!');
    } catch (error) {
      alert('Error booking trainer');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">👨‍🏫 Trainer Marketplace</h1>
        <p className="text-gray-600 mb-8">Find and book certified trainers near you</p>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
              <select
                value={filters.specialization}
                onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Specializations</option>
                <option value="strength">Strength Training</option>
                <option value="cardio">Cardio</option>
                <option value="yoga">Yoga</option>
                <option value="nutrition">Nutrition</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchTrainers}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Trainers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trainers.map((trainer) => (
            <TrainerCard
              key={trainer._id || trainer.id}
              trainer={trainer}
              onBook={() => bookTrainer(trainer._id || trainer.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const TrainerCard = ({ trainer, onBook }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
    {trainer.image_url && (
      <img src={trainer.image_url} alt={trainer.name} className="w-full h-40 object-cover" />
    )}
    <div className="p-6">
      <h3 className="text-lg font-bold text-gray-900">{trainer.name}</h3>
      <p className="text-sm text-gray-600 mt-1">{trainer.specialization}</p>
      
      <div className="mt-4 space-y-2 text-sm">
        <p>
          <span className="text-gray-600">Experience:</span>
          <span className="ml-2 font-semibold">{trainer.years_experience} years</span>
        </p>
        <p>
          <span className="text-gray-600">Rate:</span>
          <span className="ml-2 font-semibold text-green-600">₹{trainer.hourly_rate}/hr</span>
        </p>
        <p>
          <span className="text-gray-600">Rating:</span>
          <span className="ml-2 font-semibold">⭐ {trainer.rating || 4.5}/5</span>
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={onBook}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm"
        >
          Book Now
        </button>
        <button className="flex-1 bg-gray-100 text-gray-900 py-2 rounded-lg hover:bg-gray-200 text-sm">
          Reviews
        </button>
      </div>
    </div>
  </div>
);

export default function TrainerMarketplace() {
  return (
    <ProtectedRoute>
      <TrainerMarketplaceContent />
    </ProtectedRoute>
  );
}
