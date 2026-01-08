'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import notificationService from '@/lib/services/notificationService';

export default function NotificationPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const { user } = useAuth(); // We need the user to save the token to their profile

    useEffect(() => {
        // Check if notifications are supported
        if (!('Notification' in window)) return;

        // Check if already granted
        if (Notification.permission === 'granted') return;

        // Check if explicitly blocked (denied), usually we respect this and don't bug them
        // unless we have a specific "settings" UI. For a prompt, we skip if denied.
        if (Notification.permission === 'denied') return;

        // Check if app is installed (standalone) - we prioritize PWA users
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone ||
            document.referrer.includes('android-app://');

        // Logic: Show prompt if installed AND permission is 'default' (not yet asked)
        // We can also show it for regular web users if desired, but let's stick to PWA focus or general.
        // Let's show for everyone after a small delay to not overwhelm on load.

        const hasSeenPrompt = localStorage.getItem('notificationPromptShown');

        // Show if not seen recently (e.g. session based or persistent)
        // For now, let's use a flag to not show on every refresh if closed
        if (!hasSeenPrompt) {
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 5000); // Wait 5s after load
            return () => clearTimeout(timer);
        }

    }, []);

    const handleEnableNotifications = async () => {
        // Request permission
        const token = await notificationService.requestPermission();

        if (token) {
            // Permission granted and token retrieved
            setShowPrompt(false);

            // If user is logged in, save token to their profile
            if (user?.uid) {
                await notificationService.updateUserToken(user.uid, token);
            }

            // Permanently mark as handled
            localStorage.setItem('notificationPromptShown', 'true');
        } else {
            // Denied or error
            setShowPrompt(false);
            localStorage.setItem('notificationPromptShown', 'true'); // Don't bug immediately again
        }
    };

    const handleClose = () => {
        setShowPrompt(false);
        localStorage.setItem('notificationPromptShown', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 max-w-sm mx-auto md:mr-4 md:ml-auto flex items-start gap-4">

                <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg text-primary-600 dark:text-primary-400">
                    <Bell size={24} />
                </div>

                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Activa las notificaciones
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Mantente al día con el estado de tu pedido y ofertas exclusivas.
                    </p>

                    <div className="flex gap-2">
                        <button
                            onClick={handleEnableNotifications}
                            className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                        >
                            Activar
                        </button>
                        <button
                            onClick={handleClose}
                            className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors"
                        >
                            Ahora no
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
