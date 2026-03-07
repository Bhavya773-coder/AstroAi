const llmService = require('../services/llmService');
const DailyHoroscopeService = require('../services/dailyHoroscopeService');
const Profile = require('../models/Profile');

// Global request cache for rate limiting
const requestCache = new Map();

class HoroscopeController {
  constructor() {
    this.dailyHoroscopeService = new DailyHoroscopeService();
    this.getDailyHoroscope = this.getDailyHoroscope.bind(this);
    this.refreshDailyHoroscope = this.refreshDailyHoroscope.bind(this);
    this.getHoroscopeHistory = this.getHoroscopeHistory.bind(this);
    this.getPublicDailyHoroscope = this.getPublicDailyHoroscope.bind(this);
  }

  // Simple, robust horoscope data that doesn't require AI
  getSimpleHoroscope(zodiacSign, currentDate) {
    const horoscopes = {
      'Aries': {
        overall_theme: 'Dynamic Energy',
        mood: 'Energetic',
        lucky_number: 9,
        lucky_color: 'Red',
        compatibility: { best_with: 'Leo', challenging_with: 'Cancer' },
        key_areas: {
          love: 'Your passion attracts others today. Be bold but considerate.',
          career: 'New opportunities await. Take initiative on projects.',
          health: 'High energy - channel it productively with exercise.',
          finance: 'Good day for investments, but avoid impulse buys.'
        },
        advice: 'Your natural leadership shines today.',
        warning: 'Avoid rushing into decisions without thinking.',
        opportunity: 'A chance to lead a project could appear.',
        energy_level: 'High',
        lucky_time: 'Morning'
      },
      'Taurus': {
        overall_theme: 'Steady Progress',
        mood: 'Grounded',
        lucky_number: 6,
        lucky_color: 'Green',
        compatibility: { best_with: 'Virgo', challenging_with: 'Aquarius' },
        key_areas: {
          love: 'Stability in relationships brings comfort.',
          career: 'Consistent effort pays off. Stay focused.',
          health: 'Take time for relaxation and self-care.',
          finance: 'Financial planning brings security.'
        },
        advice: 'Patience is your greatest asset today.',
        warning: 'Don\'t let stubbornness block progress.',
        opportunity: 'A long-term project shows promise.',
        energy_level: 'Medium',
        lucky_time: 'Afternoon'
      },
      'Gemini': {
        overall_theme: 'Social Connections',
        mood: 'Curious',
        lucky_number: 5,
        lucky_color: 'Yellow',
        compatibility: { best_with: 'Libra', challenging_with: 'Pisces' },
        key_areas: {
          love: 'Communication deepens bonds. Share your thoughts.',
          career: 'Networking opens doors. Connect with colleagues.',
          health: 'Mental stimulation needed. Learn something new.',
          finance: 'Multiple income streams possible.'
        },
        advice: 'Your versatility is your strength.',
        warning: 'Avoid spreading yourself too thin.',
        opportunity: 'An unexpected conversation brings insight.',
        energy_level: 'High',
        lucky_time: 'Evening'
      },
      'Cancer': {
        overall_theme: 'Emotional Harmony',
        mood: 'Nurturing',
        lucky_number: 2,
        lucky_color: 'Silver',
        compatibility: { best_with: 'Scorpio', challenging_with: 'Aries' },
        key_areas: {
          love: 'Home and family bring joy. Create comfort.',
          career: 'Intuition guides decisions. Trust your gut.',
          health: 'Emotional well-being is key. Practice self-care.',
          finance: 'Security-focused decisions pay off.'
        },
        advice: 'Your empathy is a superpower.',
        warning: 'Don\'t absorb others\' negative emotions.',
        opportunity: 'A chance to help someone in need.',
        energy_level: 'Medium',
        lucky_time: 'Night'
      },
      'Leo': {
        overall_theme: 'Creative Expression',
        mood: 'Confident',
        lucky_number: 1,
        lucky_color: 'Gold',
        compatibility: { best_with: 'Aries', challenging_with: 'Taurus' },
        key_areas: {
          love: 'Your charisma attracts admirers. Shine brightly.',
          career: 'Leadership opportunities arise. Take charge.',
          health: 'High energy needs creative outlet.',
          finance: 'Bold investments may pay off.'
        },
        advice: 'Your confidence inspires others.',
        warning: 'Avoid letting ego drive decisions.',
        opportunity: 'A creative project gains recognition.',
        energy_level: 'High',
        lucky_time: 'Noon'
      },
      'Virgo': {
        overall_theme: 'Practical Wisdom',
        mood: 'Analytical',
        lucky_number: 5,
        lucky_color: 'Brown',
        compatibility: { best_with: 'Taurus', challenging_with: 'Gemini' },
        key_areas: {
          love: 'Thoughtful gestures strengthen bonds.',
          career: 'Attention to detail impresses superiors.',
          health: 'Routine brings stability. Stay consistent.',
          finance: 'Budgeting and planning bring rewards.'
        },
        advice: 'Your precision is valuable.',
        warning: 'Don\'t overanalyze simple situations.',
        opportunity: 'A problem-solving skill is needed.',
        energy_level: 'Medium',
        lucky_time: 'Morning'
      },
      'Libra': {
        overall_theme: 'Balanced Harmony',
        mood: 'Diplomatic',
        lucky_number: 7,
        lucky_color: 'Pink',
        compatibility: { best_with: 'Gemini', challenging_with: 'Capricorn' },
        key_areas: {
          love: 'Partnership energy is strong. Compromise works.',
          career: 'Collaboration brings success. Team up.',
          health: 'Balance work and rest. Find equilibrium.',
          finance: 'Fair dealings build trust.'
        },
        advice: 'Your sense of justice guides well.',
        warning: 'Avoid indecision on important matters.',
        opportunity: 'A mediation role could appear.',
        energy_level: 'Medium',
        lucky_time: 'Afternoon'
      },
      'Scorpio': {
        overall_theme: 'Deep Transformation',
        mood: 'Intense',
        lucky_number: 8,
        lucky_color: 'Black',
        compatibility: { best_with: 'Cancer', challenging_with: 'Leo' },
        key_areas: {
          love: 'Passion deepens connections. Be authentic.',
          career: 'Research uncovers hidden opportunities.',
          health: 'Emotional release is healing. Let go.',
          finance: 'Strategic investments grow wealth.'
        },
        advice: 'Your intensity is magnetic.',
        warning: 'Avoid obsessive thinking patterns.',
        opportunity: 'A revelation changes your perspective.',
        energy_level: 'High',
        lucky_time: 'Night'
      },
      'Sagittarius': {
        overall_theme: 'Adventure Awaits',
        mood: 'Optimistic',
        lucky_number: 3,
        lucky_color: 'Purple',
        compatibility: { best_with: 'Aries', challenging_with: 'Virgo' },
        key_areas: {
          love: 'Adventure together strengthens bonds.',
          career: 'New skills expand opportunities. Learn.',
          health: 'Outdoor activities energize you.',
          finance: 'Travel brings unexpected benefits.'
        },
        advice: 'Your optimism is contagious.',
        warning: 'Don\'t overcommit to too many projects.',
        opportunity: 'A learning opportunity appears.',
        energy_level: 'High',
        lucky_time: 'Morning'
      },
      'Capricorn': {
        overall_theme: 'Ambitious Achievement',
        mood: 'Disciplined',
        lucky_number: 4,
        lucky_color: 'Gray',
        compatibility: { best_with: 'Taurus', challenging_with: 'Aries' },
        key_areas: {
          love: 'Commitment builds trust. Be reliable.',
          career: 'Hard work brings recognition. Persist.',
          health: 'Structure in routine supports wellness.',
          finance: 'Long-term planning pays dividends.'
        },
        advice: 'Your ambition inspires respect.',
        warning: 'Don\'t neglect relationships for work.',
        opportunity: 'A leadership position opens up.',
        energy_level: 'Medium',
        lucky_time: 'Afternoon'
      },
      'Aquarius': {
        overall_theme: 'Innovative Thinking',
        mood: 'Intellectual',
        lucky_number: 11,
        lucky_color: 'Blue',
        compatibility: { best_with: 'Gemini', challenging_with: 'Scorpio' },
        key_areas: {
          love: 'Intellectual connection stimulates romance.',
          career: 'Innovation sets you apart. Think differently.',
          health: 'Mental stimulation prevents boredom.',
          finance: 'Technology investments show promise.'
        },
        advice: 'Your uniqueness is your strength.',
        warning: 'Don\'t detach from emotional needs.',
        opportunity: 'A groundbreaking idea emerges.',
        energy_level: 'High',
        lucky_time: 'Evening'
      },
      'Pisces': {
        overall_theme: 'Intuitive Flow',
        mood: 'Dreamy',
        lucky_number: 12,
        lucky_color: 'Sea Green',
        compatibility: { best_with: 'Cancer', challenging_with: 'Gemini' },
        key_areas: {
          love: 'Empathy deepens emotional bonds.',
          career: 'Creativity solves problems. Trust inspiration.',
          health: 'Mental health needs attention. Meditate.',
          finance: 'Intuitive decisions about money work well.'
        },
        advice: 'Your compassion heals others.',
        warning: 'Avoid escapism when facing reality.',
        opportunity: 'A creative solution is needed.',
        energy_level: 'Medium',
        lucky_time: 'Night'
      }
    };

    return horoscopes[zodiacSign] || horoscopes['Aries']; // Default to Aries if sign not found
  }

  // Normalize horoscope data to the shape the frontend expects (overall_theme, key_areas, etc.)
  normalizeHoroscopeForFrontend(horoscope, zodiacSign, currentDate) {
    if (!horoscope) return null;
    const date = currentDate || new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const sign = zodiacSign || horoscope.zodiac_sign || 'Aries';
    // Already in frontend shape (from getSimpleHoroscope)
    if (horoscope.overall_theme && horoscope.key_areas && typeof horoscope.key_areas === 'object') {
      return { ...horoscope, date: horoscope.date || date, zodiac_sign: horoscope.zodiac_sign || sign };
    }
    // LLM/service shape: overall, love, career, health, lucky_numbers[], etc.
    return {
      overall_theme: horoscope.overall_theme || horoscope.overall || 'Cosmic Energy',
      date: horoscope.date || date,
      zodiac_sign: horoscope.zodiac_sign || sign,
      key_areas: {
        love: horoscope.key_areas?.love ?? horoscope.love ?? 'Focus on connections today.',
        career: horoscope.key_areas?.career ?? horoscope.career ?? 'Professional growth awaits.',
        health: horoscope.key_areas?.health ?? horoscope.health ?? 'Wellness focus recommended.',
        finance: horoscope.key_areas?.finance ?? horoscope.finance ?? 'Financial stability in focus.'
      },
      mood: horoscope.mood || 'Balanced',
      energy_level: horoscope.energy_level || 'Medium',
      lucky_number: typeof horoscope.lucky_number === 'number' ? horoscope.lucky_number : (Array.isArray(horoscope.lucky_numbers) && horoscope.lucky_numbers[0]) || 7,
      advice: horoscope.advice || 'Trust your intuition today.',
      warning: horoscope.warning || null
    };
  }

  getZodiacSignFromProfile(profile) {
    if (!profile) return null;
    const sign = profile.birth_chart_data?.sun_sign || profile.birth_chart_data?.enhanced_birth_chart_data?.sun_sign?.sign;
    if (sign) return sign;
    if (profile.date_of_birth) return this.dailyHoroscopeService.getZodiacSign(profile.date_of_birth);
    return null;
  }

  async getDailyHoroscope(req, res) {
    try {
      const userId = req.user.userId;
      const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      console.log('Fetching daily horoscope for user:', userId);

      const profile = await Profile.findOne({ user_id: userId });
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found. Please complete your profile first.'
        });
      }

      const zodiacSign = this.getZodiacSignFromProfile(profile) || 'Aries';

      // 1) Try cached horoscope from DB
      let horoscope = await this.dailyHoroscopeService.getTodayHoroscope(userId);
      if (horoscope) {
        const data = this.normalizeHoroscopeForFrontend(horoscope, zodiacSign, currentDate);
        return res.status(200).json({ success: true, data, cached: true });
      }

      // 2) Generate new horoscope (or fallback to simple)
      try {
        horoscope = await this.dailyHoroscopeService.generateDailyHoroscope(userId, profile);
      } catch (genErr) {
        console.error('Daily horoscope generation failed, using simple horoscope:', genErr.message);
        horoscope = this.getSimpleHoroscope(zodiacSign, currentDate);
      }

      const data = this.normalizeHoroscopeForFrontend(horoscope, zodiacSign, currentDate);
      return res.status(200).json({ success: true, data, cached: false });
    } catch (error) {
      console.error('Error in getDailyHoroscope:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to load daily horoscope.'
      });
    }
  }

  async refreshDailyHoroscope(req, res) {
    try {
      const userId = req.user.userId;
      
      console.log('Refreshing horoscope for user:', req.user);
      
      // Get user's profile
      const profile = await Profile.findOne({ user_id: userId });
      
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found. Please complete your profile first.'
        });
      }

      // Extract zodiac sign from birth chart data
      const zodiacSign = profile.birth_chart_data?.sun_sign || 
                          profile.birth_chart_data?.enhanced_birth_chart_data?.sun_sign?.sign;

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

      // Clear today's cache
      const today = new Date().toDateString();
      if (profile.daily_horoscopes && profile.daily_horoscopes[today]) {
        delete profile.daily_horoscopes[today];
        console.log('Cleared cached horoscope for today:', today);
      }

      // Generate fresh AI horoscope
      let horoscopeData;
      
      try {
        horoscopeData = await llmService.generateDailyHoroscope(zodiacSign, currentDate);
        console.log('Successfully generated fresh AI horoscope for:', zodiacSign);
      } catch (aiError) {
        console.error('AI horoscope generation failed:', aiError.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to generate fresh horoscope. AI service unavailable.'
        });
      }
      
      // Add date and zodiac sign to the horoscope
      const completeHoroscope = {
        zodiac_sign: zodiacSign,
        date: currentDate,
        ...horoscopeData
      };

      // Cache the fresh horoscope on profile (legacy path)
      if (!profile.daily_horoscopes) {
        profile.daily_horoscopes = {};
      }
      profile.daily_horoscopes[today] = completeHoroscope;
      await profile.save();
      console.log('Saved fresh horoscope for:', zodiacSign);

      const data = this.normalizeHoroscopeForFrontend(completeHoroscope, zodiacSign, currentDate);
      return res.status(200).json({
        success: true,
        data,
        cached: false,
        refreshed: true
      });

    } catch (error) {
      console.error('Error in refreshDailyHoroscope:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to refresh daily horoscope.'
      });
    }
  }

  async getPublicDailyHoroscope(req, res) {
    try {
      const { zodiac_sign } = req.query;
      
      if (!zodiac_sign) {
        return res.status(400).json({
          success: false,
          message: 'Zodiac sign is required. Please provide zodiac_sign query parameter.'
        });
      }

      // Validate zodiac sign
      const validSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      if (!validSigns.includes(zodiac_sign)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid zodiac sign. Please provide a valid zodiac sign.'
        });
      }

      const today = new Date().toISOString().split('T')[0];
      
      // Create a simple public horoscope using the existing simple horoscope data
      const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const simpleHoroscope = this.getSimpleHoroscope(zodiac_sign, currentDate);
      
      const publicHoroscope = {
        date: today,
        zodiac_sign: zodiac_sign,
        overall: simpleHoroscope.overall_theme,
        love: simpleHoroscope.key_areas.love,
        career: simpleHoroscope.key_areas.career,
        health: simpleHoroscope.key_areas.health,
        lucky_numbers: [simpleHoroscope.lucky_number],
        lucky_color: simpleHoroscope.lucky_color,
        mood: simpleHoroscope.mood,
        compatibility: `Best with ${simpleHoroscope.compatibility.best_with}`,
        advice: simpleHoroscope.advice
      };

      return res.status(200).json({
        success: true,
        data: publicHoroscope,
        cached: false,
        public: true
      });

    } catch (error) {
      console.error('Error in getPublicDailyHoroscope:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate public daily horoscope.'
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
