'use client';

import React, { useState, useEffect } from 'react';
import api from '../../api';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import ProtectedRoute from '../../components/ProtectedRoute';

function ProgressReelsContent() {
  useDocumentMetadata({
    title: 'Progress Reels',
    description: 'Share your fitness journey and inspire others by posting video or photo Reels of your workouts.'
  });

  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: ''
  });

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reels/feed');
      setReels(response.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reels', formData);
      setFormData({ title: '', description: '', image_url: '' });
      setShowUpload(false);
      fetchReels();
    } catch (error) {
      alert('Error creating reel');
    }
  };

  const likeReel = async (reelId) => {
    try {
      await api.post(`/reels/${reelId}/like`, {});
      fetchReels();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">💪 Progress Reels</h1>
        <p className="text-gray-600 mb-8">Share your fitness journey and inspire others</p>

        {/* Upload Section */}
        <button
          id="btn-reels-toggle-upload"
          onClick={() => setShowUpload(!showUpload)}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 mb-8 font-semibold"
        >
          {showUpload ? '✕ Close' : '+ Share Your Story'}
        </button>

        {showUpload && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                id="reels-title"
                type="text"
                placeholder="Title (e.g., Week 4 Transformation)"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                id="reels-description"
                placeholder="Tell your story..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                id="reels-image-url"
                type="url"
                placeholder="Image URL"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                id="btn-reels-submit"
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Share Reel
              </button>
            </form>
          </div>
        )}

        {/* Reels Feed */}
        <div className="space-y-6">
          {reels.map((reel) => (
            <ReelCard key={reel._id || reel.id} reel={reel} onLike={() => likeReel(reel._id || reel.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

const ReelCard = ({ reel, onLike }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
    {reel.image_url && (
      <img src={reel.image_url} alt={reel.title} className="w-full h-64 object-cover" />
    )}

    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{reel.title}</h3>
          <p className="text-sm text-gray-600 mt-1">by {reel.user_name}</p>
        </div>
      </div>

      <p className="text-gray-700 mb-4">{reel.description}</p>

      <div className="flex gap-6 mb-4 text-sm text-gray-600">
        <span>❤️ {reel.likes_count || 0} Likes</span>
        <span>💬 {reel.comments_count || 0} Comments</span>
        <span>📊 {reel.views_count || 0} Views</span>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onLike}
          className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 font-semibold"
        >
          ❤️ Like
        </button>
        <button className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 font-semibold">
          💬 Comment
        </button>
        <button className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg hover:bg-green-100 font-semibold">
          📤 Share
        </button>
      </div>
    </div>
  </div>
);

export default function ProgressReels() {
  return (
    <ProtectedRoute>
      <ProgressReelsContent />
    </ProtectedRoute>
  );
}
