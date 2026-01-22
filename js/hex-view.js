/**
 * DevTools - HEX View Component
 * Displays binary data in hexadecimal format with ASCII representation
 */

(function() {
  'use strict';

  class HexView {
    /**
     * Create a HexView instance
     * @param {HTMLElement|string} container - Container element or selector
     * @param {Object} options - Configuration options
     */
    constructor(container, options = {}) {
      this.container = typeof container === 'string'
        ? document.querySelector(container)
        : container;

      if (!this.container) {
        throw new Error('HexView: Container element not found');
      }

      this.options = {
        bytesPerRow: options.bytesPerRow || 16,
        showHeader: options.showHeader !== false,
        showAscii: options.showAscii !== false,
        maxRows: options.maxRows || 100,
        ...options
      };

      this.data = null;
      this.highlightedIndex = -1;

      this.init();
    }

    /**
     * Initialize the component
     */
    init() {
      this.container.classList.add('hex-view');
      this.render();
    }

    /**
     * Set data to display
     * @param {Uint8Array|ArrayBuffer|string} data - Data to display
     */
    setData(data) {
      if (typeof data === 'string') {
        this.data = new TextEncoder().encode(data);
      } else if (data instanceof ArrayBuffer) {
        this.data = new Uint8Array(data);
      } else if (data instanceof Uint8Array) {
        this.data = data;
      } else {
        this.data = null;
      }

      this.render();
    }

    /**
     * Clear the display
     */
    clear() {
      this.data = null;
      this.render();
    }

    /**
     * Render the hex view
     */
    render() {
      if (!this.data || this.data.length === 0) {
        this.container.innerHTML = `
          <div class="hex-view-header">
            <span>HEX View</span>
            <span>No data</span>
          </div>
          <div class="hex-view-content">
            <p style="color: var(--color-text-muted); text-align: center; padding: 2rem;">
              No data to display
            </p>
          </div>
        `;
        return;
      }

      const totalBytes = this.data.length;
      const displayBytes = Math.min(totalBytes, this.options.bytesPerRow * this.options.maxRows);
      const truncated = totalBytes > displayBytes;

      let html = '';

      // Header
      if (this.options.showHeader) {
        html += `
          <div class="hex-view-header">
            <span>HEX View</span>
            <span>${this.formatSize(totalBytes)}${truncated ? ' (truncated)' : ''}</span>
          </div>
        `;
      }

      // Content
      html += '<div class="hex-view-content">';

      for (let offset = 0; offset < displayBytes; offset += this.options.bytesPerRow) {
        const rowBytes = this.data.slice(offset, Math.min(offset + this.options.bytesPerRow, displayBytes));
        html += this.renderRow(offset, rowBytes);
      }

      if (truncated) {
        html += `
          <div class="hex-row" style="color: var(--color-text-muted); font-style: italic;">
            ... ${totalBytes - displayBytes} more bytes ...
          </div>
        `;
      }

      html += '</div>';

      this.container.innerHTML = html;
      this.bindEvents();
    }

    /**
     * Render a single row
     * @param {number} offset - Byte offset
     * @param {Uint8Array} bytes - Row bytes
     * @returns {string} HTML string
     */
    renderRow(offset, bytes) {
      // Offset column
      const offsetHex = offset.toString(16).toUpperCase().padStart(8, '0');

      // Hex bytes column
      let hexHtml = '';
      for (let i = 0; i < this.options.bytesPerRow; i++) {
        if (i < bytes.length) {
          const byte = bytes[i];
          const hex = byte.toString(16).toUpperCase().padStart(2, '0');
          hexHtml += `<span class="hex-byte" data-index="${offset + i}">${hex}</span>`;
        } else {
          hexHtml += '<span class="hex-byte">&nbsp;&nbsp;</span>';
        }

        // Add extra space every 8 bytes
        if (i === 7) {
          hexHtml += '&nbsp;';
        }
      }

      // ASCII column
      let asciiHtml = '';
      if (this.options.showAscii) {
        for (let i = 0; i < bytes.length; i++) {
          const byte = bytes[i];
          const char = this.byteToAscii(byte);
          const isPrintable = byte >= 32 && byte <= 126;
          asciiHtml += `<span class="hex-ascii-char${isPrintable ? '' : ' non-printable'}" data-index="${offset + i}">${char}</span>`;
        }
      }

      return `
        <div class="hex-row">
          <span class="hex-offset">${offsetHex}</span>
          <span class="hex-bytes">${hexHtml}</span>
          ${this.options.showAscii ? `<span class="hex-ascii">${asciiHtml}</span>` : ''}
        </div>
      `;
    }

    /**
     * Convert byte to ASCII character
     * @param {number} byte - Byte value
     * @returns {string} ASCII character or dot
     */
    byteToAscii(byte) {
      if (byte >= 32 && byte <= 126) {
        // Escape HTML special characters
        if (byte === 60) return '&lt;';
        if (byte === 62) return '&gt;';
        if (byte === 38) return '&amp;';
        return String.fromCharCode(byte);
      }
      return '.';
    }

    /**
     * Format file size
     * @param {number} bytes - Size in bytes
     * @returns {string} Formatted size
     */
    formatSize(bytes) {
      if (bytes === 0) return '0 Bytes';

      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Bind hover events for highlighting
     */
    bindEvents() {
      const hexBytes = this.container.querySelectorAll('.hex-byte[data-index]');
      const asciiChars = this.container.querySelectorAll('.hex-ascii-char[data-index]');

      const highlight = (index) => {
        // Remove previous highlight
        this.container.querySelectorAll('.highlight').forEach(el => {
          el.classList.remove('highlight');
        });

        if (index >= 0) {
          // Add highlight to hex byte
          const hexByte = this.container.querySelector(`.hex-byte[data-index="${index}"]`);
          if (hexByte) hexByte.classList.add('highlight');

          // Add highlight to ASCII char
          const asciiChar = this.container.querySelector(`.hex-ascii-char[data-index="${index}"]`);
          if (asciiChar) asciiChar.classList.add('highlight');
        }

        this.highlightedIndex = index;
      };

      hexBytes.forEach(el => {
        el.addEventListener('mouseenter', () => {
          highlight(parseInt(el.dataset.index, 10));
        });
        el.addEventListener('mouseleave', () => {
          highlight(-1);
        });
      });

      asciiChars.forEach(el => {
        el.addEventListener('mouseenter', () => {
          highlight(parseInt(el.dataset.index, 10));
        });
        el.addEventListener('mouseleave', () => {
          highlight(-1);
        });
      });
    }

    /**
     * Get the currently displayed data
     * @returns {Uint8Array|null}
     */
    getData() {
      return this.data;
    }

    /**
     * Get data as hex string
     * @returns {string}
     */
    getHexString() {
      if (!this.data) return '';
      return Array.from(this.data)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }
  }

  // Export to global scope
  window.HexView = HexView;

})();
