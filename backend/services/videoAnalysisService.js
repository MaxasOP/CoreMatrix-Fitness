// backend/services/videoAnalysisService.js
// AI-powered form correction using MediaPipe
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const aiService = require('./aiService');

class VideoAnalysisService {
  constructor() {
    this.pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';
    this.requestTimeoutMs = Number(process.env.PYTHON_SERVICE_TIMEOUT_MS || 180000); // 3 minutes
  }

  _formatAxiosError(error) {
    if (!error) return null;

    const isAxios = !!error.isAxiosError;
    const status = isAxios && error.response ? error.response.status : undefined;
    const data = isAxios && error.response ? error.response.data : undefined;

    return {
      message: error.message,
      code: error.code,
      status,
      pythonServiceUrl: this.pythonServiceUrl,
      responseData: typeof data === 'string' ? data.slice(0, 5000) : data,
      // Avoid circular structures in logs
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    };
  }

  async analyzeExerciseForm(videoPath, exerciseName = 'squat') {
    try {
      console.log('--- Video Analysis Diagnostics ---');
      console.log('Video Path:', videoPath);
      console.log('Exercise Name:', exerciseName);
      if (videoPath) {
        const exists = fs.existsSync(videoPath);
        console.log('File exists:', exists);
        if (exists) {
          const stats = fs.statSync(videoPath);
          console.log('File size:', stats.size, 'bytes');
        }
      }

      if (!videoPath || !fs.existsSync(videoPath)) {
        throw new Error(`Video file not found at path: ${videoPath}`);
      }

      const fileStream = fs.createReadStream(videoPath);
      const formData = new FormData();
      formData.append('video', fileStream);
      formData.append('exercise_name', exerciseName);

      const targetUrl = `${this.pythonServiceUrl}/analyze`;
      console.log('Calling Python service at:', targetUrl);

      const response = await axios.post(
        targetUrl,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: this.requestTimeoutMs,
          maxBodyLength: Infinity,
          maxContentLength: Infinity
        }
      );

      console.log('Python service raw response status:', response.status);
      console.log('Python service response data:', response.data);

      return {
        exercise: response.data.exercise,
        form_issues: response.data.form_issues,
        rep_count: response.data.rep_count,
        depth_percentage: response.data.depth_percentage,
        form_score: response.data.form_score,
        recommendations: response.data.recommendations
      };
    } catch (error) {
      const formatted = this._formatAxiosError(error);
      console.error('Video analysis detailed error:', formatted || error);

      const err = new Error(
        `Unable to analyze video: ${error.message}`
      );
      err.pythonServiceError = formatted;
      throw err;
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
