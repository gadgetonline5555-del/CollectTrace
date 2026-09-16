import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here (lazy-loaded for code splitting)
import { lazy, Suspense } from 'react';
const Home = lazy(() => import('@/pages/Home'));
const MangaLibrary = lazy(() => import('@/pages/MangaLibrary'));
const MangaReader = lazy(() => import('@/pages/MangaReader'));
const ResearchHub = lazy(() => import('@/pages/ResearchHub'));
const Radar = lazy(() => import('@/pages/Radar'));
const ResearchDetail = lazy(() => import('@/pages/ResearchDetail'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const Admin = lazy(() => import('@/pages/Admin'));
const Glossary = lazy(() => import('@/pages/Glossary'));
const AiResearch = lazy(() => import('@/pages/AiResearch'));
const Discover = lazy(() => import('@/pages/Discover'));
const WealthTracker = lazy(() => import('@/pages/WealthTracker'));
const CompanyIntel = lazy(() => import('@/pages/CompanyIntel'));
const IpoTracker = lazy(() => import('@/pages/IpoTracker'));
const Invite = lazy(() => import('@/pages/Invite'));
const SnapshotView = lazy(() => import('@/pages/SnapshotView'));
const Watchlist = lazy(() => import('@/pages/Watchlist'));
const Portfolio = lazy(() => import('@/pages/Portfolio'));
const ApiAccess = lazy(() => import('@/pages/ApiAccess'));
const Settings = lazy(() => import('@/pages/Settings'));
const Legal = lazy(() => import('@/pages/Legal'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { I18nProvider } from '@/lib/i18n';
import { ThemeProvider } from 'next-themes';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/radar" element={<Radar />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/glossary" element={<Glossary />} />
        <Route path="/ai-research" element={<AiResearch />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/wealth" element={<WealthTracker />} />
        <Route path="/company-intel" element={<CompanyIntel />} />
        <Route path="/ipo" element={<IpoTracker />} />
        <Route path="/invite" element={<Invite />} />
        <Route path="/s/:id" element={<SnapshotView />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/legal" element={<Legal />} />
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/manga" element={<MangaLibrary />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/api-access" element={<ApiAccess />} />
          <Route path="/manga/:id" element={<MangaReader />} />
          <Route path="/research" element={<ResearchHub />} />
          <Route path="/research/:id" element={<ResearchDetail />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
  );
};


function App() {

  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <I18nProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
      </I18nProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App