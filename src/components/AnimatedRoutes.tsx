import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from './LoginPage';
import EmployeeTable from './EmployeeTable';
import QuarterTable from './QuarterTable';
import TaskTable from './TaskTable';
import ReportsTable from './ReportsTable';
import QuarterWorkdays from './QuarterWorkdays';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import LoadingScreen from './LoadingScreen';
import VarietyTable from './VarietyTable';
import StructureTable from './StrcutureTable';
import JornalesNoProductivos from './JornalesNoProductivos';



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

const AnimatedRoutes = () => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");
  const { loading, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage("fadeOut");
    }
  }, [location, displayLocation]);

  const handleAnimationEnd = () => {
    if (transitionStage === "fadeOut") {
      setTransitionStage("fadeIn");
      setDisplayLocation(location);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // Estructura para páginas autenticadas (con sidebar y topbar)
  if (isAuthenticated && location.pathname !== '/login') {
    return (
      <div className="min-h-screen bg-gray-100">
        <Topbar />
        <Sidebar />
        <div className="pl-64 pt-16">
          <div
            className={`${transitionStage}`}
            onAnimationEnd={handleAnimationEnd}
          >
            <Routes location={displayLocation}>
              <Route path="/" element={<Navigate to="/employees" replace />} />
              <Route path="/employees" element={<EmployeeTable />} />
              <Route path="/quarters" element={<QuarterTable />} />
              <Route path="/structure" element={<StructureTable />} />
              <Route path="/quarters/:id/workdays" element={<QuarterWorkdays />} />
              <Route path="/tasks" element={<TaskTable />} />
              <Route path="/reports" element={<ReportsTable />} />
              <Route path="/varieties" element={<VarietyTable />} />
              <Route path="/noProductivos" element={<JornalesNoProductivos />} />
              <Route path="*" element={<Navigate to="/employees" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    );
  }
  
  // Estructura para páginas no autenticadas (login)
  return (
    <Routes>
      <Route path="/login" element={
        <AuthRoute>
          <LoginPage />
        </AuthRoute>
      } />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AnimatedRoutes;