export type User = {
  id: number;
  name: string;
  email: string;
  role: 'parent' | 'admin';
  email_verified_at?: string | null;
  id_verified_at?: string | null;
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
  metadata?: {
    channel?: 'app' | 'whatsapp';
    type?: 'image' | 'text' | 'voice';
    image_url?: string;
    image_path?: string;
    reply_to_image?: boolean;
  } | null;
  created_at: string;
};

export type SendMessageResponse = {
  message: Message;
  reply: Message;
  audio_base64?: string;
};

export type SendVoiceMessageResponse = SendMessageResponse & {
  transcript: string;
  audio_url?: string;
  audio_base64?: string;
};

export type SendImageMessageResponse = SendMessageResponse & {
  audio_base64?: string;
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

export type PlanKey = 'starter' | 'family';

export type PlanConfig = {
  label: string;
  amount: number; // kobo
  interval: string;
  child_limit: number;
  trial_days: number;
};

export type SubscriptionSummary = {
  plan: PlanKey | null;
  status: 'none' | 'trialing' | 'active' | 'past_due' | 'canceled';
  has_active_access: boolean;
  trial_ends_at: string | null;
  current_period_ends_at: string | null;
  cancel_at_period_end: boolean;
  has_used_trial: boolean;
  child_limit: number;
  children_count: number;
};

export type SubscriptionResponse = {
  subscription: SubscriptionSummary;
  plans: Record<PlanKey, PlanConfig>;
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
