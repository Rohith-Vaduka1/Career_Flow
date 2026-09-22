import {
  callOpenAI,
  generateChatFallback,
  generateInterviewQuestions,
  evaluateMockAnswer,
  generateCareerRoadmap
} from '../services/aiService.js';
import { User } from '../models/User.js';
import { Application } from '../models/Application.js';
import { Interview } from '../models/Interview.js';

// @desc    Chat with AI Career Assistant
// @route   POST /api/ai/chat
// @access  Private
export const chatWithAssistant = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty.'
      });
    }

    const user = await User.findById(req.user._id).lean();
    const appCount = await Application.countDocuments({ userId: req.user._id });
    const interviewCount = await Interview.countDocuments({ userId: req.user._id, status: 'Scheduled' });

    const userContext = {
      name: user.name,
      headline: user.headline,
      targetRole: user.targetRole,
      skills: user.skills,
      applicationCount: appCount,
      scheduledInterviews: interviewCount,
      careerGoals: user.careerGoals
    };

    // Construct prompt messages for OpenAI if key is present
    const systemPrompt = `You are "Career Flow AI", an elite personal career strategist and mentor.
You are assisting ${userContext.name}, currently a "${userContext.headline}" targeting "${userContext.targetRole}".
Key Context:
- Skills: ${userContext.skills?.map(s => s.name).join(', ') || 'Not specified'}
- Active applications: ${userContext.applicationCount}
- Upcoming interviews: ${userContext.scheduledInterviews}
- Career goals: ${userContext.careerGoals || 'Advance to senior roles'}

Respond concisely, professionally, and actionably. Format with clean markdown, bullet points, and high-impact advice.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6),
      { role: 'user', content: message }
    ];

    const aiResponse = await callOpenAI(messages, { max_tokens: 1000 });

    const reply = aiResponse || generateChatFallback(message, userContext);

    res.status(200).json({
      success: true,
      reply,
      isAiPowered: !!aiResponse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate AI Interview Preparation Questions
// @route   POST /api/ai/interview-prep/generate
// @access  Private
export const generateQuestions = async (req, res, next) => {
  try {
    const { company, role, jobDescription } = req.body;

    const targetRole = role || req.user.targetRole || 'Software Engineer';
    const targetCompany = company || 'Tech Firm';

    const fallbackQuestions = generateInterviewQuestions(targetCompany, targetRole, jobDescription);

    // If OpenAI is available, try generating tailored questions
    const messages = [
      {
        role: 'system',
        content: `You are a Principal Tech Interviewer at top-tier firms. Generate comprehensive interview preparation questions in strict JSON format:
{
  "role": "${targetRole}",
  "company": "${targetCompany}",
  "technical": [{"question": "...", "suggestedAnswer": "...", "topics": ["..."]}],
  "behavioral": [{"question": "...", "starGuidance": "...", "suggestedAnswer": "..."}],
  "hr": [{"question": "...", "suggestedAnswer": "..."}],
  "questionsToAskInterviewer": ["..."]
}`
      },
      {
        role: 'user',
        content: `Generate interview prep for role: ${targetRole} at ${targetCompany}. Context: ${jobDescription || 'Standard requirements'}`
      }
    ];

    const aiResult = await callOpenAI(messages, { json: true, max_tokens: 1600 });
    let result = fallbackQuestions;

    if (aiResult) {
      try {
        result = JSON.parse(aiResult);
      } catch {
        result = fallbackQuestions;
      }
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Evaluate Mock Interview Answer
// @route   POST /api/ai/mock-interview/evaluate
// @access  Private
export const evaluateAnswer = async (req, res, next) => {
  try {
    const { question, userAnswer, role } = req.body;

    if (!question || !userAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Both question and candidate answer are required.'
      });
    }

    const fallbackEvaluation = evaluateMockAnswer(question, userAnswer);

    // If OpenAI is available
    const messages = [
      {
        role: 'system',
        content: `You are an expert interview coach evaluating a candidate's answer for a ${role || 'Software'} position.
Return strict JSON:
{
  "score": 85,
  "feedback": {
    "relevance": "...",
    "clarity": "...",
    "technicalCorrectness": "...",
    "communication": "...",
    "confidence": "...",
    "missingPoints": ["..."],
    "improvementSuggestions": ["..."]
  },
  "overallAssessment": "..."
}`
      },
      {
        role: 'user',
        content: `Question: "${question}"\n\nCandidate Answer: "${userAnswer}"`
      }
    ];

    const aiResult = await callOpenAI(messages, { json: true, max_tokens: 800 });
    let result = fallbackEvaluation;

    if (aiResult) {
      try {
        result = JSON.parse(aiResult);
      } catch {
        result = fallbackEvaluation;
      }
    }

    res.status(200).json({
      success: true,
      evaluation: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Personalized Career Roadmap
// @route   POST /api/ai/career-roadmap
// @access  Private
export const getRoadmap = async (req, res, next) => {
  try {
    const { currentRole, targetRole } = req.body;
    const user = await User.findById(req.user._id).lean();

    const fromRole = currentRole || user.headline || 'Software Engineer';
    const toRole = targetRole || user.targetRole || 'Principal Architect';

    const fallbackRoadmap = generateCareerRoadmap(fromRole, toRole);

    const messages = [
      {
        role: 'system',
        content: `Generate a structured career transition roadmap from "${fromRole}" to "${toRole}" in strict JSON:
{
  "targetRole": "${toRole}",
  "currentRole": "${fromRole}",
  "estimatedDuration": "6 - 12 Months",
  "stages": [
    {
      "stage": 1,
      "title": "...",
      "duration": "Months 1-3",
      "description": "...",
      "skills": ["..."],
      "projects": ["..."],
      "milestone": "..."
    }
  ]
}`
      },
      {
        role: 'user',
        content: `Plan roadmap for a professional moving from ${fromRole} to ${toRole}.`
      }
    ];

    const aiResult = await callOpenAI(messages, { json: true, max_tokens: 1400 });
    let roadmap = fallbackRoadmap;

    if (aiResult) {
      try {
        roadmap = JSON.parse(aiResult);
      } catch {
        roadmap = fallbackRoadmap;
      }
    }

    res.status(200).json({
      success: true,
      roadmap
    });
  } catch (error) {
    next(error);
  }
};
