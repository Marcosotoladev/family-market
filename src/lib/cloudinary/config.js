// src/lib/cloudinary/config.js
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

// Configuración para uploads
export const uploadConfig = {
  // Upload presets simples
  uploadPresets: {
    products: 'products',
    stores: 'stores', 
    users: 'users',
  },
  // Carpetas organizadas por tipo
  folders: {
    productos: 'productos',
    tiendas: 'tiendas',
    usuarios: 'usuarios',
  },
  // Transformaciones comunes
  transformations: {
    thumbnail: 'c_fill,w_150,h_150,f_auto,q_auto',
    medium: 'c_fit,w_400,h_300,f_auto,q_auto',
    large: 'c_fit,w_800,h_600,f_auto,q_auto',
  }
}

export default cloudinary