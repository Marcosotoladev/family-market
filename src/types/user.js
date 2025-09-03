// src/types/user.js

// Roles de usuario en el sistema
export const ROLES_USUARIO = {
  MIEMBRO: 'miembro',           // Usuario regular de la iglesia
  ADMINISTRADOR: 'administrador', // Puede moderar contenido
  SUPER_ADMIN: 'super_admin'    // Control total del sistema
}

// Estados del usuario
export const ESTADOS_USUARIO = {
  ACTIVO: 'activo',           // Usuario normal
  PENDIENTE: 'pendiente',     // Esperando verificación de hogar
  SUSPENDIDO: 'suspendido',   // Suspendido temporalmente
  INACTIVO: 'inactivo'        // Cuenta desactivada
}

// Tipos de verificación de hogar
export const VERIFICACION_HOGAR = {
  VERIFICADO: 'verificado',     // Hogar confirmado por administrador
  PENDIENTE: 'pendiente',       // Esperando verificación
  RECHAZADO: 'rechazado'        // Hogar no pertenece a TTL
}

// Redes sociales disponibles
export const REDES_SOCIALES = {
  WHATSAPP: 'whatsapp',
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
  TELEGRAM: 'telegram',
  LINKEDIN: 'linkedin'
}

// Configuraciones de privacidad del usuario
export const PRIVACIDAD_USUARIO = {
  PUBLICO: 'publico',           // Perfil visible para todos
  MIEMBROS: 'miembros',         // Solo visible para miembros TTL
  PRIVADO: 'privado'            // Solo visible para el usuario
}

// Notificaciones que puede recibir el usuario
export const TIPOS_NOTIFICACION = {
  NUEVO_MENSAJE: 'nuevo_mensaje',
  PRODUCTO_DESTACADO: 'producto_destacado',
  NUEVA_OFERTA_TRABAJO: 'nueva_oferta_trabajo',
  SISTEMA: 'sistema'
}

// Método de autenticación preferido
export const METODOS_AUTH = {
  EMAIL_PASSWORD: 'email_password',
  GOOGLE: 'google',
  FACEBOOK: 'facebook'
}