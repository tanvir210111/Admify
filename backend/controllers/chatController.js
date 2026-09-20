import ChatMessage from '../models/ChatMessage.js';

// Knowledge replies for chat engine
const KNOWLEDGE_RESPONSES = [
  {
    keys: ['hello', 'hi', 'hey'],
    reply: "Hi there! 👋 I'm Admify AI. I can help you with university recommendations, application deadlines, scholarship eligibility, and SOP generation. What would you like to know?",
  },
  {
    keys: ['university', 'universities', 'college'],
    reply: 'I can recommend universities based on your GPA, test scores, and budget. 🎓 We partner with over 450 top global institutions. Would you like me to analyze your profile?',
  },
  {
    keys: ['scholarship', 'scholarships', 'funding', 'money'],
    reply: 'Great question! 💰 Admify matches you with institutional and government scholarships automatically, ranging from $5,000 to full tuition. Check our Scholarships tab!',
  },
  {
    keys: ['sop', 'statement of purpose', 'lor', 'essay'],
    reply: 'Our AI SOP & LOR Generator crafts high-impact, university-aligned personal statements in seconds! Head over to the Documents section in your dashboard to try it.',
  },
  {
    keys: ['fee', 'cost', 'tuition', 'price'],
    reply: 'Tuition fees vary by destination. For example, US universities average $30k–$60k/yr, Canadian universities average $20k–$40k CAD, while German public universities offer virtually tuition-free education!',
  },
];

export const sendMessage = async (req, res, next) => {
  try {
    const { sessionId = 'guest_session', text, isLiveAgentRequest = false } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message text is required',
      });
    }

    const userId = req.user ? req.user._id : undefined;

    // Save student message if database is available
    try {
      await ChatMessage.create({
        sessionId,
        user: userId,
        sender: 'user',
        text,
        isLiveAgentRequest,
      });
    } catch (dbErr) {
      console.warn('[Chat DB]', dbErr.message);
    }

    let replyText = "I'm processing your inquiry. An Admify advisor can provide detailed assistance or you can explore universities directly through our search engine!";

    if (isLiveAgentRequest) {
      replyText = 'Connecting you to a certified study abroad counselor... An agent has been alerted and will join shortly.';
    } else {
      const lower = text.toLowerCase();
      for (const item of KNOWLEDGE_RESPONSES) {
        if (item.keys.some((k) => lower.includes(k))) {
          replyText = item.reply;
          break;
        }
      }
    }

    let aiMessage = {
      sessionId,
      sender: isLiveAgentRequest ? 'agent' : 'ai',
      text: replyText,
      createdAt: new Date().toISOString(),
    };

    // Save bot reply if database is available
    try {
      const saved = await ChatMessage.create({
        sessionId,
        user: userId,
        sender: isLiveAgentRequest ? 'agent' : 'ai',
        text: replyText,
      });
      aiMessage = saved;
    } catch (dbErr) {
      console.warn('[Chat DB]', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      data: {
        reply: aiMessage,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const messages = await ChatMessage.find({ sessionId }).sort({ createdAt: 1 }).limit(50);

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
};
