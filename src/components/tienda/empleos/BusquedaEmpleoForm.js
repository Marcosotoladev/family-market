// src/components/tienda/empleos/BusquedaEmpleoForm.js
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  TIPOS_EMPLEO,
  MODALIDADES_TRABAJO,
  NIVELES_EXPERIENCIA,
  CATEGORIAS_EMPLEO,
  DIAS_SEMANA,
  HORARIOS
} from '@/types/employment';
import { validarBusquedaEmpleo } from '@/lib/helpers/employmentHelpers';
import {
  X,
  Save,
  ArrowLeft,
  Plus,
  Upload,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Target,
  Clock,
  MapPin,
  DollarSign,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function BusquedaEmpleoForm({
  busqueda = null,
  storeId,
  onSave,
  onCancel,
  isLoading = false
}) {
  const { user } = useAuth();
  const [storeData, setStoreData] = useState(null);
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    edad: '',
    foto: '',
    titulo: '',
    descripcion: '',
    objetivoLaboral: '',
    categorias: [],
    experiencia: {
      nivel: '',
      años: '',
      trabajosAnteriores: [],
      descripcionExperiencia: ''
    },
    habilidades: [],
    disponibilidad: {
      tiposEmpleo: [],
      modalidades: [],
      diasDisponibles: [],
      horarios: [],
      inmediata: true,
      fechaDisponible: ''
    },
    preferencias: {
      salarioMinimo: '',
      salarioMaximo: '',
      zonas: []
    },
    ubicacion: {
      ciudad: '',
      provincia: '',
      pais: 'Argentina',
      dispuestoMudar: false
    },
    curriculum: {
      url: '',
      nombre: '',
      tamaño: 0
    },
    contacto: {
      whatsapp: '',
      telefono: '',
      email: '',
      linkedin: '',
      portfolio: ''
    }
  });

  const [errores, setErrores] = useState([]);
  const [currentHabilidad, setCurrentHabilidad] = useState('');
  const [currentTrabajo, setCurrentTrabajo] = useState('');
  const [currentZona, setCurrentZona] = useState('');
  const [uploadingCV, setUploadingCV] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Cargar datos del usuario
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.uid) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setStoreData(userData);

          setFormData(prev => ({
            ...prev,
            nombre: userData.firstName || '',
            apellido: userData.lastName || '',
            contacto: {
              whatsapp: userData.phone || '',
              telefono: userData.phone || '',
              email: userData.email || '',
              linkedin: '',
              portfolio: ''
            }
          }));
        }
      } catch (error) {
        console.error('Error cargando datos del usuario:', error);
      }
    };

    loadUserData();
  }, [user]);

  // Inicializar formulario si hay búsqueda existente
  useEffect(() => {
    if (busqueda) {
      setFormData({
        ...busqueda,
        edad: busqueda.edad?.toString() || '',
        experiencia: {
          ...busqueda.experiencia,
          años: busqueda.experiencia?.años?.toString() || ''
        },
        preferencias: {
          ...busqueda.preferencias,
          salarioMinimo: busqueda.preferencias?.salarioMinimo?.toString() || '',
          salarioMaximo: busqueda.preferencias?.salarioMaximo?.toString() || ''
        }
      });
    }
  }, [busqueda]);

  const handleInputChange = (field, value) => {
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
      const currentArray = prev[parent]?.[field] || [];
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

  const handleCategoriaToggle = (categoriaId) => {
    setFormData(prev => {
      const newCategorias = prev.categorias.includes(categoriaId)
        ? prev.categorias.filter(c => c !== categoriaId)
        : [...prev.categorias, categoriaId];

      return {
        ...prev,
        categorias: newCategorias
      };
    });
  };

  const addItem = (parent, field, value, setterFn) => {
    if (!value.trim()) return;

    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: [...(prev[parent][field] || []), value.trim()]
      }
    }));
    setterFn('');
  };

  const addItemToArray = (field, value, setterFn) => {
    if (!value.trim()) return;

    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }));
    setterFn('');
  };

  const removeItem = (parent, field, index) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: prev[parent][field].filter((_, i) => i !== index)
      }
    }));
  };

  const removeItemFromArray = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no puede superar los 2MB');
      return;
    }

    try {
      setUploadingPhoto(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_PROFILES);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Error al subir la imagen');

      const data = await response.json();
      handleInputChange('foto', data.secure_url);

      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error subiendo foto:', error);
      alert('Error al subir la foto. Intenta nuevamente.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor selecciona un archivo PDF');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('El CV no puede superar los 5MB');
      return;
    }

    try {
      setUploadingCV(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_DOCUMENTS);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Error al subir el CV');

      const data = await response.json();
      
      handleNestedChange('curriculum', 'url', data.secure_url);
      handleNestedChange('curriculum', 'nombre', file.name);
      handleNestedChange('curriculum', 'tamaño', file.size);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error subiendo CV:', error);
      alert('Error al subir el CV. Intenta nuevamente.');
    } finally {
      setUploadingCV(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const busquedaData = {
      ...formData,
      usuarioId: storeId,
      tiendaId: storeId,
      edad: formData.edad ? parseInt(formData.edad) : null,
      experiencia: {
        ...formData.experiencia,
        años: formData.experiencia.años ? parseInt(formData.experiencia.años) : 0
      },
      preferencias: {
        ...formData.preferencias,
        salarioMinimo: formData.preferencias.salarioMinimo ? parseFloat(formData.preferencias.salarioMinimo) : null,
        salarioMaximo: formData.preferencias.salarioMaximo ? parseFloat(formData.preferencias.salarioMaximo) : null
      }
    };

    const validationErrors = validarBusquedaEmpleo(busquedaData);
    if (validationErrors.length > 0) {
      setErrores(validationErrors);
      return;
    }

    setErrores([]);
    onSave(busquedaData);
  };

  const categorias = Object.values(CATEGORIAS_EMPLEO);

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>
          <div className="flex items-center space-x-2">
            <User className="w-6 h-6 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {busqueda ? 'Editar Perfil Laboral' : 'Crear Perfil Laboral'}
            </h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Errores */}
        {errores.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="text-red-800 dark:text-red-300 font-medium mb-2">
              Corrige los siguientes errores:
            </h3>
            <ul className="text-red-700 dark:text-red-400 text-sm space-y-1">
              {errores.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Información Personal */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Información Personal
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3 flex flex-col items-center">
              <div className="relative">
                {formData.foto ? (
                  <img
                    src={formData.foto}
                    alt="Foto de perfil"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-gray-200 dark:border-gray-600">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute bottom-0 right-0 p-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {uploadingPhoto ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Foto de perfil (opcional)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Apellido *
              </label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => handleInputChange('apellido', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Tu apellido"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Edad
              </label>
              <input
                type="number"
                min="16"
                max="99"
                value={formData.edad}
                onChange={(e) => handleInputChange('edad', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="18"
              />
            </div>
          </div>
        </div>

        {/* Perfil Profesional */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Perfil Profesional
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título profesional *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ej: Vendedor con experiencia en retail"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción / Presentación *
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Cuéntanos sobre ti, tu experiencia, tus fortalezas y qué tipo de trabajo estás buscando..."
                maxLength={2000}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formData.descripcion.length}/2000 caracteres
              </p>
            </div>
          </div>
        </div>

        {/* Áreas de Interés */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Áreas de Interés *
          </h2>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              <Info className="w-4 h-4 inline mr-2" />
              Selecciona las áreas en las que te gustaría trabajar (puedes elegir varias)
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categorias.map(categoria => (
              <button
                key={categoria.id}
                type="button"
                onClick={() => handleCategoriaToggle(categoria.id)}
                className={`p-3 rounded-lg text-sm font-medium transition-colors text-left ${
                  formData.categorias.includes(categoria.id)
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {categoria.nombre}
              </button>
            ))}
          </div>

          {formData.categorias.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Seleccionadas:
              </span>
              {formData.categorias.map(catId => {
                const cat = categorias.find(c => c.id === catId);
                return cat ? (
                  <span
                    key={catId}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
                  >
                    {cat.nombre}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Experiencia */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            Experiencia Laboral
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nivel de experiencia
              </label>
              <select
                value={formData.experiencia.nivel}
                onChange={(e) => handleNestedChange('experiencia', 'nivel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Selecciona un nivel</option>
                {Object.values(NIVELES_EXPERIENCIA).map(nivel => (
                  <option key={nivel.id} value={nivel.id}>{nivel.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Años de experiencia
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.experiencia.años}
                onChange={(e) => handleNestedChange('experiencia', 'años', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trabajos anteriores
            </label>
            <div className="space-y-2 mb-3">
              {formData.experiencia.trabajosAnteriores.map((trabajo, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">{trabajo}</span>
                  <button
                    type="button"
                    onClick={() => removeItem('experiencia', 'trabajosAnteriores', index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentTrabajo}
                onChange={(e) => setCurrentTrabajo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('experiencia', 'trabajosAnteriores', currentTrabajo, setCurrentTrabajo))}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ej: Vendedor en Tienda ABC (2020-2023)"
              />
              <button
                type="button"
                onClick={() => addItem('experiencia', 'trabajosAnteriores', currentTrabajo, setCurrentTrabajo)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción de tu experiencia
            </label>
            <textarea
              value={formData.experiencia.descripcionExperiencia}
              onChange={(e) => handleNestedChange('experiencia', 'descripcionExperiencia', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Describe brevemente tu experiencia laboral, logros y responsabilidades..."
            />
          </div>
        </div>

        {/* Habilidades */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <GraduationCap className="w-5 h-5 mr-2" />
            Habilidades y Conocimientos
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tus habilidades
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.habilidades.map((hab, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                >
                  {hab}
                  <button
                    type="button"
                    onClick={() => removeItemFromArray('habilidades', index)}
                    className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentHabilidad}
                onChange={(e) => setCurrentHabilidad(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItemToArray('habilidades', currentHabilidad, setCurrentHabilidad))}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ej: Atención al cliente, Excel, Inglés intermedio"
              />
              <button
                type="button"
                onClick={() => addItemToArray('habilidades', currentHabilidad, setCurrentHabilidad)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Disponibilidad */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Disponibilidad
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Tipos de empleo que buscas
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.values(TIPOS_EMPLEO).map(tipo => (
                  <button
                    key={tipo.id}
                    type="button"
                    onClick={() => handleArrayToggle('disponibilidad', 'tiposEmpleo', tipo.id)}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
                      formData.disponibilidad.tiposEmpleo.includes(tipo.id)
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tipo.nombre}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Modalidades preferidas
              </label>
              <div className="grid grid-cols-3 gap-3">
                {Object.values(MODALIDADES_TRABAJO).map(mod => (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => handleArrayToggle('disponibilidad', 'modalidades', mod.id)}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                      formData.disponibilidad.modalidades.includes(mod.id)
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {mod.icono} {mod.nombre}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Días disponibles
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.values(DIAS_SEMANA).map(dia => (
                  <button
                    key={dia.id}
                    type="button"
                    onClick={() => handleArrayToggle('disponibilidad', 'diasDisponibles', dia.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      formData.disponibilidad.diasDisponibles.includes(dia.id)
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {dia.abrev}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Horarios disponibles
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.values(HORARIOS).map(horario => (
                  <button
                    key={horario.id}
                    type="button"
                    onClick={() => handleArrayToggle('disponibilidad', 'horarios', horario.id)}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
                      formData.disponibilidad.horarios.includes(horario.id)
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div>{horario.nombre}</div>
                    <div className="text-xs opacity-75">{horario.rango}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="disponibilidadInmediata"
                checked={formData.disponibilidad.inmediata}
                onChange={(e) => handleNestedChange('disponibilidad', 'inmediata', e.target.checked)}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="disponibilidadInmediata" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Disponibilidad inmediata
              </label>
            </div>
          </div>
        </div>

        {/* Preferencias */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Preferencias Salariales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Salario mínimo esperado
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={formData.preferencias.salarioMinimo}
                  onChange={(e) => handleNestedChange('preferencias', 'salarioMinimo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="50000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Salario máximo esperado
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={formData.preferencias.salarioMaximo}
                  onChange={(e) => handleNestedChange('preferencias', 'salarioMaximo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="100000"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Zonas preferidas para trabajar
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.preferencias.zonas.map((zona, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                >
                  {zona}
                  <button
                    type="button"
                    onClick={() => removeItem('preferencias', 'zonas', index)}
                    className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentZona}
                onChange={(e) => setCurrentZona(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('preferencias', 'zonas', currentZona, setCurrentZona))}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ej: Centro, Nueva Córdoba, Cerro"
              />
              <button
                type="button"
                onClick={() => addItem('preferencias', 'zonas', currentZona, setCurrentZona)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Ubicación
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ciudad
              </label>
              <input
                type="text"
                value={formData.ubicacion.ciudad}
                onChange={(e) => handleNestedChange('ubicacion', 'ciudad', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ej: Córdoba"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ej: Córdoba"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="dispuestoMudar"
              checked={formData.ubicacion.dispuestoMudar}
              onChange={(e) => handleNestedChange('ubicacion', 'dispuestoMudar', e.target.checked)}
              className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="dispuestoMudar" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Dispuesto/a a mudarme por trabajo
            </label>
          </div>
        </div>

        {/* Curriculum */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Curriculum Vitae
          </h2>

          <div>
            {formData.curriculum.url ? (
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{formData.curriculum.nombre}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(formData.curriculum.tamaño / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleNestedChange('curriculum', 'url', '');
                    handleNestedChange('curriculum', 'nombre', '');
                    handleNestedChange('curriculum', 'tamaño', 0);
                  }}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleCVUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingCV}
                  className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-orange-500 dark:hover:border-orange-500 transition-colors flex flex-col items-center justify-center disabled:opacity-50"
                >
                  {uploadingCV ? (
                    <>
                      <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Subiendo CV...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mb-3" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Subir Curriculum (PDF)
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Máximo 5MB
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Información de Contacto
          </h2>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              <Info className="w-4 h-4 inline mr-2" />
              Esta información se carga automáticamente desde tu perfil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                WhatsApp *
              </label>
              <input
                type="tel"
                value={formData.contacto.whatsapp}
                onChange={(e) => handleNestedChange('contacto', 'whatsapp', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="549351xxxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.contacto.telefono}
                onChange={(e) => handleNestedChange('contacto', 'telefono', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="351xxxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.contacto.email}
                onChange={(e) => handleNestedChange('contacto', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                value={formData.contacto.linkedin}
                onChange={(e) => handleNestedChange('contacto', 'linkedin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://linkedin.com/in/tu-perfil"
              />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{busqueda ? 'Actualizar' : 'Publicar'} Perfil</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}