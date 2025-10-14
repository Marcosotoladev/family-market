// src/components/admin/EditOfertaModal.js
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

export default function EditOfertaModal({ oferta, isOpen, onClose, onOfertaUpdated }) {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    subcategoria: '',
    tipoEmpleo: '',
    modalidad: '',
    experienciaRequerida: '',
    salario: {
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
    if (oferta) {
      setFormData({
        titulo: oferta.titulo || '',
        descripcion: oferta.descripcion || '',
        categoria: oferta.categoria || '',
        subcategoria: oferta.subcategoria || '',
        tipoEmpleo: oferta.tipoEmpleo || '',
        modalidad: oferta.modalidad || '',
        experienciaRequerida: oferta.experienciaRequerida || '',
        salario: {
          tipo: oferta.salario?.tipo || TIPOS_SALARIO.MENSUAL,
          minimo: oferta.salario?.minimo?.toString() || '',
          maximo: oferta.salario?.maximo?.toString() || '',
          moneda: oferta.salario?.moneda || 'ARS'
        },
        ubicacion: {
          ciudad: oferta.ubicacion?.ciudad || '',
          provincia: oferta.ubicacion?.provincia || '',
          pais: oferta.ubicacion?.pais || 'Argentina'
        },
        contacto: {
          whatsapp: oferta.contacto?.whatsapp || '',
          telefono: oferta.contacto?.telefono || '',
          email: oferta.contacto?.email || '',
          preferencia: oferta.contacto?.preferencia || 'whatsapp'
        }
      });
    }
  }, [oferta]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!oferta) return;

    try {
      setLoading(true);
      
      // Todos los documentos están en la colección 'empleos'
      const ofertaRef = doc(db, 'empleos', oferta.id);
      const updateData = {
        ...formData,
        salario: {
          ...formData.salario,
          minimo: formData.salario.minimo ? parseFloat(formData.salario.minimo) : null,
          maximo: formData.salario.maximo ? parseFloat(formData.salario.maximo) : null
        },
        fechaActualizacion: new Date()
      };

      await updateDoc(ofertaRef, updateData);
      
      onOfertaUpdated({ ...oferta, ...updateData });
      onClose();
      alert('Oferta actualizada correctamente');
    } catch (error) {
      console.error('Error actualizando oferta:', error);
      alert('Error al actualizar la oferta');
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

  if (!isOpen || !oferta) return null;

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
              Editar Oferta de Empleo
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
                Título del puesto
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => handleChange('titulo', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de empleo
                </label>
                <select
                  value={formData.tipoEmpleo}
                  onChange={(e) => handleChange('tipoEmpleo', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Seleccionar tipo</option>
                  {Object.values(TIPOS_EMPLEO).map(tipo => (
                    <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modalidad
                </label>
                <select
                  value={formData.modalidad}
                  onChange={(e) => handleChange('modalidad', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Seleccionar modalidad</option>
                  {Object.values(MODALIDADES_TRABAJO).map(mod => (
                    <option key={mod.id} value={mod.id}>{mod.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Experiencia requerida
                </label>
                <select
                  value={formData.experienciaRequerida}
                  onChange={(e) => handleChange('experienciaRequerida', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Sin requisito específico</option>
                  {Object.values(NIVELES_EXPERIENCIA).map(nivel => (
                    <option key={nivel.id} value={nivel.id}>{nivel.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de salario
                </label>
                <select
                  value={formData.salario.tipo}
                  onChange={(e) => handleNestedChange('salario', 'tipo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value={TIPOS_SALARIO.MENSUAL}>Mensual</option>
                  <option value={TIPOS_SALARIO.SEMANAL}>Semanal</option>
                  <option value={TIPOS_SALARIO.POR_HORA}>Por hora</option>
                  <option value={TIPOS_SALARIO.POR_DIA}>Por día</option>
                  <option value={TIPOS_SALARIO.A_CONVENIR}>A convenir</option>
                </select>
              </div>

              {formData.salario.tipo !== TIPOS_SALARIO.A_CONVENIR && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Salario mínimo
                    </label>
                    <input
                      type="number"
                      value={formData.salario.minimo}
                      onChange={(e) => handleNestedChange('salario', 'minimo', e.target.value)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Salario máximo
                    </label>
                    <input
                      type="number"
                      value={formData.salario.maximo}
                      onChange={(e) => handleNestedChange('salario', 'maximo', e.target.value)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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