// src/components/tienda/empleos/OfertaEmpleoForm.js
'use client';

import { useState, useEffect } from 'react';
import {
  TIPOS_EMPLEO,
  MODALIDADES_TRABAJO,
  NIVELES_EXPERIENCIA,
  TIPOS_SALARIO,
  CATEGORIAS_EMPLEO,
  DIAS_SEMANA,
  HORARIOS
} from '@/types/employment';
import { validarOfertaEmpleo } from '@/lib/helpers/employmentHelpers';
import {
  X,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function OfertaEmpleoForm({
  oferta = null,
  storeId,
  onSave,
  onCancel,
  isLoading = false
}) {
  const { user } = useAuth();
  const [storeData, setStoreData] = useState(null);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    subcategoria: '',
    tipoEmpleo: '',
    modalidad: '',
    experienciaRequerida: '',
    requisitos: [],
    habilidades: [],
    horario: {
      dias: [],
      turnos: [],
      horaInicio: '',
      horaFin: '',
      flexible: false
    },
    salario: {
      tipo: TIPOS_SALARIO.MENSUAL,
      minimo: '',
      maximo: '',
      moneda: 'ARS',
      beneficios: []
    },
    ubicacion: {
      direccion: '',
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

  const [errores, setErrores] = useState([]);
  const [currentRequisito, setCurrentRequisito] = useState('');
  const [currentHabilidad, setCurrentHabilidad] = useState('');
  const [currentBeneficio, setCurrentBeneficio] = useState('');

  // Cargar datos de la tienda
  useEffect(() => {
    const loadStoreData = async () => {
      if (!user?.uid) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setStoreData(userData);

          setFormData(prev => ({
            ...prev,
            contacto: {
              whatsapp: userData.phone || '',
              telefono: userData.phone || '',
              email: userData.email || '',
              preferencia: 'whatsapp'
            }
          }));
        }
      } catch (error) {
        console.error('Error cargando datos de la tienda:', error);
      }
    };

    loadStoreData();
  }, [user]);

  // Inicializar formulario si hay oferta existente
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
        requisitos: oferta.requisitos || [],
        habilidades: oferta.habilidades || [],
        horario: {
          dias: oferta.horario?.dias || [],
          turnos: oferta.horario?.turnos || [],
          horaInicio: oferta.horario?.horaInicio || '',
          horaFin: oferta.horario?.horaFin || '',
          flexible: oferta.horario?.flexible || false
        },
        salario: {
          tipo: oferta.salario?.tipo || TIPOS_SALARIO.MENSUAL,
          minimo: oferta.salario?.minimo?.toString() || '',
          maximo: oferta.salario?.maximo?.toString() || '',
          moneda: oferta.salario?.moneda || 'ARS',
          beneficios: oferta.salario?.beneficios || []
        },
        ubicacion: {
          direccion: oferta.ubicacion?.direccion || '',
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

  const addItem = (field, value, setterFn) => {
    if (!value.trim()) return;

    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }));
    setterFn('');
  };

  const removeItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const ofertaData = {
      ...formData,
      usuarioId: storeId,
      tiendaId: storeId,
      salario: {
        ...formData.salario,
        minimo: formData.salario.minimo ? parseFloat(formData.salario.minimo) : null,
        maximo: formData.salario.maximo ? parseFloat(formData.salario.maximo) : null
      }
    };

    if (!oferta) {
      ofertaData.usuarioId = storeId;
      ofertaData.tiendaId = storeId;
    }

    const validationErrors = validarOfertaEmpleo(ofertaData);
    if (validationErrors.length > 0) {
      setErrores(validationErrors);
      return;
    }

    setErrores([]);
    onSave(ofertaData);
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
            <Briefcase className="w-6 h-6 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {oferta ? 'Editar Oferta de Empleo' : 'Nueva Oferta de Empleo'}
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

        {/* Información Básica */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Información Básica
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título del puesto *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ej: Vendedor de mostrador con experiencia"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción del puesto *
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Describe las responsabilidades, ambiente de trabajo, y lo que buscas en un candidato..."
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
          </div>
        </div>

        {/* Detalles del Empleo */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Detalles del Empleo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de empleo *
              </label>
              <select
                value={formData.tipoEmpleo}
                onChange={(e) => handleInputChange('tipoEmpleo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Selecciona tipo</option>
                {Object.values(TIPOS_EMPLEO).map(tipo => (
                  <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Modalidad *
              </label>
              <select
                value={formData.modalidad}
                onChange={(e) => handleInputChange('modalidad', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Selecciona modalidad</option>
                {Object.values(MODALIDADES_TRABAJO).map(mod => (
                  <option key={mod.id} value={mod.id}>{mod.icono} {mod.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Experiencia requerida
              </label>
              <select
                value={formData.experienciaRequerida}
                onChange={(e) => handleInputChange('experienciaRequerida', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Sin requisito específico</option>
                {Object.values(NIVELES_EXPERIENCIA).map(nivel => (
                  <option key={nivel.id} value={nivel.id}>{nivel.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Requisitos y Habilidades */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Requisitos y Habilidades
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Requisitos
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.requisitos.map((req, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  >
                    {req}
                    <button
                      type="button"
                      onClick={() => removeItem('requisitos', index)}
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
                  value={currentRequisito}
                  onChange={(e) => setCurrentRequisito(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('requisitos', currentRequisito, setCurrentRequisito))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ej: Secundario completo"
                />
                <button
                  type="button"
                  onClick={() => addItem('requisitos', currentRequisito, setCurrentRequisito)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Habilidades deseadas
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.habilidades.map((hab, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                  >
                    {hab}
                    <button
                      type="button"
                      onClick={() => removeItem('habilidades', index)}
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
                  value={currentHabilidad}
                  onChange={(e) => setCurrentHabilidad(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('habilidades', currentHabilidad, setCurrentHabilidad))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ej: Atención al cliente"
                />
                <button
                  type="button"
                  onClick={() => addItem('habilidades', currentHabilidad, setCurrentHabilidad)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Horario */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Horario de Trabajo
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Días de trabajo
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.values(DIAS_SEMANA).map(dia => (
                  <button
                    key={dia.id}
                    type="button"
                    onClick={() => handleArrayToggle('horario', 'dias', dia.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${formData.horario.dias.includes(dia.id)
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
                Turnos
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.values(HORARIOS).map(horario => (
                  <button
                    key={horario.id}
                    type="button"
                    onClick={() => handleArrayToggle('horario', 'turnos', horario.id)}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors text-sm ${formData.horario.turnos.includes(horario.id)
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
                id="horarioFlexible"
                checked={formData.horario.flexible}
                onChange={(e) => handleNestedChange('horario', 'flexible', e.target.checked)}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="horarioFlexible" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Horario flexible
              </label>
            </div>
          </div>
        </div>

        {/* Salario */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Salario y Beneficios
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de salario *
              </label>
              <select
                value={formData.salario.tipo}
                onChange={(e) => handleNestedChange('salario', 'tipo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.salario.minimo}
                      onChange={(e) => handleNestedChange('salario', 'minimo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Salario máximo
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.salario.maximo}
                      onChange={(e) => handleNestedChange('salario', 'maximo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Beneficios adicionales
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.salario.beneficios.map((ben, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                >
                  {ben}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        salario: {
                          ...prev.salario,
                          beneficios: prev.salario.beneficios.filter((_, i) => i !== index)
                        }
                      }));
                    }}
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
                value={currentBeneficio}
                onChange={(e) => setCurrentBeneficio(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (currentBeneficio.trim()) {
                      setFormData(prev => ({
                        ...prev,
                        salario: {
                          ...prev.salario,
                          beneficios: [...prev.salario.beneficios, currentBeneficio.trim()]
                        }
                      }));
                      setCurrentBeneficio('');
                    }
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ej: Obra social, comedor, comisiones"
              />
              <button
                type="button"
                onClick={() => {
                  if (currentBeneficio.trim()) {
                    setFormData(prev => ({
                      ...prev,
                      salario: {
                        ...prev.salario,
                        beneficios: [...prev.salario.beneficios, currentBeneficio.trim()]
                      }
                    }));
                    setCurrentBeneficio('');
                  }
                }}
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dirección
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
        </div>

        {/* Información de Contacto */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Información de Contacto
          </h2>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              <Info className="w-4 h-4 inline mr-2" />
              Esta información se carga automáticamente desde tu perfil. Puedes personalizarla para esta oferta.
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

            <div className="md:col-span-2">
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
                <span>{oferta ? 'Actualizar' : 'Publicar'} Oferta</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}