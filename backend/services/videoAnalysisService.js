// backend/services/videoAnalysisService.js
// AI-powered form correction using MediaPipe
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');

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

  generateFeedback(analysisResult) {
    const feedback = {
      overall: `Your form score is ${analysisResult.form_score || 0}%`,
      issues: analysisResult.form_issues || [],
      recommendations: analysisResult.recommendations || [],
      next_steps: []
    };

    if (analysisResult.form_score < 70) {
      feedback.next_steps.push('Work on your form in the next session');
    }
    if (analysisResult.depth_percentage) {
      feedback.next_steps.push(
        `Increase depth by ${100 - analysisResult.depth_percentage}% for full range of motion`
      );
    }

    return feedback;
  }
}

module.exports = new VideoAnalysisService();
