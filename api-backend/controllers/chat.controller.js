const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const mongoose = require('mongoose');

class ChatController {
  // Get all conversations for the authenticated user
  async getConversations(req, res) {
    try {
      console.log('Getting conversations for user:', req.user.userId);
      
      const conversations = await Conversation.find({ user_id: req.user.userId })
        .sort({ updated_at: -1 })
        .lean();
      
      console.log(`Found ${conversations.length} conversations`);
      
      res.json({
        success: true,
        data: conversations
      });
    } catch (error) {
      console.error('Error getting conversations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get conversations'
      });
    }
  }

  // Create a new conversation
  async createConversation(req, res) {
    try {
      console.log('Creating conversation for user:', req.user.userId);
      
      const { title } = req.body;
      
      const conversation = new Conversation({
        user_id: req.user.userId,
        title: title || 'New Conversation',
        created_at: new Date(),
        updated_at: new Date()
      });
      
      await conversation.save();
      
      console.log('Created conversation:', conversation._id);
      
      res.status(201).json({
        success: true,
        data: conversation
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create conversation'
      });
    }
  }

  // Get messages for a specific conversation
  async getMessages(req, res) {
    try {
      console.log('Getting messages for conversation:', req.params.conversationId);
      
      const { conversationId } = req.params;
      
      // Verify conversation belongs to user
      const conversation = await Conversation.findOne({
        _id: conversationId,
        user_id: req.user.userId
      });
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }
      
      const messages = await Message.find({ conversation_id: conversationId })
        .sort({ created_at: 1 })
        .lean();
      
      console.log(`Found ${messages.length} messages`);
      
      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      console.error('Error getting messages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get messages'
      });
    }
  }

  // Send a message in a conversation
  async sendMessage(req, res) {
    try {
      console.log('Sending message for user:', req.user.userId);
      
      const { conversation_id, message } = req.body;
      
      if (!conversation_id || !message) {
        return res.status(400).json({
          success: false,
          message: 'Conversation ID and message are required'
        });
      }
      
      // Verify conversation belongs to user
      const conversation = await Conversation.findOne({
        _id: conversation_id,
        user_id: req.user.userId
      });
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }
      
      // Save user message
      const userMessage = new Message({
        conversation_id,
        role: 'user',
        content: message,
        created_at: new Date()
      });
      
      await userMessage.save();
      
      // Update conversation timestamp
      await Conversation.findByIdAndUpdate(conversation_id, {
        updated_at: new Date()
      });
      
      // Get AI response
      const aiResponse = await this.getAIResponse(message, conversation_id);
      
      if (aiResponse) {
        // Save AI message
        const aiMessage = new Message({
          conversation_id,
          role: 'assistant',
          content: aiResponse.content,
          ai_analysis_tags: aiResponse.tags || [],
          created_at: new Date()
        });
        
        await aiMessage.save();
        
        console.log('AI response saved:', aiMessage._id);
        
        res.status(201).json({
          success: true,
          data: aiMessage
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to get AI response'
        });
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message'
      });
    }
  }

  // Get AI response from LLM service
  async getAIResponse(userMessage, conversationId) {
    try {
      // Get conversation history for context
      const recentMessages = await Message.find({ conversation_id: conversationId })
        .sort({ created_at: -1 })
        .limit(10)
        .lean();
      
      // Build conversation context
      const context = recentMessages
        .slice(0, -5) // Last 5 messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
      
      // Create prompt for AI
      const prompt = `You are an AI life coach and spiritual guide. You're having a conversation with someone seeking guidance about their life, career, relationships, and personal growth.

Previous conversation context:
${context}

User's latest message: ${userMessage}

Please provide a helpful, empathetic, and insightful response. Focus on:
- Life guidance and personal growth
- Career advice and professional development  
- Relationship guidance and communication
- Spiritual insights and self-discovery
- Practical actionable advice

Keep your response conversational and supportive (under 500 words). If relevant, include specific areas like "life coaching", "career guidance", "relationship advice", "spiritual growth", etc.

Respond in the first person as a caring AI assistant.`;

      // Call LLM service
      const llmService = require('../services/llmService');
      const response = await llmService.generateResponse(prompt);
      
      if (response && response.content) {
        // Extract potential tags from AI response
        const tags = this.extractTags(response.content);
        
        return {
          content: response.content,
          tags: tags
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting AI response:', error);
      return null;
    }
  }

  // Extract relevant tags from AI response
  extractTags(content) {
    const potentialTags = [
      'life coaching', 'career guidance', 'relationship advice', 'spiritual growth',
      'personal development', 'communication skills', 'goal setting',
      'work-life balance', 'decision making', 'self-discovery',
      'emotional intelligence', 'leadership', 'creativity', 'intuition'
    ];
    
    const foundTags = [];
    const lowerContent = content.toLowerCase();
    
    potentialTags.forEach(tag => {
      if (lowerContent.includes(tag.toLowerCase())) {
        foundTags.push(tag);
      }
    });
    
    return foundTags.slice(0, 5); // Max 5 tags
  }

  // Delete a conversation
  async deleteConversation(req, res) {
    try {
      console.log('Deleting conversation:', req.params.conversationId);
      
      const { conversationId } = req.params;
      
      // Verify conversation belongs to user
      const conversation = await Conversation.findOne({
        _id: conversationId,
        user_id: req.user.userId
      });
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }
      
      // Delete all messages in the conversation
      await Message.deleteMany({ conversation_id: conversationId });
      
      // Delete the conversation
      await Conversation.findByIdAndDelete(conversationId);
      
      console.log('Deleted conversation and all messages');
      
      res.json({
        success: true,
        message: 'Conversation deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete conversation'
      });
    }
  }

  // Get a specific conversation
  async getConversation(req, res) {
    try {
      const { conversationId } = req.params;
      
      const conversation = await Conversation.findOne({
        _id: conversationId,
        user_id: req.user.userId
      }).lean();
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }
      
      res.json({
        success: true,
        data: conversation
      });
    } catch (error) {
      console.error('Error getting conversation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get conversation'
      });
    }
  }
}

module.exports = new ChatController();
