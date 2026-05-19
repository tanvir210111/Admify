import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import AgentDashboard from './pages/dashboards/AgentDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import AgencyDashboard from './pages/dashboards/AgencyDashboard';
import UniRepDashboard from './pages/dashboards/UniRepDashboard';
import RecommendationPage from './pages/RecommendationPage';
import WalletPage from './pages/WalletPage';
import UniversityPage from './pages/UniversityPage';
import DashboardLayout from './components/layout/DashboardLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Dashboard Routes wrapper */}
        <Route element={<DashboardLayout />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/agent" element={<AgentDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/agency" element={<AgencyDashboard />} />
          <Route path="/unirep" element={<UniRepDashboard />} />
          <Route path="/recommendations" element={<RecommendationPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/university/:id" element={<UniversityPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
