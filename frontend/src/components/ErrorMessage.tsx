import React, { useState } from 'react';
import { AlertCircle, Copy, Check } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-semibold">Conversion Error</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100/60 rounded text-xs inline-flex items-center space-x-1 transition-colors cursor-pointer"
            title="Copy error details"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="p-1 text-red-400 hover:text-red-700 rounded text-xs cursor-pointer ml-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-red-800 font-mono bg-red-100/50 p-2.5 rounded-lg break-words">
        {message}
      </p>
    </div>
  );
};
