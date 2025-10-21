"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, Trash2, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';

// Types
interface ConfirmationOptions {
  title?: string;
  message?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'delete' | 'update' | 'warning' | 'success';
  onConfirm: () => Promise<void> | void;
}

interface ConfirmationContextType {
  showConfirmation: (options: ConfirmationOptions) => void;
  closeConfirmation: () => void;
}

// Create Context
const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

// Hook to use the confirmation modal
export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation must be used within ConfirmationProvider');
  }
  return context;
};

// Provider Component
export const ConfirmationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<ConfirmationOptions | null>(null);

  const showConfirmation = useCallback((opts: ConfirmationOptions) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const closeConfirmation = useCallback(() => {
    setIsOpen(false);
    setIsLoading(false);
    setTimeout(() => setOptions(null), 300);
  }, []);

  const handleConfirm = async () => {
    if (!options?.onConfirm) return;

    setIsLoading(true);
    try {
      await options.onConfirm();
      closeConfirmation();
    } catch (error) {
      console.error('Confirmation action failed:', error);
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const getIcon = () => {
    switch (options?.type) {
      case 'delete':
        return <Trash2 className="w-8 h-8 text-red-400" />;
      case 'update':
        return <CheckCircle className="w-8 h-8 text-blue-400" />;
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-yellow-400" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-gray-400" />;
    }
  };

  const getIconBg = () => {
    switch (options?.type) {
      case 'delete':
        return 'bg-red-500/20';
      case 'update':
        return 'bg-blue-500/20';
      case 'warning':
        return 'bg-yellow-500/20';
      default:
        return 'bg-gray-500/20';
    }
  };

  const getConfirmButtonStyle = () => {
    switch (options?.type) {
      case 'delete':
        return 'bg-red-600 hover:bg-red-700';
      case 'update':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  if (!isOpen || !options) {
    return (
      <ConfirmationContext.Provider value={{ showConfirmation, closeConfirmation }}>
        {children}
      </ConfirmationContext.Provider>
    );
  }

  return (
    <ConfirmationContext.Provider value={{ showConfirmation, closeConfirmation }}>
      {children}
      
      {/* Modal */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-hidden">
        <div className="bg-black/30 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md border-2 border-white/30 p-6 relative">
          
          {/* Close Icon */}
          <button
            onClick={closeConfirmation}
            disabled={isLoading}
            className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className={`w-16 h-16 ${getIconBg()} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {getIcon()}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {options.title || (options.type === 'delete' ? 'Delete Confirmation' : 'Confirm Action')}
            </h2>
            <p className="text-gray-300 text-sm">
              {options.message || 
                `Are you sure you want to ${options.type || 'proceed with this action'}${
                  options.itemName ? ` "${options.itemName}"` : ''
                }?`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={closeConfirmation}
              disabled={isLoading}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-400 text-gray-200 hover:bg-white/10 disabled:opacity-50 transition-all"
            >
              {options.cancelText || 'Cancel'}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 px-6 py-3 rounded-xl ${getConfirmButtonStyle()} text-white font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2`}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Processing...' : (options.confirmText || 'Confirm')}
            </button>
          </div>
        </div>
      </div>
    </ConfirmationContext.Provider>
  );
};