const cron = require('node-cron');
const DailyHoroscopeService = require('../services/dailyHoroscopeService');

class DailyHoroscopeWorker {
  constructor() {
    this.horoscopeService = new DailyHoroscopeService();
    this.isRunning = false;
  }

  start() {
    console.log('Starting Daily Horoscope Worker...');
    
    // Schedule job to run every day at 12:00 AM (midnight)
    cron.schedule('0 0 * * *', async () => {
      if (this.isRunning) {
        console.log('Daily horoscope generation is already running. Skipping...');
        return;
      }

      this.isRunning = true;
      console.log('Starting daily horoscope generation at midnight:', new Date().toISOString());

      try {
        await this.horoscopeService.generateHoroscopeForAllUsers();
        console.log('Daily horoscope generation completed successfully');
      } catch (error) {
        console.error('Error in daily horoscope generation:', error);
      } finally {
        this.isRunning = false;
      }
    });

    // Also run once at startup to ensure today's horoscopes are generated
    this.runOnceAtStartup();
  }

  async runOnceAtStartup() {
    console.log('Running initial horoscope generation check at startup...');
    
    try {
      await this.horoscopeService.generateHoroscopeForAllUsers();
      console.log('Initial horoscope generation completed');
    } catch (error) {
      console.error('Error in initial horoscope generation:', error);
    }
  }

  // Manual trigger for testing
  async triggerManualGeneration() {
    if (this.isRunning) {
      throw new Error('Horoscope generation is already running');
    }

    this.isRunning = true;
    console.log('Manual horoscope generation triggered:', new Date().toISOString());

    try {
      await this.horoscopeService.generateHoroscopeForAllUsers();
      console.log('Manual horoscope generation completed successfully');
    } catch (error) {
      console.error('Error in manual horoscope generation:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }
}

module.exports = DailyHoroscopeWorker;
