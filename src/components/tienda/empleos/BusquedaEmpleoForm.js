// src/components/tienda/empleos/BusquedaEmpleoForm.js
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  TIPOS_EMPLEO,
  MODALIDADES_TRABAJO,
  NIVELES_EXPERIENCIA,
  TIPOS_SALARIO,
  CATEGORIAS_EMPLEO
} from '@/types/employment';
import {
  X,
  Save,
  ArrowLeft,
  Plus,
  Upload,
  User,
  MapPin,
  DollarSign,
  Clock,
  Award,
  Info,
  FileText,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function BusquedaEmpleoForm({
  busqueda = null,
  userId,
  onSave,
  onCancel,
  isLoading = false
}) {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const fileInputRef = useRef(null);
  const cvInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nombre: '',
    foto: '',
    titulo: '',
    categoria: '',
    subcategoria: '',
    descripcion: '',
    experiencia: '',
    nivelExperiencia: '',
    habilidades: [],
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
    cv: {
      url: '',
      nombre: '',
      size: 0
    },
    contacto: {
      whatsapp: '',
      telefono: '',
      email: '',
      preferencia: 'whatsapp'
    }
  });

  const [errores, setErrores] = useState([]);
  const [currentHabilidad, setCurrentHabilidad] = useState('');
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);

  // ✅ CORREGIDO: Cargar datos del usuario SOLO si NO hay búsqueda existente
  useEffect(() => {
    // Si ya hay una búsqueda, no cargar datos del usuario
    if (busqueda) return;
    
    const loadUserData = async () => {
      if (!user?.uid) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);

          setFormData(prev => ({
            ...prev,
            nombre: data.name || '',
            foto: data.photoURL || '',
            contacto: {
              whatsapp: data.phone || '',
              telefono: data.phone || '',
              email: data.email || '',
              preferencia: 'whatsapp'
            }
          }));
        }
      } catch (error) {
        console.error('Error cargando datos del usuario:', error);
      }
    };

    loadUserData();
  }, [user, busqueda]);

  // Inicializar formulario si hay búsqueda existente
  useEffect(() => {
    if (busqueda) {
      setFormData({
        nombre: busqueda.nombre || '',
        foto: busqueda.foto || '',
        titulo: busqueda.titulo || '',
        categoria: busqueda.categoria || '',
        subcategoria: busqueda.subcategoria || '',
        descripcion: busqueda.descripcion || '',
        experiencia: busqueda.experiencia || '',
        nivelExperiencia: busqueda.nivelExperiencia || '',
        habilidades: busqueda.habilidades || [],
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
        cv: {
          url: busqueda.cv?.url || '',
          nombre: busqueda.cv?.nombre || '',
          size: busqueda.cv?.size || 0
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

  const addHabilidad = () => {
    if (!currentHabilidad.trim()) return;

    setFormData(prev => ({
      ...prev,
      habilidades: [...prev.habilidades, currentHabilidad.trim()]
    }));
    setCurrentHabilidad('');
  };

  const removeHabilidad = (index) => {
    setFormData(prev => ({
      ...prev,
      habilidades: prev.habilidades.filter((_, i) => i !== index)
    }));
  };

  // Upload de foto a Cloudinary
  const handleFotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB');
      return;
    }

    setUploadingFoto(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_JOBS);
      formDataUpload.append('folder', 'family-market/empleos/perfiles');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formDataUpload
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        handleInputChange('foto', data.secure_url);
      }
    } catch (error) {
      console.error('Error al subir foto:', error);
      alert('Error al subir la foto. Intenta nuevamente.');
    } finally {
      setUploadingFoto(false);
    }
  };

  // Upload de CV (PDF) a Cloudinary
  const handleCVUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor selecciona un archivo PDF');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('El CV no debe superar los 10MB');
      return;
    }

    setUploadingCV(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_JOBS);
      uploadFormData.append('folder', 'family-market/empleos/cvs');
      uploadFormData.append('resource_type', 'raw');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`,
        {
          method: 'POST',
          body: uploadFormData
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        setFormData(prev => ({
          ...prev,
          cv: {
            url: data.secure_url,
            nombre: file.name,
            size: file.size
          }
        }));
      }
    } catch (error) {
      console.error('Error al subir CV:', error);
      alert('Error al subir el CV. Intenta nuevamente.');
    } finally {
      setUploadingCV(false);
    }
  };

  const removeCV = () => {
    setFormData(prev => ({
      ...prev,
      cv: {
        url: '',
        nombre: '',
        size: 0
      }
    }));
  };

  const validarFormulario = () => {
    const errores = [];

    if (!formData.nombre.trim()) {
      errores.push('El nombre es obligatorio');
    }

    if (!formData.titulo.trim()) {
      errores.push('El título/puesto que buscas es obligatorio');
    }

    if (!formData.categoria) {
      errores.push('Debes seleccionar una categoría');
    }

    if (!formData.descripcion.trim()) {
      errores.push('La descripción es obligatoria');
    }

    if (formData.disponibilidad.tipoEmpleo.length === 0) {
      errores.push('Selecciona al menos un tipo de empleo');
    }

    if (formData.disponibilidad.modalidades.length === 0) {
      errores.push('Selecciona al menos una modalidad de trabajo');
    }

    if (!formData.contacto.whatsapp && !formData.contacto.telefono && !formData.contacto.email) {
      errores.push('Debes proporcionar al menos un medio de contacto');
    }

    return errores;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validarFormulario();
    if (validationErrors.length > 0) {
      setErrores(validationErrors);
      return;
    }

    const busquedaData = {
      ...formData,
      usuarioId: userId,
      pretensionSalarial: {
        ...formData.pretensionSalarial,
        minimo: formData.pretensionSalarial.minimo ? parseFloat(formData.pretensionSalarial.minimo) : null,
        maximo: formData.pretensionSalarial.maximo ? parseFloat(formData.pretensionSalarial.maximo) : null
      }
    };

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
            <User className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {busqueda ? 'Editar Búsqueda de Empleo' : 'Nueva Búsqueda de Empleo'}
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

          {/* Foto de perfil */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Foto de perfil
            </label>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {formData.foto ? (
                  <img
                    src={formData.foto}
                    alt="Foto de perfil"
                    className="w-24 h-24 rounded-full object-cover border-4 border-emerald-200 dark:border-emerald-700"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center border-4 border-emerald-200 dark:border-emerald-700">
                    <User className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFoto}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {uploadingFoto ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      <span>{formData.foto ? 'Cambiar foto' : 'Subir foto'}</span>
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  JPG, PNG o GIF. Máximo 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre completo *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ej: Juan Pérez"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título / Puesto que buscas *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ej: Vendedor con experiencia"
                maxLength={100}
              />
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción personal *
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Cuéntanos sobre ti, tus fortalezas, y qué te hace un buen candidato..."
                maxLength={1000}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formData.descripcion.length}/1000 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Experiencia laboral
              </label>
              <textarea
                value={formData.experiencia}
                onChange={(e) => handleInputChange('experiencia', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Describe tu experiencia laboral relevante..."
                maxLength={1000}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formData.experiencia.length}/1000 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nivel de experiencia
              </label>
              <select
                value={formData.nivelExperiencia}
                onChange={(e) => handleInputChange('nivelExperiencia', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Selecciona tu nivel</option>
                {Object.values(NIVELES_EXPERIENCIA).map(nivel => (
                  <option key={nivel.id} value={nivel.id}>{nivel.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Habilidades */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Habilidades
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tus habilidades principales
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.habilidades.map((hab, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200"
                >
                  {hab}
                  <button
                    type="button"
                    onClick={() => removeHabilidad(index)}
                    className="ml-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200"
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
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHabilidad())}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ej: Atención al cliente, Trabajo en equipo"
              />
              <button
                type="button"
                onClick={addHabilidad}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* CV */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Curriculum Vitae
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Sube tu CV (opcional pero recomendado)
            </label>
            
            {formData.cv.url ? (
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formData.cv.nombre}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(formData.cv.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeCV}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <input
                  ref={cvInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleCVUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => cvInputRef.current?.click()}
                  disabled={uploadingCV}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 bg-gray-50 dark:bg-gray-700"
                >
                  {uploadingCV ? (
                    <>
                      <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-700 dark:text-gray-300">Subiendo CV...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-gray-700 dark:text-gray-300">Haz clic para subir tu CV (PDF)</span>
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Archivo PDF. Máximo 10MB.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Disponibilidad */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Disponibilidad
          </h2>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="disponibilidadInmediata"
                checked={formData.disponibilidad.inmediata}
                onChange={(e) => handleNestedChange('disponibilidad', 'inmediata', e.target.checked)}
                className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="disponibilidadInmediata" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Disponibilidad inmediata
              </label>
            </div>

            {!formData.disponibilidad.inmediata && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={formData.disponibilidad.fechaInicio}
                  onChange={(e) => handleNestedChange('disponibilidad', 'fechaInicio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Tipo de empleo que buscas *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.values(TIPOS_EMPLEO).map(tipo => (
                  <button
                    key={tipo.id}
                    type="button"
                    onClick={() => handleArrayToggle('disponibilidad', 'tipoEmpleo', tipo.id)}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
                      formData.disponibilidad.tipoEmpleo.includes(tipo.id)
                        ? 'bg-emerald-600 text-white'
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
                Modalidad de trabajo *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.values(MODALIDADES_TRABAJO).map(mod => (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => handleArrayToggle('disponibilidad', 'modalidades', mod.id)}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
                      formData.disponibilidad.modalidades.includes(mod.id)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {mod.icono} {mod.nombre}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="horarioFlexible"
                checked={formData.disponibilidad.horarioFlexible}
                onChange={(e) => handleNestedChange('disponibilidad', 'horarioFlexible', e.target.checked)}
                className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="horarioFlexible" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Horario flexible
              </label>
            </div>
          </div>
        </div>

        {/* Pretensión Salarial */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Pretensión Salarial
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de salario
              </label>
              <select
                value={formData.pretensionSalarial.tipo}
                onChange={(e) => handleNestedChange('pretensionSalarial', 'tipo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    Salario mínimo esperado
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.pretensionSalarial.minimo}
                      onChange={(e) => handleNestedChange('pretensionSalarial', 'minimo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0.00"
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
                      step="0.01"
                      min="0"
                      value={formData.pretensionSalarial.maximo}
                      onChange={(e) => handleNestedChange('pretensionSalarial', 'maximo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </>
            )}
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ej: Córdoba"
              />
            </div>
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
              Esta información se carga automáticamente desde tu perfil. Puedes personalizarla para esta búsqueda.
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="351xxxxxxx"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.contacto.email}
                onChange={(e) => handleNestedChange('contacto', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="contacto@ejemplo.com"
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
            disabled={isLoading || uploadingFoto || uploadingCV}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{busqueda ? 'Actualizar' : 'Publicar'} Búsqueda</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}