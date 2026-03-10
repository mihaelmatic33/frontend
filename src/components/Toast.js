import React, { useEffect } from "react";

const Toast = ({ message, duration = 2000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      background: '#ffcc00',   // jarko žuto
      color: '#000',           // crni tekst
      padding: '12px 20px',
      borderRadius: '8px',
      fontWeight: 'bold',
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      fontSize: '16px',
    }}>
      {message}
    </div>
  );
};

export default Toast;