// backend/services/aiService.js
// AI integration service for Gemini API

const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
    this.model = 'gemini-1.5-flash';
  }

  /**
   * Generate AI feedback for workout form
   */
  async generateFormFeedback(analysis) {
    const { exercise, form_issues, rep_count, form_score, recommendations } = analysis;

    const prompt = `You are an elite fitness coach. Provide professional, encouraging, and highly technical feedback for a user who just performed ${exercise}.

Analysis Data:
- Exercise: ${exercise}
- Reps: ${rep_count}
- Form Score: ${form_score}/100
- Issues Detected: ${form_issues.join(', ')}
- Initial Recommendations: ${recommendations.join(', ')}

Please provide:
1. A concise overall summary (2 sentences).
2. Deep dive into the detected issues and how to fix them.
3. Specific cues to remember for the next set.
4. Encouragement based on the score.

Format the response as JSON:
{
  "overall": "",
  "issues_breakdown": [],
  "cues": [],
  "encouragement": ""
}`;

    try {
      const response = await this.callGemini(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating form feedback:', error);
      return {
        overall: `Your form score is ${form_score}% for ${exercise}.`,
        issues_breakdown: form_issues,
        cues: recommendations,
        encouragement: "Keep practicing to improve your technique!"
      };
    }
  }

  /**
   * Generate personalized meal plan
   */
  async generateMealPlan(userProfile) {
    const { age, weight_kg, height_cm, activity_level, goal, budget_monthly, diet_preference } = userProfile;

    const prompt = `You are an expert Indian nutrition consultant. Generate a detailed personalized meal plan for:
- Age: ${age}, Weight: ${weight_kg}kg, Height: ${height_cm}cm, Goal: ${goal}
- Budget: ₹${budget_monthly}, Diet: ${diet_preference}

Format strictly as JSON:
{
  "breakfast": { "meal_name": "", "quantity": "", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "indian_alternatives": [] },
  "lunch": { "meal_name": "", "quantity": "", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "indian_alternatives": [] },
  "dinner": { "meal_name": "", "quantity": "", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "indian_alternatives": [] },
  "snacks": [],
  "daily_macros": { "protein": 0, "carbs": 0, "fat": 0, "calories": 0 },
  "estimated_monthly_cost": 0,
  "cost_breakdown": { "breakfast": 0, "lunch": 0, "dinner": 0, "snacks": 0 },
  "nutrition_tips": []
}`;

    try {
      const response = await this.callGemini(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      throw error;
    }
  }

  /**
   * Generate personalized workout plan
   */
  async generateWorkoutPlan(userProfile) {
    const { age, weight_kg, height_cm, activity_level, goal, experience_level = 'beginner', days_per_week = 4, equipment_available = 'full_gym' } = userProfile;

    const prompt = `You are an expert fitness coach. Generate a workout plan for:
- Age: ${age}, Weight: ${weight_kg}kg, Goal: ${goal}
- Exp: ${experience_level}, Days: ${days_per_week}, Equipment: ${equipment_available}

Format strictly as JSON:
{
  "plan_name": "",
  "goal_focus": "",
  "days_per_week": 0,
  "weekly_routine": [
    {
      "day": "Day 1",
      "target_muscle_group": "",
      "exercises": [
        { "name": "", "sets": 0, "reps": "", "rest_seconds": 0, "notes": "" }
      ]
    }
  ],
  "warmup_routine": [],
  "cooldown_routine": [],
  "expert_tips": []
}`;

    try {
      const response = await this.callGemini(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating workout plan:', error);
      throw error;
    }
  }

  /**
   * Recommend supplements
   */
  async recommendSupplements(userProfile) {
    const { weight_kg, goal, age, activity_level } = userProfile;
    const prompt = `Recommend 4-6 supplements for: Weight: ${weight_kg}kg, Goal: ${goal}, Age: ${age}.
Format as JSON array with objects: name, category, explanation, dosage, timing, benefits`;

    try {
      const response = await this.callGemini(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error recommending supplements:', error);
      throw error;
    }
  }

  /**
   * Calculate health twin scores
   */
  async calculateHealthTwinScores(userMetrics) {
    const prompt = `Calculate health scores (0-100) for these metrics: ${JSON.stringify(userMetrics)}
Format as JSON: { fitness_age, strength_score, recovery_score, mobility_score, nutrition_score, consistency_score, overall_health_score, recommendations: [] }`;

    try {
      const response = await this.callGemini(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error calculating health scores:', error);
      throw error;
    }
  }

  /**
   * Analyze restaurant meal
   */
  async analyzeRestaurantMeal(restaurantName, dishName) {
    const prompt = `Analyze nutrition for dish "${dishName}" from "${restaurantName}".
Format as JSON: { dish, calories, protein, carbs, fat, fiber, health_rating, recommendation, healthy_alternative, protein_alternative }`;

    try {
      const response = await this.callGemini(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing meal:', error);
      throw error;
    }
  }

  /**
   * Call Gemini API
   */
  async callGemini(prompt) {
    try {
      if (!this.genAI) {
        console.error('CRITICAL: genAI object is not initialized. Check GEMINI_API_KEY.');
        throw new Error('GEMINI_API_KEY is missing');
      }

      console.log('--- Sending Prompt to Gemini ---');
      const model = this.genAI.getGenerativeModel({ model: this.model });
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      
      console.log('Gemini Raw Response:', text);

      // Clean up markdown code blocks
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return text;
    } catch (error) {
      console.error('Gemini API Error Detail:', {
        message: error.message,
        stack: error.stack,
        apiKeyPresent: !!this.apiKey
      });
      throw error;
    }
  }
}

module.exports = new AIService();
