import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import EmployeeTable from './components/EmployeeTable';
import QuarterTable from './components/QuarterTable';
import TaskTable from './components/TaskTable';
import ReportsTable from './components/ReportsTable';
import QuarterWorkdays from './components/QuarterWorkdays';
import VarietyTable from './components/VarietyTable';

// Componente de carga
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Cargando...</p>
    </div>
  </div>
);

// Componente protegido que verifica la autenticación
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Componente para redireccionar si ya está autenticado
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/employees" replace />;
  }
  
  return <>{children}</>;
};

// Componente de layout principal que incluye Sidebar y Topbar
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Topbar />
      <Sidebar />
      <div className="pl-64 pt-16">
        {children}
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <Routes>
      <Route path="/login" element={
        <AuthRoute>
          <LoginPage />
        </AuthRoute>
      } />
      
      <Route path="/" element={<Navigate to="/employees" replace />} />
      
      <Route path="/employees" element={
        <ProtectedRoute>
          <MainLayout>
            <EmployeeTable />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/quarters" element={
        <ProtectedRoute>
          <MainLayout>
            <QuarterTable />
          </MainLayout>
        </ProtectedRoute>
      } />

<Route path="/quarters/:id/workdays" element={
  <ProtectedRoute>
    <MainLayout>
      <QuarterWorkdays />
    </MainLayout>
  </ProtectedRoute>
} />
      
      <Route path="/tasks" element={
        <ProtectedRoute>
          <MainLayout>
            <TaskTable />
          </MainLayout>
        </ProtectedRoute>
      } />

    <Route path="/varieties" element={
        <ProtectedRoute>
          <MainLayout>
            <VarietyTable />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute>
          <MainLayout>
            <ReportsTable />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/employees" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;