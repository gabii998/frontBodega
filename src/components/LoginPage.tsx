import { FormEvent, useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/apiUtil';
import ErrorBanner from '../common/ErrorBanner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    apiCall({
      setError:setError,
      setLoading:setIsLoading,
      errorMessage:'Ha ocurrido un error al iniciar sesion',
      serverCall: login(email,password),
      onSuccess: () => { navigate('/dashboard'); }
    })
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-full">
            <LogIn className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Sistema de Jornales
        </h2>
        
        {error && (
          <ErrorBanner error={error}/>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <p className="mt-4 text-sm text-gray-600 text-center">
          Usuario: admin@bodega.com | Contraseña: admin123
        </p>
      </div>
    </div>
  );
};

export default LoginPage;