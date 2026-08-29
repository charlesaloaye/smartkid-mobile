import { api } from './client';
import type {
  ActivityItem,
  Child,
  ChildDetail,
  DashboardResponse,
  Message,
  PlanKey,
  SendMessageResponse,
  SendVoiceMessageResponse,
  SubscriptionResponse,
  SubscriptionSummary,
  User,
} from './types';

export async function registerParent(payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  consent: boolean;
}) {
  const { data } = await api.post<{ access_token: string; token_type: string }>(
    '/register',
    payload
  );
  return data;
}

export async function loginParent(payload: { email: string; password: string }) {
  const { data } = await api.post<{ access_token: string; token_type: string; role: string }>(
    '/login',
    payload
  );
  return data;
}

export async function logoutParent() {
  await api.post('/logout');
}

export async function verifyOtpApi(otp_code: string) {
  const { data } = await api.post<{ message: string; email_verified: boolean; user?: User }>('/verify-otp', { otp_code });
  return data;
}

export async function resendOtpApi() {
  const { data } = await api.post<{ message: string; otp_code?: string }>('/resend-otp');
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await api.get<User>('/user');
  return data;
}

export async function updateUserProfile(payload: { name: string; email: string }) {
  const { data } = await api.put<{ message: string; user: User }>('/user', payload);
  return data;
}

export async function updateUserPassword(payload: {
  current_password: string;
  password: string;
  password_confirmation: string;
}) {
  const { data } = await api.put<{ message: string }>('/user/password', payload);
  return data;
}

export async function fetchDashboard() {
  const { data } = await api.get<DashboardResponse>('/dashboard');
  return data;
}

export async function fetchActivities() {
  const { data } = await api.get<ActivityItem[]>('/activities');
  return data;
}

export async function fetchChildren() {
  const { data } = await api.get<Child[]>('/children');
  return data;
}

export async function createChild(payload: {
  name: string;
  whatsapp_number: string;
  age?: number;
  grade?: string;
  stream?: string;
  subjects?: string[];
}) {
  const { data } = await api.post<Child>('/children', payload);
  return data;
}

export async function fetchChildDetail(childId: number) {
  const { data } = await api.get<ChildDetail>(`/children/${childId}`);
  return data;
}

export async function fetchMessages(childId: number) {
  const { data } = await api.get<Message[]>(`/children/${childId}/messages`);
  return data;
}

export async function sendTextMessage(childId: number, message: string) {
  const { data } = await api.post<SendMessageResponse>(`/children/${childId}/messages`, {
    message,
  });
  return data;
}

export async function sendVoiceMessage(childId: number, audioUri: string) {
  const form = new FormData();
  form.append('audio', {
    uri: audioUri,
    name: 'recording.m4a',
    type: 'audio/m4a',
  } as unknown as Blob);

  const { data } = await api.post<SendVoiceMessageResponse>(
    `/children/${childId}/voice-messages`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
}

export async function fetchSubscription() {
  const { data } = await api.get<SubscriptionResponse>('/subscription');
  return data;
}

export async function startTrial() {
  const { data } = await api.post<{ message: string; subscription: SubscriptionSummary }>('/subscription/trial');
  return data;
}

export async function checkoutSubscription(plan: PlanKey, callbackUrl: string) {
  const { data } = await api.post<{ authorization_url: string; reference: string }>('/subscription/checkout', {
    plan,
    callback_url: callbackUrl,
  });
  return data;
}

export async function verifySubscriptionPayment(reference: string) {
  const { data } = await api.post<{ status: string; subscription: SubscriptionSummary }>('/subscription/verify', {
    reference,
  });
  return data;
}

export async function cancelSubscription() {
  const { data } = await api.post<{ message: string; subscription: SubscriptionSummary }>('/subscription/cancel');
  return data;
}

export async function forgotPassword(email: string) {
  const { data } = await api.post<{ message: string }>('/forgot-password', { email });
  return data;
}

export async function resetPassword(payload: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}) {
  const { data } = await api.post<{ message: string }>('/reset-password', payload);
  return data;
}
