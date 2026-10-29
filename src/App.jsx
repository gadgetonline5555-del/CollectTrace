import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here (lazy-loaded for code splitting)
import { lazy, Suspense, useEffect } from 'react';
const ResearchHub = lazy(() => import('@/pages/ResearchHub'));
const ResearchDetail = lazy(() => import('@/pages/ResearchDetail'));
const Admin = lazy(() => import('@/pages/Admin'));
const Watchlist = lazy(() => import('@/pages/Watchlist'));
const Portfolio = lazy(() => import('@/pages/Portfolio'));
const ApiAccess = lazy(() => import('@/pages/ApiAccess'));
const Settings = lazy(() => import('@/pages/Settings'));
const Legal = lazy(() => import('@/pages/Legal'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const OAuthConsent = lazy(() => import('@/pages/OAuthConsent'));
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { I18nProvider } from '@/lib/i18n';
import { ThemeProvider } from 'next-themes';
const PublicReadPreview = lazy(() => import('@/pages/PublicReadPreview'));
// Public preview routes deliberately do not mount legacy navigation or live-data pages.
const PUBLIC_PREVIEW_PATHS = ["/","/preview","/radar","/screener","/pricing","/glossary","/ai-research","/discover","/wealth","/company-intel","/ipo","/invite","/s/:id"];

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, checkAppState } = useAuth();

  // Redirect to login on auth_required — in useEffect, not during render.
  useEffect(() => {
    if (authError?.type === 'auth_required') {
      navigateToLogin();
    }
  }, [authError, navigateToLogin]);

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
      return (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
        </div>
      );
    } else if (authError.type === 'network_error' || authError.type === 'unknown') {
      // Communication failure — show error and retry, do NOT treat as authenticated.
      return (
        <div className="fixed inset-0 flex items-center justify-center px-4">
          <div className="max-w-md text-center">
            <p className="text-foreground font-medium mb-2">通信エラーが発生しました</p>
            <p className="text-muted-foreground text-sm mb-6">{authError.message || '認証状態を確認できませんでした。'}</p>
            <button
              onClick={() => checkAppState()}
              className="px-6 py-3 rounded-xl font-semibold bg-foreground text-background min-h-11"
            >
              再試行
            </button>
          </div>
        </div>
      );
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
      <Route path="/oauth/consent" element={<OAuthConsent />} />
      {PUBLIC_PREVIEW_PATHS.map((path) => (
        <Route key={path} path={path} element={<PublicReadPreview />} />
      ))}
      <Route element={<Layout />}>
        <Route path="/settings" element={<Settings />} />
        <Route path="/legal" element={<Legal />} />
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/api-access" element={<ApiAccess />} />
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