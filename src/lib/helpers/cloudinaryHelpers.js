export const extractPublicId = (url) => {
    if (!url) return null;

    try {
        // Ejemplo URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image_id.jpg

        // 1. Separar por '/'
        const parts = url.split('/');

        // 2. Encontrar el índice de 'upload'
        const uploadIndex = parts.indexOf('upload');

        if (uploadIndex === -1) return null;

        // 3. Tomar todo lo que está después de 'upload' y la versión (si existe)
        // Las versiones empiezan con 'v' seguido de números, ej: v1234567890
        let publicIdParts = parts.slice(uploadIndex + 1);

        // Si el primer elemento es una versión, lo quitamos
        if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
            publicIdParts = publicIdParts.slice(1);
        }

        // 4. Unir el resto para formar el path relativo (folder/image_id.jpg)
        const publicIdWithExtension = publicIdParts.join('/');

        // 5. Quitar la extensión (.jpg, .png, etc)
        const lastDotIndex = publicIdWithExtension.lastIndexOf('.');
        if (lastDotIndex !== -1) {
            return publicIdWithExtension.substring(0, lastDotIndex);
        }

        return publicIdWithExtension;
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return null;
    }
};
