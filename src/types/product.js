// src/types/product.js

// Estados del producto
export const ESTADOS_PRODUCTO = {
  DISPONIBLE: 'disponible',     // Producto en stock y disponible
  AGOTADO: 'agotado',          // Sin stock temporalmente
  PAUSADO: 'pausado',          // Pausado por el vendedor
  INACTIVO: 'inactivo',        // Desactivado
  PENDIENTE: 'pendiente'       // Esperando aprobación
}

// Condición del producto
export const CONDICION_PRODUCTO = {
  NUEVO: 'nuevo',              // Producto nuevo
  USADO: 'usado',              // Producto usado en buen estado
  REACONDICIONADO: 'reacondicionado', // Producto reparado/restaurado
  ARTESANAL: 'artesanal'       // Hecho a mano/artesanal
}

// Tipos de precio
export const TIPOS_PRECIO = {
  FIJO: 'fijo',                // Precio fijo
  NEGOCIABLE: 'negociable',    // Precio negociable
  CONSULTAR: 'consultar',      // Precio a consultar
  SUBASTA: 'subasta',          // Por subasta/mejor oferta
  GRATIS: 'gratis'             // Producto gratuito
}

// Unidades de medida
export const UNIDADES_MEDIDA = {
  // Peso
  GRAMOS: 'gramos',
  KILOGRAMOS: 'kilogramos',
  
  // Volumen
  MILILITROS: 'mililitros',
  LITROS: 'litros',
  
  // Longitud
  CENTIMETROS: 'centimetros',
  METROS: 'metros',
  
  // Cantidad
  UNIDAD: 'unidad',
  DOCENA: 'docena',
  PACK: 'pack',
  KIT: 'kit',
  
  // Tiempo (para servicios)
  HORA: 'hora',
  DIA: 'dia',
  MES: 'mes'
}

// Tipos de destacado
export const TIPOS_DESTACADO = {
  NORMAL: 'normal',            // Sin destacar
  PROMOCION: 'promocion',      // En promoción
  NUEVO: 'nuevo',              // Producto nuevo (últimos 30 días)
  DESTACADO: 'destacado',      // Destacado por donación
  URGENTE: 'urgente'           // Venta urgente
}

// Configuraciones de stock
export const GESTION_STOCK = {
  ILIMITADO: 'ilimitado',      // Stock ilimitado
  LIMITADO: 'limitado',        // Stock con cantidad específica
  BAJO_PEDIDO: 'bajo_pedido'   // Se hace bajo pedido
}

// Tipos de descuento
export const TIPOS_DESCUENTO = {
  PORCENTAJE: 'porcentaje',    // Descuento en porcentaje
  MONTO_FIJO: 'monto_fijo',    // Descuento en monto fijo
  PROMOCION_2X1: '2x1',        // Promoción 2x1
  COMBO: 'combo'               // Precio especial por combo
}

// Etiquetas especiales del producto
export const ETIQUETAS_PRODUCTO = {
  ORGANICO: 'organico',
  VEGANO: 'vegano',
  SIN_TACC: 'sin_tacc',
  ARTESANAL: 'artesanal',
  LOCAL: 'local',
  PREMIUM: 'premium',
  ECO_FRIENDLY: 'eco_friendly',
  HECHO_EN_CASA: 'hecho_en_casa'
}

// Tipos de variaciones del producto
export const TIPOS_VARIACION = {
  COLOR: 'color',
  TALLE: 'talle',
  SABOR: 'sabor',
  TAMAÑO: 'tamaño',
  MATERIAL: 'material',
  MODELO: 'modelo'
}

// Métodos de fabricación/obtención
export const ORIGEN_PRODUCTO = {
  PROPIO: 'propio',            // Fabricado por el vendedor
  REVENTA: 'reventa',          // Comprado para revender
  CONSIGNACION: 'consignacion' // En consignación
}