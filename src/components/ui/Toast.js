// src/components/ui/Toast.js
'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type, isVisible, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible || !message) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          icon: CheckCircle,
          iconColor: 'text-white'
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          icon: XCircle,
          iconColor: 'text-white'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          icon: AlertCircle,
          iconColor: 'text-white'
        };
      default:
        return {
          bg: 'bg-blue-500',
          icon: CheckCircle,
          iconColor: 'text-white'
        };
    }
  };

  const { bg, icon: Icon, iconColor } = getToastStyles();

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-md px-4">
      <div
        className={`
          ${bg} text-white rounded-lg shadow-lg p-4 animate-slide-in-top
          backdrop-blur-sm border border-white/20
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className={`w-5 h-5 ${iconColor}`} />
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Barra de progreso */}
      {duration > 0 && (
        <div className="w-full h-1 bg-white/20 rounded-b-lg overflow-hidden">
          <div 
            className="h-full bg-white/60 animate-progress-bar"
            style={{ 
              animation: `progress-bar ${duration}ms linear forwards`
            }}
          />
        </div>
      )}
      
      <style jsx>{`
        @keyframes slide-in-top {
          from {
            opacity: 0;
            transform: translateY(-100%) translateX(-50%);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(-50%);
          }
        }
        
        @keyframes progress-bar {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        
        .animate-slide-in-top {
          animation: slide-in-top 0.3s ease-out forwards;
        }
        
        .animate-progress-bar {
          animation: progress-bar ${duration}ms linear forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;