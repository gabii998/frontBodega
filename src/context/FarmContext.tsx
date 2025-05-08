import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Farm from '../model/Farm';

interface FarmContextType {
  activeFarm: Farm | null;
  farms: Farm[];
  isLoading: boolean;
  setActiveFarm: (farm: Farm) => void;
  loadFarms: () => Promise<void>;
}

const FarmContext = createContext<FarmContextType | null>(null);

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeFarm, setActiveFarm] = useState<Farm | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadFarms = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Farm[]>('/api/fincas');
      setFarms(response.data);
      
      // Si no hay una finca activa pero hay fincas disponibles, establecer la primera como activa
      if (!activeFarm && response.data.length > 0) {
        const savedFarmId = localStorage.getItem('activeFarmId');
        
        // Intentar restaurar la última finca seleccionada
        if (savedFarmId) {
          const savedFarm = response.data.find(farm => farm.id === parseInt(savedFarmId));
          if (savedFarm) {
            setActiveFarm(savedFarm);
          } else {
            setActiveFarm(response.data[0]);
          }
        } else {
          setActiveFarm(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Error al cargar fincas:', error);
      // Crear una finca por defecto si hay un error
      if (!activeFarm) {
        const defaultFarm: Farm = { id: 1, nombre: 'Finca Principal' };
        setFarms([defaultFarm]);
        setActiveFarm(defaultFarm);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar las fincas al iniciar la aplicación
  useEffect(() => {
    loadFarms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guardar la finca activa en localStorage cuando cambie
  useEffect(() => {
    if (activeFarm) {
      localStorage.setItem('activeFarmId', activeFarm.id.toString());
    }
  }, [activeFarm]);

  const handleSetActiveFarm = (farm: Farm) => {
    setActiveFarm(farm);
  };

  return (
    <FarmContext.Provider
      value={{
        activeFarm,
        farms,
        isLoading,
        setActiveFarm: handleSetActiveFarm,
        loadFarms
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};