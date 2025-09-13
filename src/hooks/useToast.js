// src/hooks/useToast.js
'use client';

import { useState, useCallback } from 'react';

const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    
    const newToast = {
      id,
      message,
      type,
      duration,
      isVisible: true
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration + 300); // Extra time for animation
    }
  }, []);

  const hideToast = useCallback((id) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id 
          ? { ...toast, isVisible: false }
          : toast
      )
    );

    // Remove from array after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  }, []);

  const showSuccess = useCallback((message, duration) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message, duration) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showWarning = useCallback((message, duration) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    hideToast
  };
};

export default useToast;