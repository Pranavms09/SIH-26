import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../lib/AppContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CommandPalette from './CommandPalette';
import Doc2DigitalCopilot from '../copilot/BhumiCopilot';
import ToastContainer from '../ui/ToastContainer';

export default function AppShell() {
  const { sidebarCollapsed } = useApp();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className={`app-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar />
        <main className="app-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: '100%' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global overlays */}
      <CommandPalette />
      <Doc2DigitalCopilot />
      <ToastContainer />
    </div>
  );
}
