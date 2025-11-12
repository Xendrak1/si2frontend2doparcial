import { createContext, useState, useContext } from "react";
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

  const addNotification = (type, message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const showSuccess = (message) => addNotification("success", message);
  const showError = (message) => addNotification("error", message);
  const showWarning = (message) => addNotification("warning", message);
  const showInfo = (message) => addNotification("info", message);

  return (
    <NotificationContext.Provider
      value={{ showSuccess, showError, showWarning, showInfo }}
    >
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        {notifications.map((notif) => (
          <Alert
            key={notif.id}
            type={notif.type}
            message={notif.message}
            onClose={() => removeNotification(notif.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

