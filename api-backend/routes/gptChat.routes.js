const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LLMService = require('../services/llmService');

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
    const response = await LLMService.generateResponse({
      prompt: message,
      model: model,
      temperature: 0.7,
      maxTokens: 2000,
      context: [] // No conversation history for GPT chat
    });

    if (!response) {
      throw new Error('Failed to generate response from GPT-OSS');
    }

    console.log(`GPT-OSS response generated for user ${req.user.userId}`);

    res.json({
      success: true,
      data: {
        response: response,
        model: model,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Error in GPT chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat request',
      error: error.message
    });
  }
});

module.exports = router;
