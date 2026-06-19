'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import ProtectedRoute from '../../components/ProtectedRoute';

const REEL_TYPES = [
  { value: 'transformation', label: 'Transformation', color: 'bg-purple-100 text-purple-700', icon: '🔄' },
  { value: 'workout', label: 'Workout', color: 'bg-orange-100 text-orange-700', icon: '🏋️' },
  { value: 'yoga', label: 'Yoga', color: 'bg-green-100 text-green-700', icon: '🧘' },
  { value: 'meal', label: 'Meal', color: 'bg-yellow-100 text-yellow-700', icon: '🥗' },
];

const FEED_FILTERS = [
  { value: 'all', label: 'All', icon: '🌟' },
  { value: 'transformation', label: 'Transformations', icon: '🔄' },
  { value: 'workout', label: 'Workouts', icon: '🏋️' },
  { value: 'meal', label: 'Meals', icon: '🥗' },
  { value: 'yoga', label: 'Yoga', icon: '🧘' },
];

function ProgressReelsContent() {
  useDocumentMetadata({
    title: 'Progress Reels',
    description: 'Share your fitness journey and inspire others by posting video or photo Reels of your workouts.'
  });

  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    media_url: '',
    media_type: 'image',
    type: '',
    tags: ''
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
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      await api.post('/reels', payload);
      setFormData({ title: '', description: '', media_url: '', media_type: 'image', type: '', tags: '' });
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

  const shareReel = async (reel) => {
    const link = `${window.location.origin}/reels/${reel._id || reel.id}`;
    try {
      await navigator.clipboard.writeText(link);
      alert('Link copied to clipboard!');
    } catch {
      prompt('Copy this link:', link);
    }
  };

  const filteredReels = activeFilter === 'all'
    ? reels
    : reels.filter(r => r.type === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">💪 Progress Reels</h1>
        <p className="text-gray-600 mb-8">Share your fitness journey and inspire others</p>

        {/* Upload Section */}
        <button
          id="btn-reels-toggle-upload"
          onClick={() => setShowUpload(!showUpload)}
          className="w-full text-white py-3 rounded-lg mb-8 font-semibold transition hover:opacity-90"
          style={{ backgroundColor: '#ff5a1f' }}
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
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                style={{ '--tw-ring-color': '#ff5a1f' }}
                required
              />
              <textarea
                id="reels-description"
                placeholder="Tell your story..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                style={{ '--tw-ring-color': '#ff5a1f' }}
                required
              />
              <input
                id="reels-media-url"
                type="url"
                placeholder="Media URL (image or video)"
                value={formData.media_url}
                onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                style={{ '--tw-ring-color': '#ff5a1f' }}
                required
              />
              <select
                id="reels-type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                style={{ '--tw-ring-color': '#ff5a1f' }}
                required
              >
                <option value="">Select reel type...</option>
                {REEL_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                ))}
              </select>
              <input
                id="reels-tags"
                type="text"
                placeholder="Tags (comma-separated, e.g., deadlift, PR, strength)"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                style={{ '--tw-ring-color': '#ff5a1f' }}
              />
              <button
                id="btn-reels-submit"
                type="submit"
                className="w-full text-white py-2 rounded-lg transition hover:opacity-90 font-semibold"
                style={{ backgroundColor: '#ff5a1f' }}
              >
                Share Reel
              </button>
            </form>
          </div>
        )}

        {/* Feed Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {FEED_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                activeFilter === f.value
                  ? 'text-white shadow'
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow'
              }`}
              style={activeFilter === f.value ? { backgroundColor: '#ff5a1f' } : {}}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                <div className="w-full h-64 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="flex gap-4 mt-4">
                    <div className="h-9 bg-gray-200 rounded-lg flex-1" />
                    <div className="h-9 bg-gray-200 rounded-lg flex-1" />
                    <div className="h-9 bg-gray-200 rounded-lg flex-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredReels.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {activeFilter === 'all' ? 'No Reels Yet' : `No ${FEED_FILTERS.find(f => f.value === activeFilter)?.label || activeFilter} Reels`}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeFilter === 'all'
                ? 'Be the first to share your fitness journey!'
                : 'No reels match this filter. Try switching categories.'}
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition"
              style={{ backgroundColor: '#ff5a1f' }}
            >
              + Share Your Story
            </button>
          </div>
        )}

        {/* Reels Feed */}
        {!loading && (
          <div className="space-y-6">
            {filteredReels.map((reel) => (
              <ReelCard
                key={reel._id || reel.id}
                reel={reel}
                onLike={() => likeReel(reel._id || reel.id)}
                onShare={() => shareReel(reel)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const ReelCard = ({ reel, onLike, onShare }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(reel.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const typeConfig = REEL_TYPES.find(t => t.value === reel.type);

  const handleLike = async () => {
    setAnimating(true);
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    try {
      await onLike();
    } catch {
      setLiked(!liked);
      setLikeCount(prev => liked ? prev + 1 : prev - 1);
    }
    setTimeout(() => setAnimating(false), 600);
  };

  const toggleComments = async () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      setCommentsLoading(true);
      try {
        const res = await api.get(`/reels/${reel._id || reel.id}/comments`);
        setComments(res.data || []);
      } catch {
        console.error('Error loading comments');
      } finally {
        setCommentsLoading(false);
      }
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await api.post(`/reels/${reel._id || reel.id}/comments`, { text: commentText });
      setCommentText('');
      const res = await api.get(`/reels/${reel._id || reel.id}/comments`);
      setComments(res.data || []);
    } catch {
      alert('Error posting comment');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      {/* Type Badge & Header */}
      <div className="relative">
        {reel.media_url && reel.media_type === 'video' ? (
          <video src={reel.media_url} className="w-full h-80 object-cover" controls />
        ) : reel.media_url ? (
          <img src={reel.media_url} alt={reel.title} className="w-full h-80 object-cover" />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-4xl">📷</span>
          </div>
        )}
        {typeConfig && (
          <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${typeConfig.color}`}>
            {typeConfig.icon} {typeConfig.label}
          </span>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{reel.title}</h3>
            <p className="text-sm text-gray-500 mt-0.5">by {reel.user_name} · {new Date(reel.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <p className="text-gray-700 mb-3">{reel.description}</p>

        {/* Tags */}
        {reel.tags && reel.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {reel.tags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-6 mb-4 text-sm text-gray-500">
          <span>{likeCount} Likes</span>
          <span>{reel.comments_count || 0} Comments</span>
          <span>{reel.views_count || 0} Views</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleLike}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              liked ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600'
            }`}
          >
            <span className={`inline-block transition-transform ${animating ? 'scale-125' : 'scale-100'}`}>
              {liked ? '❤️' : '🤍'}
            </span>{' '}
            Like
          </button>
          <button
            onClick={toggleComments}
            className="flex-1 bg-gray-50 text-gray-600 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 font-semibold transition"
          >
            💬 Comment
          </button>
          <button
            onClick={onShare}
            className="flex-1 bg-gray-50 text-gray-600 py-2 rounded-lg hover:bg-green-50 hover:text-green-600 font-semibold transition"
          >
            📤 Share
          </button>
        </div>

        {/* Expandable Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Comments</h4>

            {commentsLoading ? (
              <div className="space-y-2">
                {[1, 2].map(i => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No comments yet. Be the first!</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto mb-3">
                {comments.map((comment, i) => (
                  <div key={comment._id || i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                      {(comment.user_name || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-xs font-semibold text-gray-700">{comment.user_name || 'Anonymous'}</p>
                      <p className="text-sm text-gray-600">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Form */}
            <form onSubmit={submitComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:outline-none"
                style={{ '--tw-ring-color': '#ff5a1f' }}
              />
              <button
                type="submit"
                className="px-4 py-2 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition"
                style={{ backgroundColor: '#ff5a1f' }}
              >
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ProgressReels() {
  return (
    <ProtectedRoute>
      <ProgressReelsContent />
    </ProtectedRoute>
  );
}
