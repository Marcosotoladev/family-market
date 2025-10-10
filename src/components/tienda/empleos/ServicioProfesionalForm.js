// src/components/tienda/empleos/ServicioProfesionalForm.js
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MODALIDADES_TRABAJO,
  TIPOS_SALARIO,
  CATEGORIAS_EMPLEO,
  DIAS_SEMANA,
  HORARIOS
} from '@/types/employment';
import { validarServicioProfesional } from '@/lib/helpers/employmentHelpers';
import {
  X,
  Save,
  ArrowLeft,
  Plus,
  Upload,
  Trash2,
  Award,
  Wrench,
  DollarSign,
  MapPin,
  Clock,
  Image as ImageIcon,
  User,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function ServicioProfesionalForm({
  servicio = null,
  storeId,
  onSave,
  onCancel,
  isLoading = false
}) {
  const { user } = useAuth();
  const [storeData, setStoreData] = useState(null);
  const photoInputRef = useRef(null);
  const portfolioInputRef = useRef(null);

  const [formData, setFormData] = useState({
    titulo: '',
    nombreProfesional: '',
    foto: '',
    descripcion: '',
    categoria: '',
    subcategoria: '',
    especialidades: [],
    experiencia: {
      años: '',
      nivel: '',
      descripcion: ''
    },
    servicios: [],
    certificaciones: [],
    tarifas: {
      tipo: TIPOS_SALARIO.POR_SERVICIO,
      minimo: '',
      maximo: '',
      moneda: 'ARS',
      detalles: ''
    },
    disponibilidad: {
      modalidades: [],
      diasDisponibles: [],
      horarios: [],
      zonasCobertura: []
    },
    ubicacion: {
      direccion: '',
      ciudad: '',
      provincia: '',
      pais: 'Argentina',
      atendeADomicilio: false,
      zonaCobertura: []
    },
    portfolio: {
      imagenes: [],
      descripcionTrabajos: ''
    },
    contacto: {
      whatsapp: '',
      telefono: '',
      email: '',
      sitioWeb: '',
      redesSociales: {
        facebook: '',
        instagram: '',
        linkedin: ''
      }
    }
  });

  const [errores, setErrores] = useState([]);
  const [currentEspecialidad, setCurrentEspecialidad] = useState('');
  const [currentServicio, setCurrentServicio] = useState('');
  const [currentCertificacion, setCurrentCertificacion] = useState('');
  const [currentZona, setCurrentZona] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);

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
            nombreProfesional: userData.businessName || `${userData.firstName} ${userData.lastName}`.trim(),
            contacto: {
              ...prev.contacto,
              whatsapp: userData.phone || '',
              telefono: userData.phone || '',
              email: userData.email || ''
            }
          }));
        }
      } catch (error) {
        console.error('Error cargando datos del usuario:', error);
      }
    };

    loadUserData();
  }, [user]);

  // Inicializar formulario si hay servicio existente
  useEffect(() => {
    if (servicio) {
      setFormData({
        ...servicio,
        experiencia: {
          ...servicio.experiencia,
          años: servicio.experiencia?.años?.toString() || ''
        },
        tarifas: {
          ...servicio.tarifas,
          minimo: servicio.tarifas?.minimo?.toString() || '',
          maximo: servicio.tarifas?.maximo?.toString() || ''
        }
      });
    }
  }, [servicio]);

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

  const handleDeepNestedChange = (parent, child, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: {
          ...prev[parent][child],
          [field]: value
        }
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

  const addItem = (field, value, setterFn) => {
    if (!value.trim()) return;

    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }));
    setterFn('');
  };

  const addItemNested = (parent, field, value, setterFn) => {
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

  const removeItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const removeItemNested = (parent, field, index) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: prev[parent][field].filter((_, i) => i !== index)
      }
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

  const handlePortfolioUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar los 5MB');
      return;
    }

    if (formData.portfolio.imagenes.length >= 10) {
      alert('Máximo 10 imágenes en el portfolio');
      return;
    }

    try {
      setUploadingPortfolio(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_PRODUCTS);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Error al subir la imagen');

      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        portfolio: {
          ...prev.portfolio,
          imagenes: [...prev.portfolio.imagenes, data.secure_url]
        }
      }));

      if (portfolioInputRef.current) {
        portfolioInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error subiendo imagen del portfolio:', error);
      alert('Error al subir la imagen. Intenta nuevamente.');
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const removePortfolioImage = (index) => {
    setFormData(prev => ({
      ...prev,
      portfolio: {
        ...prev.portfolio,
        imagenes: prev.portfolio.imagenes.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const servicioData = {
      ...formData,
      usuarioId: storeId,
      tiendaId: storeId,
      experiencia: {
        ...formData.experiencia,
        años: formData.experiencia.años ? parseInt(formData.experiencia.años) : 0
      },
      tarifas: {
        ...formData.tarifas,
        minimo: formData.tarifas.minimo ? parseFloat(formData.tarifas.minimo) : null,
        maximo: formData.tarifas.maximo ? parseFloat(formData.tarifas.maximo) : null
      }
    };

    const validationErrors = validarServicioProfesional(servicioData);
    if (validationErrors.length > 0) {
      setErrores(validationErrors);
      return;
    }

    setErrores([]);
    onSave(servicioData);
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
            <Wrench className="w-6 h-6 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {servicio ? 'Editar Servicio Profesional' : 'Nuevo Servicio Profesional'}
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

        {/* Información del Profesional */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Información del Profesional
          </h2>

          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {formData.foto ? (
                <img
                  src={formData.foto}
                  alt="Foto profesional"
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
              Foto profesional (recomendada)
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre profesional / Nombre del servicio *
              </label>
              <input
                type="text"
                value={formData.nombreProfesional}
                onChange={(e) => handleInputChange('nombreProfesional', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ej: Juan Pérez - Electricista Profesional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título del servicio *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ej: Instalaciones eléctricas y reparaciones"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción de tu servicio *
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Describe tu servicio, tu experiencia, qué ofreces y qué te diferencia..."
                maxLength={2000}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formData.descripcion.length}/2000 caracteres
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría *
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => {
                    handleInputChange('categoria', e.target.value);
                    handleInputChange('subcategoria', '');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              {formData.categoria && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subcategoría
                  </label>
                  <select
                    value={formData.subcategoria}
                    onChange={(e) => handleInputChange('subcategoria', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Selecciona una subcategoría</option>
                    {Object.entries(
                      categorias.find(c => c.id === formData.categoria)?.subcategorias || {}
                    ).map(([key, value]) => (
                      <option key={key} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nivel profesional
                </label>
                <select
                  value={formData.experiencia.nivel}
                  onChange={(e) => handleNestedChange('experiencia', 'nivel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">No especificado</option>
                  <option value="principiante">Principiante</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                  <option value="experto">Experto</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Especialidades y Servicios */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Especialidades y Servicios
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Especialidades
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.especialidades.map((esp, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  >
                    {esp}
                    <button
                      type="button"
                      onClick={() => removeItem('especialidades', index)}
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
                  value={currentEspecialidad}
                  onChange={(e) => setCurrentEspecialidad(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('especialidades', currentEspecialidad, setCurrentEspecialidad))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ej: Instalaciones industriales"
                />
                <button
                  type="button"
                  onClick={() => addItem('especialidades', currentEspecialidad, setCurrentEspecialidad)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Servicios que ofreces
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.servicios.map((serv, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                  >
                    {serv}
                    <button
                      type="button"
                      onClick={() => removeItem('servicios', index)}
                      className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentServicio}
                  onChange={(e) => setCurrentServicio(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('servicios', currentServicio, setCurrentServicio))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ej: Cambio de cableado"
                />
                <button
                  type="button"
                  onClick={() => addItem('servicios', currentServicio, setCurrentServicio)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Certificaciones */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Certificaciones y Títulos
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Certificaciones o títulos profesionales
            </label>
            <div className="space-y-2 mb-3">
              {formData.certificaciones.map((cert, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">{cert}</span>
                  <button
                    type="button"
                    onClick={() => removeItem('certificaciones', index)}
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
                value={currentCertificacion}
                onChange={(e) => setCurrentCertificacion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('certificaciones', currentCertificacion, setCurrentCertificacion))}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ej: Electricista Matriculado Categoría A"
              />
              <button
                type="button"
                onClick={() => addItem('certificaciones', currentCertificacion, setCurrentCertificacion)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tarifas */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Tarifas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de tarifa *
              </label>
              <select
                value={formData.tarifas.tipo}
                onChange={(e) => handleNestedChange('tarifas', 'tipo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={TIPOS_SALARIO.POR_SERVICIO}>Por servicio</option>
                <option value={TIPOS_SALARIO.POR_HORA}>Por hora</option>
                <option value={TIPOS_SALARIO.POR_DIA}>Por día</option>
                <option value={TIPOS_SALARIO.POR_PROYECTO}>Por proyecto</option>
                <option value={TIPOS_SALARIO.FIJO}>Fijo</option>
                <option value={TIPOS_SALARIO.NEGOCIABLE}>Negociable</option>
                <option value={TIPOS_SALARIO.A_CONVENIR}>A convenir</option>
              </select>
            </div>

            {formData.tarifas.tipo !== TIPOS_SALARIO.A_CONVENIR && 
             formData.tarifas.tipo !== TIPOS_SALARIO.NEGOCIABLE && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tarifa mínima
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      step="100"
                      min="0"
                      value={formData.tarifas.minimo}
                      onChange={(e) => handleNestedChange('tarifas', 'minimo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="5000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tarifa máxima
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      step="100"
                      min="0"
                      value={formData.tarifas.maximo}
                      onChange={(e) => handleNestedChange('tarifas', 'maximo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="15000"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Detalles de las tarifas
            </label>
            <textarea
              value={formData.tarifas.detalles}
              onChange={(e) => handleNestedChange('tarifas', 'detalles', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ej: Las tarifas varían según complejidad. Presupuesto sin cargo."
            />
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
                Modalidades de atención
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
          </div>
        </div>

        {/* Ubicación y Zona de Cobertura */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Ubicación y Zona de Cobertura
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dirección (si tienes local)
              </label>
              <input
                type="text"
                value={formData.ubicacion.direccion}
                onChange={(e) => handleNestedChange('ubicacion', 'direccion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Calle y número (opcional)"
              />
            </div>

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
              id="atendeADomicilio"
              checked={formData.ubicacion.atendeADomicilio}
              onChange={(e) => handleNestedChange('ubicacion', 'atendeADomicilio', e.target.checked)}
              className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="atendeADomicilio" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Atiendo a domicilio
            </label>
          </div>

          {formData.ubicacion.atendeADomicilio && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Zonas de cobertura
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.ubicacion.zonaCobertura.map((zona, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200"
                  >
                    {zona}
                    <button
                      type="button"
                      onClick={() => removeItemNested('ubicacion', 'zonaCobertura', index)}
                      className="ml-2 text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-200"
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
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItemNested('ubicacion', 'zonaCobertura', currentZona, setCurrentZona))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ej: Centro, Nueva Córdoba, Cerro"
                />
                <button
                  type="button"
                  onClick={() => addItemNested('ubicacion', 'zonaCobertura', currentZona, setCurrentZona)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Portfolio */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2" />
            Portfolio de Trabajos
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Imágenes de trabajos realizados (máximo 10)
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {formData.portfolio.imagenes.map((imagen, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imagen}
                    alt={`Trabajo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => removePortfolioImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {formData.portfolio.imagenes.length < 10 && (
                <div className="relative">
                  <input
                    ref={portfolioInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePortfolioUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => portfolioInputRef.current?.click()}
                    disabled={uploadingPortfolio}
                    className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center hover:border-orange-500 transition-colors disabled:opacity-50"
                  >
                    {uploadingPortfolio ? (
                      <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Agregar
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Muestra fotos de tus mejores trabajos para generar confianza
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción de trabajos destacados
            </label>
            <textarea
              value={formData.portfolio.descripcionTrabajos}
              onChange={(e) => handleNestedChange('portfolio', 'descripcionTrabajos', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Describe algunos de tus trabajos más destacados o proyectos importantes..."
            />
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
                Email
              </label>
              <input
                type="email"
                value={formData.contacto.email}
                onChange={(e) => handleNestedChange('contacto', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="contacto@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sitio Web
              </label>
              <input
                type="url"
                value={formData.contacto.sitioWeb}
                onChange={(e) => handleNestedChange('contacto', 'sitioWeb', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://tu-sitio.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instagram
              </label>
              <input
                type="text"
                value={formData.contacto.redesSociales.instagram}
                onChange={(e) => handleDeepNestedChange('contacto', 'redesSociales', 'instagram', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="@tu_usuario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Facebook
              </label>
              <input
                type="text"
                value={formData.contacto.redesSociales.facebook}
                onChange={(e) => handleDeepNestedChange('contacto', 'redesSociales', 'facebook', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="facebook.com/tu-pagina"
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
                <span>{servicio ? 'Actualizar' : 'Publicar'} Servicio</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}