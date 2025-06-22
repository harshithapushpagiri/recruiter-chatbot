export interface KnowledgeEntry {
  id: string;
  question: string;
  answer: string;
  category: 'experience' | 'skills' | 'projects_&_impact' | 'side_projects' | 'mvp' | 'achievements' | 'general_questions' | 'pm_mindset' | 'personality_&_values' | 'vision_&_learning' | 'education';
  keywords: string[];
  timePeriod?: string | null;
  organization?: string | null;
  relevance?: string;
}

export interface ResumeData {
  personalInfo: {
    name: string;
    title: string;
    summary: string;
    yearsExperience: number;
    location: string;
  };
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    achievements: string[];
    technologies: string[];
  }>;
  skills: {
    technical: string[];
    product: string[];
    leadership: string[];
  };
  projects: Array<{
    name: string;
    description: string;
    impact: string;
    technologies: string[];
    deploymentLink?: string;
  }>;
}