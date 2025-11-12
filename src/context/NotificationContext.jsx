import { createContext, useState, useContext, useEffect, useCallback } from "react";
import Alert from "../components/ui/Alert";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [browserNotificationPermission, setBrowserNotificationPermission] = useState("default");

  // Solicitar permiso para notificaciones del navegador al cargar
  useEffect(() => {
    if ("Notification" in window) {
      setBrowserNotificationPermission(Notification.permission);
      
      // Si el permiso no está denegado, solicitar automáticamente
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          setBrowserNotificationPermission(permission);
        });
      }
    }
  }, []);

  // Mostrar notificación del navegador si está permitido
  const showBrowserNotification = useCallback((title, options = {}) => {
    if ("Notification" in window && browserNotificationPermission === "granted") {
      try {
        new Notification(title, {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          ...options,
        });
      } catch (error) {
        console.warn("Error mostrando notificación del navegador:", error);
      }
    }
  }, [browserNotificationPermission]);

  const addNotification = useCallback((type, message, options = {}) => {
    const id = Date.now() + Math.random();
    const notification = { 
      id, 
      type, 
      message,
      persistent: options.persistent || false,
      duration: options.duration || 5000
    };
    
    setNotifications((prev) => [...prev, notification]);

    // Mostrar notificación del navegador para eventos importantes
    if (options.showBrowserNotification !== false && (type === "error" || type === "success")) {
      showBrowserNotification(
        type === "success" ? "✅ Éxito" : "❌ Error",
        { body: message }
      );
    }

    // Auto-remover solo si no es persistente
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }
  }, [showBrowserNotification]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const showSuccess = useCallback((message, options = {}) => {
    addNotification("success", message, options);
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    addNotification("error", message, { ...options, persistent: true, duration: 8000 });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    addNotification("warning", message, { ...options, duration: options.duration || 6000 });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    addNotification("info", message, options);
  }, [addNotification]);

  return (
    <NotificationContext.Provider
      value={{ 
        showSuccess, 
        showError, 
        showWarning, 
        showInfo,
        browserNotificationPermission,
        requestPermission: () => {
          if ("Notification" in window) {
            Notification.requestPermission().then((permission) => {
              setBrowserNotificationPermission(permission);
            });
          }
        }
      }}
    >
      {children}
      
      {/* Notification Container - Mejorado con animaciones */}
      <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-md pointer-events-none">
        {notifications.map((notif) => (
          <div key={notif.id} className="pointer-events-auto animate-slide-in-right">
            <Alert
              type={notif.type}
              message={notif.message}
              onClose={() => removeNotification(notif.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

