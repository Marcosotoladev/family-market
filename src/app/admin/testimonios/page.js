// src/app/admin/testimonios/page.js
'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Star, 
  Trash2, 
  Edit2, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  Loader2,
  MessageCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  getTestimonials,
  deleteTestimonial,
  toggleFeaturedTestimonial,
  toggleApproveTestimonial,
  getTestimonialStats
} from '@/lib/services/testimonialsService';
import TestimonialModal from '@/components/testimonials/TestimonialModal';
import { useToast } from '@/hooks/useToast';

export default function AdminTestimonialsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [testimonials, setTestimonials] = useState([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, approved, pending, featured
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  // Verificar acceso de admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Cargar testimonios
  useEffect(() => {
    loadTestimonials();
    loadStats();
  }, []);

  const loadTestimonials = async () => {
    setLoading(true);
    try {
      // Cargar todos los testimonios (sin filtro de aprobados)
      const data = await getTestimonials({});
      setTestimonials(data);
      setFilteredTestimonials(data);
    } catch (error) {
      console.error('Error cargando testimonios:', error);
      showToast('Error al cargar los testimonios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getTestimonialStats();
      setStats(data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  // Filtrar testimonios
  useEffect(() => {
    let filtered = [...testimonials];
    
    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.testimonial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por estado
    switch (filterStatus) {
      case 'approved':
        filtered = filtered.filter(t => t.approved);
        break;
      case 'pending':
        filtered = filtered.filter(t => !t.approved);
        break;
      case 'featured':
        filtered = filtered.filter(t => t.featured);
        break;
    }
    
    setFilteredTestimonials(filtered);
  }, [searchTerm, filterStatus, testimonials]);

  const handleDelete = async (testimonialId) => {
    if (!window.confirm('¿Estás seguro de eliminar este testimonio permanentemente?')) {
      return;
    }
    
    setProcessingId(testimonialId);
    
    try {
      const result = await deleteTestimonial(testimonialId);
      
      if (result.success) {
        showToast('Testimonio eliminado exitosamente', 'success');
        loadTestimonials();
        loadStats();
      } else {
        showToast(result.error || 'Error al eliminar el testimonio', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al eliminar el testimonio', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleFeatured = async (testimonialId, currentFeatured) => {
    setProcessingId(testimonialId);
    
    try {
      const result = await toggleFeaturedTestimonial(testimonialId, !currentFeatured);
      
      if (result.success) {
        showToast(
          !currentFeatured ? 'Testimonio destacado' : 'Testimonio ya no está destacado',
          'success'
        );
        loadTestimonials();
      } else {
        showToast(result.error || 'Error al cambiar el estado', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al cambiar el estado', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleApproved = async (testimonialId, currentApproved) => {
    setProcessingId(testimonialId);
    
    try {
      const result = await toggleApproveTestimonial(testimonialId, !currentApproved);
      
      if (result.success) {
        showToast(
          !currentApproved ? 'Testimonio aprobado' : 'Testimonio ocultado',
          'success'
        );
        loadTestimonials();
      } else {
        showToast(result.error || 'Error al cambiar el estado', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al cambiar el estado', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Gestión de Testimonios
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administra los testimonios y valoraciones de la comunidad
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {testimonials.length}
              </p>
            </div>
            <MessageCircle className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Aprobados</p>
              <p className="text-2xl font-bold text-green-600">
                {testimonials.filter(t => t.approved).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Destacados</p>
              <p className="text-2xl font-bold text-yellow-600">
                {testimonials.filter(t => t.featured).length}
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rating Promedio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.averageRating}
              </p>
              <div className="flex gap-0.5 mt-1">
                {renderStars(Math.round(parseFloat(stats.averageRating)))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, email, rol o contenido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          
          {/* Filtro de estado */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Aprobados
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFilterStatus('featured')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'featured'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Destacados
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de testimonios */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando testimonios...</p>
          </div>
        ) : filteredTestimonials.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Testimonio
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTestimonials.map((testimonial) => (
                  <tr key={testimonial.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={testimonial.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.userName || 'Usuario')}&background=6366f1&color=ffffff`}
                          alt={testimonial.userName}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {testimonial.userName || 'Usuario Anónimo'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {testimonial.role}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {testimonial.userEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                        {testimonial.testimonial}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {renderStars(testimonial.rating)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        {testimonial.approved ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                            Aprobado
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full">
                            Pendiente
                          </span>
                        )}
                        {testimonial.featured && (
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full">
                            Destacado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(testimonial.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleToggleApproved(testimonial.id, testimonial.approved)}
                          disabled={processingId === testimonial.id}
                          className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
                          title={testimonial.approved ? 'Ocultar' : 'Aprobar'}
                        >
                          {testimonial.approved ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(testimonial.id, testimonial.featured)}
                          disabled={processingId === testimonial.id}
                          className="p-1.5 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors disabled:opacity-50"
                          title={testimonial.featured ? 'Quitar destacado' : 'Destacar'}
                        >
                          <Star className={`w-4 h-4 ${testimonial.featured ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingTestimonial(testimonial);
                            setModalOpen(true);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(testimonial.id)}
                          disabled={processingId === testimonial.id}
                          className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                          title="Eliminar"
                        >
                          {processingId === testimonial.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No se encontraron testimonios
            </p>
          </div>
        )}
      </div>

      {/* Modal para editar testimonio */}
      <TestimonialModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTestimonial(null);
        }}
        onSuccess={() => {
          loadTestimonials();
          loadStats();
        }}
        editingTestimonial={editingTestimonial}
      />
    </div>
  );
}