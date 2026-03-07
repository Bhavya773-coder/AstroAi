const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const llmService = require('./llmService');

class DailyHoroscopeService {
  constructor() {
    this.llmService = llmService;
  }

  async generateDailyHoroscope(userId, userProfile) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get zodiac sign from birth date
      const zodiacSign = this.getZodiacSign(userProfile.date_of_birth);
      
      const prompt = `Generate a detailed daily horoscope for ${zodiacSign} for ${today}. 
      Include the following sections in JSON format:
      {
        "date": "${today}",
        "zodiac_sign": "${zodiacSign}",
        "overall": "Overall horoscope for the day",
        "love": "Love and relationships forecast",
        "career": "Career and work forecast", 
        "health": "Health and wellness forecast",
        "lucky_numbers": [1, 2, 3, 4, 5],
        "lucky_color": "color of the day",
        "mood": "overall mood for the day",
        "compatibility": "best compatible signs today",
        "advice": "daily advice and guidance"
      }
      
      Make it inspiring, positive, and insightful. Keep each section concise but meaningful.`;

      const llmResponse = await this.llmService.callLLM(prompt);
      let raw = llmResponse.choices[0].message.content || '{}';
      // Strip markdown code blocks if present
      const codeMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeMatch) raw = codeMatch[1];
      raw = raw.trim();
      const horoscopeData = JSON.parse(raw);

      // Store in reports collection using Mongoose
      const Report = mongoose.connection.db.collection('reports');
      await Report.updateOne(
        {
          user_id: new ObjectId(userId),
          report_type: 'daily_horoscope',
          'daily_horoscope.date': today
        },
        {
          $set: {
            user_id: new ObjectId(userId),
            report_type: 'daily_horoscope',
            content: JSON.stringify(horoscopeData),
            summary: `Daily horoscope for ${zodiacSign} - ${today}`,
            generated_at: new Date(),
            daily_horoscope: horoscopeData
          }
        },
        { upsert: true }
      );

      return horoscopeData;
    } catch (error) {
      console.error('Error generating daily horoscope:', error);
      throw error;
    }
  }

  async getTodayHoroscope(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const Report = mongoose.connection.db.collection('reports');
      
      const report = await Report.findOne({
        user_id: new ObjectId(userId),
        report_type: 'daily_horoscope',
        'daily_horoscope.date': today
      });

      return report?.daily_horoscope || null;
    } catch (error) {
      console.error('Error getting today horoscope:', error);
      throw error;
    }
  }

  async generateHoroscopeForAllUsers() {
    try {
      const db = mongoose.connection.db;
      const today = new Date().toISOString().split('T')[0];
      
      // Get all users with profiles
      const users = await db.collection('users').aggregate([
        {
          $lookup: {
            from: 'profiles',
            localField: '_id',
            foreignField: 'user_id',
            as: 'profile'
          }
        },
        {
          $match: {
            profile: { $ne: [] }
          }
        }
      ]).toArray();

      console.log(`Generating horoscopes for ${users.length} users...`);

      for (const user of users) {
        try {
          const userProfile = user.profile[0];
          
          // Check if horoscope already exists for today
          const existingHoroscope = await this.getTodayHoroscope(user._id);
          
          if (!existingHoroscope) {
            await this.generateDailyHoroscope(user._id, userProfile);
            console.log(`Generated horoscope for user ${user._id}`);
          } else {
            console.log(`Horoscope already exists for user ${user._id}`);
          }
        } catch (error) {
          console.error(`Error generating horoscope for user ${user._id}:`, error);
        }
      }

      console.log('Daily horoscope generation completed');
    } catch (error) {
      console.error('Error in generateHoroscopeForAllUsers:', error);
      throw error;
    }
  }

  getZodiacSign(birthDate) {
    const date = new Date(birthDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
    
    return 'Unknown';
  }
}

module.exports = DailyHoroscopeService;
