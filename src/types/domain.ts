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
export type PocketKind = "KPR" | "BILLS" | "CHILD" | "GENERAL";
export type PocketMemberStatus = "PENDING" | "ACTIVE" | "DECLINED" | "EXPIRED";
export type PocketPaymentStatus = "PENDING" | "EXECUTED" | "REJECTED";
export type PocketLedgerDirection = "CREDIT" | "DEBIT";
export type PocketPaymentCategory = "BNI_GRIYA" | "QRIS_SIMULATED" | "ELECTRICITY" | "WATER" | "INTERNET" | "SCHOOL_PAYMENT";

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
export interface RetentionSummary { as_of_date: string; customers: { total: number; active: number; at_risk: number; silent_churn: number; reactivated: number }; risk: Record<RiskLevel, number> & { UNAVAILABLE: number }; relationship_score: { average: number | null; weak: number; moderate: number; strong: number }; merchant: { total: number; high_leakage_risk: number | null; evaluated: number; unavailable: number }; campaigns: { active_simulations: number }; data_disclosure: Record<string, boolean>; }
export interface TopDrivers { items: { feature: string; customer_count: number }[]; prediction_count: number; }
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
export interface CorporateSummary { customer_id: string; customer_ref: string; company_ref: string; industry_category: string | null; business_size: string | null; relationship_start_date: string | null; as_of_date: string; accounts_summary: { total_accounts: number; primary_currency: string; total_balance: string | null }; cashflow_totals_30d: { incoming_30d: string; outgoing_30d: string; net_cashflow_30d: string }; active_simulated_credit_requests_count: number; score_status: { status: string; reason_code: string; message: string }; disclaimer: string; }

// ── Corporate Advisor (forecast, navigator, wizard, cash-flow items) ───────────
export type CorporateIntent = "MANAGE_OPERATIONS" | "GROW" | "EXPORT";
export type AdvisoryAction = "LEARN_MORE" | "CONTACT_RM" | "REQUEST_RECEIVABLE_FINANCING" | "REQUEST_PAYMENT_SCHEDULING" | "REQUEST_LIQUIDITY_REVIEW";
export type CashflowCategory = "RECEIVABLE" | "EXPORT_RECEIVABLE" | "PAYABLE" | "PAYROLL" | "OPERATING" | "CAPEX";
export type CashflowDirection = "CREDIT" | "DEBIT";
export type CashflowItemStatus = "PENDING" | "SETTLED";
export type WizardAnswerType = "BOOLEAN" | "DECIMAL" | "SINGLE_CHOICE" | "TEXT";
export type WizardStepStatus = "QUESTION" | "COMPLETED" | "INSUFFICIENT_DATA";

export interface ProductMatch { code: string; name: string; source_url: string; why_this_product: string; rule_version: string; eligibility: string; }
export interface AdvisoryDriver { [key: string]: unknown; }
export interface AdvisoryRead { id: string; run_id: string; kind: string; intent: CorporateIntent; event_date: string | null; amount: string | null; rule_version: string; explanation: string; drivers: AdvisoryDriver[]; recommended_action: string; product_match: ProductMatch | null; next_actions: AdvisoryAction[]; is_simulation: boolean; }
export interface ForecastPoint { date: string; known_inflow: string; known_outflow: string; predicted_inflow: string; predicted_outflow: string; projected_balance: string; lower_balance: string; upper_balance: string; risk_status: "BELOW_THRESHOLD" | "ADEQUATE"; evidence: Record<string, unknown>[]; }
export interface ForecastRead { run_id: string; customer_id: string; as_of_date: string; horizon_days: number; currency: "IDR"; opening_balance: string; threshold: string; method_version: string; feature_version: string; input_checksum: string; uncertainty_method: string; assumptions: string[]; points: ForecastPoint[]; advisories: AdvisoryRead[]; is_simulation: boolean; disclaimer: string; }
export interface ScenarioRead { baseline: ForecastRead; scenario: ForecastRead; baseline_minimum: string; scenario_minimum: string; is_simulation: boolean; }
export interface NavigatorRead { intent: CorporateIntent; status: "AVAILABLE" | "INSUFFICIENT_DATA"; reason: string | null; recommendation: AdvisoryRead | null; rule_version: string; }

export interface WizardQuestionRead { question_id: string; pillar: CorporateIntent; prompt: string; answer_type: WizardAnswerType; evidence_needed: string; options: string[]; unit: string | null; dependencies: string[]; selection_reason: string; }
export interface WizardProgress { answered: number; minimum_questions: number; maximum_questions: number; }
export interface WizardStepRead { status: WizardStepStatus; intent: CorporateIntent; question: WizardQuestionRead | null; progress: WizardProgress; completion_reason: string | null; rule_version: string; evidence_schema_version: string; is_simulation: boolean; }
export interface WizardAnswerValue { question_id: string; value: boolean | string | number; }
export interface WizardRecommendationRead { title: string; explanation: string; drivers: AdvisoryDriver[]; recommended_action: string; product_match: ProductMatch | null; next_actions: AdvisoryAction[]; }
export interface WizardResultRead { status: "AVAILABLE" | "INSUFFICIENT_DATA"; intent: CorporateIntent; recommendation: WizardRecommendationRead | null; reason: string | null; answered_question_ids: string[]; rule_version: string; selector_rule_version: string; evidence_schema_version: string; forecast_method_version: string; is_simulation: boolean; disclaimer: string; }

export interface CorporateHomeRead { company_ref: string; current_cash: string; projected_closing_cash: string; minimum_projected_cash: string; receivables: string; payables: string; runway_days: number | null; runway_status: "AT_RISK" | "ADEQUATE_WITHIN_HORIZON"; pending_items_count: number; urgent_items_count: number; cashflow_volume_12m: string | null; cashflow_volume_12m_status: "AVAILABLE" | "INSUFFICIENT_HISTORY"; forecast: ForecastRead; intents: CorporateIntent[]; }
export interface CashflowItemRead { id: string; reference: string; counterparty_ref: string; category: CashflowCategory; direction: CashflowDirection; amount: string; currency: "IDR"; known_on: string; due_date: string; days_to_due: number; status: CashflowItemStatus; paid_on: string | null; is_simulation: boolean; }
export interface CashflowTotals { receivable_total: string; payable_total: string; pending_count: number; urgent_count: number; }
export interface CashflowItemList { as_of_date: string; currency: "IDR"; items: CashflowItemRead[]; totals: CashflowTotals; total: number; page: number; page_size: number; is_simulation: boolean; disclaimer: string; }
export interface CorporateActivityItem { id: string; advisory_id: string; action: string; occurred_at: string; }
export interface CorporateActivityList { items: CorporateActivityItem[]; total: number; page: number; page_size: number; }
export interface CorporateActionRead { id: string; advisory_id: string; action: string; status: "RECORDED"; delivery: string; }

// ── Consumer engagement score (backend-computed, rule-based) ───────────────────
export interface EngagementScoreDriver { observed: number; points_per_action: number; cap: number; points: number; }
export interface EngagementScoreData {
  score: number;
  max_score: number;
  tier: "LOW" | "MEDIUM" | "HIGH";
  as_of_date: string;
  score_drivers: Record<string, EngagementScoreDriver>;
  available_actions: { action: string; points: number; remaining_cap: number }[];
  version: string;
  not_creditworthiness: true;
  points_are: string;
}
export interface EngagementScoreRead { data: EngagementScoreData; source: "RULE_BASED"; version: string; disclaimer: string; }
export interface ActiveModel { id: string | null; name: string; type: "LOGISTIC_REGRESSION" | "XGBOOST"; version: string | null; feature_schema_version: string | null; training_dataset_version: string | null; training_timestamp: string | null; thresholds: { medium: number; high: number }; metrics: { accuracy?: number | null; threshold?: number | null; sample_count?: number | null; roc_auc: number | null; pr_auc: number | null; precision_at_10_percent: number | null; recall_at_10_percent: number | null; lift_at_10_percent: number | null }; is_available: boolean; disclosure: string; }
export interface Campaign { id: string; name: string; campaign_type: ActionType; status: CampaignStatus; description: string; is_simulation: boolean; created_at: string; updated_at: string; }

// ── Shared Pockets (joint savings, e.g. KPR down-payment) ──────────────────────
export interface Envelope<T> { data: T; version: string; source: string; disclaimer: string; }
export interface PocketMemberSummary { id: string; customer_ref: string; status: PocketMemberStatus; contribution: string; contribution_amount: string | null; day_of_month: number | null; }
export interface PocketSummary { id: string; name: string; kind: PocketKind; balance: string; daily_limit: string | null; dual_approval: boolean; members: PocketMemberSummary[]; is_simulation: true; }
export interface PocketMembership { pocket_id: string; status: PocketMemberStatus; }
export interface PocketInvitation { id: string; pocket_id: string; status: PocketMemberStatus; expires_at: string | null; }
export interface PocketLedgerEntry { id: string; actor_customer_id: string; amount: string; balance_after: string; direction: PocketLedgerDirection; description: string; category: string; created_at: string; is_simulation: boolean; }
export interface PocketPaymentRecord { id: string; initiated_by: string; approved_by: string | null; amount: string; status: PocketPaymentStatus; category: PocketPaymentCategory; description: string; created_at: string; }
export interface CampaignTarget { id: string; campaign_id: string; customer_id: string; recommendation_id: string | null; assigned_at: string; }
