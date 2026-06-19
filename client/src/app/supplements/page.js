'use client';

import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import ProtectedRoute from '../../components/ProtectedRoute';

const CATEGORIES = ['all', 'protein', 'pre-workout', 'vitamins', 'amino-acids', 'creatine', 'fat-burner', 'recovery'];
const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popularity', label: 'Most Popular' },
];

function SupplementsContent() {
  useDocumentMetadata({
    title: 'Supplement Store',
    description: 'Browse high-quality fitness supplements and receive personalized suggestions based on your profile and goals.'
  });

  const [supplements, setSupplements] = useState([]);
  const [loadingSupplements, setLoadingSupplements] = useState(true);
  const [formData, setFormData] = useState({
    weight: '',
    goal: 'muscle_gain'
  });
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState('popularity');

  useEffect(() => {
    fetchSupplements();
  }, []);

  const fetchSupplements = async () => {
    setLoadingSupplements(true);
    try {
      const response = await api.get('/supplements');
      const data = response.data;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.supplements)
          ? data.supplements
          : [];
      setSupplements(list);
    } catch (error) {
      console.error('Error:', error);
      setSupplements([]);
    } finally {
      setLoadingSupplements(false);
    }
  };

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const response = await api.post('/supplements/recommend', formData);
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSupplements = useMemo(() => {
    let result = [...supplements];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(
        (s) => s.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Price range filter
    result = result.filter((s) => {
      const price = s.lowest_verified_price || s.lowest_price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sorting
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => (a.lowest_verified_price || a.lowest_price || 0) - (b.lowest_verified_price || b.lowest_price || 0));
        break;
      case 'price_desc':
        result.sort((a, b) => (b.lowest_verified_price || b.lowest_price || 0) - (a.lowest_verified_price || a.lowest_price || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
      case 'popularity':
        result.sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
        break;
      default:
        break;
    }

    return result;
  }, [supplements, searchQuery, selectedCategory, priceRange, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Supplement Store</h1>
        <p className="text-gray-600 mb-8">Personalized recommendations with price comparison</p>

        {/* Recommendation Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Recommendations</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              id="supp-weight"
              type="number"
              placeholder="Your weight (kg)"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <select
              id="supp-goal"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="muscle_gain">Muscle Gain</option>
              <option value="fat_loss">Fat Loss</option>
              <option value="endurance">Endurance</option>
              <option value="recovery">Recovery</option>
            </select>
            <button
              id="btn-supp-recommend"
              onClick={getRecommendations}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Recommend'}
            </button>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations && (
          <div className="bg-blue-50 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.recommendations?.map((rec, idx) => (
                <RecommendationCard key={idx} rec={rec} />
              ))}
            </div>
          </div>
        )}

        {/* Search, Filter, Sort Bar */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search supplements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>

            {/* Price Range */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <span className="text-gray-400">–</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-500 mb-4">
          {filteredSupplements.length} supplement{filteredSupplements.length !== 1 ? 's' : ''} found
        </p>

        {/* Loading Skeleton */}
        {loadingSupplements && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SupplementSkeleton key={idx} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loadingSupplements && filteredSupplements.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No supplements found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters to find what you're looking for.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setPriceRange([0, 5000]);
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Supplements Grid */}
        {!loadingSupplements && filteredSupplements.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredSupplements.map((supplement) => (
              <SupplementCard key={supplement._id || supplement.id} supplement={supplement} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const RecommendationCard = ({ rec }) => {
  const supplement = rec.supplement_data || {};
  return (
    <div className="bg-white p-5 rounded-lg border-l-4 border-blue-600 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{rec.supplement}</h3>
          <p className="text-gray-600 text-sm mt-1">{rec.reason}</p>
        </div>
        {supplement.authenticity_score >= 80 && (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full ml-2 whitespace-nowrap">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </span>
        )}
      </div>

      {/* Dosage & Timing */}
      {(rec.dosage || rec.timing) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {rec.dosage && (
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {rec.dosage}
            </span>
          )}
          {rec.timing && (
            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              {rec.timing}
            </span>
          )}
        </div>
      )}

      {/* Benefits */}
      {rec.benefits && rec.benefits.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-500 mb-1">Benefits:</p>
          <div className="flex flex-wrap gap-1">
            {rec.benefits.map((benefit, i) => (
              <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                {benefit}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SupplementCard = ({ supplement }) => {
  const lowestPrice = supplement.lowest_verified_price || supplement.lowest_price || 0;
  const vendor = supplement.lowest_price_vendor || '';
  const rating = supplement.average_rating || 0;
  const authenticity = supplement.authenticity_score || 0;
  const inStockCount = supplement.prices?.filter((p) => p.in_stock).length || 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition flex flex-col">
      {/* Image */}
      {supplement.image_url && (
        <img
          src={supplement.image_url}
          alt={supplement.name}
          className="w-full h-40 object-cover rounded-lg mb-4"
        />
      )}

      {/* Authenticity Badge */}
      {authenticity >= 80 && (
        <div className="flex items-center gap-1 mb-2">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium text-green-600">Authentic ({authenticity}%)</span>
        </div>
      )}

      {/* Name & Category */}
      <h3 className="text-lg font-bold text-gray-900">{supplement.name}</h3>
      <p className="text-sm text-gray-500 capitalize">{supplement.category?.replace('-', ' ')}</p>

      {/* Description */}
      {supplement.description && (
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{supplement.description}</p>
      )}

      {/* Rating */}
      {rating > 0 && (
        <div className="flex items-center gap-1 mt-3">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500">({rating.toFixed(1)})</span>
        </div>
      )}

      {/* Price Comparison */}
      <div className="mt-4">
        <p className="text-xs text-gray-500 mb-2">Compare prices</p>
        <div className="grid grid-cols-2 gap-2">
          {supplement.prices?.slice(0, 4).map((price, idx) => (
            <div key={idx} className={`text-xs p-2 rounded ${price.in_stock ? 'bg-gray-50' : 'bg-red-50'}`}>
              <p className="font-semibold text-gray-900">{price.vendor}</p>
              <p className="text-blue-600 font-bold">₹{price.price}</p>
              {!price.in_stock && <p className="text-red-500 text-[10px]">Out of stock</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Lowest Price */}
      <div className="mt-4 pt-4 border-t">
        <p className="text-lg font-bold text-green-600">₹{lowestPrice}</p>
        <p className="text-xs text-gray-500">
          Best price {vendor ? `from ${vendor}` : ''} · {inStockCount} vendor{inStockCount !== 1 ? 's' : ''} in stock
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2">
        <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 text-sm font-medium transition">
          Add to Cart
        </button>
        <button className="flex-1 border border-blue-600 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-50 text-sm font-medium transition">
          Buy Now
        </button>
      </div>

      {/* Affiliate Link */}
      {supplement.prices?.[0]?.url && (
        <a
          href={supplement.prices[0].url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-center text-xs text-gray-400 hover:text-blue-500 transition"
        >
          View on {supplement.prices[0].vendor} →
        </a>
      )}
    </div>
  );
};

const SupplementSkeleton = () => (
  <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
    <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>
    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
    <div className="grid grid-cols-2 gap-2 mb-4">
      <div className="h-12 bg-gray-200 rounded"></div>
      <div className="h-12 bg-gray-200 rounded"></div>
    </div>
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="flex gap-2">
      <div className="h-9 bg-gray-200 rounded flex-1"></div>
      <div className="h-9 bg-gray-200 rounded flex-1"></div>
    </div>
  </div>
);

export default function Supplements() {
  return (
    <ProtectedRoute>
      <SupplementsContent />
    </ProtectedRoute>
  );
}
