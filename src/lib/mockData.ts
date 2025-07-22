import { v4 as uuidv4 } from 'uuid';
import { 
  User, 
  Source, 
  StylePost, 
  Draft, 
  SourceContent, 
  Feedback,
  DashboardStats 
} from './types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'john.doe@example.com',
    timezone: 'America/New_York',
    delivery_time: '08:00:00',
    active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-07-20T15:30:00Z'
  },
  {
    id: 'user-2',
    email: 'jane.smith@example.com',
    timezone: 'Europe/London',
    delivery_time: '09:00:00',
    active: true,
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-07-21T09:15:00Z'
  },
  {
    id: 'user-3',
    email: 'alex.chen@example.com',
    timezone: 'Asia/Singapore',
    delivery_time: '07:30:00',
    active: false,
    created_at: '2024-02-01T08:00:00Z',
    updated_at: '2024-07-15T12:00:00Z'
  }
];

// Mock Sources
export const mockSources: Source[] = [
  {
    id: 'source-1',
    user_id: 'user-1',
    type: 'rss',
    url: 'https://techcrunch.com/feed/',
    name: 'TechCrunch',
    active: true,
    last_checked: '2024-07-22T06:00:00Z',
    error_count: 0,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-07-20T14:00:00Z'
  },
  {
    id: 'source-2',
    user_id: 'user-1',
    type: 'twitter',
    url: 'https://twitter.com/elonmusk',
    name: 'Elon Musk',
    active: true,
    last_checked: '2024-07-22T06:00:00Z',
    error_count: 0,
    created_at: '2024-01-15T11:00:00Z',
    updated_at: '2024-07-21T08:30:00Z'
  },
  {
    id: 'source-3',
    user_id: 'user-1',
    type: 'rss',
    url: 'https://blog.ycombinator.com/feed/',
    name: 'Y Combinator Blog',
    active: true,
    last_checked: '2024-07-22T06:00:00Z',
    error_count: 1,
    created_at: '2024-01-16T09:00:00Z',
    updated_at: '2024-07-22T06:00:00Z',
    last_error: 'Temporary connection timeout'
  },
  {
    id: 'source-4',
    user_id: 'user-1',
    type: 'rss',
    url: 'https://invalid-feed.com/feed/',
    name: 'Broken Feed',
    active: false,
    last_checked: '2024-07-21T06:00:00Z',
    error_count: 5,
    created_at: '2024-01-17T15:00:00Z',
    updated_at: '2024-07-21T06:00:00Z',
    last_error: 'Feed URL is not accessible'
  },
  {
    id: 'source-5',
    user_id: 'user-1',
    type: 'twitter',
    url: 'https://twitter.com/paulg',
    name: 'Paul Graham',
    active: true,
    last_checked: '2024-07-22T05:45:00Z',
    error_count: 0,
    created_at: '2024-02-01T12:00:00Z',
    updated_at: '2024-07-22T05:45:00Z'
  },
  {
    id: 'source-6',
    user_id: 'user-1',
    type: 'rss',
    url: 'https://a16z.com/feed/',
    name: 'Andreessen Horowitz',
    active: true,
    last_checked: '2024-07-22T06:15:00Z',
    error_count: 0,
    created_at: '2024-02-15T16:30:00Z',
    updated_at: '2024-07-22T06:15:00Z'
  }
];

// Mock Style Posts
export const mockStylePosts: StylePost[] = [
  {
    id: 'style-1',
    user_id: 'user-1',
    content: 'Just shipped a new feature that reduces API response time by 40%. Sometimes the smallest optimizations make the biggest impact. What\'s your favorite performance win?',
    processed: true,
    created_at: '2024-01-15T12:00:00Z',
    processed_at: '2024-01-15T12:05:00Z',
    word_count: 28
  },
  {
    id: 'style-2',
    user_id: 'user-1',
    content: 'Debugging is like being a detective in a crime movie where you are also the murderer. Today I spent 3 hours tracking down a bug I introduced yesterday. The humility is real.',
    processed: true,
    created_at: '2024-01-15T12:05:00Z',
    processed_at: '2024-01-15T12:10:00Z',
    word_count: 32
  },
  {
    id: 'style-3',
    user_id: 'user-1',
    content: 'Hot take: Code reviews are more about knowledge sharing than catching bugs. The best reviews I\'ve received taught me something new about the codebase or a better approach.',
    processed: true,
    created_at: '2024-01-15T12:10:00Z',
    processed_at: '2024-01-15T12:15:00Z',
    word_count: 31
  },
  {
    id: 'style-4',
    user_id: 'user-1',
    content: 'Building in public update: Our user base grew 150% this month. Key lessons: 1) Listen to user feedback religiously 2) Ship fast, iterate faster 3) Community beats marketing every time',
    processed: true,
    created_at: '2024-01-15T12:15:00Z',
    processed_at: '2024-01-15T12:20:00Z',
    word_count: 33
  },
  {
    id: 'style-5',
    user_id: 'user-1',
    content: 'The best engineering advice I ever received: "Make it work, make it right, make it fast" - in that order. Too many projects die because we try to optimize before we validate.',
    processed: true,
    created_at: '2024-01-15T12:20:00Z',
    processed_at: '2024-01-15T12:25:00Z',
    word_count: 35
  },
  {
    id: 'style-6',
    user_id: 'user-1',
    content: '🚀 Launched our MVP today! 6 months of nights and weekends finally paying off. The feedback has been incredible - users are already asking for features we hadn\'t even thought of. This is why you ship early and iterate.',
    processed: true,
    created_at: '2024-01-15T12:25:00Z',
    processed_at: '2024-01-15T12:30:00Z',
    word_count: 38
  },
  {
    id: 'style-7',
    user_id: 'user-1',
    content: 'Unpopular opinion: Most "senior" developers I know got there by being curious, not by memorizing frameworks. The best engineers I work with ask "why" more than "how".',
    processed: true,
    created_at: '2024-01-15T12:30:00Z',
    processed_at: '2024-01-15T12:35:00Z',
    word_count: 29
  },
  {
    id: 'style-8',
    user_id: 'user-1',
    content: 'Remote work tip: Your home office setup matters more than you think. Invested in a good chair and monitor this year - my productivity and back pain both improved dramatically. Worth every penny.',
    processed: true,
    created_at: '2024-01-15T12:35:00Z',
    processed_at: '2024-01-15T12:40:00Z',
    word_count: 34
  },
  {
    id: 'style-9',
    user_id: 'user-1',
    content: 'Today I learned: Sometimes the best code is the code you don\'t write. Spent 2 hours building a complex feature, then realized a simple config change solved the same problem in 5 minutes.',
    processed: false,
    created_at: '2024-07-22T10:00:00Z',
    word_count: 36
  },
  {
    id: 'style-10',
    user_id: 'user-1',
    content: 'Startup life: We pivoted 3 times in 6 months. Each time felt like failure, but looking back, each pivot taught us something crucial about our market. Sometimes you have to fail fast to succeed faster.',
    processed: false,
    created_at: '2024-07-22T11:00:00Z',
    word_count: 39
  }
];

// Mock Source Content
export const mockSourceContent: SourceContent[] = [
  {
    id: 'content-1',
    source_id: 'source-1',
    title: 'AI Startup Raises $50M Series A',
    content: 'A new AI startup focused on developer tools has raised $50M in Series A funding. The company plans to use the funding to expand their team and accelerate product development. The startup, which has been in stealth mode for 18 months, claims their AI-powered debugging tool can reduce development time by 60%.',
    url: 'https://techcrunch.com/2024/07/22/ai-startup-raises-50m',
    published_at: '2024-07-22T08:00:00Z',
    processed: true,
    created_at: '2024-07-22T08:30:00Z'
  },
  {
    id: 'content-2',
    source_id: 'source-2',
    title: null,
    content: 'The future of work is remote-first. Companies that embrace this early will have a massive competitive advantage in talent acquisition. Traditional office-centric companies are already losing top talent to remote-first competitors.',
    url: 'https://twitter.com/elonmusk/status/123456789',
    published_at: '2024-07-22T07:30:00Z',
    processed: true,
    created_at: '2024-07-22T07:45:00Z'
  },
  {
    id: 'content-3',
    source_id: 'source-3',
    title: 'How to Build a Successful SaaS Product',
    content: 'Building a successful SaaS product requires more than just good code. You need to understand your market, validate your assumptions, and iterate based on user feedback. The most successful SaaS founders spend 70% of their time talking to customers and only 30% building.',
    url: 'https://blog.ycombinator.com/how-to-build-saas',
    published_at: '2024-07-22T06:00:00Z',
    processed: true,
    created_at: '2024-07-22T06:15:00Z'
  },
  {
    id: 'content-4',
    source_id: 'source-6',
    title: 'The Scaling Playbook: From 0 to 1000 Users',
    content: 'Scaling a startup from zero to your first thousand users is one of the most challenging phases. It requires a delicate balance of product development, user acquisition, and retention strategies. Most successful startups focus on manual, non-scalable tactics first.',
    url: 'https://a16z.com/scaling-playbook-0-to-1000',
    published_at: '2024-07-21T09:00:00Z',
    processed: true,
    created_at: '2024-07-21T09:15:00Z'
  },
  {
    id: 'content-5',
    source_id: 'source-5',
    title: null,
    content: 'The best entrepreneurs don\'t just solve problems - they understand why problems exist in the first place. This shift from reactive to proactive thinking is what separates good founders from great ones.',
    url: 'https://twitter.com/paulg/status/987654321',
    published_at: '2024-07-20T14:20:00Z',
    processed: true,
    created_at: '2024-07-20T14:35:00Z'
  },
  {
    id: 'content-6',
    source_id: 'source-1',
    title: 'The Rise of AI-Powered Development Tools',
    content: 'AI is transforming how developers write, debug, and deploy code. From GitHub Copilot to automated testing tools, AI is becoming an essential part of the modern development workflow. Early adopters report 40-60% productivity gains.',
    url: 'https://techcrunch.com/2024/07/21/ai-development-tools',
    published_at: '2024-07-21T15:30:00Z',
    processed: false,
    created_at: '2024-07-21T15:45:00Z'
  },
  {
    id: 'content-7',
    source_id: 'source-3',
    title: 'Why Most Startups Fail at Product-Market Fit',
    content: 'Product-market fit isn\'t a destination - it\'s a continuous process. Many startups think they\'ve achieved PMF when they haven\'t, leading to premature scaling and eventual failure. The key is measuring retention, not just acquisition.',
    url: 'https://blog.ycombinator.com/product-market-fit-mistakes',
    published_at: '2024-07-19T11:00:00Z',
    processed: false,
    created_at: '2024-07-19T11:15:00Z'
  }
];

// Mock Drafts
export const mockDrafts: Draft[] = [
  {
    id: 'draft-1',
    user_id: 'user-1',
    content: '🚀 Just saw that another AI startup raised $50M Series A. The developer tools space is absolutely exploding right now.\n\nWhat excites me most? They\'re focusing on solving real problems developers face daily, not just jumping on the AI hype train.\n\nKey takeaway: Great funding follows great product-market fit, not the other way around.\n\nWhat\'s your take on the current AI tools landscape?',
    source_content_id: 'content-1',
    status: 'pending',
    feedback_token: 'feedback-token-1',
    email_sent_at: '2024-07-22T08:00:00Z',
    created_at: '2024-07-22T07:45:00Z',
    updated_at: '2024-07-22T08:00:00Z',
    source_name: 'TechCrunch',
    character_count: 387,
    engagement_score: 8.5
  },
  {
    id: 'draft-2',
    user_id: 'user-1',
    content: '💭 Remote-first isn\'t just a trend anymore - it\'s becoming the default.\n\nCompanies still clinging to "office-first" mentality are going to struggle with talent acquisition. The best developers have options now.\n\nI\'ve seen this shift firsthand. The teams that adapted early are crushing it with global talent pools.\n\nAre you seeing this in your industry too?',
    source_content_id: 'content-2',
    status: 'approved',
    feedback_token: 'feedback-token-2',
    email_sent_at: '2024-07-22T08:00:00Z',
    created_at: '2024-07-22T07:50:00Z',
    updated_at: '2024-07-22T09:15:00Z',
    source_name: 'Elon Musk',
    character_count: 421,
    engagement_score: 9.2
  },
  {
    id: 'draft-3',
    user_id: 'user-1',
    content: '📈 Building SaaS? Here\'s what I wish someone told me earlier:\n\n✅ Code quality matters, but market validation matters more\n✅ Your first 100 users will teach you more than any business plan\n✅ Iterate fast, but don\'t pivot on every piece of feedback\n✅ Revenue solves most problems (but not all of them)\n\nThe hardest part isn\'t building the product - it\'s finding the right problem to solve.\n\nWhat\'s been your biggest SaaS learning?',
    source_content_id: 'content-3',
    status: 'rejected',
    feedback_token: 'feedback-token-3',
    email_sent_at: '2024-07-22T08:00:00Z',
    created_at: '2024-07-22T07:55:00Z',
    updated_at: '2024-07-22T09:30:00Z',
    source_name: 'Y Combinator Blog',
    character_count: 512,
    engagement_score: 7.8
  },
  {
    id: 'draft-4',
    user_id: 'user-1',
    content: '🔥 Hot take: The best engineers aren\'t the ones who write the most code.\n\nThey\'re the ones who:\n→ Ask the right questions before coding\n→ Delete more code than they write\n→ Make complex things simple\n→ Help others level up\n\nTechnical skills get you in the door. Everything else determines how far you go.\n\nWhat non-technical skill has helped you most as a developer?',
    source_content_id: null,
    status: 'pending',
    feedback_token: 'feedback-token-4',
    email_sent_at: null,
    created_at: '2024-07-21T18:00:00Z',
    updated_at: '2024-07-21T18:00:00Z',
    character_count: 456,
    engagement_score: 8.9
  },
  {
    id: 'draft-5',
    user_id: 'user-1',
    content: '⚡ Performance optimization tip that saved us 40% on server costs:\n\nWe were making 3 separate API calls for data that could be fetched in one.\n\nSometimes the biggest wins come from stepping back and questioning the approach, not just optimizing the implementation.\n\n"Make it work, make it right, make it fast" - but also make sure you\'re solving the right problem.\n\nWhat\'s your favorite performance optimization story?',
    source_content_id: null,
    status: 'pending',
    feedback_token: 'feedback-token-5',
    email_sent_at: null,
    created_at: '2024-07-20T16:30:00Z',
    updated_at: '2024-07-20T16:30:00Z',
    character_count: 498,
    engagement_score: 8.1
  },
  {
    id: 'draft-6',
    user_id: 'user-1',
    content: '🎯 Startup milestone: We just hit 1,000 active users!\n\nWhat I learned scaling from 0 to 1K:\n\n• Product-market fit > perfect code\n• User feedback is your north star\n• Manual processes are okay at first\n• Community building beats paid ads\n• Retention matters more than acquisition\n\nNext stop: 10K users. The journey continues!\n\nWhat\'s been your biggest scaling challenge?',
    source_content_id: 'content-4',
    status: 'approved',
    feedback_token: 'feedback-token-6',
    email_sent_at: '2024-07-21T08:00:00Z',
    created_at: '2024-07-21T07:30:00Z',
    updated_at: '2024-07-21T10:45:00Z',
    source_name: 'Andreessen Horowitz',
    character_count: 467,
    engagement_score: 9.1
  },
  {
    id: 'draft-7',
    user_id: 'user-1',
    content: '💡 Today\'s debugging session reminded me why I love programming.\n\nSpent 4 hours chasing a bug that turned out to be a single missing semicolon. Frustrating? Yes. But that moment when everything clicks? Pure magic.\n\nDebugging teaches patience, problem-solving, and humility all at once.\n\nWhat\'s the most ridiculous bug you\'ve ever spent hours on?',
    source_content_id: null,
    status: 'pending',
    feedback_token: 'feedback-token-7',
    email_sent_at: '2024-07-21T08:00:00Z',
    created_at: '2024-07-21T07:15:00Z',
    updated_at: '2024-07-21T08:00:00Z',
    character_count: 423,
    engagement_score: 8.3
  },
  {
    id: 'draft-8',
    user_id: 'user-1',
    content: '🌟 Career advice that changed my trajectory:\n\n"Don\'t just solve problems - understand why they exist."\n\nThis shift from reactive to proactive thinking:\n→ Made me a better engineer\n→ Opened leadership opportunities\n→ Helped me build better products\n→ Improved my problem-solving skills\n\nSometimes the best solution is preventing the problem entirely.\n\nWhat advice changed your career path?',
    source_content_id: 'content-5',
    status: 'rejected',
    feedback_token: 'feedback-token-8',
    email_sent_at: '2024-07-20T08:00:00Z',
    created_at: '2024-07-20T07:20:00Z',
    updated_at: '2024-07-20T11:20:00Z',
    source_name: 'Paul Graham',
    character_count: 489,
    engagement_score: 7.6
  }
];

// Mock Feedback
export const mockFeedback: Feedback[] = [
  {
    id: 'feedback-1',
    draft_id: 'draft-2',
    feedback_type: 'positive',
    created_at: '2024-07-22T09:15:00Z'
  },
  {
    id: 'feedback-2',
    draft_id: 'draft-3',
    feedback_type: 'negative',
    created_at: '2024-07-22T09:30:00Z'
  }
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  total_drafts: 47,
  drafts_this_week: 5,
  positive_feedback: 28,
  negative_feedback: 12,
  feedback_rate: 0.85, // 85% feedback rate
  active_sources: 3
};

// Helper function to get user-specific data
export const getUserData = (userId: string) => ({
  user: mockUsers.find(u => u.id === userId),
  sources: mockSources.filter(s => s.user_id === userId),
  stylePosts: mockStylePosts.filter(sp => sp.user_id === userId),
  drafts: mockDrafts.filter(d => d.user_id === userId),
  stats: mockDashboardStats
});

// Helper function to generate new IDs
export const generateId = () => uuidv4();

// Helper function to get current timestamp
export const getCurrentTimestamp = () => new Date().toISOString();

// Helper function to get timestamp N days ago
export const getDaysAgoTimestamp = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// Helper function to generate realistic engagement scores
export const generateEngagementScore = () => {
  return Math.round((Math.random() * 3 + 7) * 10) / 10; // 7.0-10.0
};

// Helper function to count characters in content
export const getCharacterCount = (content: string) => {
  return content.length;
};

// Helper function to count words in content
export const getWordCount = (content: string) => {
  return content.trim().split(/\s+/).length;
};

// Helper function to create realistic draft content
export const generateDraftContent = (template: string, variables: Record<string, string>) => {
  let content = template;
  Object.entries(variables).forEach(([key, value]) => {
    content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  });
  return content;
};

// Sample content templates for draft generation
export const draftTemplates = [
  '🚀 Just came across an interesting development in {topic}. {insight}\n\nThis reminds me of when I {personal_experience}.\n\nWhat\'s your take on {question}?',
  '💡 Hot take: {opinion}\n\nHere\'s why I think this matters:\n→ {reason1}\n→ {reason2}\n→ {reason3}\n\nAm I missing something here?',
  '📈 {achievement_or_milestone}\n\nKey lessons learned:\n• {lesson1}\n• {lesson2}\n• {lesson3}\n\nWhat\'s been your biggest {related_topic} challenge?',
  '🔥 Unpopular opinion: {controversial_statement}\n\n{supporting_argument}\n\nI\'ve seen this play out in {example}.\n\nChange my mind - what am I getting wrong?',
  '⚡ Quick tip that {benefit}:\n\n{specific_tip}\n\nSometimes the simplest solutions are the most effective.\n\nWhat\'s your favorite {category} hack?'
];

// Error simulation helpers
export const simulateNetworkError = () => {
  const errors = [
    'Network timeout',
    'Connection refused',
    'DNS resolution failed',
    'SSL certificate error',
    'Request timeout'
  ];
  return errors[Math.floor(Math.random() * errors.length)];
};

export const simulateValidationError = (field: string) => {
  const errors = {
    email: 'Invalid email format',
    password: 'Password must be at least 8 characters',
    url: 'Invalid URL format',
    content: 'Content is too short or too long'
  };
  return errors[field as keyof typeof errors] || 'Validation error';
};