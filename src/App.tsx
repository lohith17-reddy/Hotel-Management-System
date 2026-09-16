import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { LandingPage } from './components/landing/LandingPage.tsx';
import { StudentLoginPage } from './components/auth/StudentLoginPage.tsx';
import { StudentSignUpPage } from './components/auth/StudentSignUpPage.tsx';
import { WardenLoginPage } from './components/auth/WardenLoginPage.tsx';
import { WardenSignUpPage } from './components/auth/WardenSignUpPage.tsx';
import { AdminLoginPage } from './components/auth/AdminLoginPage.tsx';
import { AdminSignUpPage } from './components/auth/AdminSignUpPage.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { PortalHeader } from './components/layout/PortalHeader.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard.tsx';
import { HostelsView } from './components/hostels/HostelsView.tsx';
import { RoomsBedsView } from './components/hostels/RoomsBedsView.tsx';
import { AllocationsView } from './components/allocations/AllocationsView.tsx';
import { StudentsView } from './components/students/StudentsView.tsx';
import { FoodWastageDashboard } from './components/foodWaste/FoodWastageDashboard.tsx';
import { ComplaintsView } from './components/complaints/ComplaintsView.tsx';
import { LeavesView } from './components/leaves/LeavesView.tsx';
import { FeesView } from './components/fees/FeesView.tsx';
import { VisitorsView } from './components/visitors/VisitorsView.tsx';
import { AttendanceView } from './components/attendance/AttendanceView.tsx';
import { AnnouncementsView } from './components/announcements/AnnouncementsView.tsx';
import { InventoryView } from './components/inventory/InventoryView.tsx';
import { AuditLogsView } from './components/audit/AuditLogsView.tsx';
import { AIAssistantModal } from './components/ai/AIAssistantModal.tsx';
import { Menu, X, ShieldAlert } from 'lucide-react';

type AuthRoute =
  | 'landing'
  | 'student-login'
  | 'student-signup'
  | 'warden-login'
  | 'warden-signup'
  | 'admin-login'
  | 'admin-signup';

function getRouteFromPathname(path: string): { authRoute: AuthRoute; tab?: string } {
  const clean = path.toLowerCase().replace(/\/$/, '') || '/';
  if (clean === '/student/login') return { authRoute: 'student-login' };
  if (clean === '/student/signup') return { authRoute: 'student-signup' };
  if (clean === '/warden/login') return { authRoute: 'warden-login' };
  if (clean === '/warden/signup') return { authRoute: 'warden-signup' };
  if (clean === '/admin/login') return { authRoute: 'admin-login' };
  if (clean === '/admin/signup') return { authRoute: 'admin-signup' };
  if (clean === '/student/dashboard') return { authRoute: 'landing', tab: 'dashboard' };
  if (clean === '/warden/dashboard') return { authRoute: 'landing', tab: 'dashboard' };
  if (clean === '/admin/dashboard') return { authRoute: 'landing', tab: 'dashboard' };
  return { authRoute: 'landing' };
}

function getPathnameFromAuthRoute(authRoute: AuthRoute): string {
  switch (authRoute) {
    case 'student-login':
      return '/student/login';
    case 'student-signup':
      return '/student/signup';
    case 'warden-login':
      return '/warden/login';
    case 'warden-signup':
      return '/warden/signup';
    case 'admin-login':
      return '/admin/login';
    case 'admin-signup':
      return '/admin/signup';
    default:
      return '/';
  }
}

const MainAppContent: React.FC = () => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const [authRoute, setAuthRoute] = useState<AuthRoute>(() => {
    const { authRoute: initialRoute } = getRouteFromPathname(window.location.pathname);
    return initialRoute;
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedHostelForRooms, setSelectedHostelForRooms] = useState<string | undefined>(undefined);
  const [showAIAssistant, setShowAIAssistant] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Synchronize browser history and popstate
  const navigateToAuthRoute = useCallback((route: AuthRoute) => {
    setAuthRoute(route);
    const targetPath = getPathnameFromAuthRoute(route);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ authRoute: route }, '', targetPath);
    }
  }, []);

  const navigateToRoleDashboard = useCallback((role?: string) => {
    setActiveTab('dashboard');
    const targetPath = role ? `/${role}/dashboard` : '/dashboard';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab: 'dashboard' }, '', targetPath);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const { authRoute: currentRoute } = getRouteFromPathname(window.location.pathname);
      setAuthRoute(currentRoute);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync tab on role change to prevent illegal cross-state
  useEffect(() => {
    if (currentUser) {
      setActiveTab('dashboard');
      const targetPath = `/${currentUser.role}/dashboard`;
      if (window.location.pathname !== targetPath) {
        window.history.replaceState({ tab: 'dashboard' }, '', targetPath);
      }
    }
  }, [currentUser?.role, currentUser?.id]);

  const handleSelectHostelForRooms = (hostelId: string) => {
    setSelectedHostelForRooms(hostelId);
    setActiveTab('rooms');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-white text-sm font-semibold">Authenticating Session...</div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Unauthenticated State: Show Landing or Role Auth Pages
  // ----------------------------------------------------
  if (!isAuthenticated || !currentUser) {
    switch (authRoute) {
      case 'student-login':
        return (
          <StudentLoginPage
            onNavigateSignUp={() => navigateToAuthRoute('student-signup')}
            onNavigateLanding={() => navigateToAuthRoute('landing')}
            onLoginSuccess={() => navigateToRoleDashboard('student')}
          />
        );
      case 'student-signup':
        return (
          <StudentSignUpPage
            onNavigateLogin={() => navigateToAuthRoute('student-login')}
            onNavigateLanding={() => navigateToAuthRoute('landing')}
            onRegisteredSuccess={() => navigateToAuthRoute('student-login')}
          />
        );
      case 'warden-login':
        return (
          <WardenLoginPage
            onNavigateSignUp={() => navigateToAuthRoute('warden-signup')}
            onNavigateLanding={() => navigateToAuthRoute('landing')}
            onLoginSuccess={() => navigateToRoleDashboard('warden')}
          />
        );
      case 'warden-signup':
        return (
          <WardenSignUpPage
            onNavigateLogin={() => navigateToAuthRoute('warden-login')}
            onNavigateLanding={() => navigateToAuthRoute('landing')}
            onRegisteredSuccess={() => navigateToAuthRoute('warden-login')}
          />
        );
      case 'admin-login':
        return (
          <AdminLoginPage
            onNavigateSignUp={() => navigateToAuthRoute('admin-signup')}
            onNavigateLanding={() => navigateToAuthRoute('landing')}
            onLoginSuccess={() => navigateToRoleDashboard('admin')}
          />
        );
      case 'admin-signup':
        return (
          <AdminSignUpPage
            onNavigateLogin={() => navigateToAuthRoute('admin-login')}
            onNavigateLanding={() => navigateToAuthRoute('landing')}
            onRegisteredSuccess={() => navigateToAuthRoute('admin-login')}
          />
        );
      case 'landing':
      default:
        return (
          <LandingPage
            onNavigateStudentLogin={() => navigateToAuthRoute('student-login')}
            onNavigateStudentSignUp={() => navigateToAuthRoute('student-signup')}
            onNavigateWardenLogin={() => navigateToAuthRoute('warden-login')}
            onNavigateWardenSignUp={() => navigateToAuthRoute('warden-signup')}
            onNavigateAdminLogin={() => navigateToAuthRoute('admin-login')}
            onNavigateAdminSignUp={() => navigateToAuthRoute('admin-signup')}
          />
        );
    }
  }

  // ----------------------------------------------------
  // Authenticated State: Role-Based Dashboard & Views
  // ----------------------------------------------------
  const role = currentUser.role;

  // Strict Role-Based Access Control
  const isTabAllowed = (tab: string): boolean => {
    if (role === 'admin') return true;
    if (role === 'warden') {
      const allowed = [
        'dashboard',
        'hostels',
        'rooms',
        'allocations',
        'transfers',
        'students',
        'attendance',
        'leaves',
        'visitors',
        'food-waste',
        'complaints',
        'announcements',
        'inventory',
      ];
      return allowed.includes(tab);
    }
    if (role === 'student') {
      const allowed = [
        'dashboard',
        'my-room',
        'transfers',
        'food-waste',
        'leaves',
        'complaints',
        'fees',
        'visitors',
        'announcements',
      ];
      return allowed.includes(tab);
    }
    if (role === 'staff') {
      const allowed = ['dashboard', 'complaints', 'food-waste', 'inventory', 'announcements'];
      return allowed.includes(tab);
    }
    return tab === 'dashboard';
  };

  const renderActiveView = () => {
    if (!isTabAllowed(activeTab)) {
      return (
        <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your authenticated role (<span className="font-bold uppercase text-slate-800">{role}</span>) does not have permission to view the <span className="font-semibold">{activeTab}</span> module.
          </p>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <OverviewDashboard setActiveTab={setActiveTab} onOpenAI={() => setShowAIAssistant(true)} />;
      case 'hostels':
        return <HostelsView onSelectHostelForRooms={handleSelectHostelForRooms} />;
      case 'rooms':
        return <RoomsBedsView initialHostelId={selectedHostelForRooms} />;
      case 'my-room':
        return <AllocationsView isStudentMyRoomView={true} />;
      case 'allocations':
      case 'transfers':
        return <AllocationsView />;
      case 'students':
        return <StudentsView />;
      case 'food-waste':
        return <FoodWastageDashboard />;
      case 'complaints':
        return <ComplaintsView />;
      case 'leaves':
        return <LeavesView />;
      case 'fees':
        return <FeesView />;
      case 'visitors':
        return <VisitorsView />;
      case 'attendance':
        return <AttendanceView />;
      case 'announcements':
        return <AnnouncementsView />;
      case 'inventory':
        return <InventoryView />;
      case 'audit-logs':
        return <AuditLogsView />;
      default:
        return <OverviewDashboard setActiveTab={setActiveTab} onOpenAI={() => setShowAIAssistant(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 antialiased">
      {/* Top Navigation */}
      <Navbar
        onOpenAIAssistant={() => setShowAIAssistant(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNavigateLogin={() => navigateToAuthRoute('landing')}
      />

      {/* Role-Specific Portal Header Bar */}
      <PortalHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Mobile Sidebar Toggle Button */}
      <div className="md:hidden bg-white px-4 py-2.5 flex items-center justify-between text-slate-800 border-b border-slate-200 shadow-2xs">
        <span className="text-xs font-bold capitalize">View: {activeTab.replace('-', ' ')}</span>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop & Mobile Responsive Sidebar */}
        <div
          className={`${
            isMobileMenuOpen ? 'block fixed inset-0 z-50 pt-16 bg-white/95 backdrop-blur-md' : 'hidden md:block'
          }`}
        >
          <Sidebar
            activeTab={activeTab}
            setActiveTab={tab => {
              setActiveTab(tab);
              setIsMobileMenuOpen(false);
            }}
            onOpenAI={() => {
              setShowAIAssistant(true);
              setIsMobileMenuOpen(false);
            }}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 min-w-0 max-w-full">{renderActiveView()}</main>
      </div>

      {/* Interactive AI Assistant Modal */}
      <AIAssistantModal isOpen={showAIAssistant} onClose={() => setShowAIAssistant(false)} />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
