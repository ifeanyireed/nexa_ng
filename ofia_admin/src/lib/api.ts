import { User, School, SubscriptionPlan, Invoice, PayoutRequest, ScratchCardBatch, BlogPost, SuiteStats } from './types';
import axios from 'axios';

const api = axios.create();

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('resultspro_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;

const USERS_API = process.env.NEXT_PUBLIC_USERS_API || '';
const RESULTS_API = process.env.NEXT_PUBLIC_RESULTS_API || '';
const EXAMS_API = process.env.NEXT_PUBLIC_EXAMS_API || '';
const CLASSROOM_API = process.env.NEXT_PUBLIC_CLASSROOM_API || '';
const TUTORS_API = process.env.NEXT_PUBLIC_TUTORS_API || '';
const COURSES_API = process.env.NEXT_PUBLIC_COURSES_API || '';

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('resultspro_admin_token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function fetchSuiteStats(): Promise<SuiteStats> {
  try {
    const res = await fetch(`${USERS_API}/api/v1/admin/stats`, { headers: getAuthHeader(), cache: 'no-store' });
    return await res.json();
  } catch {
    return {
      totalUsers: 0,
      totalSchools: 0,
      verifiedSchools: 0,
      pendingVerifications: 0,
      activeSubscriptions: 0,
      totalRevenue: 0,
      activeAgents: 0,
      cbtExamsCount: 0,
      activeTutors: 0,
      supportTicketsPending: 0,
    };
  }
}

// 2. Schools Management
export async function fetchSchools(): Promise<School[]> {
  try {
    const res = await fetch(`${USERS_API}/api/v1/tenants`, { 
      headers: getAuthHeader(),
      cache: 'no-store'
    });
    const data = await res.json();
    return Array.isArray(data) ? data : (data.tenants || []);
  } catch {
    return [];
  }
}

export async function createTenant(payload: any): Promise<boolean> {
  try {
    const res = await fetch(`${USERS_API}/api/v1/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function verifySchool(schoolId: string, status: 'VERIFIED' | 'REJECTED', reason?: string): Promise<boolean> {
  try {
    const res = await fetch(`${USERS_API}/api/v1/tenants/verify/${schoolId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status, reason }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// 3. User Management
export async function fetchUsers(): Promise<User[]> {
  try {
    const res = await fetch(`${USERS_API}/api/v1/users`, { headers: getAuthHeader(), cache: 'no-store' });
    const data = await res.json();
    return Array.isArray(data) ? data : (data.users || []);
  } catch {
    return [];
  }
}

export async function updateUserStatus(userId: string, status: string): Promise<boolean> {
  try {
    const res = await fetch(`${USERS_API}/api/v1/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// 4. Subscriptions & Billing
export async function fetchPlans(): Promise<any[]> {
  try {
    const res = await fetch(`${USERS_API}/api/v1/billing/plans`, { headers: getAuthHeader(), cache: 'no-store' });
    const data = await res.json();
    return data.plans || data || [];
  } catch {
    return [];
  }
}

export async function fetchInvoices(schoolId?: string): Promise<Invoice[]> {
  try {
    const url = schoolId ? `${USERS_API}/api/v1/billing/invoices/tenant/${schoolId}` : `${USERS_API}/api/v1/admin/invoices`;
    const res = await fetch(url, { headers: getAuthHeader(), cache: 'no-store' });
    const data = await res.json();
    return data.invoices || (Array.isArray(data) ? data : []);
  } catch {
    return [];
  }
}

// 5. Agents & Payouts
export async function fetchPayoutRequests(): Promise<PayoutRequest[]> {
  try {
    const res = await fetch(`${USERS_API}/api/v1/admin/payouts`, { headers: getAuthHeader(), cache: 'no-store' });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function processPayout(payoutId: string, action: 'APPROVE' | 'REJECT' | 'MARK_PAID'): Promise<boolean> {
  try {
    const res = await fetch(`${USERS_API}/api/v1/agents/payouts/${payoutId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ action }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// 6. ResultPRO Scratch Cards
export async function generateScratchCardBatch(schoolId: string, quantity: number, unitCost: number): Promise<any> {
  try {
    const res = await fetch(`${RESULTS_API}/api/v1/cards/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ school_id: schoolId, quantity, unit_cost: unitCost }),
    });
    return await res.json();
  } catch (err: any) {
    return { error: err.message };
  }
}

// 7. Blog & CMS
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${USERS_API}/api/v1/cms/blog/posts`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data.posts || []);
  } catch {
    return [];
  }
}

// --- EXAMSPRO API ---

export async function fetchExamproOverview() {
  try {
    const res = await fetch(`${EXAMS_API}/api/admin/overview`, { headers: getAuthHeader(), cache: 'no-store' });
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchExamproExams() {
  try {
    const res = await fetch(`${EXAMS_API}/api/admin/exams`, { headers: getAuthHeader(), cache: 'no-store' });
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchExamproQuestions(params?: { page?: number; limit?: number; search?: string; examId?: number|string; subjectId?: number|string; topicId?: number|string }) {
  try {
    let url = `${EXAMS_API}/api/admin/questions?`;
    if (params) {
      const qs = new URLSearchParams();
      if (params.page) qs.append('page', params.page.toString());
      if (params.limit) qs.append('limit', params.limit.toString());
      if (params.search) qs.append('search', params.search);
      if (params.examId) qs.append('examId', params.examId.toString());
      if (params.subjectId) qs.append('subjectId', params.subjectId.toString());
      if (params.topicId) qs.append('topicId', params.topicId.toString());
      url += qs.toString();
    }
    const res = await fetch(url, { headers: getAuthHeader(), cache: 'no-store' });
    return await res.json();
  } catch {
    return { questions: [], total: 0, page: 1, limit: 20 };
  }
}

export async function fetchExamproBattles() {
  try {
    const res = await fetch(`${EXAMS_API}/api/admin/battles/monitor-stats`, { headers: getAuthHeader(), cache: 'no-store' });
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchExamproUsers() {
  try {
    const res = await fetch(`${EXAMS_API}/api/admin/users-access`, { headers: getAuthHeader(), cache: 'no-store' });
    const data = await res.json();
    return Array.isArray(data) ? data : (data.users || []);
  } catch {
    return [];
  }
}

export async function fetchExamproFinancials() {
  try {
    const res = await fetch(`${EXAMS_API}/api/admin/finances/stats`, { headers: getAuthHeader(), cache: 'no-store' });
    return await res.json();
  } catch {
    return null;
  }
}

// --- CLASSROOMPRO API ---
export async function fetchClassroomNotes() {
  try {
    const res = await fetch(`${CLASSROOM_API}/api/notes`, { headers: getAuthHeader(), cache: 'no-store' });
    const data = await res.json();
    return Array.isArray(data.notes) ? data.notes : [];
  } catch {
    return [];
  }
}

export async function fetchClassroomQuizzes() {
  try {
    const res = await fetch(`${CLASSROOM_API}/api/quizzes`, { headers: getAuthHeader(), cache: 'no-store' });
    const data = await res.json();
    return Array.isArray(data.quizzes) ? data.quizzes : [];
  } catch {
    return [];
  }
}

export async function fetchClassroomFlashcards() {
  try {
    const res = await fetch(`${CLASSROOM_API}/api/flashcards`, { headers: getAuthHeader(), cache: 'no-store' });
    const data = await res.json();
    return Array.isArray(data.flashcards) ? data.flashcards : [];
  } catch {
    return [];
  }
}

// --- TUTORSPRO API ---
export async function fetchTutorsproTutors() {
  try {
    const res = await fetch(`${TUTORS_API}/api/admin/tutors`, { headers: getAuthHeader(), cache: 'no-store' });
    const data = await res.json();
    return Array.isArray(data.tutors) ? data.tutors : [];
  } catch {
    return [];
  }
}

export async function fetchTutorsproBookings() {
  try {
    const res = await fetch(`${TUTORS_API}/api/admin/bookings`, { headers: getAuthHeader(), cache: 'no-store' });
    const data = await res.json();
    return Array.isArray(data.bookings) ? data.bookings : [];
  } catch {
    return [];
  }
}

export async function fetchTutorsproPayouts() {
  try {
    const res = await fetch(`${TUTORS_API}/api/admin/payouts`, { headers: getAuthHeader(), cache: 'no-store' });
    const data = await res.json();
    return Array.isArray(data.payouts) ? data.payouts : [];
  } catch {
    return [];
  }
}

// --- COURSESPRO API ---
export async function fetchCoursesproCohorts() {
  try {
    const res = await fetch(`${COURSES_API}/api/admin/cohorts`, { headers: getAuthHeader(), cache: 'no-store' });
    const data = await res.json();
    return Array.isArray(data.cohorts) ? data.cohorts : [];
  } catch {
    return [];
  }
}

export async function fetchCoursesproEnrollments() {
  try {
    const res = await fetch(`${COURSES_API}/api/admin/enrollments`, { headers: getAuthHeader(), cache: 'no-store' });
    const data = await res.json();
    return Array.isArray(data.enrollments) ? data.enrollments : [];
  } catch {
    return [];
  }
}


// 5. Agents
export async function fetchAgents() {
  try {
    const res = await fetch(`${USERS_API}/api/v1/admin/agents`, { headers: getAuthHeader(), cache: 'no-store' });
    const data = await res.json();
    return data.agents || [];
  } catch {
    return [];
  }
}

export async function fetchAgentReferrals() {
  try {
    const res = await fetch(`${USERS_API}/api/v1/admin/agents/referrals`, { headers: getAuthHeader(), cache: 'no-store' });
    const data = await res.json();
    return data.referrals || [];
  } catch {
    return [];
  }
}

export async function fetchAgentAssignments() {
  try {
    const res = await fetch(`${USERS_API}/api/v1/admin/agents/assignments`, { headers: getAuthHeader(), cache: 'no-store' });
    const data = await res.json();
    return data.assignments || [];
  } catch {
    return [];
  }
}

export async function fetchAgentPayouts() {
  try {
    const res = await fetch(`${USERS_API}/api/v1/admin/payouts`, { headers: getAuthHeader(), cache: 'no-store' });
    const data = await res.json();
    return data.payouts || [];
  } catch {
    return [];
  }
}

export async function createExamproExam(data: any) {
  const res = await fetch(`${EXAMS_API}/api/admin/exams`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create exam');
  return res.json();
}

export async function updateExamproExam(id: number | string, data: any) {
  const res = await fetch(`${EXAMS_API}/api/admin/exams/${id}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update exam');
  return res.json();
}

export async function deleteExamproExam(id: number | string) {
  const res = await fetch(`${EXAMS_API}/api/admin/exams/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to delete exam');
  return res.json();
}

export async function fetchExamproSubjects(examId: number | string) {
  try {
    const res = await fetch(`${EXAMS_API}/api/exams/${examId}/subjects`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data.subjects || []);
  } catch {
    return [];
  }
}

export async function createExamproSubject(data: any) {
  const res = await fetch(`${EXAMS_API}/api/admin/subjects`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create subject');
  return res.json();
}

export async function updateExamproSubject(id: number | string, data: any) {
  const res = await fetch(`${EXAMS_API}/api/admin/subjects/${id}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update subject');
  return res.json();
}

export async function deleteExamproSubject(id: number | string) {
  const res = await fetch(`${EXAMS_API}/api/admin/subjects/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to delete subject');
  return res.json();
}

export async function createExamproQuestion(data: any) {
  const res = await fetch(`${EXAMS_API}/api/admin/questions`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create question');
  return res.json();
}

export async function updateExamproQuestion(id: string, data: any) {
  const res = await fetch(`${EXAMS_API}/api/admin/questions/${id}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update question');
  return res.json();
}

export async function deleteExamproQuestion(id: string) {
  const res = await fetch(`${EXAMS_API}/api/admin/questions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to delete question');
  return res.json();
}

export async function fetchExamproTopics(subjectId: number | string) {
  try {
    const res = await fetch(`${EXAMS_API}/api/exams/subjects/${subjectId}/topics`, { headers: getAuthHeader(), cache: 'no-store' });
    const data = await res.json();
    return Array.isArray(data) ? data : (data.topics || []);
  } catch {
    return [];
  }
}

export async function fetchExamproLiveRooms(params?: { page?: number; limit?: number; search?: string; status?: string }) {
  try {
    let url = `${EXAMS_API}/api/admin/liverooms?`;
    if (params) {
      const qs = new URLSearchParams();
      if (params.page) qs.append('page', params.page.toString());
      if (params.limit) qs.append('limit', params.limit.toString());
      if (params.search) qs.append('search', params.search);
      if (params.status) qs.append('status', params.status);
      url += qs.toString();
    }
    const res = await fetch(url, { headers: getAuthHeader(), cache: 'no-store' });
    return await res.json();
  } catch {
    return { rooms: [], total: 0, page: 1, limit: 20 };
  }
}

export async function deleteExamproLiveRoom(id: string) {
  const res = await fetch(`${EXAMS_API}/api/admin/liverooms/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to delete live room');
  return res.json();
}

export async function fetchExamproBattleMatches(params?: { page?: number; limit?: number; search?: string; status?: string }) {
  try {
    let url = `${EXAMS_API}/api/admin/battles?`;
    if (params) {
      const qs = new URLSearchParams();
      if (params.page) qs.append('page', params.page.toString());
      if (params.limit) qs.append('limit', params.limit.toString());
      if (params.search) qs.append('search', params.search);
      if (params.status) qs.append('status', params.status);
      url += qs.toString();
    }
    const res = await fetch(url, { headers: getAuthHeader(), cache: 'no-store' });
    return await res.json();
  } catch {
    return { battles: [], total: 0, page: 1, limit: 20 };
  }
}

export async function deleteExamproBattleMatch(id: string) {
  const res = await fetch(`${EXAMS_API}/api/admin/battles/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to delete battle');
  return res.json();
}

export async function fetchExamproTournaments() {
  try {
    const res = await fetch(`${EXAMS_API}/api/admin/tournaments`, { headers: getAuthHeader(), cache: 'no-store' });
    return await res.json();
  } catch {
    return [];
  }
}

export async function createExamproTournament(data: any) {
  const res = await fetch(`${EXAMS_API}/api/admin/tournaments`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create tournament');
  return res.json();
}

export async function updateExamproTournament(id: string, data: any) {
  const res = await fetch(`${EXAMS_API}/api/admin/tournaments/${id}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update tournament');
  return res.json();
}

export async function deleteExamproTournament(id: string) {
  const res = await fetch(`${EXAMS_API}/api/admin/tournaments/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to delete tournament');
  return res.json();
}

export async function fetchExamproReports(params?: { type?: string; status?: string }) {
  try {
    let url = `${EXAMS_API}/api/admin/reports?`;
    if (params) {
      const qs = new URLSearchParams();
      if (params.type) qs.append('type', params.type);
      if (params.status) qs.append('status', params.status);
      url += qs.toString();
    }
    const res = await fetch(url, { headers: getAuthHeader(), cache: 'no-store' });
    return await res.json();
  } catch {
    return [];
  }
}

export async function updateExamproReportStatus(id: string, status: string, adminNotes: string = '') {
  const res = await fetch(`${EXAMS_API}/api/admin/reports/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeader(),
    body: JSON.stringify({ status, adminNotes }),
  });
  if (!res.ok) throw new Error('Failed to update report status');
  return res.json();
}

// ExamsPRO Admin Referral Settings
export async function fetchExamproSettings(): Promise<any[]> {
  const res = await fetch(`${EXAMS_API}/api/admin/settings?_t=${Date.now()}`, { headers: { ...getAuthHeader(), 'Cache-Control': 'no-cache' }, cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateExamproSetting(id: string, value: string): Promise<any> {
  const res = await fetch(`${EXAMS_API}/api/admin/settings/${id}`, {
    method: 'PUT',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ value })
  });
  if (!res.ok) throw new Error('Failed to update setting');
  return res.json();
}

export async function fetchExamproPayouts(): Promise<any[]> {
  const res = await fetch(`${EXAMS_API}/api/admin/payouts`, { headers: getAuthHeader(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch payouts');
  return res.json();
}

export async function updateExamproPayoutStatus(id: string, status: string): Promise<any> {
  const res = await fetch(`${EXAMS_API}/api/admin/payouts/${id}`, {
    method: 'PUT',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update payout');
  return res.json();
}

// ExamsPRO Store Management
export async function fetchExamproStorePacks(): Promise<any[]> {
  const res = await fetch(`${EXAMS_API}/api/admin/coin-packs?_t=${Date.now()}`, { headers: { ...getAuthHeader(), 'Cache-Control': 'no-cache' }, cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch store packs');
  return res.json();
}

export async function createExamproStorePack(data: any): Promise<any> {
  const res = await fetch(`${EXAMS_API}/api/admin/coin-packs`, {
    method: 'POST',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create store pack');
  return res.json();
}

export async function updateExamproStorePack(id: string, data: any): Promise<any> {
  const res = await fetch(`${EXAMS_API}/api/admin/coin-packs/${id}`, {
    method: 'PUT',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update store pack');
  return res.json();
}

export async function deleteExamproStorePack(id: string): Promise<any> {
  const res = await fetch(`${EXAMS_API}/api/admin/coin-packs/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to delete store pack');
  return res.json();
}

// ExamsPRO Plan Management (Legacy / Local module plans)
export async function fetchExamproPlans(): Promise<any[]> {
  try {
    const res = await fetch(`${USERS_API}/api/v1/billing/plans?app_module=ExamsPRO`, { headers: getAuthHeader(), cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.plans || [];
  } catch (err) {
    console.error("Error fetching exampro plans:", err);
    return [];
  }
}

export async function createExamproPlan(data: any): Promise<any> {
  const res = await fetch(`${EXAMS_API}/api/admin/plans`, {
    method: 'POST',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create exampro plan');
  return res.json();
}

export async function updateExamproPlan(id: string, data: any): Promise<any> {
  const res = await fetch(`${EXAMS_API}/api/admin/plans/${id}`, {
    method: 'PUT',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update exampro plan');
  return res.json();
}

export async function deleteExamproPlan(id: string): Promise<any> {
  const res = await fetch(`${EXAMS_API}/api/admin/plans/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error('Failed to delete exampro plan');
  return res.json();
}

export async function updateTenant(tenantId: string, payload: any): Promise<boolean> {
  try {
    const res = await fetch(`${USERS_API}/api/v1/tenants/update/${tenantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const res = await fetch(`${USERS_API}/api/v1/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchSupportTickets(): Promise<any[]> {
  try {
    const res = await fetch(`${USERS_API}/api/v1/support/admin/tickets`, { headers: getAuthHeader(), cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data || [];
  } catch (err) {
    console.error("Error fetching tickets:", err);
    return [];
  }
}
