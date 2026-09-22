import { User } from '../models/User.js';
import { SKILL_CATEGORIES } from '../config/constants.js';

const ROLE_SKILL_BENCHMARKS = {
  'AI / Machine Learning Engineer': {
    high: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Deep Learning', 'Linear Algebra'],
    medium: ['Docker', 'MLOps', 'FastAPI', 'Pandas', 'NumPy', 'HuggingFace Transformers'],
    low: ['Kubernetes', 'MLflow', 'CUDA', 'LangChain', 'Vector Databases (Pinecone/Chroma)']
  },
  'Full Stack Engineer': {
    high: ['JavaScript', 'TypeScript', 'React.js', 'Node.js', 'MongoDB', 'PostgreSQL'],
    medium: ['Express.js', 'RESTful API', 'Git', 'Tailwind CSS', 'Docker', 'Redis'],
    low: ['GraphQL', 'AWS', 'Next.js', 'CI/CD Pipelines', 'Microservices Architecture']
  },
  'Frontend Architect': {
    high: ['JavaScript', 'TypeScript', 'React.js', 'HTML5', 'CSS3', 'Web Performance Optimization'],
    medium: ['Next.js', 'Tailwind CSS', 'Redux / Zustand', 'Webpack / Vite', 'Jest / Vitest'],
    low: ['Design Systems', 'Micro-frontends', 'Accessibility (WCAG)', 'GraphQL', 'Storybook']
  },
  'Backend / Cloud Engineer': {
    high: ['Node.js', 'Go', 'PostgreSQL', 'System Design', 'RESTful API', 'Microservices'],
    medium: ['Docker', 'Redis', 'Kafka / RabbitMQ', 'AWS (EC2, S3, RDS)', 'Kubernetes'],
    low: ['Terraform', 'gRPC', 'CI/CD Pipelines', 'Distributed Tracing', 'GraphQL']
  },
  'DevOps / SRE Engineer': {
    high: ['Linux', 'Docker', 'Kubernetes', 'CI/CD Pipelines', 'Terraform', 'Bash Scripting'],
    medium: ['AWS / GCP', 'Prometheus & Grafana', 'GitOps / ArgoCD', 'Ansible', 'Networking'],
    low: ['Python / Go', 'Helm Charts', 'Service Mesh (Istio)', 'Chaos Engineering']
  },
  'Data Scientist': {
    high: ['Python', 'SQL', 'Pandas', 'NumPy', 'Statistical Modeling', 'Machine Learning'],
    medium: ['Tableau / PowerBI', 'Scikit-Learn', 'Data Visualization (Seaborn)', 'Jupyter'],
    low: ['Spark / PySpark', 'BigQuery / Snowflake', 'Airflow', 'A/B Testing']
  }
};

// @desc    Get skill categories and taxonomy
// @route   GET /api/skills/categories
// @access  Public
export const getSkillCategories = async (req, res) => {
  const commonTaxonomy = {
    Programming: ['JavaScript', 'TypeScript', 'Python', 'Go', 'Java', 'C++', 'Rust', 'C#'],
    Frontend: ['React.js', 'Next.js', 'Vue.js', 'Angular', 'Tailwind CSS', 'HTML5', 'CSS3', 'Redux'],
    Backend: ['Node.js', 'Express.js', 'FastAPI', 'Django', 'Spring Boot', 'RESTful API', 'GraphQL', 'Microservices'],
    Database: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'DynamoDB', 'Supabase'],
    'AI/ML': ['Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'LLMs', 'Prompt Engineering', 'LangChain', 'Pandas'],
    Cloud: ['AWS', 'Google Cloud (GCP)', 'Microsoft Azure', 'Cloudflare', 'Vercel', 'Serverless'],
    DevOps: ['Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'Terraform', 'Linux', 'Monitoring (Prometheus)'],
    Tools: ['Git', 'GitHub', 'Postman', 'VS Code', 'Jira', 'Figma', 'Vite', 'Webpack'],
    'Soft Skills': ['Technical Communication', 'Problem Solving', 'Team Leadership', 'Agile/Scrum', 'Cross-functional Collaboration', 'Mentorship']
  };

  res.status(200).json({
    success: true,
    categories: SKILL_CATEGORIES,
    taxonomy: commonTaxonomy,
    availableRoles: Object.keys(ROLE_SKILL_BENCHMARKS)
  });
};

// @desc    Analyze skill gap for target role
// @route   GET /api/skills/gap
// @access  Private
export const getSkillGap = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    const targetRole = req.query.role || user.targetRole || 'Full Stack Engineer';

    const benchmark = ROLE_SKILL_BENCHMARKS[targetRole] || ROLE_SKILL_BENCHMARKS['Full Stack Engineer'];
    const allRequired = [...benchmark.high, ...benchmark.medium, ...benchmark.low];

    const userSkillNames = (user.skills || []).map(s => s.name.toLowerCase().trim());

    const matched = [];
    const missingHigh = [];
    const missingMedium = [];
    const missingLow = [];

    benchmark.high.forEach(s => {
      if (userSkillNames.includes(s.toLowerCase())) matched.push({ name: s, priority: 'High' });
      else missingHigh.push({ name: s, priority: 'High', urgency: 'Immediate Requirement' });
    });

    benchmark.medium.forEach(s => {
      if (userSkillNames.includes(s.toLowerCase())) matched.push({ name: s, priority: 'Medium' });
      else missingMedium.push({ name: s, priority: 'Medium', urgency: 'Competitive Advantage' });
    });

    benchmark.low.forEach(s => {
      if (userSkillNames.includes(s.toLowerCase())) matched.push({ name: s, priority: 'Low' });
      else missingLow.push({ name: s, priority: 'Low', urgency: 'Nice to Have' });
    });

    const totalBenchmarkCount = allRequired.length;
    const readinessScore = Math.round((matched.length / totalBenchmarkCount) * 100);

    // Learning recommendations
    const recommendedLearning = missingHigh.map(item => ({
      skill: item.name,
      priority: item.priority,
      action: `Complete 1 project module and build practical hands-on examples using ${item.name}.`,
      estimatedTime: '1 - 2 weeks'
    }));

    res.status(200).json({
      success: true,
      targetRole,
      readinessScore,
      currentSkillsCount: user.skills?.length || 0,
      matchedSkills: matched,
      missingSkills: {
        high: missingHigh,
        medium: missingMedium,
        low: missingLow,
        totalMissing: missingHigh.length + missingMedium.length + missingLow.length
      },
      recommendedLearning
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user skills
// @route   POST /api/skills
// @access  Private
export const updateSkills = async (req, res, next) => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: 'Skills must be an array of skill objects.'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { skills } },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Skills updated successfully.',
      skills: user.skills,
      profileCompletion: user.getProfileCompletion()
    });
  } catch (error) {
    next(error);
  }
};
