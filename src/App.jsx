import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ChatWidget from "./components/chat/ChatWidget";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AdminLogin from "./pages/AdminLogin";

import DashboardLayout from "./components/layout/DashboardLayout";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import StudentDashboard from "./pages/dashboards/StudentDashboard";
import AgentDashboard from "./pages/dashboards/AgentDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import AgencyDashboard from "./pages/dashboards/AgencyDashboard";
import UniRepDashboard from "./pages/dashboards/UniRepDashboard";

// ── Admin Portal Layout and Page Imports ────────────────────────────────────
import AdminLayout from "./components/admin/AdminLayout";
import AdmDashboard from "./pages/admin/AdminDashboard";
import AdmStudents from "./pages/admin/AdminStudents";
import AdmAgents from "./pages/admin/AdminAgents";
import AdmLiveAgents from "./pages/admin/AdminLiveAgents";
import AdmUniversities from "./pages/admin/AdminUniversities";
import AdmScholarships from "./pages/admin/AdminScholarships";
import AdmApplications from "./pages/admin/AdminApplications";
import AdmRecommendations from "./pages/admin/AdminRecommendations";
import AdmSopLor from "./pages/admin/AdminSopLor";
import AdmWallet from "./pages/admin/AdminWallet";
import AdmPayments from "./pages/admin/AdminPayments";
import AdmNotifications from "./pages/admin/AdminNotifications";
import AdmReports from "./pages/admin/AdminReports";
import AdmSettings from "./pages/admin/AdminSettings";

// ── Agent Portal Layout and Page Imports ────────────────────────────────────
import AgentLayout from "./components/agent/AgentLayout";
import AgeDashboard from "./pages/agent/AgentDashboard";
import AgeStudents from "./pages/agent/AgentStudents";
import AgeApplications from "./pages/agent/AgentApplications";
import AgeUniversities from "./pages/agent/AgentUniversities";
import AgeScholarships from "./pages/agent/AgentScholarships";
import AgeDocuments from "./pages/agent/AgentDocuments";
import AgeSopLor from "./pages/agent/AgentSopLor";
import AgeMessages from "./pages/agent/AgentMessages";
import AgeMeetings from "./pages/agent/AgentMeetings";
import AgeCommissions from "./pages/agent/AgentCommissions";
import AgeNotifications from "./pages/agent/AgentNotifications";
import AgeProfile from "./pages/agent/AgentProfile";

import RecommendationPage from "./pages/dashboards/RecommendationPage";
import WalletPage from "./pages/dashboards/WalletPage";
import UniversityPage from "./pages/dashboards/UniversityPage";
import ScholarshipsPage from "./pages/dashboards/ScholarshipsPage";
import ApplicationsPage from "./pages/dashboards/ApplicationsPage";
import DocumentsPage from "./pages/dashboards/DocumentsPage";
import NotificationsPage from "./pages/dashboards/NotificationsPage";
import SettingsPage from "./pages/dashboards/SettingsPage";

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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/student/admin/login" element={<AdminLogin />} />

        {/* Dashboard Routes wrapped in ProtectedRoute and DashboardLayout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/student" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="recommendations" element={<RecommendationPage />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="universities" element={<UniversityPage />} />
            <Route path="scholarships" element={<ScholarshipsPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="sop" element={<DocumentsPage />} />
            <Route path="lor" element={<DocumentsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Agent Portal Nested Routes */}
        <Route path="/agent" element={<AgentLayout />}>
          <Route index element={<Navigate to="/agent/dashboard" replace />} />
          <Route path="dashboard" element={<AgeDashboard />} />
          <Route path="students" element={<AgeStudents />} />
          <Route path="applications" element={<AgeApplications />} />
          <Route path="universities" element={<AgeUniversities />} />
          <Route path="scholarships" element={<AgeScholarships />} />
          <Route path="documents" element={<AgeDocuments />} />
          <Route path="sop-lor" element={<AgeSopLor />} />
          <Route path="messages" element={<AgeMessages />} />
          <Route path="meetings" element={<AgeMeetings />} />
          <Route path="commissions" element={<AgeCommissions />} />
          <Route path="notifications" element={<AgeNotifications />} />
          <Route path="profile" element={<AgeProfile />} />
        </Route>

        <Route path="/agency" element={<DashboardLayout />}>
          <Route path="dashboard" element={<AgencyDashboard />} />
          <Route path="wallet" element={<WalletPage />} />
        </Route>

        <Route path="/university" element={<DashboardLayout />}>
          <Route path="dashboard" element={<UniRepDashboard />} />
        </Route>

        {/* Admin Portal Nested Routes (Role-protected: admin only) */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdmDashboard />} />
            <Route path="students" element={<AdmStudents />} />
            <Route path="agents" element={<AdmAgents />} />
            <Route path="live-agents" element={<AdmLiveAgents />} />
            <Route path="universities" element={<AdmUniversities />} />
            <Route path="scholarships" element={<AdmScholarships />} />
            <Route path="applications" element={<AdmApplications />} />
            <Route path="recommendations" element={<AdmRecommendations />} />
            <Route path="sop-lor" element={<AdmSopLor />} />
            <Route path="wallet" element={<AdmWallet />} />
            <Route path="payments" element={<AdmPayments />} />
            <Route path="notifications" element={<AdmNotifications />} />
            <Route path="reports" element={<AdmReports />} />
            <Route path="settings" element={<AdmSettings />} />
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
