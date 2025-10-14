// src/components/admin/EditBusquedaModal.js
'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { X, Save, Loader2 } from 'lucide-react';
import {
  TIPOS_EMPLEO,
  MODALIDADES_TRABAJO,
  NIVELES_EXPERIENCIA,
  TIPOS_SALARIO,
  CATEGORIAS_EMPLEO
} from '@/types/employment';

export default function EditBusquedaModal({ busqueda, isOpen, onClose, onBusquedaUpdated }) {
  const [formData, setFormData] = useState({
    nombre: '',
    titulo: '',
    descripcion: '',
    categoria: '',
    subcategoria: '',
    nivelExperiencia: '',
    disponibilidad: {
      inmediata: true,
      fechaInicio: '',
      tipoEmpleo: [],
      modalidades: [],
      horarioFlexible: false
    },
    pretensionSalarial: {
      tipo: TIPOS_SALARIO.MENSUAL,
      minimo: '',
      maximo: '',
      moneda: 'ARS'
    },
    ubicacion: {
      ciudad: '',
      provincia: '',
      pais: 'Argentina'
    },
    contacto: {
      whatsapp: '',
      telefono: '',
      email: '',
      preferencia: 'whatsapp'
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (busqueda) {
      setFormData({
        nombre: busqueda.nombre || '',
        titulo: busqueda.titulo || '',
        descripcion: busqueda.descripcion || '',
        categoria: busqueda.categoria || '',
        subcategoria: busqueda.subcategoria || '',
        nivelExperiencia: busqueda.nivelExperiencia || '',
        disponibilidad: {
          inmediata: busqueda.disponibilidad?.inmediata ?? true,
          fechaInicio: busqueda.disponibilidad?.fechaInicio || '',
          tipoEmpleo: busqueda.disponibilidad?.tipoEmpleo || [],
          modalidades: busqueda.disponibilidad?.modalidades || [],
          horarioFlexible: busqueda.disponibilidad?.horarioFlexible || false
        },
        pretensionSalarial: {
          tipo: busqueda.pretensionSalarial?.tipo || TIPOS_SALARIO.MENSUAL,
          minimo: busqueda.pretensionSalarial?.minimo?.toString() || '',
          maximo: busqueda.pretensionSalarial?.maximo?.toString() || '',
          moneda: busqueda.pretensionSalarial?.moneda || 'ARS'
        },
        ubicacion: {
          ciudad: busqueda.ubicacion?.ciudad || '',
          provincia: busqueda.ubicacion?.provincia || '',
          pais: busqueda.ubicacion?.pais || 'Argentina'
        },
        contacto: {
          whatsapp: busqueda.contacto?.whatsapp || '',
          telefono: busqueda.contacto?.telefono || '',
          email: busqueda.contacto?.email || '',
          preferencia: busqueda.contacto?.preferencia || 'whatsapp'
        }
      });
    }
  }, [busqueda]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!busqueda) return;

    try {
      setLoading(true);
      
      const busquedaRef = doc(db, 'busquedasEmpleo', busqueda.id);
      const updateData = {
        ...formData,
        pretensionSalarial: {
          ...formData.pretensionSalarial,
          minimo: formData.pretensionSalarial.minimo ? parseFloat(formData.pretensionSalarial.minimo) : null,
          maximo: formData.pretensionSalarial.maximo ? parseFloat(formData.pretensionSalarial.maximo) : null
        },
        fechaActualizacion: new Date()
      };

      await updateDoc(busquedaRef, updateData);
      
      onBusquedaUpdated({ ...busqueda, ...updateData });
      onClose();
      alert('Búsqueda actualizada correctamente');
    } catch (error) {
      console.error('Error actualizando búsqueda:', error);
      alert('Error al actualizar la búsqueda');
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

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleArrayToggle = (parent, field, value) => {
    setFormData(prev => {
      const currentArray = prev[parent][field] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];

      return {
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: newArray
        }
      };
    });
  };

  if (!isOpen || !busqueda) return null;

  const categorias = Object.values(CATEGORIAS_EMPLEO);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Editar Búsqueda de Empleo
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título / Puesto que busca
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => handleChange('titulo', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => handleChange('categoria', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nivel de experiencia
                </label>
                <select
                  value={formData.nivelExperiencia}
                  onChange={(e) => handleChange('nivelExperiencia', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Seleccionar nivel</option>
                  {Object.values(NIVELES_EXPERIENCIA).map(nivel => (
                    <option key={nivel.id} value={nivel.id}>{nivel.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Tipo de empleo que busca
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(TIPOS_EMPLEO).map(tipo => (
                  <button
                    key={tipo.id}
                    type="button"
                    onClick={() => handleArrayToggle('disponibilidad', 'tipoEmpleo', tipo.id)}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                      formData.disponibilidad.tipoEmpleo.includes(tipo.id)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {tipo.nombre}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Modalidad de trabajo
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(MODALIDADES_TRABAJO).map(mod => (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => handleArrayToggle('disponibilidad', 'modalidades', mod.id)}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                      formData.disponibilidad.modalidades.includes(mod.id)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {mod.nombre}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de salario
                </label>
                <select
                  value={formData.pretensionSalarial.tipo}
                  onChange={(e) => handleNestedChange('pretensionSalarial', 'tipo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value={TIPOS_SALARIO.MENSUAL}>Mensual</option>
                  <option value={TIPOS_SALARIO.SEMANAL}>Semanal</option>
                  <option value={TIPOS_SALARIO.POR_HORA}>Por hora</option>
                  <option value={TIPOS_SALARIO.POR_DIA}>Por día</option>
                  <option value={TIPOS_SALARIO.A_CONVENIR}>A convenir</option>
                </select>
              </div>

              {formData.pretensionSalarial.tipo !== TIPOS_SALARIO.A_CONVENIR && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Salario mínimo
                    </label>
                    <input
                      type="number"
                      value={formData.pretensionSalarial.minimo}
                      onChange={(e) => handleNestedChange('pretensionSalarial', 'minimo', e.target.value)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={formData.ubicacion.ciudad}
                  onChange={(e) => handleNestedChange('ubicacion', 'ciudad', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Provincia
                </label>
                <input
                  type="text"
                  value={formData.ubicacion.provincia}
                  onChange={(e) => handleNestedChange('ubicacion', 'provincia', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={formData.contacto.whatsapp}
                  onChange={(e) => handleNestedChange('contacto', 'whatsapp', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.contacto.email}
                  onChange={(e) => handleNestedChange('contacto', 'email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
 