import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface User {
  email: string;
  nombre: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Verificar autenticación al cargar la página
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const savedUser = localStorage.getItem('user');
        
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          
          // Configurar el token para todas las solicitudes
          axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
          
          // Validar que el token sigue siendo válido haciendo una petición al servidor
          try {
            // Puedes crear un endpoint específico para validar tokens
            // o usar uno existente como obtener el perfil del usuario
            await axios.get('/api/usuarios/perfil');
            
            // Si llega aquí, el token es válido
            setUser(parsedUser);
            setIsAuthenticated(true);
          } catch (error) {
            console.error("Error validando token:", error);
            // Token inválido, eliminar datos
            localStorage.removeItem('user');
            delete axios.defaults.headers.common['Authorization'];
          }
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });
      
      const userData: User = {
        email: response.data.email,
        nombre: response.data.nombre,
        token: response.data.token
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Configurar el token para todas las solicitudes futuras
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      
      return;
    } catch (error) {
      console.error('Error durante el login:', error);
      throw new Error('Credenciales inválidas');
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    
    // Eliminar el token de las solicitudes futuras
    delete axios.defaults.headers.common['Authorization'];
    
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};