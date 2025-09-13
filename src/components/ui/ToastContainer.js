// src/components/ui/ToastContainer.js
'use client';

import Toast from './Toast';

const ToastContainer = ({ toasts, onHideToast }) => {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          duration={toast.duration}
          onClose={() => onHideToast(toast.id)}
        />
      ))}
    </>
  );
};

export default ToastContainer;