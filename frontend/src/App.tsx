import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './lib/AppContext';
import AppShell from './components/app-shell/AppShell';
import Landing from './pages/Landing';

// Lazy load pages for performance
const Overview = React.lazy(() => import('./pages/Overview'));
const Documents = React.lazy(() => import('./pages/Documents'));
const Processing = React.lazy(() => import('./pages/Processing'));
const Verification = React.lazy(() => import('./pages/Verification'));
const LandRecords = React.lazy(() => import('./pages/LandRecords'));
const RecordDetail = React.lazy(() => import('./pages/RecordDetail'));
const GIS = React.lazy(() => import('./pages/GIS'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const AuditTrail = React.lazy(() => import('./pages/AuditTrail'));
const Integrations = React.lazy(() => import('./pages/Integrations'));
const Users = React.lazy(() => import('./pages/Users'));

// Simple loading fallback
const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
    Loading module...
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* Public Landing */}
          <Route path="/" element={<Landing />} />

          {/* App Shell */}
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Navigate to="overview" replace />} />
            
            <Route path="overview" element={
              <Suspense fallback={<PageLoader />}><Overview /></Suspense>
            } />
            
            <Route path="documents" element={
              <Suspense fallback={<PageLoader />}><Documents /></Suspense>
            } />
            
            <Route path="processing" element={
              <Suspense fallback={<PageLoader />}><Processing /></Suspense>
            } />
            
            <Route path="verification" element={
              <Suspense fallback={<PageLoader />}><Verification /></Suspense>
            } />
            
            <Route path="records" element={
              <Suspense fallback={<PageLoader />}><LandRecords /></Suspense>
            } />
            
            <Route path="records/:id" element={
              <Suspense fallback={<PageLoader />}><RecordDetail /></Suspense>
            } />
            
            <Route path="gis" element={
              <Suspense fallback={<PageLoader />}><GIS /></Suspense>
            } />
            
            <Route path="analytics" element={
              <Suspense fallback={<PageLoader />}><Analytics /></Suspense>
            } />
            
            <Route path="audit" element={
              <Suspense fallback={<PageLoader />}><AuditTrail /></Suspense>
            } />
            
            <Route path="integrations" element={
              <Suspense fallback={<PageLoader />}><Integrations /></Suspense>
            } />
            
            <Route path="users" element={
              <Suspense fallback={<PageLoader />}><Users /></Suspense>
            } />
            
            {/* Catch all unbuilt admin routes */}
            <Route path="roles" element={<Navigate to="/app/users" replace />} />
            <Route path="settings" element={<Navigate to="/app/overview" replace />} />
          </Route>

          {/* Fallback 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
