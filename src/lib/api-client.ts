import type {
  ActionType,
  ActiveModel,
  AppUser,
  AtRiskCustomer,
  Behavior,
  Branch,
  BranchAvailability,
  BranchDetail,
  Booking,
  Campaign,
  CheckInResponse,
  CorporateSummary,
  CreditApplication,
  Customer,
  CustomerSummary,
  InboxEvent,
  InboxMessage,
  LoginResponse,
  MerchantRetention,
  OwnSummary,
  Paginated,
  ChurnPrediction,
  Recommendation,
  RelationshipScore,
  RetentionSummary,
  Transaction,
  TopDrivers,
} from "@/types/domain";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8000";

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

function formatDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item: unknown) => {
        if (typeof item === "object" && item !== null) {
          const d = item as Record<string, unknown>;
          const field =
            Array.isArray(d.loc) && d.loc.length > 0
              ? String(d.loc[d.loc.length - 1])
              : null;
          const msg = typeof d.msg === "string" ? d.msg : "nilai tidak valid";
          return field ? `${field}: ${msg}` : msg;
        }
        return String(item);
      })
      .join("; ");
  }
  return "Layanan tidak tersedia. Coba lagi.";
}

async function readResponse<T>(response: Response): Promise<T> {
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const data =
      typeof payload === "object" && payload !== null
        ? (payload as Record<string, unknown>)
        : {};
    throw new ApiError(
      typeof data.message === "string" ? data.message : formatDetail(data.detail),
      response.status,
      typeof data.code === "string" ? data.code : "API_ERROR",
    );
  }
  return payload as T;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = window.localStorage.getItem("retention.access_token");
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (response.status === 401) {
    window.localStorage.removeItem("retention.access_token");
    window.localStorage.removeItem("retention.user");
    window.dispatchEvent(new Event("retention:unauthorized"));
  }
  return readResponse<T>(response);
}

// ─── Branch query params ──────────────────────────────────────────────────────
export interface BranchesParams {
  city?: string;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  page_size?: number;
}

// ─── Credit event payload ─────────────────────────────────────────────────────
export interface CreditEventPayload {
  expected_version: number;
  event_type: "STAGE_CHANGED" | "DOCUMENT_UPDATED";
  to_stage?: string;
  document_requirement_id?: string;
  document_status?: string;
  customer_note?: string;
  idempotency_key: string;
}

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  login: (username: string, password: string) => {
    const body = new URLSearchParams({ username, password });
    return request<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },
  logout: () => request<{ detail: string }>("/api/v1/auth/logout", { method: "POST" }),
  me: () => request<AppUser>("/api/v1/auth/me"),

  // ── Customers ─────────────────────────────────────────────────────────────
  customer: (id: string) => request<Customer>(`/api/v1/customers/${id}`),
  customerSummary: (id: string) => request<CustomerSummary>(`/api/v1/customers/${id}/summary`),
  transactions: (id: string, page = 1, pageSize = 20) =>
    request<Paginated<Transaction>>(
      `/api/v1/customers/${id}/transactions?page=${page}&page_size=${pageSize}`,
    ),

  // ── Credit ────────────────────────────────────────────────────────────────
  ownCreditApplications: (page = 1, pageSize = 20) =>
    request<Paginated<CreditApplication>>(
      `/api/v1/me/credit-applications?page=${page}&page_size=${pageSize}`,
    ),

  createCreditApplication: (payload: {
    product_category: string;
    requested_amount: string;
    currency: string;
    idempotency_key: string;
  }) =>
    request<CreditApplication>("/api/v1/me/credit-applications", {
      method: "POST",
      body: JSON.stringify({
        product_category: payload.product_category,
        requested_amount: payload.requested_amount,
        currency: payload.currency,
      }),
      headers: { "Idempotency-Key": payload.idempotency_key },
    }),

  staffCreditApplications: (page = 1, pageSize = 20) =>
    request<Paginated<CreditApplication>>(
      `/api/v1/credit-applications?page=${page}&page_size=${pageSize}`,
    ),
  staffCreditApplication: (id: string) =>
    request<CreditApplication>(`/api/v1/credit-applications/${id}`),
  staffCreditApplicationEvents: (id: string) =>
    request<Paginated<Record<string, unknown>>>(`/api/v1/credit-applications/${id}/events`),

  staffAddCreditEvent: (id: string, payload: CreditEventPayload) =>
    request<Record<string, unknown>>(`/api/v1/credit-applications/${id}/events`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Idempotency-Key": payload.idempotency_key },
    }),

  creditApplication: (id: string) =>
    request<CreditApplication>(`/api/v1/me/credit-applications/${id}`),
  creditApplicationEvents: (id: string) =>
    request<Paginated<Record<string, unknown>>>(`/api/v1/me/credit-applications/${id}/events`),

  // ── Inbox / Messages ──────────────────────────────────────────────────────
  messages: (page = 1, pageSize = 20) =>
    request<Paginated<InboxMessage>>(
      `/api/v1/me/messages?page=${page}&page_size=${pageSize}`,
    ),
  message: (id: string) => request<InboxMessage>(`/api/v1/me/messages/${id}`),
  messageEvents: (id: string) =>
    request<Paginated<InboxEvent>>(`/api/v1/me/messages/${id}/events`),
  respondToMessage: (
    id: string,
    eventType: "VIEWED" | "ACCEPTED" | "DECLINED",
    idempotencyKey: string,
  ) =>
    request<InboxEvent>(`/api/v1/me/messages/${id}/events`, {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({ event_type: eventType }),
    }),

  // ── Branches ──────────────────────────────────────────────────────────────
  branches: (params: BranchesParams = {}) => {
    const qs = new URLSearchParams();
    if (params.city) qs.set("city", params.city);
    if (params.latitude != null) qs.set("latitude", String(params.latitude));
    if (params.longitude != null) qs.set("longitude", String(params.longitude));
    if (params.radius_km != null) qs.set("radius_km", String(params.radius_km));
    if (params.page_size != null) qs.set("page_size", String(params.page_size));
    const query = qs.toString();
    return request<Paginated<Branch>>(
      `/api/v1/branches${query ? `?${query}` : ""}`,
    );
  },
  branch: (id: string) => request<BranchDetail>(`/api/v1/branches/${id}`),
  branchAvailability: (id: string, date: string) =>
    request<BranchAvailability>(
      `/api/v1/branches/${id}/availability?date=${encodeURIComponent(date)}`,
    ),

  // ── Bookings ──────────────────────────────────────────────────────────────
  bookings: (page = 1, pageSize = 20) =>
    request<Paginated<Booking>>(`/api/v1/bookings/me?page=${page}&page_size=${pageSize}`),
  booking: (code: string) =>
    request<Booking>(`/api/v1/bookings/${encodeURIComponent(code)}`),
  createBooking: (payload: {
    branch_id: string;
    appointment_date: string;
    start_time: string;
    end_time: string;
    idempotency_key: string;
  }) =>
    request<Booking>("/api/v1/bookings", { method: "POST", body: JSON.stringify(payload) }),
  checkIn: (code: string) =>
    request<CheckInResponse>(`/api/v1/bookings/${encodeURIComponent(code)}/check-in`, {
      method: "POST",
    }),
  cancelBooking: (code: string, reason?: string) =>
    request<Booking>(`/api/v1/bookings/${encodeURIComponent(code)}/cancel`, {
      method: "POST",
      body: reason ? JSON.stringify({ reason }) : undefined,
    }),

  // ── Business / Merchant / Corporate ──────────────────────────────────────
  merchantSummary: () => request<MerchantRetention>("/api/v1/me/merchant-summary"),
  corporateSummary: () => request<CorporateSummary>("/api/v1/me/company-summary"),

  // ── ML / Analytics ────────────────────────────────────────────────────────
  behavior: (id: string) => request<Behavior>(`/api/v1/customers/${id}/behavior`),
  churn: (id: string) => request<ChurnPrediction>(`/api/v1/customers/${id}/churn`),
  relationshipScore: (id: string) =>
    request<RelationshipScore>(`/api/v1/customers/${id}/relationship-score`),
  recommendations: (id: string, page = 1, pageSize = 20) =>
    request<Paginated<Recommendation>>(
      `/api/v1/customers/${id}/recommendations?page=${page}&page_size=${pageSize}`,
    ),
  atRisk: (page = 1, pageSize = 100) =>
    request<Paginated<AtRiskCustomer>>(
      `/api/v1/retention/at-risk?page=${page}&page_size=${pageSize}`,
    ),
  retentionSummary: () => request<RetentionSummary>("/api/v1/analytics/retention-summary"),
  topDrivers: () => request<TopDrivers>("/api/v1/analytics/top-drivers"),
  activeModel: () => request<ActiveModel>("/api/v1/ml/models/active"),
  campaigns: () => request<Paginated<Campaign>>("/api/v1/campaigns"),

  // ── Consumer self-service ─────────────────────────────────────────────────
  meSummary: () => request<OwnSummary>("/api/v1/me/summary"),
  meTransactions: (page = 1, pageSize = 20) =>
    request<Paginated<Transaction>>(
      `/api/v1/me/transactions?page=${page}&page_size=${pageSize}`,
    ),

  // ── Staff: Campaign & Messaging ───────────────────────────────────────────
  createCampaign: (payload: {
    name: string;
    campaign_type: ActionType;
    description: string;
  }) =>
    request<Campaign>("/api/v1/campaigns", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Idempotency-Key": crypto.randomUUID() },
    }),

  addCampaignTargets: (
    campaignId: string,
    targets: { customer_id: string; recommendation_id?: string }[],
  ) =>
    request<Array<{ id: string; customer_id: string }>>(`/api/v1/campaigns/${campaignId}/targets`, {
      method: "POST",
      body: JSON.stringify({ targets }),
      headers: { "Idempotency-Key": crypto.randomUUID() },
    }),

  deliverMessage: (
    customerId: string,
    payload: {
      campaign_target_id: string;
      selection_method: "RULE_RANKER_V1" | "MANUAL_SIMULATION";
      title: string;
      body: string;
    },
  ) =>
    request<InboxMessage>(`/api/v1/customers/${customerId}/messages`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Idempotency-Key": crypto.randomUUID() },
    }),
};
