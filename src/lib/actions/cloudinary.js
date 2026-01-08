'use server';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export async function deleteImage(publicId) {
    if (!publicId) return { success: false, error: 'No public ID provided' };

    try {
        console.log(`🗑️ Eliminando imagen de Cloudinary: ${publicId}`);
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('✅ Resultado eliminación:', result);

        if (result.result === 'ok' || result.result === 'not found') {
            return { success: true, result };
        } else {
            return { success: false, error: 'Failed to delete image', result };
        }
    } catch (error) {
        console.error('❌ Error deleting image from Cloudinary:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteImages(publicIds) {
    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
        return { success: false, error: 'No public IDs provided' };
    }

    // Filtrar nulos o strings vacíos
    const validIds = publicIds.filter(id => id);

    if (validIds.length === 0) return { success: true, message: 'No valid IDs to delete' };

    try {
        console.log(`🗑️ Eliminando ${validIds.length} imágenes de Cloudinary`);
        // Cloudinary permite borrar múltiples imágenes por tag o prefijo, api.delete_resources es para admin api
        // uploader.destroy es uno por uno, pero api.delete_resources permite array

        // Usamos admin API para borrar múltiples (requiere permisos de admin API key)
        const result = await cloudinary.api.delete_resources(validIds);
        console.log('✅ Resultado eliminación múltiple:', result);

        return { success: true, result };
    } catch (error) {
        console.error('❌ Error deleting images batch:', error);
        // Intentar uno por uno si falla el batch (por permisos o lo que sea)
        console.log('⚠️ Intentando eliminación individual...');

        const results = await Promise.allSettled(
            validIds.map(id => cloudinary.uploader.destroy(id))
        );

        const failures = results.filter(r => r.status === 'rejected');
        if (failures.length > 0) {
            return { success: false, error: 'Some images failed to delete', failures };
        }

        return { success: true, results };
    }
}
