import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Topbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="h-16 bg-white fixed w-full shadow-sm z-10">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-800">Sistea de Jornales</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-gray-700">{user?.email}</span>
          <button
            onClick={logout}
            className="text-gray-600 hover:text-gray-800"
            title="Cerrar sesión"
          >
            <LogOut className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Topbar;