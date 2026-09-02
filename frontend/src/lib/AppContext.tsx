import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Notification, Document, LandRecord, ProcessResponse } from '../types';
import { mockDocuments, mockLandRecords } from '../data/mockData';

interface AppContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  commandOpen: boolean;
  setCommandOpen: (v: boolean) => void;
  copilotOpen: boolean;
  setCopilotOpen: (v: boolean) => void;
  notifications: Notification[];
  addToast: (type: Notification['type'], message: string) => void;
  dismissToast: (id: string) => void;
  activeRecord: string | null;
  setActiveRecord: (id: string | null) => void;
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  addDocument: (doc: Document) => void;
  landRecords: LandRecord[];
  setLandRecords: React.Dispatch<React.SetStateAction<LandRecord[]>>;
  addLandRecord: (record: LandRecord) => void;
  activeProcessResult: ProcessResponse | null;
  setActiveProcessResult: (res: ProcessResponse | null) => void;
  activeDocumentFile: File | null;
  setActiveDocumentFile: (file: File | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeRecord, setActiveRecord] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [landRecords, setLandRecords] = useState<LandRecord[]>([]);
  const [activeProcessResult, setActiveProcessResult] = useState<ProcessResponse | null>(null);
  const [activeDocumentFile, setActiveDocumentFile] = useState<File | null>(null);

  const toastIdRef = useRef(0);

  const addToast = useCallback((type: Notification['type'], message: string) => {
    const id = `toast-${++toastIdRef.current}`;
    const n: Notification = { id, type, message, timestamp: new Date().toISOString(), read: false };
    setNotifications(prev => [...prev, n]);
    setTimeout(() => dismissToast(id), 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addDocument = useCallback((doc: Document) => {
    setDocuments(prev => [doc, ...prev]);
  }, []);

  const addLandRecord = useCallback((rec: LandRecord) => {
    setLandRecords(prev => [rec, ...prev]);
  }, []);

  // Ctrl+K command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCommandOpen(false);
        setCopilotOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <AppContext.Provider value={{
      sidebarCollapsed, setSidebarCollapsed,
      commandOpen, setCommandOpen,
      copilotOpen, setCopilotOpen,
      notifications, addToast, dismissToast,
      activeRecord, setActiveRecord,
      documents, setDocuments, addDocument,
      landRecords, setLandRecords, addLandRecord,
      activeProcessResult, setActiveProcessResult,
      activeDocumentFile, setActiveDocumentFile,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
