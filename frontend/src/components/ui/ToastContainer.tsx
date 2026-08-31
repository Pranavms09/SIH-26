import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../lib/AppContext';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

const icons = {
  success: <CheckCircle size={15} />,
  info: <Info size={15} />,
  warning: <AlertCircle size={15} />,
  error: <XCircle size={15} />,
};

const colors = {
  success: 'var(--status-verified)',
  info: 'var(--status-processing)',
  warning: 'var(--status-review)',
  error: 'var(--status-error)',
};

export default function ToastContainer() {
  const { notifications, dismissToast } = useApp();

  return (
    <div className="toast-container">
      <AnimatePresence>
        {notifications.map(n => (
          <motion.div
            key={n.id}
            className="toast"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            <span style={{ color: colors[n.type] }}>{icons[n.type]}</span>
            <span style={{ flex: 1, fontSize: 'var(--text-base)' }}>{n.message}</span>
            <button
              onClick={() => dismissToast(n.id)}
              style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              aria-label="Dismiss"
            >
              <X size={13} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
