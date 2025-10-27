"use client";

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Notification } from '@/lib/hooks/use-notifications';

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

export function NotificationItem({ notification, onRemove }: NotificationItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-[#97F11D]" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-[#97F11D]" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-[#97F11D]" />;
      case 'info':
        return <Info className="w-5 h-5 text-[#97F11D]" />;
      default:
        return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-black border-[#97F11D]/30';
      case 'error':
        return 'bg-black border-[#97F11D]/30';
      case 'warning':
        return 'bg-black border-[#97F11D]/30';
      case 'info':
        return 'bg-black border-[#97F11D]/30';
      default:
        return 'bg-black border-white/10';
    }
  };

  const getTextColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-white';
      case 'error':
        return 'text-white';
      case 'warning':
        return 'text-white';
      case 'info':
        return 'text-white';
      default:
        return 'text-gray-200';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getBackgroundColor()}
        border rounded-lg p-4 shadow-lg backdrop-blur-sm
        hover:shadow-xl transition-shadow duration-200
        shadow-[0_0_20px_rgba(151,241,29,0.1)]
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${getTextColor()}`}>
            {notification.title}
          </h4>
          <p className={`text-sm mt-1 ${getTextColor()} opacity-80`}>
            {notification.message}
          </p>
          
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className={`
                mt-2 text-xs font-medium underline hover:no-underline
                ${getTextColor()} opacity-80 hover:opacity-100
                transition-opacity duration-200
              `}
            >
              {notification.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={handleRemove}
          className={`
            flex-shrink-0 p-1 rounded-full hover:bg-white/10
            transition-colors duration-200
            text-gray-400 hover:text-white
          `}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
