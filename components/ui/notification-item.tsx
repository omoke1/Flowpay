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
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const getTextColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-900 dark:text-green-100';
      case 'error':
        return 'text-red-900 dark:text-red-100';
      case 'warning':
        return 'text-yellow-900 dark:text-yellow-100';
      case 'info':
        return 'text-blue-900 dark:text-blue-100';
      default:
        return 'text-gray-900 dark:text-gray-100';
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
            flex-shrink-0 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10
            transition-colors duration-200
            ${getTextColor()} opacity-60 hover:opacity-100
          `}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
