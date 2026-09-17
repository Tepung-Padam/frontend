import { Navigate, Route, Routes } from "react-router-dom";
import { ConsumerLayout } from "@/components/layout/consumer-layout";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { BusinessLayout } from "@/components/layout/business-layout";
import { LoginPage } from "@/features/auth/login-page";
import { ConsumerHomePage as Home } from "@/features/consumer/home-page";
import { ActivityPage } from "@/features/consumer/activity-page";
import { InboxPage } from "@/features/inbox/inbox-page";
import { CreditPage } from "@/features/credit/credit-page";
import { BranchesPage } from "@/features/branches/branches-page";
import { BookingsPage } from "@/features/branches/bookings-page";
import { BookingDetailPage } from "@/features/branches/booking-detail-page";
import { MessageDetailPage } from "@/features/inbox/message-detail-page";
import { ProfilePage } from "@/features/profile/profile-page";
import { OffersPage } from "@/features/consumer/offers-page";
import { WorkspaceHomePage } from "@/features/analytics/workspace-home-page";
import { RetentionPage } from "@/features/retention/retention-page";
import { CustomerDetailPage } from "@/features/retention/customer-detail-page";
import { AdminPage } from "@/features/admin/admin-page";
import { RequireAuth } from "@/routes/guards";
import { BusinessHomePage } from "@/features/merchant/business-home-page";
import { ModelPage } from "@/features/analytics/model-page";
import { CampaignsPage } from "@/features/analytics/campaigns-page";
import { StaffCreditPage } from "@/features/credit/staff-credit-page";
import { CreditDetailPage } from "@/features/credit/credit-detail-page";
import { CorporateAdvisoryPage, CorporateInvoicesPage, CorporateNotificationsPage } from "@/features/corporate/corporate-pages";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth roles={["CONSUMER"]} />}>
        <Route element={<ConsumerLayout />}>
          <Route path="/app" element={<Home />} />
          <Route path="/app/activity" element={<ActivityPage />} />
          <Route path="/app/inbox" element={<InboxPage />} />
          <Route path="/app/offers" element={<OffersPage />} />
          <Route path="/app/inbox/:id" element={<MessageDetailPage />} />
          <Route path="/app/financing" element={<CreditPage />} />
          <Route path="/app/financing/:id" element={<CreditDetailPage />} />
          <Route path="/app/branches" element={<BranchesPage />} />
          <Route path="/app/branches/:id" element={<BranchesPage />} />
          <Route path="/app/bookings" element={<BookingsPage />} />
          <Route path="/app/bookings/:code" element={<BookingDetailPage />} />
          <Route path="/app/profile" element={<ProfilePage />} />
          <Route path="/app/*" element={<Home />} />
        </Route>
      </Route>

      <Route element={<RequireAuth roles={["MERCHANT"]} />}>
        <Route element={<BusinessLayout />}>
          <Route path="/business" element={<BusinessHomePage />} />
          <Route path="/business/financing" element={<CreditPage />} />
          <Route
            path="/business/financing/:id"
            element={<CreditDetailPage />}
          />
          <Route path="/business/profile" element={<ProfilePage />} />
          <Route path="/business/*" element={<BusinessHomePage />} />
        </Route>
      </Route>

      <Route element={<RequireAuth roles={["CORPORATE"]} />}>
        <Route element={<BusinessLayout />}>
          <Route path="/corporate" element={<BusinessHomePage />} />
          <Route path="/corporate/advisory" element={<CorporateAdvisoryPage />} />
          <Route path="/corporate/notifications" element={<CorporateNotificationsPage />} />
          <Route path="/corporate/invoices" element={<CorporateInvoicesPage />} />
          <Route path="/corporate/financing" element={<CreditPage />} />
          <Route
            path="/corporate/financing/:id"
            element={<CreditDetailPage />}
          />
          <Route path="/corporate/profile" element={<ProfilePage />} />
          <Route path="/corporate/*" element={<BusinessHomePage />} />
        </Route>
      </Route>

      <Route element={<RequireAuth roles={["ANALYST", "RM", "ADMIN"]} />}>
        <Route element={<WorkspaceLayout />}>
          <Route path="/staff" element={<WorkspaceHomePage />} />
          <Route path="/staff/at-risk" element={<RetentionPage />} />
          <Route path="/staff/at-risk/:id" element={<CustomerDetailPage />} />
          <Route path="/staff/campaigns" element={<CampaignsPage />} />
          <Route path="/staff/models" element={<ModelPage />} />
          <Route path="/staff/applications" element={<StaffCreditPage />} />
          <Route
            path="/staff/applications/:id"
            element={<CreditDetailPage />}
          />
          <Route path="/staff/*" element={<RetentionPage />} />

          <Route path="/rm" element={<WorkspaceHomePage />} />
          <Route path="/rm/at-risk" element={<RetentionPage />} />
          <Route path="/rm/at-risk/:id" element={<CustomerDetailPage />} />
          <Route path="/rm/campaigns" element={<CampaignsPage />} />
          <Route path="/rm/models" element={<ModelPage />} />
          <Route path="/rm/applications" element={<StaffCreditPage />} />
          <Route path="/rm/applications/:id" element={<CreditDetailPage />} />
          <Route path="/rm/*" element={<Navigate to="/rm" replace />} />

          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/at-risk" element={<RetentionPage />} />
          <Route path="/admin/at-risk/:id" element={<CustomerDetailPage />} />
          <Route path="/admin/campaigns" element={<CampaignsPage />} />
          <Route path="/admin/models" element={<ModelPage />} />
          <Route path="/admin/applications" element={<StaffCreditPage />} />
          <Route path="/admin/applications/:id" element={<CreditDetailPage />} />
          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
