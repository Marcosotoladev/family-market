// src/components/tienda/nosotros/AboutSection.js
'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Save, 
  Plus, 
  X, 
  Heart,
  Target,
  Eye,
  Award,
  Calendar,
  Loader2,
  Trash2,
  ExternalLink,
  CheckCircle
} from 'lucide-react';

export default function AboutSection() {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    description: '',
    mission: '',
    vision: '',
    values: [],
    foundedYear: null
  });

  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    if (user?.uid) {
      loadAboutData();
    }
  }, [user]);

  const loadAboutData = async () => {
    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.about) {
          setFormData({
            description: userData.about.description || '',
            mission: userData.about.mission || '',
            vision: userData.about.vision || '',
            values: userData.about.values || [],
            foundedYear: userData.about.foundedYear || null
          });
        }
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddValue = () => {
    if (newValue.trim() && formData.values.length < 10) {
      setFormData(prev => ({
        ...prev,
        values: [...prev.values, newValue.trim()]
      }));
      setNewValue('');
    }
  };

  const handleRemoveValue = (index) => {
    setFormData(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.uid) {
      alert('Error: Usuario no autenticado');
      return;
    }

    try {
      setSaving(true);
      
      const userRef = doc(db, 'users', user.uid);
      const dataToSave = {
        about: {
          description: formData.description.trim(),
          mission: formData.mission.trim(),
          vision: formData.vision.trim(),
          values: formData.values,
          foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : null
        }
      };
      
      await updateDoc(userRef, dataToSave);

      setSuccessMessage('¡Información actualizada correctamente!');
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (error) {
      console.error('Error al guardar:', error);
      alert(`Error al guardar la información: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleClearAll = () => {
    if (confirm('¿Estás seguro de que quieres borrar toda la información? Esta acción no se puede deshacer.')) {
      setShowDeleteConfirm(true);
    }
  };

  const confirmClearAll = async () => {
    try {
      setSaving(true);
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        about: {
          description: '',
          mission: '',
          vision: '',
          values: [],
          foundedYear: null
        }
      });

      setFormData({
        description: '',
        mission: '',
        vision: '',
        values: [],
        foundedYear: null
      });

      setShowDeleteConfirm(false);
      setSuccessMessage('¡Información eliminada correctamente!');
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar la información');
    } finally {
      setSaving(false);
    }
  };

  const getStoreUrl = () => {
    const slug = userData?.storeSlug || 'mi-tienda';
    return `/tienda/${slug}/nosotros`;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando información...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast de éxito simplificado */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <p className="font-semibold">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage('')}
              className="ml-auto hover:bg-green-600 rounded p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Botón de acción superior - solo borrar */}
      <div className="flex justify-end">
        <button
          onClick={handleClearAll}
          className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Borrar todo
        </button>
      </div>

      {/* Modal de confirmación para borrar */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-xl font-bold">Confirmar eliminación</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              ¿Estás seguro de que quieres eliminar toda la información de la sección "Nosotros"? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmClearAll}
                disabled={saving}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar todo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulario principal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Nuestra Historia / Descripción */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2">
              <Heart className="w-5 h-5 text-orange-600" />
              Nuestra Historia
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Cuenta la historia de tu negocio, cómo comenzó, qué te motivó a crearlo.
            </p>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Ej: Somos una empresa familiar que comenzó en 2010 con el sueño de..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.description.length} caracteres
            </p>
          </div>

          {/* Año de fundación */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              Año de Fundación
            </label>
            <input
              type="number"
              value={formData.foundedYear || ''}
              onChange={(e) => handleChange('foundedYear', e.target.value)}
              placeholder="Ej: 2010"
              min="1900"
              max={new Date().getFullYear()}
              className="w-full md:w-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Misión y Visión */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Misión */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2">
                <Target className="w-5 h-5 text-orange-600" />
                Nuestra Misión
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                ¿Cuál es el propósito de tu negocio?
              </p>
              <textarea
                value={formData.mission}
                onChange={(e) => handleChange('mission', e.target.value)}
                placeholder="Ej: Ofrecer productos de calidad que mejoren la vida de nuestros clientes..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Visión */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2">
                <Eye className="w-5 h-5 text-orange-600" />
                Nuestra Visión
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                ¿Hacia dónde quieres llevar tu negocio?
              </p>
              <textarea
                value={formData.vision}
                onChange={(e) => handleChange('vision', e.target.value)}
                placeholder="Ej: Ser la empresa líder en nuestro sector a nivel nacional..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Valores */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2">
              <Award className="w-5 h-5 text-orange-600" />
              Nuestros Valores
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Agrega los valores que guían tu negocio (máximo 10)
            </p>

            {/* Lista de valores */}
            {formData.values.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {formData.values.map((value, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-3 px-4 py-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg group"
                  >
                    <span className="text-gray-900 dark:text-white font-medium">
                      {value}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(index)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Agregar nuevo valor */}
            {formData.values.length < 10 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddValue();
                    }
                  }}
                  placeholder="Ej: Honestidad"
                  maxLength={50}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddValue}
                  disabled={!newValue.trim()}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                  Agregar
                </button>
              </div>
            )}

            {formData.values.length >= 10 && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                Has alcanzado el máximo de 10 valores
              </p>
            )}
          </div>

          {/* Botón de guardar */}
          <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}