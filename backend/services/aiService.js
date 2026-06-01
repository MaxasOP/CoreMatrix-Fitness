// backend/services/aiService.js
// AI integration service for OpenAI API

class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = 'gpt-4';
  }

  /**
   * Generate personalized meal plan using OpenAI
   * @param {Object} userProfile - User's profile data
   * @returns {Promise<Object>} Generated meal plan
   */
  async generateMealPlan(userProfile) {
    const {
      age,
      weight_kg,
      height_cm,
      activity_level,
      goal,
      budget_monthly,
      diet_preference
    } = userProfile;

    const prompt = `You are an expert Indian nutrition consultant. Generate a detailed personalized meal plan based on these criteria:

User Profile:
- Age: ${age} years
- Weight: ${weight_kg} kg
- Height: ${height_cm} cm
- Activity Level: ${activity_level}
- Goal: ${goal}
- Monthly Budget: ₹${budget_monthly}
- Diet Preference: ${diet_preference}

Please provide:
1. Breakfast recommendation (with quantity)
2. Lunch recommendation (with quantity)
3. Dinner recommendation (with quantity)
4. 2 Snack options
5. Macro breakdown (protein, carbs, fats)
6. 5 Indian food alternatives for the recommended meals
7. Estimated monthly cost breakdown
8. Key nutrition tips

Format the response as JSON with the following structure:
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
      const response = await this.callOpenAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      throw error;
    }
  }

  /**
   * Generate supplement recommendations
   * @param {Object} userProfile - User's profile
   * @returns {Promise<Array>} Array of supplement recommendations
   */
  async recommendSupplements(userProfile) {
    const { weight_kg, goal, age, activity_level } = userProfile;

    const prompt = `You are an expert sports nutritionist. Based on the following user profile, recommend the best supplements:

User Profile:
- Weight: ${weight_kg} kg
- Goal: ${goal}
- Age: ${age}
- Activity Level: ${activity_level}

Recommend 4-6 supplements that would be most beneficial, and for each provide:
1. Supplement name
2. Category
3. Why it's recommended (detailed explanation)
4. Recommended dosage
5. Timing (pre-workout, post-workout, with meals, etc.)
6. Expected benefits

Format as JSON array with objects containing: name, category, explanation, dosage, timing, benefits`;

    try {
      const response = await this.callOpenAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error recommending supplements:', error);
      throw error;
    }
  }

  /**
   * Generate health twin scores
   * @param {Object} userMetrics - User's fitness metrics
   * @returns {Promise<Object>} Health twin scores
   */
  async calculateHealthTwinScores(userMetrics) {
    const {
      age,
      weight_kg,
      height_cm,
      workouts_per_week,
      sleep_hours,
      meals_logged,
      streak_days,
      strength_level
    } = userMetrics;

    const prompt = `Calculate personalized health scores based on these metrics:

User Metrics:
- Age: ${age}
- Weight: ${weight_kg} kg
- Height: ${height_cm} cm
- Workouts per week: ${workouts_per_week}
- Sleep hours: ${sleep_hours}
- Meals logged: ${meals_logged}
- Streak days: ${streak_days}
- Strength level: ${strength_level}

Calculate and return:
1. Fitness Age
2. Strength Score (0-100)
3. Recovery Score (0-100)
4. Mobility Score (0-100)
5. Nutrition Score (0-100)
6. Consistency Score (0-100)
7. Overall Health Score (0-100)

Format as JSON:
{
  "fitness_age": 0,
  "strength_score": 0,
  "recovery_score": 0,
  "mobility_score": 0,
  "nutrition_score": 0,
  "consistency_score": 0,
  "overall_health_score": 0,
  "recommendations": []
}`;

    try {
      const response = await this.callOpenAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error calculating health scores:', error);
      throw error;
    }
  }

  /**
   * Analyze restaurant menu and meal calories
   * @param {String} restaurantName - Restaurant name
   * @param {String} dishName - Dish name
   * @returns {Promise<Object>} Meal analysis
   */
  async analyzeRestaurantMeal(restaurantName, dishName) {
    const prompt = `Analyze this Indian restaurant dish and provide nutritional information:

Restaurant: ${restaurantName}
Dish: ${dishName}

Provide:
1. Estimated calories
2. Protein content (g)
3. Carbs content (g)
4. Fat content (g)
5. Healthiness rating (1-10)
6. Health recommendation
7. Best healthy option alternative from the restaurant (if available)
8. Protein-rich alternative

Format as JSON:
{
  "dish": "",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "fiber": 0,
  "health_rating": 0,
  "recommendation": "",
  "healthy_alternative": "",
  "protein_alternative": ""
}`;

    try {
      const response = await this.callOpenAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing meal:', error);
      throw error;
    }
  }

  /**
   * Call OpenAI API
   * @param {String} prompt - Prompt for OpenAI
   * @returns {Promise<String>} API response
   */
  async callOpenAI(prompt) {
    try {
      // TODO: Implement actual OpenAI API call using openai package
      // Example implementation:
      // const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      //   model: this.model,
      //   messages: [{ role: 'user', content: prompt }]
      // }, {
      //   headers: { 'Authorization': `Bearer ${this.apiKey}` }
      // });
      // return response.data.choices[0].message.content;
      
      console.log('OpenAI API call placeholder - implement actual API integration');
      return JSON.stringify({
        status: 'placeholder',
        message: 'Implement actual OpenAI API integration'
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Content moderation for reels
   * @param {String} imageUrl - Image URL to moderate
   * @returns {Promise<Object>} Moderation results
   */
  async moderateContent(imageUrl) {
    try {
      // TODO: Implement actual moderation using OpenAI's moderation API
      return {
        nudity_detected: false,
        nudity_score: 0,
        unrelated_content: false,
        spam_detected: false,
        contains_fitness_content: true,
        is_approved: true
      };
    } catch (error) {
      console.error('Error moderating content:', error);
      throw error;
    }
  }
}

module.exports = new AIService();
