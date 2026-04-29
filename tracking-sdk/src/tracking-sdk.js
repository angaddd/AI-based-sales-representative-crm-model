/**
 * Tracking SDK - Captures user behavior and sends to backend
 * Usage: Include <script src="tracking-sdk.js"></script> in HTML
 * Then use: window.trackingSDK.trackEvent(eventType, data)
 */

(function() {
  'use strict';

  class TrackingSDK {
    constructor(config = {}) {
      // Configuration
      this.apiEndpoint = config.apiEndpoint || 'http://localhost:8000/api/crm/events/track/';
      this.companyId = config.companyId || 'default';
      this.debug = config.debug || false;
      
      // Session management
      this.sessionId = this.generateSessionId();
      this.userId = this.getOrCreateUserId();
      this.startTime = Date.now();
      this.lastActivityTime = Date.now();
      this.pageDepth = 0;
      
      // Storage
      this.eventQueue = [];
      this.sessionData = {
        visits: 0,
        clicks: 0,
        timeSpent: 0,
        pagesVisited: [],
      };
      
      // Initialize tracking
      this.init();
    }

    init() {
      this.log('SDK Initialized', { sessionId: this.sessionId, userId: this.userId });
      
      // Track page view
      this.trackPageView();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Setup periodic tasks
      this.setupPeriodicTasks();
      
      // Expose to global scope
      window.trackingSDK = this;
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
      return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get or create user ID from localStorage
     */
    getOrCreateUserId() {
      let userId = localStorage.getItem('tracking_user_id');
      
      if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('tracking_user_id', userId);
      }
      
      return userId;
    }

    /**
     * Setup DOM event listeners
     */
    setupEventListeners() {
      // Track clicks on buttons, links, and interactive elements
      document.addEventListener('click', (e) => {
        const target = e.target;
        const clickable = target.closest('button, a, [role="button"], [onclick]');
        
        if (clickable) {
          this.trackClick(clickable);
        }
      });

      // Track form submissions
      document.addEventListener('submit', (e) => {
        this.trackEvent('form_submit', {
          form_id: e.target.id,
          form_name: e.target.name,
          url: window.location.href,
        });
      });

      // Track form focus (start)
      document.addEventListener('focus', (e) => {
        if (e.target.matches('input, textarea, select')) {
          this.trackEvent('form_start', {
            element_id: e.target.id,
            element_name: e.target.name,
            url: window.location.href,
          });
        }
      }, true);

      // Track scroll for engagement
      let scrollTimeout;
      window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
          if (scrollPercent > 50) {
            this.trackEvent('scroll', {
              scroll_percent: scrollPercent,
              url: window.location.href,
            });
          }
        }, 500);
      });

      // Track page unload (for time spent)
      window.addEventListener('beforeunload', () => {
        this.trackTimeSpent();
      });

      // Track visibility changes
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.trackTimeSpent();
        } else {
          this.lastActivityTime = Date.now();
        }
      });
    }

    /**
     * Setup periodic tasks
     */
    setupPeriodicTasks() {
      // Send queued events every 30 seconds
      setInterval(() => {
        if (this.eventQueue.length > 0) {
          this.sendQueuedEvents();
        }
      }, 30000);

      // Track time spent every minute
      setInterval(() => {
        const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
        if (timeSpent % 60 === 0) {
          this.trackEvent('time_spent', {
            seconds: timeSpent,
          });
        }
      }, 60000);
    }

    /**
     * Track page view event
     */
    trackPageView() {
      this.pageDepth++;
      this.sessionData.visits++;
      
      if (!this.sessionData.pagesVisited.includes(window.location.href)) {
        this.sessionData.pagesVisited.push(window.location.href);
      }

      this.trackEvent('page_view', {
        title: document.title,
        url: window.location.href,
        page_depth: this.pageDepth,
        referrer: document.referrer,
      });
    }

    /**
     * Track click event
     */
    trackClick(element) {
      this.sessionData.clicks++;
      
      let elementText = element.textContent?.substring(0, 100) || '';
      let elementId = element.id || '';
      let href = element.href || '';
      
      this.trackEvent('click', {
        element_id: elementId,
        element_text: elementText,
        element_type: element.tagName,
        href: href,
        url: window.location.href,
        page_depth: this.pageDepth,
      });
    }

    /**
     * Track time spent on page
     */
    trackTimeSpent() {
      const timeSpentMs = Date.now() - this.startTime;
      const timeSpentSeconds = Math.floor(timeSpentMs / 1000);
      
      if (timeSpentSeconds > 0) {
        this.sessionData.timeSpent += timeSpentSeconds;
        this.trackEvent('time_spent', {
          seconds: timeSpentSeconds,
          url: window.location.href,
        });
      }
    }

    /**
     * Main event tracking method
     */
    trackEvent(eventType, eventData = {}) {
      const timestamp = new Date().toISOString();
      
      const event = {
        unique_identifier: this.userId,
        event_type: eventType,
        event_data: {
          ...eventData,
          timestamp: timestamp,
          user_agent: navigator.userAgent,
          language: navigator.language,
        },
        session_id: this.sessionId,
        url: window.location.href,
        page_depth: this.pageDepth,
      };

      this.eventQueue.push(event);
      this.log('Event tracked:', event);

      // Send immediately for high-priority events
      if (['complete_purchase', 'start_checkout', 'add_to_cart'].includes(eventType)) {
        this.sendEvent(event);
      } else if (this.eventQueue.length >= 10) {
        // Send in batch if queue is full
        this.sendQueuedEvents();
      }
    }

    /**
     * Send a single event
     */
    sendEvent(event) {
      if (!this.isOnline()) {
        this.log('Offline - event queued for later');
        return;
      }

      fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken() || ''}`,
        },
        body: JSON.stringify(event),
      })
        .then((response) => {
          if (response.ok) {
            this.log('Event sent successfully');
          } else {
            this.log('Failed to send event:', response.status);
            this.eventQueue.push(event);
          }
        })
        .catch((error) => {
          this.log('Error sending event:', error);
          this.eventQueue.push(event);
        });
    }

    /**
     * Send all queued events in batch
     */
    sendQueuedEvents() {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift();
        this.sendEvent(event);
      }
    }

    /**
     * Check if online
     */
    isOnline() {
      return navigator.onLine;
    }

    /**
     * Try to get auth token from browser storage or header
     */
    getAuthToken() {
      return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    }

    /**
     * Debug logging
     */
    log(message, data) {
      if (this.debug) {
        console.log(`[TrackingSDK] ${message}`, data || '');
      }
    }

    /**
     * Get session data
     */
    getSessionData() {
      return this.sessionData;
    }

    /**
     * Reset session
     */
    resetSession() {
      this.sessionId = this.generateSessionId();
      this.startTime = Date.now();
      this.sessionData = {
        visits: 0,
        clicks: 0,
        timeSpent: 0,
        pagesVisited: [],
      };
      this.log('Session reset');
    }
  }

  // Initialize SDK on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.trackingSDK = new TrackingSDK({
        apiEndpoint: 'http://localhost:8000/api/crm/events/track/',
        debug: false,
      });
    });
  } else {
    // Already loaded
    window.trackingSDK = new TrackingSDK({
      apiEndpoint: 'http://localhost:8000/api/crm/events/track/',
      debug: false,
    });
  }
})();
