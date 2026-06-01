// Supplements Page
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Supplements = () => {
  const [supplements, setSupplements] = useState([]);
  const [formData, setFormData] = useState({
    weight: '',
    goal: 'muscle_gain'
  });
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSupplements();
  }, []);

  const fetchSupplements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/supplements`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSupplements(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/supplements/recommend`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Smart Supplement Engine</h1>
        <p className="text-gray-600 mb-8">Personalized recommendations with price comparison</p>

        {/* Recommendation Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Recommendations</h2>
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Your weight (kg)"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <select
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
                <div key={idx} className="bg-white p-4 rounded-lg border-l-4 border-blue-600">
                  <h3 className="text-lg font-bold text-gray-900">{rec.supplement}</h3>
                  <p className="text-gray-700 mt-2">{rec.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Supplements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supplements.map((supplement) => (
            <SupplementCard key={supplement._id} supplement={supplement} />
          ))}
        </div>
      </div>
    </div>
  );
};

const SupplementCard = ({ supplement }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
    <h3 className="text-lg font-bold text-gray-900">{supplement.name}</h3>
    <p className="text-sm text-gray-600 mt-1">{supplement.category}</p>
    
    <div className="mt-4">
      <p className="text-sm text-gray-600">Prices</p>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {supplement.prices?.map((price, idx) => (
          <div key={idx} className="text-xs">
            <p className="font-semibold text-gray-900">{price.vendor}</p>
            <p className="text-blue-600">₹{price.price}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="mt-4 pt-4 border-t">
      <p className="text-lg font-bold text-green-600">₹{supplement.lowest_price}</p>
      <p className="text-xs text-gray-600">Lowest verified price</p>
    </div>

    <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
      View Details
    </button>
  </div>
);

export default Supplements;
