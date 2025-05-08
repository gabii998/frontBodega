// src/components/Topbar.tsx
import { useState } from 'react';
import { LogOut, MapPin, ChevronDown, Plus, Edit, Trash2, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFarm } from '../context/FarmContext';
import Farm from '../model/Farm';
import FarmModal from './FarmModal';
import Toast from './Toast';
import ToastProps from '../model/ToastProps';
import { createFarm, updateFarm, deleteFarm } from '../services/FarmService';

const Topbar = () => {
  const { user, logout } = useAuth();
  const { activeFarm, farms, setActiveFarm, loadFarms } = useFarm();
  const [showFarmSelector, setShowFarmSelector] = useState(false);
  const [showFarmManagement, setShowFarmManagement] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastProps | null>(null);

  const handleFarmSelect = (farm: Farm) => {
    setActiveFarm(farm);
    setShowFarmSelector(false);
  };

  const handleCreateFarm = () => {
    setSelectedFarm(null);
    setIsModalOpen(true);
    setShowFarmSelector(false);
    setShowFarmManagement(false);
  };

  const handleEditFarm = (farm: Farm) => {
    setSelectedFarm(farm);
    setIsModalOpen(true);
    setShowFarmSelector(false);
    setShowFarmManagement(false);
  };

  const handleDeleteFarm = async (farm: Farm) => {
    if (farms.length <= 1) {
      setToast({
        type: 'error',
        message: 'No se puede eliminar la única finca existente'
      });
      return;
    }

    if (confirm(`¿Está seguro de que desea eliminar la finca "${farm.nombre}"?`)) {
      setIsLoading(true);
      try {
        const success = await deleteFarm(farm.id);
        if (success) {
          // Recargar la lista de fincas
          await loadFarms();
          
          setToast({
            type: 'success',
            message: 'Finca eliminada correctamente'
          });
          
          // Si la finca eliminada era la activa, se seleccionará otra automáticamente
          // en el loadFarms()
        } else {
          setToast({
            type: 'error',
            message: 'Error al eliminar la finca'
          });
        }
      } catch (error) {
        console.error('Error al eliminar la finca:', error);
        setToast({
          type: 'error',
          message: 'Error al eliminar la finca'
        });
      } finally {
        setIsLoading(false);
        setShowFarmManagement(false);
      }
    }
  };

  const handleSaveFarm = async (farmData: Farm) => {
    setIsLoading(true);
    try {
      let savedFarm: Farm | null;
      
      if (selectedFarm) {
        // Actualizar finca existente
        savedFarm = await updateFarm(selectedFarm.id, farmData.nombre);
        
        if (savedFarm) {
          // Recargar la lista de fincas
          await loadFarms();
          
          setToast({
            type: 'success',
            message: 'Finca actualizada correctamente'
          });
        } else {
          setToast({
            type: 'error',
            message: 'Error al actualizar la finca'
          });
        }
      } else {
        // Crear nueva finca
        savedFarm = await createFarm(farmData.nombre);
        
        if (savedFarm) {
          // Recargar la lista de fincas
          await loadFarms();
          
          // Establecer la nueva finca como activa
          setActiveFarm(savedFarm);
          
          setToast({
            type: 'success',
            message: 'Finca creada correctamente'
          });
        } else {
          setToast({
            type: 'error',
            message: 'Error al crear la finca'
          });
        }
      }
      
      // Cerrar el modal
      setIsModalOpen(false);
      setSelectedFarm(null);
      
    } catch (error) {
      console.error('Error al guardar la finca:', error);
      setToast({
        type: 'error',
        message: 'Error al guardar la finca'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="h-16 bg-white fixed w-full shadow-sm z-10">
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800 mr-6">Sistema de Jornales</h1>
            
            {/* Selector de Fincas */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowFarmSelector(!showFarmSelector);
                  setShowFarmManagement(false);
                }}
                className="flex items-center px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MapPin className="h-4 w-4 mr-2 text-green-600" />
                <span className="mr-1">{activeFarm?.nombre || 'Seleccionar Finca'}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
              
              {showFarmSelector && (
                <div className="absolute mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
                  <div className="p-2 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-700">Fincas Disponibles</h3>
                      <button
                        onClick={() => setShowFarmManagement(!showFarmManagement)}
                        className="text-gray-500 hover:text-gray-700"
                        title="Gestionar fincas"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {farms.map(farm => (
                    <button
                      key={farm.id}
                      onClick={() => handleFarmSelect(farm)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        activeFarm?.id === farm.id ? 'bg-green-50 text-green-800 font-medium' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        {activeFarm?.id === farm.id && (
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        )}
                        <span className={activeFarm?.id === farm.id ? 'ml-0' : 'ml-4'}>
                          {farm.nombre}
                        </span>
                      </div>
                    </button>
                  ))}
                  
                  {/* Gestión de fincas */}
                  {showFarmManagement && (
                    <div className="border-t border-gray-200 pt-1 mt-1">
                      {farms.map(farm => (
                        <div
                          key={`manage-${farm.id}`}
                          className="flex items-center justify-between px-4 py-2 hover:bg-gray-100"
                        >
                          <span className="text-sm text-gray-700">{farm.nombre}</span>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditFarm(farm);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              disabled={isLoading}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFarm(farm);
                              }}
                              className="text-red-600 hover:text-red-800"
                              disabled={isLoading || farms.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="px-4 py-2 border-t border-gray-200">
                        <button
                          onClick={handleCreateFarm}
                          className="w-full flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          disabled={isLoading}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Nueva Finca
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
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
      
      {/* Modal para crear/editar fincas */}
      {isModalOpen && (
        <FarmModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedFarm(null);
          }}
          onSave={handleSaveFarm}
          farm={selectedFarm || undefined}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default Topbar;