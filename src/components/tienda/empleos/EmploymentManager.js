// src/components/tienda/empleos/EmploymentManager.js
'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import {
  TIPOS_PUBLICACION
} from '@/types/employment';
import {
  createEmployment,
  updateEmployment,
  deleteEmployment
} from '@/lib/helpers/employmentHelpers';
import OfertaEmpleoForm from './OfertaEmpleoForm';
import BusquedaEmpleoForm from './BusquedaEmpleoForm';
import ServicioProfesionalForm from './ServicioProfesionalForm';
import OfertaEmpleoCard from './OfertaEmpleoCard';
import BusquedaEmpleoCard from './BusquedaEmpleoCard';
import ServicioProfesionalCard from './ServicioProfesionalCard';
import {
  Plus,
  ArrowLeft,
  Briefcase,
  User as UserIcon,
  Wrench,
  Package,
  Filter,
  Search,
  Edit,
  Trash2,
  Eye,
  X
} from 'lucide-react';

export default function EmploymentManager({ storeId, storeData, userData }) {
  const { user } = useAuth();
  const [view, setView] = useState('list');
  const [tipoPublicacion, setTipoPublicacion] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [selectedPublicacion, setSelectedPublicacion] = useState(null);
  const [editingPublicacion, setEditingPublicacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showPreview, setShowPreview] = useState(false);

  // 🔍 LOG 1: Verificar usuario y datos iniciales
  useEffect(() => {
    console.log('🚀 EmploymentManager montado:', {
      usuario: {
        uid: user?.uid,
        email: user?.email
      },
      storeId: storeId,
      userData: userData
    });
  }, [user, storeId, userData]);

  // Cargar publicaciones
  useEffect(() => {
    if (storeId) {
      loadPublicaciones();
    }
  }, [storeId]);

  const loadPublicaciones = async () => {
    try {
      setLoading(true);
      const empleosRef = collection(db, 'empleos');
      const q = query(
        empleosRef,
        where('usuarioId', '==', storeId),
        orderBy('fechaCreacion', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const publicacionesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPublicaciones(publicacionesData);
    } catch (error) {
      console.error('Error cargando publicaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = (tipo) => {
    setTipoPublicacion(tipo);
    setEditingPublicacion(null);
    setView('form');
  };

  const handleEdit = (publicacion) => {
    setTipoPublicacion(publicacion.tipoPublicacion);
    setEditingPublicacion(publicacion);
    setView('form');
  };

  const handleView = (publicacion) => {
    setSelectedPublicacion(publicacion);
    setShowPreview(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta publicación?')) return;

    try {
      await deleteEmployment(id);
      setPublicaciones(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error eliminando:', error);
      alert('Error al eliminar la publicación');
    }
  };

  const handleSave = async (formData) => {
    try {
      setLoading(true);
      
      // 🔍 LOG 2: Ver datos del formulario
      console.log('📝 FormData recibido:', formData);
      console.log('🔑 StoreId actual:', storeId);
      console.log('📌 Tipo de publicación:', tipoPublicacion);
      
      if (editingPublicacion) {
        // Actualizar publicación existente
        await updateEmployment(editingPublicacion.id, {
          ...formData,
          fechaModificacion: new Date().toISOString()
        });
        
        setPublicaciones(prev =>
          prev.map(p => p.id === editingPublicacion.id 
            ? { ...p, ...formData, fechaModificacion: new Date().toISOString() }
            : p
          )
        );
      } else {
        // Crear nueva publicación - ESTRUCTURA SIMPLIFICADA
        const nuevaPublicacion = {
          // Campos OBLIGATORIOS según Firestore Rules
          titulo: formData.titulo || '',
          tipoPublicacion: tipoPublicacion,
          usuarioId: storeId,
          
          // Campos adicionales
          descripcion: formData.descripcion || '',
          empresa: formData.empresa || '',
          ubicacion: formData.ubicacion || '',
          salario: formData.salario || null,
          
          // Campos opcionales específicos por tipo
          ...(tipoPublicacion === TIPOS_PUBLICACION.OFERTA_EMPLEO && {
            tipoContrato: formData.tipoContrato || '',
            modalidad: formData.modalidad || '',
            experiencia: formData.experiencia || '',
            requisitos: formData.requisitos || [],
            beneficios: formData.beneficios || []
          }),
          
          ...(tipoPublicacion === TIPOS_PUBLICACION.BUSQUEDA_EMPLEO && {
            disponibilidad: formData.disponibilidad || '',
            habilidades: formData.habilidades || [],
            experienciaAnios: formData.experienciaAnios || 0,
            curriculum: formData.curriculum || null
          }),
          
          ...(tipoPublicacion === TIPOS_PUBLICACION.SERVICIO_PROFESIONAL && {
            especialidad: formData.especialidad || '',
            tarifa: formData.tarifa || null,
            disponibilidadHoraria: formData.disponibilidadHoraria || '',
            certificaciones: formData.certificaciones || []
          }),
          
          // Contacto
          email: formData.email || userData?.email || '',
          telefono: formData.telefono || userData?.phone || '',
          whatsapp: formData.whatsapp || userData?.whatsapp || '',
          
          // Metadata
          estado: 'activo',
          fechaCreacion: new Date().toISOString(),
          fechaModificacion: new Date().toISOString(),
          vistas: 0
        };
        
        console.log('✅ Publicación lista para guardar:', nuevaPublicacion);
        console.log('🔍 Verificar campos requeridos:', {
          titulo: nuevaPublicacion.titulo,
          tipoPublicacion: nuevaPublicacion.tipoPublicacion,
          usuarioId: nuevaPublicacion.usuarioId
        });
        
        const nuevoId = await createEmployment(nuevaPublicacion);
        setPublicaciones(prev => [...prev, { id: nuevoId, ...nuevaPublicacion }]);
      }

      setView('list');
      setEditingPublicacion(null);
      setTipoPublicacion(null);
    } catch (error) {
      console.error('Error guardando publicación:', error);
      alert('Error al guardar. Revisa la consola para más detalles.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setView('list');
    setEditingPublicacion(null);
    setTipoPublicacion(null);
  };

  // Filtrar publicaciones
  const publicacionesFiltradas = publicaciones.filter(pub => {
    const matchType = filterType === 'all' || pub.tipoPublicacion === filterType;
    const matchSearch = !searchQuery || 
      pub.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  // Agrupar por tipo
  const ofertas = publicacionesFiltradas.filter(p => p.tipoPublicacion === TIPOS_PUBLICACION.OFERTA_EMPLEO);
  const busquedas = publicacionesFiltradas.filter(p => p.tipoPublicacion === TIPOS_PUBLICACION.BUSQUEDA_EMPLEO);
  const servicios = publicacionesFiltradas.filter(p => p.tipoPublicacion === TIPOS_PUBLICACION.SERVICIO_PROFESIONAL);

  return (
    <div className="space-y-6">
      {view === 'list' && (
        <>
          {/* Botones crear */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleCreateNew(TIPOS_PUBLICACION.OFERTA_EMPLEO)}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Briefcase className="w-5 h-5" />
              <span className="font-medium">Nueva Oferta de Empleo</span>
            </button>

            <button
              onClick={() => handleCreateNew(TIPOS_PUBLICACION.BUSQUEDA_EMPLEO)}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <UserIcon className="w-5 h-5" />
              <span className="font-medium">Busco Empleo</span>
            </button>

            <button
              onClick={() => handleCreateNew(TIPOS_PUBLICACION.SERVICIO_PROFESIONAL)}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Wrench className="w-5 h-5" />
              <span className="font-medium">Servicio Profesional</span>
            </button>
          </div>

          {/* Filtros */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar publicaciones..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">Todas</option>
                  <option value={TIPOS_PUBLICACION.OFERTA_EMPLEO}>Ofertas</option>
                  <option value={TIPOS_PUBLICACION.BUSQUEDA_EMPLEO}>Búsquedas</option>
                  <option value={TIPOS_PUBLICACION.SERVICIO_PROFESIONAL}>Servicios</option>
                </select>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{publicaciones.length}</p>
                </div>
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Ofertas</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{ofertas.length}</p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Búsquedas</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{busquedas.length}</p>
                </div>
                <UserIcon className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Servicios</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{servicios.length}</p>
                </div>
                <Wrench className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Lista de publicaciones */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : publicacionesFiltradas.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No hay publicaciones
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Crea tu primera publicación usando los botones de arriba
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Ofertas */}
              {ofertas.length > 0 && (filterType === 'all' || filterType === TIPOS_PUBLICACION.OFERTA_EMPLEO) && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Briefcase className="w-6 h-6 mr-2 text-blue-600" />
                    Ofertas de Empleo ({ofertas.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ofertas.map(oferta => (
                      <div key={oferta.id} className="relative">
                        <OfertaEmpleoCard
                          oferta={oferta}
                          storeData={storeData}
                          variant="grid"
                          showContactInfo={false}
                          onClick={() => handleView(oferta)}
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(oferta); }}
                            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(oferta.id); }}
                            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Búsquedas */}
              {busquedas.length > 0 && (filterType === 'all' || filterType === TIPOS_PUBLICACION.BUSQUEDA_EMPLEO) && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <UserIcon className="w-6 h-6 mr-2 text-green-600" />
                    Búsquedas de Empleo ({busquedas.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {busquedas.map(busqueda => (
                      <div key={busqueda.id} className="relative">
                        <BusquedaEmpleoCard
                          busqueda={busqueda}
                          variant="grid"
                          showContactInfo={false}
                          onClick={() => handleView(busqueda)}
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(busqueda); }}
                            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(busqueda.id); }}
                            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Servicios */}
              {servicios.length > 0 && (filterType === 'all' || filterType === TIPOS_PUBLICACION.SERVICIO_PROFESIONAL) && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Wrench className="w-6 h-6 mr-2 text-purple-600" />
                    Servicios Profesionales ({servicios.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {servicios.map(servicio => (
                      <div key={servicio.id} className="relative">
                        <ServicioProfesionalCard
                          servicio={servicio}
                          storeData={storeData}
                          variant="grid"
                          showContactInfo={false}
                          onClick={() => handleView(servicio)}
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(servicio); }}
                            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(servicio.id); }}
                            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {view === 'form' && (
        <>
          {tipoPublicacion === TIPOS_PUBLICACION.OFERTA_EMPLEO && (
            <OfertaEmpleoForm
              oferta={editingPublicacion}
              onSave={handleSave}
              onCancel={handleCancel}
              isLoading={loading}
            />
          )}

          {tipoPublicacion === TIPOS_PUBLICACION.BUSQUEDA_EMPLEO && (
            <BusquedaEmpleoForm
              busqueda={editingPublicacion}
              onSave={handleSave}
              onCancel={handleCancel}
              isLoading={loading}
            />
          )}

          {tipoPublicacion === TIPOS_PUBLICACION.SERVICIO_PROFESIONAL && (
            <ServicioProfesionalForm
              servicio={editingPublicacion}
              onSave={handleSave}
              onCancel={handleCancel}
              isLoading={loading}
            />
          )}
        </>
      )}

      {/* Preview Modal */}
      {showPreview && selectedPublicacion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vista Previa</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {selectedPublicacion.tipoPublicacion === TIPOS_PUBLICACION.OFERTA_EMPLEO && (
                <OfertaEmpleoCard
                  oferta={selectedPublicacion}
                  storeData={storeData}
                  variant="grid"
                  showContactInfo={true}
                />
              )}

              {selectedPublicacion.tipoPublicacion === TIPOS_PUBLICACION.BUSQUEDA_EMPLEO && (
                <BusquedaEmpleoCard
                  busqueda={selectedPublicacion}
                  variant="grid"
                  showContactInfo={true}
                />
              )}

              {selectedPublicacion.tipoPublicacion === TIPOS_PUBLICACION.SERVICIO_PROFESIONAL && (
                <ServicioProfesionalCard
                  servicio={selectedPublicacion}
                  storeData={storeData}
                  variant="grid"
                  showContactInfo={true}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}