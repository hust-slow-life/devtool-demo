/**
 * DevTools - Common JavaScript
 * Theme switching, navigation highlighting, and utility functions
 */

(function() {
  'use strict';

  // ============================================
  // Theme Management
  // ============================================

  const ThemeManager = {
    STORAGE_KEY: 'devtools-theme',
    LIGHT: 'light',
    DARK: 'dark',

    init() {
      const savedTheme = localStorage.getItem(this.STORAGE_KEY);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = savedTheme || (prefersDark ? this.DARK : this.LIGHT);

      this.setTheme(theme);
      this.bindEvents();
    },

    setTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(this.STORAGE_KEY, theme);
      this.updateToggleButton(theme);
    },

    toggle() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === this.DARK ? this.LIGHT : this.DARK;
      this.setTheme(next);
    },

    updateToggleButton(theme) {
      const btn = document.querySelector('.theme-toggle');
      if (btn) {
        btn.innerHTML = theme === this.DARK ? '&#9728;' : '&#9790;';
        btn.setAttribute('aria-label', theme === this.DARK ? 'Switch to light mode' : 'Switch to dark mode');
      }
    },

    bindEvents() {
      // Theme toggle button
      const btn = document.querySelector('.theme-toggle');
      if (btn) {
        btn.addEventListener('click', () => this.toggle());
      }

      // System preference change
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
          this.setTheme(e.matches ? this.DARK : this.LIGHT);
        }
      });
    }
  };

  // ============================================
  // Navigation Highlighting
  // ============================================

  const Navigation = {
    init() {
      const currentPath = window.location.pathname;
      const navLinks = document.querySelectorAll('.nav-link');

      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.endsWith(href.replace(/^\.\.\//, '').replace(/^\.\//, ''))) {
          link.classList.add('active');
        }
      });
    }
  };

  // ============================================
  // Copy to Clipboard
  // ============================================

  const Clipboard = {
    async copy(text, button) {
      try {
        await navigator.clipboard.writeText(text);
        this.showSuccess(button);
        return true;
      } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
          document.execCommand('copy');
          this.showSuccess(button);
          return true;
        } catch (e) {
          console.error('Copy failed:', e);
          return false;
        } finally {
          document.body.removeChild(textarea);
        }
      }
    },

    showSuccess(button) {
      if (!button) return;

      const originalText = button.innerHTML;
      button.innerHTML = '&#10003; Copied';
      button.classList.add('copied');

      setTimeout(() => {
        button.innerHTML = originalText;
        button.classList.remove('copied');
      }, 2000);
    }
  };

  // ============================================
  // Utility Functions
  // ============================================

  const Utils = {
    /**
     * Format file size in human readable format
     */
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';

      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Debounce function calls
     */
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    /**
     * Convert string to Uint8Array
     */
    stringToBytes(str) {
      return new TextEncoder().encode(str);
    },

    /**
     * Convert Uint8Array to string
     */
    bytesToString(bytes) {
      return new TextDecoder().decode(bytes);
    },

    /**
     * Convert Uint8Array to hex string
     */
    bytesToHex(bytes) {
      return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    },

    /**
     * Convert hex string to Uint8Array
     */
    hexToBytes(hex) {
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
      }
      return bytes;
    },

    /**
     * Escape HTML special characters
     */
    escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    },

    /**
     * Generate random bytes
     */
    getRandomBytes(length) {
      const bytes = new Uint8Array(length);
      crypto.getRandomValues(bytes);
      return bytes;
    }
  };

  // ============================================
  // Hash Functions (Web Crypto API)
  // ============================================

  const Hash = {
    /**
     * Calculate hash using Web Crypto API
     * Supports: SHA-1, SHA-256, SHA-384, SHA-512
     */
    async calculate(algorithm, data) {
      const buffer = typeof data === 'string'
        ? Utils.stringToBytes(data)
        : data;

      const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
      return new Uint8Array(hashBuffer);
    },

    async sha1(data) {
      return this.calculate('SHA-1', data);
    },

    async sha256(data) {
      return this.calculate('SHA-256', data);
    },

    async sha384(data) {
      return this.calculate('SHA-384', data);
    },

    async sha512(data) {
      return this.calculate('SHA-512', data);
    }
  };

  // ============================================
  // Base64 Functions
  // ============================================

  const Base64 = {
    /**
     * Encode string to Base64
     */
    encode(str, urlSafe = false) {
      const bytes = Utils.stringToBytes(str);
      return this.encodeBytes(bytes, urlSafe);
    },

    /**
     * Encode bytes to Base64
     */
    encodeBytes(bytes, urlSafe = false) {
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      let base64 = btoa(binary);

      if (urlSafe) {
        base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      }

      return base64;
    },

    /**
     * Decode Base64 to string
     */
    decode(base64, urlSafe = false) {
      const bytes = this.decodeToBytes(base64, urlSafe);
      return Utils.bytesToString(bytes);
    },

    /**
     * Decode Base64 to bytes
     */
    decodeToBytes(base64, urlSafe = false) {
      if (urlSafe) {
        base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
        // Add padding if needed
        while (base64.length % 4) {
          base64 += '=';
        }
      }

      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    }
  };

  // ============================================
  // UUID Functions
  // ============================================

  const UUID = {
    /**
     * Generate UUID v4 (random)
     */
    v4() {
      const bytes = Utils.getRandomBytes(16);

      // Set version (4) and variant (10xx)
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;

      return this.format(bytes);
    },

    /**
     * Generate UUID v3 (MD5 based) - requires crypto-js
     */
    async v3(namespace, name) {
      if (typeof CryptoJS === 'undefined') {
        throw new Error('CryptoJS is required for UUID v3');
      }

      const nsBytes = this.parse(namespace);
      const nameBytes = Utils.stringToBytes(name);
      const combined = new Uint8Array(nsBytes.length + nameBytes.length);
      combined.set(nsBytes);
      combined.set(nameBytes, nsBytes.length);

      // MD5 hash
      const wordArray = CryptoJS.lib.WordArray.create(combined);
      const hash = CryptoJS.MD5(wordArray);
      const bytes = this.wordArrayToBytes(hash);

      // Set version (3) and variant (10xx)
      bytes[6] = (bytes[6] & 0x0f) | 0x30;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;

      return this.format(bytes);
    },

    /**
     * Generate UUID v5 (SHA-1 based)
     */
    async v5(namespace, name) {
      const nsBytes = this.parse(namespace);
      const nameBytes = Utils.stringToBytes(name);
      const combined = new Uint8Array(nsBytes.length + nameBytes.length);
      combined.set(nsBytes);
      combined.set(nameBytes, nsBytes.length);

      // SHA-1 hash
      const hashBytes = await Hash.sha1(combined);
      const bytes = hashBytes.slice(0, 16);

      // Set version (5) and variant (10xx)
      bytes[6] = (bytes[6] & 0x0f) | 0x50;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;

      return this.format(bytes);
    },

    /**
     * Parse UUID string to bytes
     */
    parse(uuid) {
      const hex = uuid.replace(/-/g, '');
      return Utils.hexToBytes(hex);
    },

    /**
     * Format bytes as UUID string
     */
    format(bytes) {
      const hex = Utils.bytesToHex(bytes);
      return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20, 32)
      ].join('-');
    },

    /**
     * Convert CryptoJS WordArray to Uint8Array
     */
    wordArrayToBytes(wordArray) {
      const words = wordArray.words;
      const sigBytes = wordArray.sigBytes;
      const bytes = new Uint8Array(sigBytes);

      for (let i = 0; i < sigBytes; i++) {
        bytes[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
      }

      return bytes;
    },

    // Standard namespaces
    NAMESPACE_DNS: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    NAMESPACE_URL: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
    NAMESPACE_OID: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
    NAMESPACE_X500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8'
  };

  // ============================================
  // Initialize on DOM Ready
  // ============================================

  function init() {
    ThemeManager.init();
    Navigation.init();

    // Bind copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const target = this.dataset.target;
        const text = target
          ? document.querySelector(target)?.textContent
          : this.closest('.result-box, .code-panel')?.querySelector('pre, code')?.textContent;

        if (text) {
          Clipboard.copy(text, this);
        }
      });
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ============================================
  // Export to global scope
  // ============================================

  window.DevTools = {
    ThemeManager,
    Clipboard,
    Utils,
    Hash,
    Base64,
    UUID
  };

})();
