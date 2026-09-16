export type UserRole = "ADMIN" | "ANALYST" | "RM" | "CONSUMER" | "MERCHANT" | "CORPORATE";
export type CustomerType = "CONSUMER" | "MERCHANT" | "CORPORATE";
export type CustomerState = "ACTIVE" | "AT_RISK" | "SILENT_CHURN" | "REACTIVATED" | "RETAINED";
export type AccountStatus = "ACTIVE" | "DORMANT" | "CLOSED";
export type AccountType = "SAVINGS" | "CURRENT";
export type DataSourceType = "PUBLIC_DATASET" | "SYNTHETIC" | "DEMO_SIMULATION";
export type TransactionDirection = "CREDIT" | "DEBIT";
export type TransactionChannel = "TRANSFER" | "QRIS_SIMULATED" | "BILL_PAYMENT" | "CARD" | "ATM" | "SALARY" | "LOAN_PAYMENT" | "SETTLEMENT_SIMULATED" | "OTHER";
export type CreditProductCategory = "PERSONAL" | "WORKING_CAPITAL" | "INVESTMENT";
export type CreditStage = "SUBMITTED" | "DOCUMENTS_RECEIVED" | "FINANCIAL_ANALYSIS" | "FIELD_SURVEY" | "COMMITTEE_REVIEW" | "APPROVED_SIMULATION" | "REJECTED_SIMULATION";
export type CreditEventType = "STAGE_CHANGED" | "DOCUMENT_UPDATED";
export type DocumentStatus = "PENDING" | "RECEIVED" | "REVIEWED";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "SERVING" | "COMPLETED" | "CANCELLED" | "EXPIRED" | "NO_SHOW";
export type InboxEventType = "VIEWED" | "ACCEPTED" | "DECLINED";
export type ActionType = "QRIS_MISSION" | "BILL_PAYMENT_MISSION" | "PERSONALIZED_REWARD" | "DAILY_BANKING_ENGAGEMENT" | "MERCHANT_RETENTION_OFFER" | "RM_OUTREACH" | "PRODUCT_EDUCATION" | "NO_ACTION";
export type CampaignStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface AppUser {
  id: string;
  username: string;
  role: UserRole;
  customer_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_at: string;
  user: AppUser;
}

export interface CustomerProfile {
  age_band: string | null;
  income_band: string | null;
  occupation_category: string | null;
  region_category: string | null;
  relationship_start_date: string | null;
}

export interface MerchantProfile {
  merchant_category: string;
  business_size: string | null;
  business_age_band: string | null;
  settlement_behavior_category: string | null;
  estimated_monthly_revenue_band: string | null;
}

export interface CorporateProfile {
  company_ref: string;
  industry_category: string;
  business_size: string | null;
  relationship_start_date: string | null;
}

export interface Customer {
  id: string;
  customer_ref: string;
  customer_type: CustomerType;
  segment: string | null;
  state: CustomerState;
  status: string;
  data_source_type: DataSourceType;
  profile: CustomerProfile | null;
  merchant_profile: MerchantProfile | null;
  corporate_profile: CorporateProfile | null;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  customer_id: string;
  account_ref: string;
  account_type: AccountType;
  currency: string;
  status: AccountStatus;
  is_primary: boolean;
  opened_at: string;
  closed_at: string | null;
}

export interface Transaction {
  id: string;
  account_id: string;
  category_id: number | null;
  merchant_customer_id: string | null;
  transaction_timestamp: string;
  transaction_type: string;
  direction: TransactionDirection;
  amount: string;
  currency: string;
  counterparty_type: string | null;
  channel: TransactionChannel;
  description_normalized: string | null;
  data_source_type: DataSourceType;
}

export interface Paginated<T> {
  items: T[];
  pagination: { page: number; page_size: number; total_items: number; total_pages: number };
}

export interface CustomerSummary {
  customer: Customer;
  accounts: Account[];
  latest_behavior: Record<string, unknown> | null;
}

export interface CreditDocument {
  id: string;
  document_code: string;
  status: DocumentStatus;
  updated_at: string;
}

export interface CreditApplication {
  id: string;
  customer_id: string;
  product_category: CreditProductCategory;
  requested_amount: string;
  currency: string;
  current_stage: CreditStage;
  version: number;
  estimated_completion_at: string | null;
  is_simulation: boolean;
  created_at: string;
  documents: CreditDocument[];
}

export interface CreditEvent {
  id: string;
  application_id: string;
  actor_user_id: string;
  sequence: number;
  event_type: CreditEventType;
  from_stage: CreditStage | null;
  to_stage: CreditStage | null;
  document_requirement_id: string | null;
  document_status: DocumentStatus | null;
  customer_note: string | null;
  occurred_at: string;
}

export interface OwnSummary {
  customer_ref: string;
  persona: string;
  accounts: Account[];
  behavior: Behavior | null;
  behavior_status: string;
  data_source_type: DataSourceType;
  disclaimer: string;
}

export interface InboxMessage {
  id: string;
  customer_id: string;
  campaign_target_id: string;
  created_by_user_id: string;
  selection_method: "RULE_RANKER_V1" | "MANUAL_SIMULATION";
  title: string;
  body: string;
  is_simulation: boolean;
  created_at: string;
  response_state: InboxEventType | null;
}

export interface InboxEvent {
  id: string;
  message_id: string;
  actor_user_id: string;
  campaign_event_id: string;
  event_type: InboxEventType;
  occurred_at: string;
}

export interface Branch {
  id: string;
  branch_code: string;
  branch_name: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  is_active: boolean;
  distance_km: number | null;
}

export interface BranchDetail extends Branch {
  operating_hours: { day_of_week: number; opening_time: string; closing_time: string; is_closed: boolean }[];
  closures: { closure_date: string; reason: string }[];
}

export interface BranchAvailability {
  date: string;
  branch_id: string;
  branch_name: string;
  opening_time: string | null;
  closing_time: string | null;
  slot_interval_minutes: number;
  closed_reason: string | null;
  slots: { start_time: string; end_time: string; capacity: number; booked_count: number; remaining_capacity: number; status: string }[];
}

export interface Booking {
  id: string;
  booking_code: string;
  customer_id: string;
  branch_id: string;
  branch_name: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  check_in_earliest: string;
  check_in_latest: string;
  checked_in_at: string | null;
  served_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  version: number;
  is_simulation: boolean;
}

export interface CheckInResponse { status: BookingStatus; booking_code: string; checked_in_at: string; message: string; }

export interface Behavior {
  customer_id: string;
  as_of_date: string;
  observation_window_days: number;
  recent_window_days: number;
  metrics: { txn_count_7d: number; txn_count_30d: number; txn_count_90d: number; txn_amount_30d: string; txn_amount_90d: string; days_since_last_transaction: number | null; incoming_amount_30d: string; outgoing_amount_30d: string; net_cashflow_30d: string; avg_balance_30d: string; bill_payment_count_30d: number; qris_txn_count_30d: number; app_sessions_30d: number };
  trends: { txn_count_change_30_vs_baseline: number; txn_amount_change_30_vs_baseline: number; balance_trend: number };
  feature_schema_version: string;
  data_disclosure: Record<string, boolean>;
}

export interface ChurnPrediction { id: string; customer_id: string; probability: number; risk_level: RiskLevel; prediction_timestamp: string; prediction_window_days: number; top_drivers: { feature: string; value: unknown; impact: number; direction: string; message: string }[]; }
export interface RelationshipScore { id: string; customer_id: string; score: number; interpretation: string; components: Record<string, number>; score_version: string; calculated_at: string; disclaimer: string; }
export interface Recommendation { id: string; customer_id: string; method: string; action_type: ActionType; priority_score: number; title: string; description: string; reason: string; supporting_signals: Record<string, unknown>[]; status: string; is_simulation: boolean; created_at: string; }
export interface AtRiskCustomer { id: string; customer_ref: string; customer_type: CustomerType; segment: string | null; state: CustomerState; probability: number; risk_level: RiskLevel; relationship_score: number | null; priority_score: number | null; prediction_timestamp: string; recommended_action: ActionType | null; }
export interface RetentionSummary { as_of_date: string; customers: { total: number; active: number; at_risk: number; silent_churn: number; reactivated: number }; risk: Record<RiskLevel, number>; relationship_score: { average: number; weak: number; moderate: number; strong: number }; merchant: { total: number; high_leakage_risk: number }; campaigns: { active_simulations: number }; data_disclosure: Record<string, boolean>; }
export interface MerchantRetention {
  customer_id: string;
  customer_ref: string;
  as_of_date: string;
  window_days: number;
  metrics: {
    incoming_settlement: string;
    matched_outgoing_transfer: string;
    total_outgoing: string;
    average_balance: string | null;
    retained_ratio_proxy: number | null;
  };
  risk_indicator: RiskLevel | null;
  status: string;
  balance_days_available: number;
  complete_match_window: boolean;
  outflow_match_hours: number;
  recommendation: { action_type: ActionType; title: string } | null;
  data_source_type: DataSourceType;
  disclaimer: string;
}
export interface MerchantSelfSummary {
  customer_id: string;
  customer_ref: string;
  as_of_date: string;
  window_days: number;
  metrics: {
    incoming_settlement: string;
    matched_outgoing_transfer: string;
    total_outgoing: string;
    average_balance: string | null;
    retained_ratio_proxy: number | null;
  };
  status: string;
  balance_days_available: number;
  complete_match_window: boolean;
  outflow_match_hours: number;
  data_source_type: DataSourceType;
  disclaimer: string;
}
export interface CorporateSummary { customer_id: string; customer_ref: string; company_ref: string; industry_category: string; business_size: string | null; relationship_start_date: string | null; as_of_date: string; accounts_summary: { total_accounts: number; primary_currency: string; total_balance: string }; cashflow_totals_30d: { incoming_30d: string; outgoing_30d: string; net_cashflow_30d: string }; active_simulated_credit_requests_count: number; score_status: { status: string; reason_code: string; message: string }; disclaimer: string; }
export interface ActiveModel { id: string | null; name: string; type: "LOGISTIC_REGRESSION" | "XGBOOST"; version: string; feature_schema_version: string; training_dataset_version: string; training_timestamp: string | null; thresholds: { medium: number; high: number }; metrics: { roc_auc: number | null; pr_auc: number | null; precision_at_10_percent: number | null; recall_at_10_percent: number | null; lift_at_10_percent: number | null }; is_available: boolean; disclosure: string; }
export interface Campaign { id: string; name: string; campaign_type: ActionType; status: CampaignStatus; description: string; is_simulation: boolean; created_at: string; updated_at: string; }
export interface CampaignTarget { id: string; campaign_id: string; customer_id: string; recommendation_id: string | null; assigned_at: string; }
