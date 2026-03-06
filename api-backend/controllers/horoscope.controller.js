const llmService = require('../services/llmService');
const Profile = require('../models/Profile');

class HoroscopeController {
  async getDailyHoroscope(req, res) {
    try {
      console.log('Fetching horoscope for user:', req.user);
      console.log('User ID:', req.user.userId);
      
      // Get user's profile to find their zodiac sign
      const profile = await Profile.findOne({ user_id: req.user.userId });
      
      console.log('Found profile:', profile ? 'Yes' : 'No');
      
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found. Please complete your profile first.'
        });
      }

      if (!profile.birth_chart_data) {
        return res.status(404).json({
          success: false,
          message: 'Birth chart data not found. Please complete your profile first.'
        });
      }

      console.log('Birth chart data:', profile.birth_chart_data);

      // Extract zodiac sign from birth chart data
      const zodiacSign = profile.birth_chart_data.sun_sign || 
                          profile.birth_chart_data.enhanced_birth_chart_data?.sun_sign?.sign;

      console.log('Extracted zodiac sign:', zodiacSign);

      if (!zodiacSign) {
        return res.status(404).json({
          success: false,
          message: 'Zodiac sign not found in birth chart data.'
        });
      }

      // Get current date
      const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Check if we already have a horoscope for today (cache for performance)
      const today = new Date().toDateString();
      const cachedHoroscope = profile.daily_horoscopes && profile.daily_horoscopes[today];
      
      if (cachedHoroscope) {
        return res.status(200).json({
          success: true,
          data: cachedHoroscope,
          cached: true
        });
      }

      // Generate new horoscope using AI
      try {
        const horoscopeResponse = await llmService.generateDailyHoroscope(zodiacSign, currentDate);
        
        // Parse the AI response
        let horoscopeData;
        try {
          horoscopeData = JSON.parse(horoscopeResponse.choices[0].message.content);
        } catch (parseError) {
          console.error('Error parsing horoscope JSON:', parseError);
          // Fallback horoscope if JSON parsing fails
          horoscopeData = {
            zodiac_sign: zodiacSign,
            date: currentDate,
            overall_theme: "Cosmic Harmony",
            mood: "Balanced",
            lucky_number: 7,
            lucky_color: "Blue",
            compatibility: {
              best_with: "Libra",
              challenging_with: "Aries"
            },
            key_areas: {
              love: "Focus on communication and understanding in relationships.",
              career: "Good day for creative projects and collaboration.",
              health: "Maintain balance between work and rest.",
              finance: "Stable financial day, avoid impulsive purchases."
            },
            advice: "Trust your intuition today.",
            warning: "Avoid major decisions in the evening.",
            opportunity: "A chance encounter could lead to something meaningful.",
            energy_level: "Medium",
            lucky_time: "Afternoon"
          };
        }

        // Cache the horoscope in the user's profile
        if (!profile.daily_horoscopes) {
          profile.daily_horoscopes = {};
        }
        profile.daily_horoscopes[today] = horoscopeData;
        
        // Keep only last 7 days of horoscopes to save space
        const horoscopeKeys = Object.keys(profile.daily_horoscopes);
        if (horoscopeKeys.length > 7) {
          const oldestKey = horoscopeKeys[0];
          delete profile.daily_horoscopes[oldestKey];
        }

        await profile.save();

        return res.status(200).json({
          success: true,
          data: horoscopeData,
          cached: false
        });

      } catch (llmError) {
        console.error('LLM Error generating horoscope:', llmError);
        
        // Fallback horoscope if AI fails
        const fallbackHoroscope = {
          zodiac_sign: zodiacSign,
          date: currentDate,
          overall_theme: "Cosmic Energy",
          mood: "Neutral",
          lucky_number: 5,
          lucky_color: "Green",
          compatibility: {
            best_with: "Gemini",
            challenging_with: "Scorpio"
          },
          key_areas: {
            love: "Be open to new connections.",
            career: "Focus on completing existing tasks.",
            health: "Take time for self-care today.",
            finance: "Review your budget and financial goals."
          },
          advice: "Stay positive and focused on your goals.",
          warning: "Avoid unnecessary conflicts.",
          opportunity: "Small opportunities may present themselves.",
          energy_level: "Medium",
          lucky_time: "Morning"
        };

        return res.status(200).json({
          success: true,
          data: fallbackHoroscope,
          cached: false,
          fallback: true
        });
      }

    } catch (error) {
      console.error('Error in getDailyHoroscope:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate daily horoscope.'
      });
    }
  }

  async getHoroscopeHistory(req, res) {
    try {
      const profile = await Profile.findOne({ user_id: req.user.userId });
      
      if (!profile || !profile.daily_horoscopes) {
        return res.status(404).json({
          success: false,
          message: 'No horoscope history found.'
        });
      }

      // Return last 7 days of horoscopes
      const horoscopes = Object.entries(profile.daily_horoscopes)
        .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
        .slice(0, 7)
        .map(([date, horoscope]) => ({
          date,
          ...horoscope
        }));

      return res.status(200).json({
        success: true,
        data: horoscopes
      });

    } catch (error) {
      console.error('Error in getHoroscopeHistory:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve horoscope history.'
      });
    }
  }
}

module.exports = new HoroscopeController();
