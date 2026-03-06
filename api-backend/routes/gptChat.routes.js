const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const llmService = require('../services/llmService');
const Message = require('../models/Message');
const mongoose = require('mongoose');

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

    // Create a temporary conversation ID for GPT chat (could be enhanced later)
    const conversationId = new mongoose.Types.ObjectId();

    // Store user message in database
    const userMessage = new Message({
      conversation_id: conversationId,
      role: 'user',
      content: message,
      created_at: new Date()
    });

    await userMessage.save();

    let aiResponse = '';

    try {
      // Use LLMService to get response from GPT-OSS:120B
      const response = await llmService.callLLM(message);

      if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
        throw new Error('Invalid response from GPT-OSS');
      }

      aiResponse = response.choices[0].message.content;

      console.log(`GPT-OSS response generated for user ${req.user.userId}`);

    } catch (llmError) {
      console.error('LLM Service Error:', llmError.message);
      
      // If LLM service is not available, provide a helpful response
      if (llmError.code === 'ECONNREFUSED') {
        aiResponse = "I'm sorry, the GPT-OSS:120B service is currently unavailable. This could be because:\n\n1. The LLM service isn't running on port 8080\n2. The service configuration needs to be updated\n\nPlease check with your administrator to start the GPT-OSS service. In the meantime, I can help you with basic questions about astrology and numerology based on your existing profile data.";
      } else {
        aiResponse = "I'm experiencing some technical difficulties with the AI service. Please try again in a few moments. If the issue persists, please contact support.";
      }
    }

    // Store AI response in database
    const aiMessage = new Message({
      conversation_id: conversationId,
      role: 'assistant',
      content: aiResponse,
      ai_analysis_tags: ['gpt-oss:120b', 'chat'],
      created_at: new Date()
    });

    await aiMessage.save();

    res.json({
      success: true,
      data: {
        response: aiResponse,
        model: model,
        conversation_id: conversationId,
        timestamp: new Date(),
        stored_in_db: true
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

// Get GPT chat messages for a user
router.get('/messages', auth.requireAuth, async (req, res) => {
  try {
    const Message = require('../models/Message');
    
    // Get all messages for this user (you might want to filter by conversation type)
    const messages = await Message.find({})
      .sort({ created_at: 1 })
      .limit(50); // Limit to last 50 messages for performance

    res.json({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error('Error fetching GPT messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

module.exports = router;
