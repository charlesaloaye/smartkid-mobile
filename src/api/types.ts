export type User = {
  id: number;
  name: string;
  email: string;
  role: 'parent' | 'admin';
};

export type Child = {
  id: number;
  name: string;
  whatsapp_number: string;
  age?: number | null;
  grade?: string | null;
  stream?: string | null;
  subjects?: string[] | null;
  questions_count?: number;
  last_session?: string;
};

export type DashboardResponse = {
  role: string;
  total_children: number;
  total_questions: number;
  learning_streak: number;
  weekly_growth: number;
  weekly_activity: number[];
  children: Child[];
};

export type Message = {
  id: number;
  child_id: number;
  sender: 'child' | 'ai';
  message: string;
  subject?: string | null;
  metadata?: { channel?: 'app' | 'whatsapp' } | null;
  created_at: string;
};

export type SendMessageResponse = {
  message: Message;
  reply: Message;
};

export type SendVoiceMessageResponse = SendMessageResponse & {
  transcript: string;
};

export type MasterySubject = {
  name: string;
  score: number;
  color: string;
};

export type ChildDetail = {
  child: Child;
  mastery: MasterySubject[];
  learning_time: string;
  confidence_score: string | null;
  insight: string | null;
};

export type ActivityItem = {
  id: string;
  type: 'conversation' | 'log';
  child_id?: number;
  child_name?: string;
  message?: string;
  sender?: 'child' | 'ada' | string;
  subject?: string;
  action?: string;
  description?: string;
  created_at: string;
  icon: string;
};
