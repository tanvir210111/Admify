import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ChatWidget from "./components/chat/ChatWidget";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ActivateAgency from "./pages/ActivateAgency";
import ActivateUniversityRep from "./pages/ActivateUniversityRep";
import AdminLogin from "./pages/AdminLogin";

import DashboardLayout from "./components/layout/DashboardLayout";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import StudentDashboard from "./pages/dashboards/StudentDashboard";
import AgentDashboard from "./pages/dashboards/AgentDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";

// ── Agency Portal Layout and Page Imports ───────────────────────────────────
import AgencyLayout from "./components/agency/AgencyLayout";
import AgyDashboard from "./pages/agency/AgencyDashboard";
import AgyAgents from "./pages/agency/AgencyAgents";
import AgyStudents from "./pages/agency/AgencyStudents";
import AgyApplications from "./pages/agency/AgencyApplications";
import AgyServiceRequests from "./pages/agency/AgencyServiceRequests";
import AgyUniversityPartnerships from "./pages/agency/AgencyUniversityPartnerships";
import AgyMessages from "./pages/agency/AgencyMessages";
import AgyDocuments from "./pages/agency/AgencyDocuments";
import AgyPerformance from "./pages/agency/AgencyPerformance";
import AgyNotifications from "./pages/agency/AgencyNotifications";
import AgyReports from "./pages/agency/AgencyReports";
import AgyServiceHistory from "./pages/agency/AgencyServiceHistory";
import AgyProfile from "./pages/agency/AgencyProfile";
import AgySettings from "./pages/agency/AgencySettings";

// ── Admin Portal Layout and Page Imports ────────────────────────────────────
import AdminLayout from "./components/admin/AdminLayout";
import AdmDashboard from "./pages/admin/AdminDashboard";
import AdmUsers from "./pages/admin/AdminUsers";
import AdmStudents from "./pages/admin/AdminStudents";
import AdmAgencies from "./pages/admin/AdminAgencies";
import AdmAgents from "./pages/admin/AdminAgents";
import AdmLiveAgents from "./pages/admin/AdminLiveAgents";
import AdmUniReps from "./pages/admin/AdminUniReps";
import AdmUniversities from "./pages/admin/AdminUniversities";
import AdmScholarships from "./pages/admin/AdminScholarships";
import AdmApplications from "./pages/admin/AdminApplications";
import AdmPartnerships from "./pages/admin/AdminPartnerships";
import AdmRecommendations from "./pages/admin/AdminRecommendations";
import AdmSopLor from "./pages/admin/AdminSopLor";
import AdmWallet from "./pages/admin/AdminWallet";
import AdmCoupons from "./pages/admin/AdminCoupons";
import AdmCountries from "./pages/admin/AdminCountries";
import AdmPayments from "./pages/admin/AdminPayments";
import AdmNotifications from "./pages/admin/AdminNotifications";
import AdmReports from "./pages/admin/AdminReports";
import AdmSupport from "./pages/admin/AdminSupport";
import AdmAI from "./pages/admin/AdminAI";
import AdmAuditLogs from "./pages/admin/AdminAuditLogs";
import AdmAdmins from "./pages/admin/AdminAdmins";
import AdmSettings from "./pages/admin/AdminSettings";

// ── Agent Portal Layout and Page Imports ────────────────────────────────────
import AgentLayout from "./components/agent/AgentLayout";
import AgeDashboard from "./pages/agent/AgentDashboard";
import AgeStudents from "./pages/agent/AgentStudents";
import AgeApplications from "./pages/agent/AgentApplications";
import AgeDocuments from "./pages/agent/AgentDocuments";
import AgeSopLor from "./pages/agent/AgentSopLor";
import AgeUniversities from "./pages/agent/AgentUniversities";
import AgeMessages from "./pages/agent/AgentMessages";
import AgeTasks from "./pages/agent/AgentTasks";
import AgePerformance from "./pages/agent/AgentPerformance";
import AgeNotifications from "./pages/agent/AgentNotifications";
import AgeReports from "./pages/agent/AgentReports";
import AgeAgency from "./pages/agent/AgentAgency";
import AgeProfile from "./pages/agent/AgentProfile";
import AgeSettings from "./pages/agent/AgentSettings";

// ── University Representative Portal Layout and Page Imports ────────────────
import UniRepLayout from "./components/university-rep/UniRepLayout";
import UniRepDashboard from "./pages/university-rep/UniRepDashboard";
import UniRepUniversity from "./pages/university-rep/UniRepUniversity";
import UniRepPrograms from "./pages/university-rep/UniRepPrograms";
import UniRepPartnerships from "./pages/university-rep/UniRepPartnerships";
import UniRepAgencies from "./pages/university-rep/UniRepAgencies";
import UniRepApplications from "./pages/university-rep/UniRepApplications";
import UniRepDocuments from "./pages/university-rep/UniRepDocuments";
import UniRepMessages from "./pages/university-rep/UniRepMessages";
import UniRepAnnouncements from "./pages/university-rep/UniRepAnnouncements";
import UniRepScholarships from "./pages/university-rep/UniRepScholarships";
import UniRepIntakes from "./pages/university-rep/UniRepIntakes";
import UniRepAnalytics from "./pages/university-rep/UniRepAnalytics";
import UniRepNotifications from "./pages/university-rep/UniRepNotifications";
import UniRepReports from "./pages/university-rep/UniRepReports";
import UniRepProfile from "./pages/university-rep/UniRepProfile";
import UniRepSettings from "./pages/university-rep/UniRepSettings";

import RecommendationPage from "./pages/dashboards/RecommendationPage";
import WalletPage from "./pages/dashboards/WalletPage";
import UniversityPage from "./pages/dashboards/UniversityPage";
import ScholarshipsPage from "./pages/dashboards/ScholarshipsPage";
import ApplicationsPage from "./pages/dashboards/ApplicationsPage";
import DocumentsPage from "./pages/dashboards/DocumentsPage";
import NotificationsPage from "./pages/dashboards/NotificationsPage";
import SettingsPage from "./pages/dashboards/SettingsPage";

// ── Redesigned Student Portal Pages ──────────────────────────────────────────
import StudentProfilePage from "./pages/student/StudentProfilePage";
import AcademicProfilePage from "./pages/student/AcademicProfilePage";
import StudentDocumentsPage from "./pages/student/StudentDocumentsPage";
import AIRecommendationsPage from "./pages/student/AIRecommendationsPage";
import UniversityDiscoveryPage from "./pages/student/UniversityDiscoveryPage";
import UniversityComparePage from "./pages/student/UniversityComparePage";
import ScholarshipsSystemPage from "./pages/student/ScholarshipsSystemPage";
import AdmissionProbabilityPage from "./pages/student/AdmissionProbabilityPage";
import CostEstimatorPage from "./pages/student/CostEstimatorPage";
import SopGeneratorPage from "./pages/student/SopGeneratorPage";
import LorGeneratorPage from "./pages/student/LorGeneratorPage";
import DirectApplicationsPage from "./pages/student/DirectApplicationsPage";
import AgencyAssistancePage from "./pages/student/AgencyAssistancePage";
import ApplicationTrackingPage from "./pages/student/ApplicationTrackingPage";
import StudentMessagesPage from "./pages/student/StudentMessagesPage";
import NotificationsCenterPage from "./pages/student/NotificationsCenterPage";
import CreditsPremiumPage from "./pages/student/CreditsPremiumPage";
import StudentReportsPage from "./pages/student/StudentReportsPage";
import StudentChatbotPage from "./pages/student/StudentChatbotPage";

import MarketingLayout from "./components/layout/MarketingLayout";
import FeaturesPage from "./pages/marketing/FeaturesPage";
import PricingPage from "./pages/marketing/PricingPage";
import UniversitySearchPage from "./pages/marketing/UniversitySearchPage";
import UniversityDetailPage from "./pages/marketing/UniversityDetailPage";
import AIDocumentPrepPage from "./pages/marketing/AIDocumentPrepPage";
import AboutUsPage from "./pages/marketing/AboutUsPage";
import CareersPage from "./pages/marketing/CareersPage";
import BlogPage from "./pages/marketing/BlogPage";
import ContactPage from "./pages/marketing/ContactPage";

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Marketing/Product pages wrapped in MarketingLayout */}
        <Route element={<MarketingLayout />}>
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/university-search" element={<UniversitySearchPage />} />
          <Route path="/universities" element={<UniversitySearchPage />} />
          <Route path="/university/:id" element={<UniversityDetailPage />} />
          <Route path="/ai-document-prep" element={<AIDocumentPrepPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/activate-agency" element={<ActivateAgency />} />
        <Route path="/activate-university-rep" element={<ActivateUniversityRep />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/student/admin/login" element={<AdminLogin />} />

        {/* Dashboard Routes wrapped in ProtectedRoute and DashboardLayout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/student" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />

            {/* MY PROFILE */}
            <Route path="profile" element={<StudentProfilePage />} />
            <Route path="academic-profile" element={<AcademicProfilePage />} />
            <Route path="documents" element={<StudentDocumentsPage />} />

            {/* DISCOVER */}
            <Route path="recommendations" element={<AIRecommendationsPage />} />
            <Route path="universities" element={<UniversityDiscoveryPage />} />
            <Route path="universities/:id" element={<UniversityDetailPage />} />
            <Route path="university/:id" element={<UniversityDetailPage />} />
            <Route path="compare" element={<UniversityComparePage />} />
            <Route path="scholarships" element={<ScholarshipsSystemPage />} />
            <Route path="probability" element={<AdmissionProbabilityPage />} />
            <Route path="cost-estimator" element={<CostEstimatorPage />} />

            {/* AI TOOLS */}
            <Route path="sop-generator" element={<SopGeneratorPage />} />
            <Route path="lor-generator" element={<LorGeneratorPage />} />
            <Route path="sop" element={<SopGeneratorPage />} />
            <Route path="lor" element={<LorGeneratorPage />} />

            {/* APPLICATIONS */}
            <Route path="direct-applications" element={<DirectApplicationsPage />} />
            <Route path="agency-assistance" element={<AgencyAssistancePage />} />
            <Route path="applications" element={<ApplicationTrackingPage />} />

            {/* COMMUNICATION: Exactly 2 Core Features (Chatbot & Messages) */}
            <Route path="chatbot" element={<StudentChatbotPage />} />
            <Route path="admify-ai" element={<StudentChatbotPage />} />
            <Route path="ai-chat" element={<StudentChatbotPage />} />
            <Route path="live-chat" element={<StudentChatbotPage />} />
            <Route path="messages" element={<StudentMessagesPage />} />
            <Route path="notifications" element={<NotificationsCenterPage />} />

            {/* ACCOUNT & CREDITS */}
            <Route path="wallet" element={<CreditsPremiumPage />} />
            <Route path="credits" element={<CreditsPremiumPage />} />
            <Route path="subscription" element={<CreditsPremiumPage />} />
            <Route path="pricing" element={<CreditsPremiumPage />} />
            <Route path="reports" element={<StudentReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Agent Portal Nested Routes (Role-protected: active agent only) */}
        <Route element={<ProtectedRoute allowedRoles={['agent']} />}>
          <Route path="/agent" element={<AgentLayout />}>
            <Route index element={<Navigate to="/agent/dashboard" replace />} />
            <Route path="dashboard" element={<AgeDashboard />} />
            <Route path="students" element={<AgeStudents />} />
            <Route path="applications" element={<AgeApplications />} />
            <Route path="documents" element={<AgeDocuments />} />
            <Route path="sop-lor" element={<AgeSopLor />} />
            <Route path="universities" element={<AgeUniversities />} />
            <Route path="messages" element={<AgeMessages />} />
            <Route path="tasks" element={<AgeTasks />} />
            <Route path="performance" element={<AgePerformance />} />
            <Route path="notifications" element={<AgeNotifications />} />
            <Route path="reports" element={<AgeReports />} />
            <Route path="agency" element={<AgeAgency />} />
            <Route path="profile" element={<AgeProfile />} />
            <Route path="settings" element={<AgeSettings />} />
          </Route>
        </Route>

        {/* Agency Portal Nested Routes (Role-protected: active agency only) */}
        <Route element={<ProtectedRoute allowedRoles={['agency']} />}>
          <Route path="/agency" element={<AgencyLayout />}>
            <Route index element={<Navigate to="/agency/dashboard" replace />} />
            <Route path="dashboard" element={<AgyDashboard />} />
            <Route path="agents" element={<AgyAgents />} />
            <Route path="students" element={<AgyStudents />} />
            <Route path="applications" element={<AgyApplications />} />
            <Route path="service-requests" element={<AgyServiceRequests />} />
            <Route path="university-partnerships" element={<AgyUniversityPartnerships />} />
            <Route path="messages" element={<AgyMessages />} />
            <Route path="documents" element={<AgyDocuments />} />
            <Route path="performance" element={<AgyPerformance />} />
            <Route path="notifications" element={<AgyNotifications />} />
            <Route path="reports" element={<AgyReports />} />
            <Route path="service-history" element={<AgyServiceHistory />} />
            <Route path="profile" element={<AgyProfile />} />
            <Route path="settings" element={<AgySettings />} />
          </Route>
        </Route>

        {/* Uni Rep Portal Nested Routes (Role-protected: active university_rep only) */}
        <Route element={<ProtectedRoute allowedRoles={['university_rep', 'university']} />}>
          <Route path="/university-rep" element={<UniRepLayout />}>
            <Route index element={<Navigate to="/university-rep/dashboard" replace />} />
            <Route path="dashboard" element={<UniRepDashboard />} />
            <Route path="university" element={<UniRepUniversity />} />
            <Route path="programs" element={<UniRepPrograms />} />
            <Route path="partnerships" element={<UniRepPartnerships />} />
            <Route path="agencies" element={<UniRepAgencies />} />
            <Route path="applications" element={<UniRepApplications />} />
            <Route path="documents" element={<UniRepDocuments />} />
            <Route path="messages" element={<UniRepMessages />} />
            <Route path="announcements" element={<UniRepAnnouncements />} />
            <Route path="scholarships" element={<UniRepScholarships />} />
            <Route path="intakes" element={<UniRepIntakes />} />
            <Route path="analytics" element={<UniRepAnalytics />} />
            <Route path="notifications" element={<UniRepNotifications />} />
            <Route path="reports" element={<UniRepReports />} />
            <Route path="profile" element={<UniRepProfile />} />
            <Route path="settings" element={<UniRepSettings />} />
          </Route>
          {/* Legacy / Alias Route Redirect */}
          <Route path="/university" element={<Navigate to="/university-rep/dashboard" replace />} />
          <Route path="/university/*" element={<Navigate to="/university-rep/dashboard" replace />} />
        </Route>

        {/* Admin Portal Nested Routes (Role-protected: admin only) */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdmDashboard />} />
            <Route path="users" element={<AdmUsers />} />
            <Route path="students" element={<AdmStudents />} />
            <Route path="agencies" element={<AdmAgencies />} />
            <Route path="agents" element={<AdmAgents />} />
            <Route path="live-agents" element={<AdmLiveAgents />} />
            <Route path="university-representatives" element={<AdmUniReps />} />
            <Route path="universities" element={<AdmUniversities />} />
            <Route path="partnerships" element={<AdmPartnerships />} />
            <Route path="applications" element={<AdmApplications />} />
            <Route path="payments" element={<AdmPayments />} />
            <Route path="wallet" element={<AdmWallet />} />
            <Route path="credits" element={<AdmWallet />} />
            <Route path="coupons" element={<AdmCoupons />} />
            <Route path="scholarships" element={<AdmScholarships />} />
            <Route path="countries" element={<AdmCountries />} />
            <Route path="reports" element={<AdmReports />} />
            <Route path="support" element={<AdmSupport />} />
            <Route path="notifications" element={<AdmNotifications />} />
            <Route path="ai" element={<AdmAI />} />
            <Route path="audit-logs" element={<AdmAuditLogs />} />
            <Route path="admins" element={<AdmAdmins />} />
            <Route path="settings" element={<AdmSettings />} />
            <Route path="recommendations" element={<AdmRecommendations />} />
            <Route path="sop-lor" element={<AdmSopLor />} />
          </Route>
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

        {/* Global 24/7 Chat Widget — visible on all pages */}
        <ChatWidget />
      </Router>
    </AuthProvider>
  );
}

export default App;
