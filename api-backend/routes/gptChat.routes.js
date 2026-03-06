const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LLMService = require('../services/llmService');

// Initialize LLMService
const llmService = new LLMService();

// GPT Chat endpoint
router.post('/chat', auth.requireAuth, async (req, res) => {
  try {
    const { message, model = 'gpt-oss:120B' } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    console.log(`GPT Chat request from user ${req.user.userId}:`, message);

    // Use LLMService to get response from GPT-OSS:120B
    const response = await llmService.callLLM(message);

    if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
      throw new Error('Invalid response from GPT-OSS');
    }

    const aiResponse = response.choices[0].message.content;

    console.log(`GPT-OSS response generated for user ${req.user.userId}`);

    res.json({
      success: true,
      data: {
        response: aiResponse,
        model: model,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Error in GPT chat:', error);
    
    // If it's a connection error, provide a helpful response
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({
        success: false,
        message: 'GPT-OSS service is currently unavailable. Please try again later.',
        error: 'Service temporarily unavailable'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to process chat request',
        error: error.message
      });
    }
  }
});

module.exports = router;
