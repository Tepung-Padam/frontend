import type { ActionType, ActiveModel, AppUser, AtRiskCustomer, Behavior, Branch, BranchAvailability, BranchDetail, Booking, Campaign, CheckInResponse, CorporateSummary, CreditApplication, Customer, CustomerSummary, InboxEvent, InboxMessage, LoginResponse, MerchantRetention, Paginated, Recommendation, RelationshipScore, RetentionSummary, Transaction, ChurnPrediction, OwnSummary } from "@/types/domain";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8000";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code = "API_ERROR") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const data = typeof payload === "object" && payload !== null ? payload as Record<string, unknown> : {};
    
    // Perbaikan kecil: FastAPI 422 mengembalikan array pada 'detail', kode ini menangani jika detail berupa string atau array
    const detail = typeof data.detail === "string" 
        ? data.detail 
        : Array.isArray(data.detail) ? JSON.stringify(data.detail) : "Layanan tidak tersedia. Coba lagi.";
        
    throw new ApiError(detail, response.status, typeof data.code === "string" ? data.code : "API_ERROR");
  }
  return payload as T;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = window.localStorage.getItem("retention.access_token");
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  return readResponse<T>(response);
}

export const api = {
  login: (username: string, password: string) => {
    const body = new URLSearchParams({ username, password });
    return request<LoginResponse>("/api/v1/auth/login", { 
      method: "POST", 
      body, 
      headers: { "Content-Type": "application/x-www-form-urlencoded" } 
    });
  },
  logout: () => request<{ detail: string }>("/api/v1/auth/logout", { method: "POST" }),
  me: () => request<AppUser>("/api/v1/auth/me"),
  customer: (id: string) => request<Customer>(`/api/v1/customers/${id}`),
  customerSummary: (id: string) => request<CustomerSummary>(`/api/v1/customers/${id}/summary`),
  transactions: (id: string, page = 1, pageSize = 20) => request<Paginated<Transaction>>(`/api/v1/customers/${id}/transactions?page=${page}&page_size=${pageSize}`),
  ownCreditApplications: (page = 1, pageSize = 20) => request<Paginated<CreditApplication>>(`/api/v1/me/credit-applications?page=${page}&page_size=${pageSize}`),
  staffCreditApplications: (page = 1, pageSize = 20) => request<Paginated<CreditApplication>>(`/api/v1/credit-applications?page=${page}&page_size=${pageSize}`),
  staffCreditApplication: (id: string) => request<CreditApplication>(`/api/v1/credit-applications/${id}`),
  staffCreditApplicationEvents: (id: string) => request<Paginated<Record<string, unknown>>>(`/api/v1/credit-applications/${id}/events`),
  creditApplication: (id: string) => request<CreditApplication>(`/api/v1/me/credit-applications/${id}`),
  creditApplicationEvents: (id: string) => request<Paginated<Record<string, unknown>>>(`/api/v1/me/credit-applications/${id}/events`),
  messages: (page = 1, pageSize = 20) => request<Paginated<InboxMessage>>(`/api/v1/me/messages?page=${page}&page_size=${pageSize}`),
  message: (id: string) => request<InboxMessage>(`/api/v1/me/messages/${id}`),
  messageEvents: (id: string) => request<Paginated<InboxEvent>>(`/api/v1/me/messages/${id}/events`),
  respondToMessage: (id: string, eventType: "VIEWED" | "ACCEPTED" | "DECLINED", idempotencyKey: string) => request<InboxEvent>(`/api/v1/me/messages/${id}/events`, { method: "POST", headers: { "Idempotency-Key": idempotencyKey }, body: JSON.stringify({ event_type: eventType }) }),
  branches: (city?: string) => request<Branch[]>(`/api/v1/branches${city ? `?city=${encodeURIComponent(city)}` : ""}`),
  branch: (id: string) => request<BranchDetail>(`/api/v1/branches/${id}`),
  branchAvailability: (id: string, date: string) => request<BranchAvailability>(`/api/v1/branches/${id}/availability?date=${encodeURIComponent(date)}`),
  bookings: () => request<Booking[]>("/api/v1/bookings/me"),
  booking: (code: string) => request<Booking>(`/api/v1/bookings/${encodeURIComponent(code)}`),
  createBooking: (payload: { branch_id: string; appointment_date: string; start_time: string; end_time: string; idempotency_key: string }) => request<Booking>("/api/v1/bookings", { method: "POST", body: JSON.stringify(payload) }),
  checkIn: (code: string) => request<CheckInResponse>(`/api/v1/bookings/${encodeURIComponent(code)}/check-in`, { method: "POST" }),
  cancelBooking: (code: string, reason?: string) => request<Booking>(`/api/v1/bookings/${encodeURIComponent(code)}/cancel`, { method: "POST", body: reason ? JSON.stringify({ reason }) : undefined }),
  merchantSummary: () => request<MerchantRetention>("/api/v1/me/merchant-summary"),
  corporateSummary: () => request<CorporateSummary>("/api/v1/me/company-summary"),
  behavior: (id: string) => request<Behavior>(`/api/v1/customers/${id}/behavior`),
  churn: (id: string) => request<ChurnPrediction>(`/api/v1/customers/${id}/churn`),
  relationshipScore: (id: string) => request<RelationshipScore>(`/api/v1/customers/${id}/relationship-score`),
  recommendations: (id: string) => request<Recommendation[]>(`/api/v1/customers/${id}/recommendations`),
  atRisk: () => request<Paginated<AtRiskCustomer>>("/api/v1/retention/at-risk"), 
  retentionSummary: () => request<RetentionSummary>("/api/v1/analytics/retention-summary"),
  activeModel: () => request<ActiveModel>("/api/v1/ml/models/active"),
  campaigns: () => request<Paginated<Campaign>>("/api/v1/campaigns"),
  
  // Endpoint milik Consumer
  meSummary: () => request<OwnSummary>("/api/v1/me/summary"),
  meTransactions: (page = 1, pageSize = 20) => request<Paginated<Transaction>>(`/api/v1/me/transactions?page=${page}&page_size=${pageSize}`),

  // --- Fitur Staff: Campaign & Messaging ---
  createCampaign: (payload: { name: string; campaign_type: ActionType; description: string }) => 
    request<Campaign>("/api/v1/campaigns", { 
      method: "POST", 
      body: JSON.stringify(payload),
      headers: { "Idempotency-Key": crypto.randomUUID() }
    }),
    
  addCampaignTargets: (campaignId: string, targets: { customer_id: string; recommendation_id?: string }[]) => 
    request<any[]>(`/api/v1/campaigns/${campaignId}/targets`, { 
      method: "POST", 
      body: JSON.stringify({ targets }),
      headers: { "Idempotency-Key": crypto.randomUUID() }
    }),
    
  deliverMessage: (customerId: string, payload: { campaign_target_id: string; selection_method: string; title: string; body: string }) => 
    request<InboxMessage>(`/api/v1/customers/${customerId}/messages`, { 
      method: "POST", 
      body: JSON.stringify(payload),
      headers: { "Idempotency-Key": crypto.randomUUID() }
    }),
};