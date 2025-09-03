// src/types/store.js

// Estados de la tienda
export const ESTADOS_TIENDA = {
  ACTIVA: 'activa',           // Tienda funcionando normalmente
  PAUSADA: 'pausada',         // Temporalmente sin ventas
  INACTIVA: 'inactiva',       // Desactivada por el usuario
  SUSPENDIDA: 'suspendida',   // Suspendida por administrador
  PENDIENTE: 'pendiente'      // Esperando aprobación
}

// Tipos de entrega disponibles
export const TIPOS_ENTREGA = {
  DOMICILIO: 'domicilio',     // Entrega a domicilio
  RETIRO: 'retiro',           // Retiro en punto acordado
  ENVIO: 'envio',             // Envío por correo/transporte
  DIGITAL: 'digital'          // Producto/servicio digital
}

// Métodos de pago aceptados
export const METODOS_PAGO = {
  EFECTIVO: 'efectivo',
  TRANSFERENCIA: 'transferencia',
  MERCADO_PAGO: 'mercado_pago',
  TARJETA: 'tarjeta',
  CRIPTO: 'cripto',
  TRUEQUE: 'trueque'          // Intercambio por otros productos/servicios
}

// Zonas de cobertura para delivery
export const ZONAS_COBERTURA = {
  CENTRO: 'centro',
  NORTE: 'norte',
  SUR: 'sur',
  ESTE: 'este',
  OESTE: 'oeste',
  GRAN_CORDOBA: 'gran_cordoba',
  TODA_CORDOBA: 'toda_cordoba',
  TODO_PAIS: 'todo_pais'
}

// Horarios de atención
export const DIAS_SEMANA = {
  LUNES: 'lunes',
  MARTES: 'martes',
  MIERCOLES: 'miercoles',
  JUEVES: 'jueves',
  VIERNES: 'viernes',
  SABADO: 'sabado',
  DOMINGO: 'domingo'
}

// Tipos de tienda según el modelo de negocio
export const TIPOS_NEGOCIO = {
  PRODUCTO_FISICO: 'producto_fisico',    // Vende productos físicos
  SERVICIO: 'servicio',                  // Ofrece servicios
  DIGITAL: 'digital',                    // Productos digitales
  MIXTA: 'mixta'                        // Productos y servicios
}

// Configuraciones de la tienda
export const CONFIGURACION_TIENDA = {
  CATALOGO_PUBLICO: 'catalogo_publico',      // Catálogo visible sin login
  SOLO_MIEMBROS: 'solo_miembros',            // Solo miembros TTL
  PRECIOS_PUBLICOS: 'precios_publicos',      // Precios visibles a todos
  PRECIOS_MIEMBROS: 'precios_miembros'       // Precios solo para miembros
}

// Estados de verificación de la tienda
export const VERIFICACION_TIENDA = {
  VERIFICADA: 'verificada',       // Tienda verificada por admin
  NO_VERIFICADA: 'no_verificada', // Sin verificar
  EN_REVISION: 'en_revision'      // En proceso de verificación
}