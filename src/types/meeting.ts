
export interface Template {
  id: string;
  userId?: string;
  name: string;
  description: string;
  prompt: string;
  sections: string[];
  isSystemTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Meeting {
  id: string;
  title: string;
  transcript: string;
  aiSummary: Record<string, string>;
  templateId: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
  status: 'recording' | 'transcribing' | 'processing' | 'completed';
}

export interface NoteSection {
  title: string;
  content: string;
  order: number;
}
