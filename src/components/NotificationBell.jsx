// src/components/NotificationBell.js
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import useNotificationSocket from '../hooks/useNotificationSocket';
import BaseUrl from '../Api';
import 'react-toastify/dist/ReactToastify.css';
import ReactDOM from 'react-dom';

const NotificationBell = ({ userId, sidebarOpen = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notificationStats, setNotificationStats] = useState({ total: 0, unread: 0 });

  // Calculate modal positioning based on sidebar state
  const getModalPosition = () => {
    const sidebarWidth = sidebarOpen ? 220 : 72;
    const navbarHeight = 80;

    return {
      top: navbarHeight,
      left: sidebarWidth,
      right: 0,
      bottom: 0
    };
  };

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('⚠️ No token found, skipping notification fetch');
        return;
      }

      console.log('📡 Fetching notifications from API...');
      const response = await fetch(`${BaseUrl}/notifications/my-notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Notifications fetched successfully:', data.length, 'notifications');

      // Transform the data to match our expected format
      const transformedNotifications = data.map(notif => ({
        id: notif._id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        link: notif.link,
        isRead: notif.isRead,
        createdAt: notif.createdAt,
        updatedAt: notif.updatedAt
      }));

      setNotifications(transformedNotifications);
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch notification stats (total, unread)
  const fetchNotificationStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${BaseUrl}/notifications/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setNotificationStats(data);
    } catch (error) {
      console.error('❌ Error fetching notification stats:', error);
      setNotificationStats({ total: 0, unread: 0 });
    }
  }, []);

  // Handle new notification with useCallback to prevent unnecessary re-renders
  const handleNotification = useCallback((notif) => {
    console.log('🔔 [handleNotification] Called with:', notif);
    // toast.info('🔔 [handleNotification] Called with:', notif);
    if (!notif || (!notif.title && !notif.message)) {
      console.warn('⚠️ [handleNotification] Notification missing title or message:', notif);
      return;
    }
    
    // Ensure notification has an id
    const notificationWithTimestamp = {
      ...notif,
      createdAt: notif.createdAt || new Date().toISOString(),
      id: notif.id || notif._id || `notif-${Date.now()}-${Math.random()}`
    };
    
    setNotifications((prev) => {
      // Check if notification already exists to prevent duplicates
      const exists = prev.some(n => n.id === notificationWithTimestamp.id);
      if (exists) {
        console.log('⚠️ [handleNotification] Notification already exists, skipping...');
        return prev;
      }
      console.log('✅ [handleNotification] Adding new notification to state:', notificationWithTimestamp);
      return [notificationWithTimestamp, ...prev];
    });
    
    // Show enhanced toast notification immediately for real-time notifications
    console.log('📢 [handleNotification] Showing enhanced toast for:', notificationWithTimestamp.title, notificationWithTimestamp.message);
    
    // Ultra-compact professional toast design
    toast.info(
      <div 
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '12px',
          cursor: 'pointer',
          position: 'relative',
          width: '100%',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)'
        }}
        onClick={() => {
          console.log('📢 [handleNotification] Toast clicked, opening modal for:', notificationWithTimestamp);
          setSelectedNotification(notificationWithTimestamp);
          setShowModal(true);
          // Mark as read if not already read
          if (!notificationWithTimestamp.isRead) {
            markAsRead(notificationWithTimestamp.id);
          }
        }}
        onMouseEnter={(e) => {
          e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.12)';
          e.target.style.borderColor = '#cbd5e1';
        }}
        onMouseLeave={(e) => {
          e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08)';
          e.target.style.borderColor = '#e2e8f0';
        }}
      >
        {/* Status indicator */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3px',
          background: !notificationWithTimestamp.isRead ? '#2563eb' : '#94a3b8',
          borderRadius: '6px 0 0 6px'
        }} />

        {/* Compact icon */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '4px',
          background: 'transparent', // No background color
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: !notificationWithTimestamp.isRead ? '#2563eb' : '#64748b', // Bell color
          fontSize: '18px', // Slightly larger for clarity
          flexShrink: 0,
          border: '1px solid #e5e7eb'
        }}>
          <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}>🔔</span>
        </div>

        {/* Content area */}
        <div style={{ 
          flex: 1, 
          minWidth: 0
        }}>
          {/* Header with title and time */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '4px',
            gap: '8px'
          }}>
            <h4 style={{
              fontWeight: '600',
              fontSize: '13px',
              color: '#1e293b',
              margin: 0,
              lineHeight: '1.3',
              wordBreak: 'break-word',
              flex: 1
            }}>
              {notificationWithTimestamp.title}
            </h4>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexShrink: 0
            }}>
              {!notificationWithTimestamp.isRead && (
                <span style={{
                  fontSize: '9px',
                  color: '#ffffff',
                  fontWeight: '600',
                  background: '#dc2626',
                  padding: '1px 4px',
                  borderRadius: '3px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  New
                </span>
              )}
              <span style={{
                fontSize: '10px',
                color: '#64748b',
                fontWeight: '500'
              }}>
                {new Date(notificationWithTimestamp.createdAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>

          {/* Compact message */}
          <p style={{
            fontSize: '12px',
            color: '#475569',
            lineHeight: '1.4',
            margin: '0 0 6px 0',
            wordBreak: 'break-word',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {notificationWithTimestamp.message}
          </p>

          {/* Compact footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <span style={{
              fontSize: '10px',
              color: '#64748b',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {notificationWithTimestamp.type || 'Notification'}
            </span>
            
            <span style={{
              fontSize: '10px',
              color: '#2563eb',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              View →
            </span>
          </div>
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        toastId: `notification-${notificationWithTimestamp.id}`,
        style: {
          background: 'transparent',
          border: 'none',
          borderRadius: '6px',
          boxShadow: 'none',
          padding: '0',
          minWidth: '280px',
          maxWidth: '360px',
          cursor: 'pointer',
          position: 'relative'
        },
        onOpen: () => console.log('📢 [handleNotification] Compact toast opened'),
        onClose: () => console.log('📢 [handleNotification] Compact toast closed'),
      }
    );
    
    // Refetch stats and notifications to update UI in real time
    fetchNotificationStats();
    fetchNotifications();
  }, [fetchNotificationStats, fetchNotifications]);

  // Use the socket hook
  const socket = useNotificationSocket(userId, handleNotification);

  // Monitor socket status
  useEffect(() => {
    if (socket) {
      const handleConnect = () => {
        console.log('✅ Socket connected');
        setSocketStatus('connected');
      };
      const handleDisconnect = () => {
        console.log('🔌 Socket disconnected');
        setSocketStatus('disconnected');
      };
      const handleError = (error) => {
        console.error('❌ Socket error:', error);
        setSocketStatus('error');
      };

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('connect_error', handleError);

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('connect_error', handleError);
      };
    }
  }, [socket]);

  // Fetch notifications when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      fetchNotifications();
      fetchNotificationStats();
    }
  }, [userId, fetchNotifications, fetchNotificationStats]);

  // Debug socket status
  useEffect(() => {
    console.log('🔌 Socket status:', socketStatus);
  }, [socketStatus]);

  // Clear notifications when dropdown is closed
  const handleDropdownToggle = () => {
    setShowDropdown((prev) => !prev);
    // Fetch fresh notifications when opening dropdown
    if (!showDropdown) {
      fetchNotifications();
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${BaseUrl}/notifications/mark-read/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        await fetchNotificationStats();
        console.log('✅ Notification marked as read');
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  };

  // Handle view notification
  const handleViewNotification = async (notification) => {
    setSelectedNotification(notification);
    setShowModal(true);

    // Mark as read if not already read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedNotification(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const notificationBell = document.querySelector('[data-notification-bell]');
      if (notificationBell && !notificationBell.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Test notification function
  const testNotification = () => {
    const testNotif = {
      title: 'Test Notification',
      message: 'This is a test notification to verify socket connection',
      createdAt: new Date().toISOString(),
      id: Date.now()
    };
    handleNotification(testNotif);
  };

  
  // Test socket connection manually
  const testSocketConnection = () => {
    if (socket) {
      console.log('🧪 Testing socket connection...');
      console.log('🔗 Socket state:', socket.connected ? 'Connected' : 'Disconnected');
      console.log('🔗 Socket ID:', socket.id);
      console.log('🔗 Socket URL:', socket.io?.uri);

      if (socket.connected) {
        // Test emit
        socket.emit('test', { message: 'Test from client' });
        console.log('✅ Test message sent to server');
      } else {
        console.log('❌ Socket not connected, attempting to connect...');
        socket.connect();
      }
    } else {
      console.log('❌ No socket instance available');
    }
  };

  // Get unread count (from stats)
  const unreadCount = notificationStats.unread;

  return (
    <>
      <div style={{ position: 'relative', display: 'inline-block' }} data-notification-bell>
        {/* Enhanced Bell icon with count and status indicator */}
        <div
          onClick={handleDropdownToggle}
          style={{
            cursor: 'pointer',
            position: 'relative',
            padding: '8px',
            borderRadius: '50%',
            background: socketStatus === 'connected' 
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)' 
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
            border: `2px solid ${socketStatus === 'connected' ? '#22c55e' : '#ef4444'}`,
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          }}
          title={`Socket: ${socketStatus}`}
        >
          <div style={{
            fontSize: '16px',
            filter: socketStatus === 'connected' ? 'drop-shadow(0 2px 4px rgba(34, 197, 94, 0.3))' : 'drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3))'
          }}>
            🔔
          </div>
          
          {unreadCount > 0 && (
            <span
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                borderRadius: '50%',
                padding: '3px 6px',
                fontSize: '10px',
                position: 'absolute',
                top: -6,
                right: -6,
                minWidth: '16px',
                textAlign: 'center',
                fontWeight: 'bold',
                boxShadow: '0 4px 8px rgba(239, 68, 68, 0.4)',
                animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none'
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          
          {/* Enhanced Socket status indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: socketStatus === 'connected' 
                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' 
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              animation: socketStatus === 'connected' ? 'pulse 2s infinite' : 'none'
            }}
          />
        </div>

        {/* Enhanced Dropdown list */}
        {showDropdown && (
          <div
            style={{
              position: 'absolute',
              top: '50px',
              right: 0,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              width: '380px',
              maxHeight: '500px',
              overflowY: 'auto',
              overflowX: 'hidden',
              zIndex: 1000,
              borderRadius: '16px',
              backdropFilter: 'blur(20px)',
              animation: 'slideInDown 0.3s ease-out'
            }}
          >
            {/* Enhanced Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '16px 16px 0 0',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative background elements */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }} />
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                zIndex: 2
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    🔔
                  </div>
                  <div>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '18px', 
                      fontWeight: '600',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      Notifications
                    </h3>
                    <p style={{ 
                      margin: '4px 0 0 0', 
                      fontSize: '12px', 
                      opacity: 0.9 
                    }}>
                      {unreadCount} unread • {notificationStats.total} total
                    </p>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: socketStatus === 'connected' ? '#22c55e' : '#ef4444',
                    animation: socketStatus === 'connected' ? 'pulse 2s infinite' : 'none'
                  }} />
                  <span style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                    {socketStatus === 'connected' ? 'Live' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Test buttons for debugging */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #e2e8f0',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
            }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <button
                  onClick={testNotification}
                  style={{
                    background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(30, 64, 175, 0.3)'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  🧪 Test Notification
                </button>
                <button
                  onClick={testSocketConnection}
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(5, 150, 105, 0.3)'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  🔗 Test Socket
                </button>
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#64748b',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4px'
              }}>
                <div>Socket: {socketStatus}</div>
                <div>User ID: {userId || 'Not set'}</div>
                <div>Notifications: {notifications.length}</div>
                <div>Unread: {unreadCount}</div>
              </div>
            </div>

            {/* Enhanced Notifications list */}
            {loading ? (
              <div style={{ 
                padding: '40px 20px', 
                textAlign: 'center', 
                color: '#64748b',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #e2e8f0',
                  borderTop: '3px solid #667eea',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }} />
                <p style={{ margin: 0, fontWeight: '500' }}>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ 
                padding: '40px 20px', 
                textAlign: 'center', 
                color: '#64748b',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px',
                  opacity: 0.5
                }}>
                  🔔
                </div>
                <p style={{ margin: '0 0 8px 0', fontWeight: '600', fontSize: '16px' }}>
                  No notifications
                </p>
                <small style={{ color: '#94a3b8' }}>
                  {socketStatus === 'connected' ? 'Waiting for new notifications...' : 'Socket disconnected'}
                </small>
              </div>
            ) : (
              <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
                {notifications.map((n, index) => (
                  <div
                    key={n.id || index}
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid #f1f5f9',
                      background: n.isRead 
                        ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' 
                        : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: n.isRead ? 0.8 : 1,
                      borderLeft: n.isRead ? '4px solid transparent' : '4px solid #3b82f6',
                      position: 'relative',
                      overflow: 'hidden',
                      wordWrap: 'break-word',
                      wordBreak: 'break-word'
                    }}
                    onClick={() => handleViewNotification(n)}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateX(4px)';
                      e.target.style.background = n.isRead 
                        ? 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' 
                        : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateX(0)';
                      e.target.style.background = n.isRead 
                        ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' 
                        : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)';
                    }}
                  >
                    {/* Unread indicator */}
                    {!n.isRead && (
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        animation: 'pulse 2s infinite'
                      }} />
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', maxWidth: '100%' }}>
                      <div style={{ flex: 1, marginRight: '16px', minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px',
                          flexWrap: 'wrap'
                        }}>
                          <strong style={{
                            color: n.isRead ? '#64748b' : '#1e293b',
                            fontSize: '14px',
                            fontWeight: n.isRead ? '500' : '600',
                            lineHeight: '1.4',
                            wordBreak: 'break-word'
                          }}>
                            {n.title}
                          </strong>
                          {!n.isRead && (
                            <span style={{
                              padding: '2px 8px',
                              backgroundColor: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                              color: '#000080',
                              borderRadius: '12px',
                              fontSize: '10px',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              flexShrink: 0
                            }}>
                              NEW
                            </span>
                          )}
                        </div>
                        
                        <p style={{
                          margin: '8px 0',
                          color: n.isRead ? '#64748b' : '#374151',
                          fontSize: '13px',
                          lineHeight: '1.5',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          wordBreak: 'break-word'
                        }}>
                          {n.message}
                        </p>
                        
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '12px',
                          flexWrap: 'wrap',
                          gap: '8px'
                        }}>
                          <small style={{
                            color: n.isRead ? '#94a3b8' : '#64748b',
                            fontSize: '11px',
                            fontWeight: '500'
                          }}>
                            {new Date(n.createdAt).toLocaleString()}
                          </small>
                          <span style={{
                            color: n.isRead ? '#94a3b8' : '#3b82f6',
                            fontSize: '11px',
                            fontWeight: n.isRead ? '400' : '600'
                          }}>
                            {n.isRead ? '✓ Viewed' : 'Click to view'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Notification Details Modal */}
      {showModal && selectedNotification &&
        ReactDOM.createPortal(
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              backdropFilter: 'blur(4px)',
            }}
            onClick={handleCloseModal}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '20px',
                padding: '0',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                animation: 'modalSlideIn 0.3s ease-out',
                zIndex: 10000
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with gradient */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '24px 24px 20px 24px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Decorative elements */}
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-30px',
                  left: '-30px',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)'
                }} />

                {/* Close button */}
                <button
                  onClick={handleCloseModal}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: 'white',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s ease',
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                >
                  ×
                </button>

                {/* Title and type */}
                <div style={{ position: 'relative', zIndex: 5 }}>
                  <h2 style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '12px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {selectedNotification.title}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      padding: '6px 16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      borderRadius: '25px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}>
                      {selectedNotification.type || 'Notification'}
                    </span>
                    <span style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {new Date(selectedNotification.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content area */}
              <div style={{
                background: 'white',
                padding: '24px',
                maxHeight: '60vh',
                overflowY: 'auto'
              }}>
                {/* Message content */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    lineHeight: '1.7',
                    color: '#334155',
                    fontSize: '16px',
                    whiteSpace: 'pre-wrap',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    {selectedNotification.message}
                  </div>
                </div>

                {/* Status indicator */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  backgroundColor: selectedNotification.isRead ? '#f0fdf4' : '#fef3c7',
                  borderRadius: '12px',
                  border: `1px solid ${selectedNotification.isRead ? '#bbf7d0' : '#fde68a'}`,
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: selectedNotification.isRead ? '#22c55e' : '#f59e0b'
                    }} />
                    <span style={{
                      color: selectedNotification.isRead ? '#166534' : '#92400e',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      {selectedNotification.isRead ? '✓ Read' : '● New'}
                    </span>
                  </div>
                  <span style={{
                    color: '#64748b',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {selectedNotification.isRead ? 'Viewed' : 'Unread'}
                  </span>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  {selectedNotification.link && (
                    <a
                      href={selectedNotification.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '14px',
                        display: 'inline-block',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 6px rgba(102, 126, 234, 0.25)'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      🔗 Open Link
                    </a>
                  )}
                  <button
                    onClick={handleCloseModal}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#f1f5f9',
                      color: '#64748b',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#e2e8f0';
                      e.target.style.color = '#475569';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f1f5f9';
                      e.target.style.color = '#64748b';
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      }

      {/* Enhanced Modal animation styles */}
      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(5deg);
          }
        }
      `}</style>
    </>
  );
};

export default NotificationBell;
