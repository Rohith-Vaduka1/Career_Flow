/**
 * AI Service for Career Flow
 * Connects to OpenAI API if OPENAI_API_KEY is provided.
 * Features a comprehensive deterministic intelligent fallback engine
 * to guarantee the app never crashes and always delivers high-value results.
 */

export const callOpenAI = async (messages, options = {}) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null; // Signals caller to use fallback
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: options.model || 'gpt-4o-mini',
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 1200,
        response_format: options.json ? { type: 'json_object' } : undefined
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[AI Service] OpenAI API error (${response.status}): ${errText}`);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.warn(`[AI Service] OpenAI request failed: ${err.message}. Using intelligent fallback.`);
    return null;
  }
};

/**
 * Intelligent Fallback: AI Career Assistant Chat
 */
export const generateChatFallback = (userMessage, userContext = {}) => {
  const msgLower = (userMessage || '').toLowerCase();
  const userName = userContext.name || 'there';
  const targetRole = userContext.targetRole || 'Software Engineer';
  const skills = userContext.skills?.map(s => s.name || s).join(', ') || 'modern software engineering skills';

  if (msgLower.includes('resume') || msgLower.includes('ats')) {
    return `Hello ${userName}! Here are 4 actionable ways to optimize your resume for ${targetRole} positions:

1. **Incorporate Target Keywords**: Ensure your core skills (${skills.slice(0, 50)}...) appear in both your summary and technical competencies section.
2. **Quantify Your Achievements**: Replace vague statements with the Google X-Y-Z formula: "Accomplished [X], as measured by [Y], by doing [Z]".
3. **ATS-Friendly Formatting**: Use clear single-column markdown/plain text headings without nested graphics or non-standard fonts.
4. **Target Role Alignment**: Customize your professional summary to explicitly match the responsibilities of the role you're targeting.

You can also use our **Resume Center** tool to run an instant ATS scan!`;
  }

  if (msgLower.includes('interview') || msgLower.includes('prep') || msgLower.includes('question')) {
    return `Hi ${userName}! For ${targetRole} interviews, here is your preparation game plan:

1. **STAR Behavioral Method**: Structure your stories with Situation, Task, Action, and Result. Always emphasize your personal contribution and measurable outcome.
2. **Core Technical Depth**: Be prepared to discuss deep architectural trade-offs in ${skills.slice(0, 40) || 'your tech stack'}.
3. **System Design**: Practice breaking down high-level requirements, database schema design, caching strategies, and API contracts.
4. **Questions for Interviewers**: Always prepare 2-3 thoughtful questions about engineering culture and tech debt management.

Check out our **Interview Prep** section to practice in real-time with the interactive Mock Interviewer!`;
  }

  if (msgLower.includes('skill') || msgLower.includes('gap') || msgLower.includes('learn')) {
    return `Hi ${userName}! Based on your current profile and target of **${targetRole}**:

- **Your Core Strengths**: ${skills}
- **High-Demand Recommended Additions**: Docker, Kubernetes, Cloud Architecture (AWS/GCP), CI/CD pipelines, and System Design patterns.
- **Next Step**: Head over to the **Skill Gap** page in the left sidebar to view a prioritized breakdown with free curated learning paths!`;
  }

  if (msgLower.includes('job') || msgLower.includes('apply') || msgLower.includes('match')) {
    return `Great to assist you, ${userName}! On Career Flow, you can:

1. Browse **Find Jobs** to view real-time deterministic match percentages calculated directly against your registered skills.
2. Track every submission through the **Applications Kanban Board** to monitor your conversion rates.
3. Use the **AI Analysis** tab on any job details page to see why you're a fit and what topics to brush up on.`;
  }

  return `Hello ${userName}! I am your Career Flow AI Assistant. I can help you with:
- **Resume Optimization & ATS Scoring**
- **Interview Preparation & Mock Interviews**
- **Skill Gap Analysis for ${targetRole}**
- **Job Matching & Application Strategies**
- **Email & Job Scam Risk Evaluation**

What would you like to focus on today?`;
};

/**
 * Intelligent Fallback: Job Fit Analysis
 */
export const generateJobFitAnalysis = (job, user) => {
  const userSkills = user?.skills?.map(s => s.name || s) || [];
  const jobSkills = job?.skills || [];
  const matched = jobSkills.filter(js => userSkills.some(us => us.toLowerCase() === js.toLowerCase()));
  const missing = jobSkills.filter(js => !userSkills.some(us => us.toLowerCase() === js.toLowerCase()));

  return {
    whyGoodMatch: `Your background in ${matched.slice(0, 3).join(', ') || 'software development'} directly aligns with ${job.company}'s core stack for the ${job.title} position.`,
    strengths: matched.length > 0 
      ? matched.map(s => `Strong foundation in ${s} required for day-to-day deliverables.`)
      : ['Solid software engineering fundamentals and transferable problem-solving skills.'],
    missingSkills: missing.length > 0 ? missing : ['No major missing skills identified!'],
    recommendedImprovements: missing.length > 0
      ? [
          `Build a portfolio project demonstrating hands-on experience with ${missing.slice(0, 2).join(' and ')}.`,
          `Highlight any tangential experience in your resume bullet points.`,
          `Review system design and operational best practices for ${missing[0] || 'the core architecture'}.`
        ]
      : ['Tailor your resume summary specifically to emphasize your leadership and project scale.'],
    preparationTopics: [
      `System architecture and scalability for ${job.title}`,
      `Deep dive into ${jobSkills[0] || 'core technologies'} concurrency and performance patterns`,
      `Behavioral examples demonstrating cross-functional collaboration and delivering under tight deadlines`
    ]
  };
};

/**
 * Intelligent Fallback: AI Interview Questions
 */
export const generateInterviewQuestions = (company, role, jobDescription = '') => {
  return {
    role,
    company: company || 'Target Company',
    technical: [
      {
        question: `How would you architect a scalable, fault-tolerant service for a ${role} role?`,
        suggestedAnswer: `Describe a distributed design: client layer, load balancer, stateless API services, caching layer (Redis), persistent storage (Postgres/MongoDB with read replicas), and asynchronous queue workers (RabbitMQ/Kafka) for background jobs.`,
        topics: ['System Design', 'Scalability', 'Fault Tolerance']
      },
      {
        question: `Explain how you handle database optimization, indexing, and query performance bottlenecks.`,
        suggestedAnswer: `Explain execution plans (EXPLAIN ANALYZE), compound indexing, avoiding N+1 queries via proper joins/population, caching frequently queried static datasets, and connection pooling.`,
        topics: ['Databases', 'Performance', 'Indexing']
      },
      {
        question: `What strategies do you employ for testing, CI/CD automation, and zero-downtime deployments?`,
        suggestedAnswer: `Automated unit and integration test suites, linting and security scans in Github Actions, blue/green or canary deployment strategies via container orchestration.`,
        topics: ['DevOps', 'CI/CD', 'Testing']
      }
    ],
    behavioral: [
      {
        question: `Tell me about a time you faced a critical production outage or bug. How did you diagnose and resolve it?`,
        starGuidance: `Situation: Describe the incident and business impact. Task: Your role in incident triage. Action: Log inspection, metric dashboards, hotfix or rollback. Result: Downtime duration, post-mortem, and permanent preventive guardrails established.`,
        suggestedAnswer: `Focus on staying calm, communicating transparently with stakeholders, finding the root cause with telemetry, deploying a safe mitigation, and conducting a blameless post-mortem.`
      },
      {
        question: `Describe a situation where you had a technical disagreement with a team member or lead. How did you resolve it?`,
        starGuidance: `Situation: Architectural choice difference. Task: Reaching alignment without delaying sprint. Action: Built a lightweight benchmark/POC and evaluated against data. Result: Team aligned objectively with mutual respect.`,
        suggestedAnswer: `Emphasize disagree-and-commit culture, objective data-driven benchmarks rather than personal opinions, and aligning with business goals.`
      }
    ],
    hr: [
      {
        question: `Why are you interested in joining ${company || 'our company'} specifically?`,
        suggestedAnswer: `Mention specific admiration for their product impact, engineering challenges at their current scale, and how your skills can solve their current roadmap priorities.`
      },
      {
        question: `Where do you see yourself growing professionally over the next 2-3 years?`,
        suggestedAnswer: `Discuss deepening architectural expertise, mentoring junior engineers, owning complex distributed systems, and driving high-impact product features.`
      }
    ],
    questionsToAskInterviewer: [
      `What is the current biggest technical debt or scaling challenge the team is solving this quarter?`,
      `How does the engineering team balance new feature velocity with code quality, testing, and refactoring?`,
      `What does a typical on-call rotation and deployment cycle look like for this team?`
    ]
  };
};

/**
 * Intelligent Fallback: Mock Interview Evaluation
 */
export const evaluateMockAnswer = (question, userAnswer) => {
  const wordCount = (userAnswer || '').trim().split(/\s+/).filter(Boolean).length;
  const answerLower = (userAnswer || '').toLowerCase();

  let score = 75;
  const feedback = {
    relevance: 'Good',
    clarity: 'Clear and structured',
    technicalCorrectness: 'Solid grasp of concepts',
    communication: 'Professional tone',
    confidence: 'Positive delivery',
    missingPoints: [],
    improvementSuggestions: []
  };

  if (wordCount < 20) {
    score = 45;
    feedback.clarity = 'Too brief';
    feedback.missingPoints.push('The answer lacks depth and context.');
    feedback.improvementSuggestions.push('Expand your explanation with concrete examples and specific technical terminology.');
  } else if (wordCount > 180) {
    score = 80;
    feedback.clarity = 'Detailed, but watch for rambling';
    feedback.improvementSuggestions.push('Try to keep your answer focused around 90-120 seconds to maintain high interviewer engagement.');
  } else {
    score = 85;
  }

  // Check for STAR indicators or technical keywords
  const hasResult = /result|outcome|improved|reduced|delivered|achieved/i.test(userAnswer);
  const hasAction = /i built|i designed|i implemented|i investigated|i decided/i.test(userAnswer);

  if (!hasResult) {
    score = Math.max(score - 10, 40);
    feedback.missingPoints.push('Measurable result or outcome of the action taken.');
    feedback.improvementSuggestions.push('Conclude your answer with the concrete business or technical outcome achieved.');
  }

  if (!hasAction) {
    feedback.missingPoints.push('Specific personal ownership ("I" versus generic "we").');
    feedback.improvementSuggestions.push('Clearly specify your direct contribution rather than just what the team did.');
  }

  return {
    score,
    feedback,
    overallAssessment: score >= 80 
      ? 'Strong response! You communicated technical competence and clear problem-solving ability.'
      : 'Good attempt. Adding measurable outcomes and deeper technical specifics will make this answer stand out.'
  };
};

/**
 * Intelligent Fallback: Career Roadmap Generator
 */
export const generateCareerRoadmap = (currentRole = 'Junior Developer', targetRole = 'Senior Staff Engineer') => {
  return {
    targetRole,
    currentRole,
    estimatedDuration: '6 - 12 Months',
    stages: [
      {
        stage: 1,
        title: 'Core Technical Mastery & Code Quality',
        duration: 'Months 1-3',
        description: 'Solidify advanced language fundamentals, architectural clean code principles, and automated testing.',
        skills: ['Advanced TypeScript/Python', 'Design Patterns', 'Test-Driven Development (TDD)', 'Profiling & Benchmarking'],
        projects: ['Build a high-concurrency microservice with 95%+ unit and integration test coverage.'],
        milestone: 'Deliver production-grade code that requires minimal PR revisions.'
      },
      {
        stage: 2,
        title: 'Distributed Systems & Cloud Architecture',
        duration: 'Months 4-6',
        description: 'Master cloud infrastructure, container orchestration, event-driven architectures, and databases at scale.',
        skills: ['Docker & Kubernetes', 'AWS/GCP Cloud Architecture', 'Kafka / Redis PubSub', 'PostgreSQL Query Optimization'],
        projects: ['Design and deploy an event-driven data processing pipeline handling 10,000 requests/sec.'],
        milestone: 'Deploy a containerized distributed system with autoscaling and monitoring.'
      },
      {
        stage: 3,
        title: 'System Design & High-Availability Engineering',
        duration: 'Months 7-9',
        description: 'Understand end-to-end distributed system trade-offs: CAP theorem, caching hierarchies, consistency models, and rate limiting.',
        skills: ['System Design', 'API Gateway Design', 'Distributed Caching', 'Database Sharding & Replication'],
        projects: ['Author a comprehensive RFC design document for an enterprise-scale distributed system.'],
        milestone: 'Confidently pass Senior/Staff level System Design mock interviews.'
      },
      {
        stage: 4,
        title: 'Interview Mastery & Leadership Presence',
        duration: 'Months 10-12',
        description: 'Polish behavioral STAR stories, technical deep-dives, negotiation strategies, and technical mentorship.',
        skills: ['Executive Communication', 'Technical Mentorship', 'Negotiation', 'Behavioral STAR Framework'],
        projects: ['Mentor junior engineers, contribute to open-source or technical blogs, build an impressive portfolio.'],
        milestone: 'Secure top-tier offers for target role with competitive compensation package.'
      }
    ]
  };
};

/**
 * Intelligent Fallback: Email Guardian Analysis & Scam Detection
 */
export const analyzeEmailAndJobRisk = (emailContent = '') => {
  const contentLower = emailContent.toLowerCase();
  
  // Risk signals
  const signals = [];
  let riskScore = 10; // Base low risk

  // Financial / Money requests
  if (/send money|wire transfer|pay for equipment|processing fee|check deposit|cashier's check|crypto|bitcoin/i.test(emailContent)) {
    riskScore += 60;
    signals.push({ type: 'danger', message: 'Requests advance money, check deposits, or equipment payment (Classic recruitment scam signal).' });
  }

  // Sensitive personal info requests upfront
  if (/social security|ssn|bank account|routing number|credit card|passport scan/i.test(emailContent)) {
    riskScore += 50;
    signals.push({ type: 'danger', message: 'Requests sensitive financial details (SSN, Bank routing, Credit card) before any interview.' });
  }

  // Unrealistic salary or guaranteed job without interview
  if (/100% guaranteed|no interview required|earn \$5000 a week|immediate hire without interview/i.test(emailContent)) {
    riskScore += 40;
    signals.push({ type: 'warning', message: 'Promises guaranteed employment or extraordinary compensation without formal technical screening.' });
  }

  // Suspicious domain or messaging platform
  if (/telegram|whatsapp|signal only|gmail\.com|yahoo\.com|outlook\.com/i.test(emailContent) && /recruiter|hr manager|talent acquisition/i.test(emailContent)) {
    riskScore += 25;
    signals.push({ type: 'warning', message: 'Communication directed exclusively via personal email (Gmail/Yahoo) or Telegram/WhatsApp rather than a verified corporate domain.' });
  }

  // Extreme artificial urgency
  if (/act now|urgent within 2 hours|limited offer expires today|respond immediately/i.test(emailContent)) {
    riskScore += 20;
    signals.push({ type: 'warning', message: 'Pressuring artificial urgency to force quick, unverified actions.' });
  }

  // Categorize Email
  let category = 'General Opportunity';
  if (/invitation to interview|interview scheduled|schedule a time|call with our team/i.test(contentLower)) {
    category = 'Interview Invitation';
  } else if (/unfortunately|not moving forward|other candidates|at this time/i.test(contentLower)) {
    category = 'Application Rejection';
  } else if (/offer letter|pleased to offer|compensation details/i.test(contentLower)) {
    category = 'Offer Letter';
  } else if (/coding challenge|online assessment|hackerrank|coderbyte|take-home/i.test(contentLower)) {
    category = 'Technical Assessment';
  } else if (/reviewed your profile|found your resume on/i.test(contentLower)) {
    category = 'Recruiter Outreach';
  }

  // Extract Dates & Links
  const dateMatches = emailContent.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/gi) || [];
  const linkMatches = emailContent.match(/https?:\/\/[^\s]+/gi) || [];

  let riskLevel = 'Low Risk';
  if (riskScore >= 60) riskLevel = 'High Risk';
  else if (riskScore >= 30) riskLevel = 'Medium Risk';

  const recommendations = [];
  if (riskLevel === 'High Risk') {
    recommendations.push('DO NOT send money, banking information, or purchase equipment.');
    recommendations.push('Verify company contact information directly on their official LinkedIn and careers portal.');
  } else if (riskLevel === 'Medium Risk') {
    recommendations.push('Request to communicate exclusively through corporate email addresses (@company.com).');
    recommendations.push('Check the recruiter’s profile on LinkedIn to confirm their employment at the firm.');
  } else {
    recommendations.push('This appears to be a legitimate recruitment message.');
    if (category === 'Interview Invitation') {
      recommendations.push('Confirm your availability promptly and review the company profile and job description in Career Flow.');
    }
  }

  return {
    category,
    riskLevel,
    riskScore: Math.min(riskScore, 100),
    signals,
    extractedDates: Array.from(new Set(dateMatches)),
    extractedLinks: Array.from(new Set(linkMatches)),
    recommendations,
    disclaimer: 'This automated risk assessment is generated by Career Flow heuristic analysis and should be combined with your own due diligence.'
  };
};
