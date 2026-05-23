import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Views
import LandingPage from './views/LandingPage';
import LoginPage from './views/LoginPage';
import SignupPage from './views/SignupPage';
import ClientDashboard from './views/clientside/ClientDashboard';import FreelancerDashboard from './views/FreelancerDashboard';
import AdminDashboard from './views/AdminDashboard';
import { MessagingView, DetailViewLayout } from './views/SupportCore';
import { WalletView } from './views/SupportFinance';
import { AIExperienceView } from './views/SupportAI';
import { SettingsView, SystemAdminView } from './views/SupportSystem';
import { DashboardLayout } from './components/Layouts';
import { LayoutDashboard, ShieldAlert, Award } from 'lucide-react';

// Protects routes — redirects to /login if not authenticated
const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !profile?.isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />

          {/* Client */}
          <Route path="/client/dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
          <Route path="/client/messages" element={<ProtectedRoute><DashboardLayout sidebarItems={clientSidebar}><MessagingView /></DashboardLayout></ProtectedRoute>} />
          <Route path="/client/payments" element={<ProtectedRoute><DashboardLayout sidebarItems={clientSidebar}><WalletView /></DashboardLayout></ProtectedRoute>} />
          <Route path="/client/settings" element={<ProtectedRoute><DashboardLayout sidebarItems={clientSidebar}><SettingsView /></DashboardLayout></ProtectedRoute>} />

          {/* Freelancer */}
          <Route path="/freelancer/dashboard" element={<ProtectedRoute><FreelancerDashboard /></ProtectedRoute>} />
          <Route path="/freelancer/wallet" element={<ProtectedRoute><DashboardLayout sidebarItems={freelancerSidebar}><WalletView /></DashboardLayout></ProtectedRoute>} />
          <Route path="/freelancer/reputation" element={<ProtectedRoute><DashboardLayout sidebarItems={freelancerSidebar}><AIExperienceView /></DashboardLayout></ProtectedRoute>} />
          <Route path="/freelancer/ai-proposal" element={<ProtectedRoute><DashboardLayout sidebarItems={freelancerSidebar}><AIExperienceView /></DashboardLayout></ProtectedRoute>} />
          <Route path="/freelancer/settings" element={<ProtectedRoute><DashboardLayout sidebarItems={freelancerSidebar}><SettingsView /></DashboardLayout></ProtectedRoute>} />

          {/* Admin — adminOnly flag means non-admins get bounced */}
          <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/fraud" element={<ProtectedRoute adminOnly><DashboardLayout sidebarItems={adminSidebar}><SystemAdminView /></DashboardLayout></ProtectedRoute>} />

          {/* Detail */}
          <Route path="/project/:id" element={<ProtectedRoute><DetailViewLayout title="Identity Metamorphosis" subtitle="The Aurelian Group" badge="In Progress"><div>Detail content here...</div></DetailViewLayout></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

const clientSidebar = [
  { icon: LayoutDashboard, label: 'Overview', path: '/client/dashboard' },
  { icon: Award, label: 'Milestones', path: '/client/milestones' },
  { icon: ShieldAlert, label: 'Payments', path: '/client/payments' },
];
const freelancerSidebar = [
  { icon: LayoutDashboard, label: 'Overview', path: '/freelancer/dashboard' },
  { icon: Award, label: 'Reputation', path: '/freelancer/reputation' },
  { icon: ShieldAlert, label: 'Wallet', path: '/freelancer/wallet' },
];
const adminSidebar = [
  { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
  { icon: ShieldAlert, label: 'Fraud Monitor', path: '/admin/fraud' },
];