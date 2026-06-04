// backend/services/videoAnalysisService.js
// AI-powered form correction using MediaPipe
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const aiService = require('./aiService');

class VideoAnalysisService {
  constructor() {
    this.pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';
  }

  async analyzeExerciseForm(videoPath) {
    try {
      const fileStream = fs.createReadStream(videoPath);
      const formData = new FormData();
      formData.append('video', fileStream);

      const response = await axios.post(
        `${this.pythonServiceUrl}/analyze`,
        formData,
        { headers: formData.getHeaders() }
      );

      return {
        exercise: response.data.exercise,
        form_issues: response.data.form_issues,
        rep_count: response.data.rep_count,
        depth_percentage: response.data.depth_percentage,
        form_score: response.data.form_score,
        recommendations: response.data.recommendations
      };
    } catch (error) {
      console.error('Video analysis error:', error);
      throw new Error('Unable to analyze video');
    }
  }

  async analyzeYogaPose(imagePath) {
    try {
      const fileStream = fs.createReadStream(imagePath);
      const formData = new FormData();
      formData.append('image', fileStream);

      const response = await axios.post(
        `${this.pythonServiceUrl}/yoga-analyze`,
        formData,
        { headers: formData.getHeaders() }
      );

      return {
        pose_name: response.data.pose_name,
        alignment_score: response.data.alignment_score,
        corrections: response.data.corrections,
        tips: response.data.tips
      };
    } catch (error) {
      console.error('Yoga pose analysis error:', error);
      throw new Error('Unable to analyze pose');
    }
  }

  async generateFeedback(analysisResult) {
    return await aiService.generateFormFeedback(analysisResult);
  }
}

module.exports = new VideoAnalysisService();
