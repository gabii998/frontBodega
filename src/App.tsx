import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FarmProvider } from './context/FarmContext';
import AnimatedRoutes from './components/AnimatedRoutes';



function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FarmProvider>
          <AnimatedRoutes/>
        </FarmProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;