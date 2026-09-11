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
  SendImageMessageResponse,
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

export async function socialLogin(payload: {
  provider: 'google' | 'apple';
  email: string;
  name?: string;
  provider_id: string;
}) {
  const { data } = await api.post<{ access_token: string; token_type: string; user: User; role: string }>(
    '/auth/social',
    payload
  );
  return data;
}

export async function deleteAccount() {
  const { data } = await api.delete<{ message: string }>('/user');
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

export async function loginChild(payload: { username: string; password: string }) {
  const { data } = await api.post<{ access_token: string; token_type: string; role: 'child'; child: Child }>(
    '/child/login',
    payload
  );
  return data;
}

export async function fetchCurrentChild() {
  const { data } = await api.get<{ role: 'child'; child: Child; parent: any }>('/child/me');
  return data;
}

export async function resetChildPassword(childId: number, password?: string) {
  const { data } = await api.post<{ message: string; username: string; password: string }>(
    `/children/${childId}/reset-password`,
    password ? { password } : {}
  );
  return data;
}

export async function createChild(payload: {
  name: string;
  whatsapp_number?: string;
  username?: string;
  password?: string;
  age?: number;
  grade?: string;
  stream?: string;
  subjects?: string[];
}) {
  const { data } = await api.post<Child & { plain_password?: string }>('/children', payload);
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
    {
      timeout: 90000,
      transformRequest: (data) => data, // Prevent axios from transforming FormData
    }
  );
  return data;
}

export async function sendImageMessage(childId: number, imageUri: string, message?: string) {
  const form = new FormData();
  const filename = imageUri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1].toLowerCase() === 'jpg' ? 'jpeg' : match[1].toLowerCase()}` : 'image/jpeg';

  form.append('image', {
    uri: imageUri,
    name: filename,
    type,
  } as unknown as Blob);

  if (message && message.trim()) {
    form.append('message', message.trim());
  }

  const { data } = await api.post<SendImageMessageResponse>(
    `/children/${childId}/image-messages`,
    form,
    {
      timeout: 90000,
      transformRequest: (data) => data, // Prevent axios from transforming FormData
    }
  );
  return data;
}

export async function synthesizeSpeech(childId: number, text: string) {
  const { data } = await api.post<{ audio_base64?: string }>(`/children/${childId}/synthesize-speech`, {
    text,
  });
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
