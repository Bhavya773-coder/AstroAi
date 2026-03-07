const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const llmService = require('../services/llmService');
const Message = require('../models/Message');
const Profile = require('../models/Profile');
const mongoose = require('mongoose');

const CHAT_RATE_LIMIT = 30;
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: CHAT_RATE_LIMIT,
  message: { success: false, message: 'Too many messages. Please wait a moment.' }
});

function formatDateForContext(dateStr) {
  if (!dateStr) return 'Not provided';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function buildUserProfileBlock(profile) {
  if (!profile) return 'No profile available.';
  const lc = profile.life_context || {};
  const bc = profile.birth_chart_data || {};
  const nd = profile.numerology_data || {};
  return `
User Profile:
Name: ${profile.full_name || 'Not provided'}
Date of Birth: ${formatDateForContext(profile.date_of_birth)}
Time of Birth: ${profile.time_of_birth || 'Not provided'}
Place of Birth: ${profile.place_of_birth || 'Not provided'}
Gender: ${(profile.gender || 'Not provided').charAt(0).toUpperCase() + (profile.gender || '').slice(1)}
Current Location: ${profile.current_location || profile.place_of_birth || 'Not provided'}

Life Context:
Career Stage: ${(lc.career_stage || 'Not provided').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
Relationship Status: ${(lc.relationship_status || 'Not provided').charAt(0).toUpperCase() + (lc.relationship_status || '').slice(1)}
Main Life Focus: ${(lc.main_life_focus || 'Not provided').charAt(0).toUpperCase() + (lc.main_life_focus || '').slice(1)}
Personality Style: ${(lc.personality_style || 'Not provided').charAt(0).toUpperCase() + (lc.personality_style || '').slice(1)}
Primary Life Concern: ${lc.primary_life_problem || 'Not provided'}

Birth Chart (use for astrological analysis):
Sun Sign: ${bc.sun_sign || 'Not set'}
Moon Sign: ${bc.moon_sign || 'Not set'}
Ascendant: ${bc.ascendant || 'Not set'}
Dominant Planet: ${bc.dominant_planet || 'Not set'}

Numerology (optional): Life Path ${nd.life_path || '—'}, Destiny ${nd.destiny || '—'}, Personal Year ${nd.personal_year || '—'}
`.trim();
}

function buildConversationHistoryBlock(messages) {
  if (!messages || messages.length === 0) return '';
  const lines = messages.map((m) => {
    const label = m.role === 'user' ? 'User' : 'Astrologer';
    return `${label}: ${m.content}`;
  });
  return 'Previous conversation:\n' + lines.join('\n\n');
}

function buildFullAstrologerPrompt(userMessage, profileBlock, conversationBlock) {
  return `You are a professional Vedic astrologer. You are analyzing the astrology profile of the user and providing personalized guidance. You MUST answer every question. Never say "I can't help with that" or refuse to answer. Your role is to give astrology-based insights, predictions, and guidance using the user's birth data and life context.

RULES:
- Always respond as a knowledgeable, calm, and supportive astrologer.
- Use the user's birth chart (Sun, Moon, Ascendant, dominant planet) and life context in your answer.
- For relationship questions: reference their relationship status, emotional style, and planetary influences.
- For career: use career stage and relevant signs. For timing: use transits and personal year if available.
- Keep tone wise, calm, supportive, and slightly mystical but practical.
- If some birth data is missing, work with what is provided and mention that more detail could refine the reading.
- Never refuse. If the question is vague, give a general astrological perspective and invite a follow-up.

SYSTEM CONTEXT – User's astrology profile (use this for every response):

${profileBlock}
${conversationBlock ? '\n\n' + conversationBlock + '\n\n' : ''}

Current user question: ${userMessage}

Provide your astrological analysis and guidance now. Address the user by name if provided. Be specific to their chart and situation.`;
}

router.post('/chat', auth.requireAuth, chatLimiter, async (req, res) => {
  try {
    const { message, model = 'gpt-oss:120B' } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const userId = req.user.userId;
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    const conversationId = userObjectId;
    const trimmedMessage = message.trim();

    const profile = await Profile.findOne({ user_id: userObjectId }).lean();
    const profileBlock = buildUserProfileBlock(profile || {});

    const lastMessages = await Message.find({ user_id: userObjectId })
      .sort({ created_at: -1 })
      .limit(10)
      .lean();
    const ordered = lastMessages.reverse();
    const conversationBlock = buildConversationHistoryBlock(ordered);

    const fullPrompt = buildFullAstrologerPrompt(trimmedMessage, profileBlock, conversationBlock);

    const userMessageDoc = new Message({
      user_id: userObjectId,
      conversation_id: conversationId,
      role: 'user',
      content: trimmedMessage,
      created_at: new Date()
    });
    await userMessageDoc.save();

    let aiResponse = '';

    try {
      const response = await llmService.callLLM(fullPrompt);

      if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
        throw new Error('Invalid response from model');
      }

      aiResponse = response.choices[0].message.content;

      if (typeof aiResponse !== 'string' || !aiResponse.trim()) {
        aiResponse = 'Based on your chart and current influences, this is a favorable time to focus on your intentions. I’m here for follow-up questions whenever you’d like to go deeper.';
      }

      if (/i can't help|i cannot help|cannot assist|can't assist|not able to help|refuse/i.test(aiResponse)) {
        aiResponse = `Dear ${profile?.full_name || 'friend'}, as your astrologer I’m here to offer guidance. Given your focus on relationships and your emotional nature, this year invites you to be open to new connections while honoring your need for depth. Your chart suggests a period of emotional growth—trust your intuition and take small steps toward the connections you want. If you’d like, we can look at specific timing or areas of life next.`;
      }
    } catch (llmError) {
      console.error('LLM Service Error:', llmError.message);
      if (llmError.code === 'ECONNREFUSED') {
        aiResponse = "Your personal astrologer service is temporarily unavailable. Please try again in a few minutes. You can still explore your Birth Chart and Daily Horoscope on the dashboard.";
      } else {
        aiResponse = "I’m having a brief technical difficulty. Please try your question again in a moment, or rephrase it.";
      }
    }

    const aiMessageDoc = new Message({
      user_id: userObjectId,
      conversation_id: conversationId,
      role: 'assistant',
      content: aiResponse,
      ai_analysis_tags: ['gpt-oss:120b', 'astrologer', 'chat'],
      created_at: new Date()
    });
    await aiMessageDoc.save();

    res.json({
      success: true,
      data: {
        response: aiResponse,
        model,
        conversation_id: conversationId,
        timestamp: new Date(),
        stored_in_db: true
      }
    });
  } catch (error) {
    console.error('Error in GPT chat:', error);
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable. Please try again later.'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to process chat request',
      error: error.message
    });
  }
});

router.get('/messages', auth.requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;

    const messages = await Message.find({ user_id: userObjectId })
      .sort({ created_at: 1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

router.get('/profile-summary', auth.requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;

    const profile = await Profile.findOne({ user_id: userObjectId }).lean();
    if (!profile) {
      return res.json({
        success: true,
        data: { full_name: null, date_of_birth: null, sun_sign: null, has_profile: false }
      });
    }

    const bc = profile.birth_chart_data || {};
    res.json({
      success: true,
      data: {
        full_name: profile.full_name,
        date_of_birth: profile.date_of_birth,
        time_of_birth: profile.time_of_birth,
        place_of_birth: profile.place_of_birth,
        sun_sign: bc.sun_sign || null,
        moon_sign: bc.moon_sign || null,
        ascendant: bc.ascendant || null,
        has_profile: true
      }
    });
  } catch (error) {
    console.error('Error fetching chat profile summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile summary'
    });
  }
});

module.exports = router;
