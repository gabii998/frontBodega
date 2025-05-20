import { NavLink, useNavigate } from 'react-router-dom';
import { Users, Home, Settings, FileText, MapPin, ClipboardList, LogOut, Grape } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-gray-800 h-screen fixed left-0 top-16">
      <nav className="mt-6">
        <div className="px-6">
          <NavLink 
            to="/home"
            className={({ isActive }) => `flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-all duration-300 w-full text-left ${
              isActive 
                ? 'bg-gray-700 text-white shadow-lg transform scale-105' 
                : ''
            }`}
          >
            <Home className="h-5 w-5 mr-3" />
            <span>Inicio</span>
          </NavLink>
          
          <NavLink 
            to="/employees"
            className={({ isActive }) => `flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-all duration-300 w-full text-left ${
              isActive 
                ? 'bg-gray-700 text-white shadow-lg transform scale-105' 
                : ''
            }`}
          >
            <Users className="h-5 w-5 mr-3" />
            <span>Empleados</span>
          </NavLink>
          
          <NavLink 
            to="/quarters"
            className={({ isActive }) => `flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-all duration-300 w-full text-left ${
              isActive 
                ? 'bg-gray-700 text-white shadow-lg transform scale-105' 
                : ''
            }`}
          >
            <MapPin className="h-5 w-5 mr-3" />
            <span>Cuarteles</span>
          </NavLink>
          
          <NavLink 
            to="/tasks"
            className={({ isActive }) => `flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-all duration-300 w-full text-left ${
              isActive 
                ? 'bg-gray-700 text-white shadow-lg transform scale-105' 
                : ''
            }`}
          >
            <ClipboardList className="h-5 w-5 mr-3" />
            <span>Tareas</span>
          </NavLink>
          
          <NavLink 
            to="/reports"
            className={({ isActive }) => `flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-all duration-300 w-full text-left ${
              isActive 
                ? 'bg-gray-700 text-white shadow-lg transform scale-105' 
                : ''
            }`}
          >
            <FileText className="h-5 w-5 mr-3" />
            <span>Reportes</span>
          </NavLink>

           <NavLink 
             to="/varieties"
             className={({ isActive }) => `flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-all duration-300 w-full text-left ${
               isActive ? 'bg-gray-700 text-white shadow-lg transform scale-105'  : ''
             }`}
           >
             <Grape className="h-5 w-5 mr-3" />
             <span>Variedades de Uva</span>
           </NavLink>
          
          <NavLink 
            to="/settings"
            className={({ isActive }) => `flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-all duration-300 w-full text-left ${
              isActive 
                ? 'bg-gray-700 text-white shadow-lg transform scale-105' 
                : ''
            }`}
          >
            <Settings className="h-5 w-5 mr-3" />
            <span>Configuración</span>
          </NavLink>
          
          <button 
            onClick={handleLogout}
            className="flex items-center px-4 py-3 text-gray-300 hover:bg-red-700 rounded-lg transition-all duration-300 w-full text-left mt-4"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;