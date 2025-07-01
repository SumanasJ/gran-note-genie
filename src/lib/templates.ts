
import { Template } from '@/types/meeting';

export const systemTemplates: Template[] = [
  {
    id: 'one-on-one',
    name: '1-on-1 Meeting',
    description: 'Perfect for regular team check-ins and performance discussions',
    prompt: `You are a meeting assistant. Create a structured summary from this 1-on-1 meeting transcript. Include:

- Key Discussion Points
- Goals & Objectives
- Challenges Discussed
- Action Items
- Next Meeting Topics

Meeting transcript:
{{transcript}}`,
    sections: ['Key Discussion Points', 'Goals & Objectives', 'Challenges Discussed', 'Action Items', 'Next Meeting Topics'],
    isSystemTemplate: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sales-pitch',
    name: 'Sales Pitch',
    description: 'Ideal for client presentations and sales meetings',
    prompt: `You are a sales meeting assistant. Analyze this sales pitch transcript and provide:

- Company Overview
- Current Provider
- Client Requirements
- Budget & Timeline
- Decision Makers
- Next Steps

Meeting transcript:
{{transcript}}`,
    sections: ['Company Overview', 'Current Provider', 'Client Requirements', 'Budget & Timeline', 'Decision Makers', 'Next Steps'],
    isSystemTemplate: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'interview',
    name: 'Interview',
    description: 'Structured for job interviews and candidate assessments',
    prompt: `You are an interview assistant. Summarize this interview transcript with:

- Candidate Background
- Key Skills & Experience
- Strengths & Weaknesses
- Cultural Fit Assessment
- Technical Assessment
- Hiring Decision

Interview transcript:
{{transcript}}`,
    sections: ['Candidate Background', 'Key Skills & Experience', 'Strengths & Weaknesses', 'Cultural Fit Assessment', 'Technical Assessment', 'Hiring Decision'],
    isSystemTemplate: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'project-planning',
    name: 'Project Planning',
    description: 'For project kickoffs and planning sessions',
    prompt: `You are a project planning assistant. Create a structured summary from this planning meeting:

- Project Overview
- Key Stakeholders
- Timeline & Milestones
- Resource Requirements
- Risk Assessment
- Next Steps

Meeting transcript:
{{transcript}}`,
    sections: ['Project Overview', 'Key Stakeholders', 'Timeline & Milestones', 'Resource Requirements', 'Risk Assessment', 'Next Steps'],
    isSystemTemplate: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const getUserTemplates = (): Template[] => {
  const stored = localStorage.getItem('user-templates');
  return stored ? JSON.parse(stored) : [];
};

export const saveUserTemplate = (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Template => {
  const userTemplates = getUserTemplates();
  const newTemplate: Template = {
    ...template,
    id: `user-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    isSystemTemplate: false
  };
  
  userTemplates.push(newTemplate);
  localStorage.setItem('user-templates', JSON.stringify(userTemplates));
  
  return newTemplate;
};

export const getAllTemplates = (): Template[] => {
  return [...systemTemplates, ...getUserTemplates()];
};

export const getTemplateById = (id: string): Template | undefined => {
  return getAllTemplates().find(template => template.id === id);
};

export const deleteUserTemplate = (id: string): void => {
  const userTemplates = getUserTemplates().filter(template => template.id !== id);
  localStorage.setItem('user-templates', JSON.stringify(userTemplates));
};
