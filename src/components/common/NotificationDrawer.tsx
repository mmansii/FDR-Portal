import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  X, 
  ExternalLink, 
  AlertCircle, 
  AlertTriangle, 
  Clock, 
  Info 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationItem } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    setActiveModule, 
    setSelectedFdrId 
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const filtered = notifications.filter(n => filter === 'all' || !n.isRead);

  const handleNotificationClick = (item: NotificationItem) => {
    markNotificationRead(item.id);
    if (item.targetModule) {
      setActiveModule(item.targetModule);
    }
    if (item.relatedFdrId) {
      setSelectedFdrId(item.relatedFdrId);
    }
    onClose();
  };

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />;
      case 'HIGH':
        return <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />;
      case 'MEDIUM':
        return <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          {/* Top Bar */}
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-800">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Regulatory Alerts & Notifications</h3>
                <p className="text-xs text-slate-500">Real-time automation alerts & dispatch notes</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls */}
          <div className="px-5 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filter === 'unread' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Unread ({notifications.filter(n => !n.isRead).length})
              </button>
            </div>
            <button
              onClick={markAllNotificationsRead}
              className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-semibold"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No notifications matching filter</p>
              </div>
            ) : (
              filtered.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-4 transition-colors hover:bg-slate-50 cursor-pointer flex gap-3 ${
                    !item.isRead ? 'bg-blue-50/40' : ''
                  }`}
                >
                  {getIcon(item.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-semibold truncate ${!item.isRead ? 'text-slate-950 font-bold' : 'text-slate-800'}`}>
                        {item.title}
                      </p>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{item.message}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{item.timestamp}</span>
                      <span className="text-blue-700 font-medium inline-flex items-center gap-1">
                        View Record <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
