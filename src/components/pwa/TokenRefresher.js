'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import notificationService from '@/lib/services/notificationService';

export default function TokenRefresher() {
    const { user } = useAuth();

    useEffect(() => {
        // Only run if user is logged in
        if (!user) return;

        const checkAndRefresh = async () => {
            // Check if notifications are supported and permission is granted
            if (!('Notification' in window) || Notification.permission !== 'granted') return;

            try {
                // Init service
                await notificationService.initialize();

                // Get current token from Firebase Messaging
                const currentToken = await notificationService.getToken();

                if (currentToken) {
                    // Always update/verify in backend. 
                    // Optimization: We could check if it matches local storage causing less writes,
                    // but writing to Firestore periodically (e.g. on session start) is safe to ensure sync.
                    console.log('🔄 Verificando/Actualizando token de notificaciones...');
                    await notificationService.updateUserToken(user.uid, currentToken);
                }
            } catch (error) {
                console.warn('Error en auto-refresh de token:', error);
            }
        };

        // Run on mount (app start/reload)
        checkAndRefresh();

        // Optional: Set up an interval or listener for token refresh events if needed long-term
        // But usually on-load is sufficient for most apps.

    }, [user]); // Re-run if user changes (login/logout)

    // Render nothing
    return null;
}
