/**
 * DevTools - File Upload Component
 * Drag and drop file upload with size validation
 */

(function() {
  'use strict';

  class FileUpload {
    /**
     * Create a FileUpload instance
     * @param {HTMLElement|string} container - Container element or selector
     * @param {Object} options - Configuration options
     */
    constructor(container, options = {}) {
      this.container = typeof container === 'string'
        ? document.querySelector(container)
        : container;

      if (!this.container) {
        throw new Error('FileUpload: Container element not found');
      }

      this.options = {
        maxSize: options.maxSize || 50 * 1024 * 1024, // 50MB default
        accept: options.accept || '*/*',
        multiple: options.multiple || false,
        dropText: options.dropText || 'Drag and drop a file here',
        browseText: options.browseText || 'or click to browse',
        onFile: options.onFile || null,
        onError: options.onError || null,
        ...options
      };

      this.file = null;
      this.fileData = null;

      this.init();
    }

    /**
     * Initialize the component
     */
    init() {
      this.render();
      this.bindEvents();
    }

    /**
     * Render the component
     */
    render() {
      this.container.innerHTML = `
        <div class="file-upload" role="button" tabindex="0">
          <div class="file-upload-icon">&#128206;</div>
          <p>${this.options.dropText}</p>
          <p class="file-upload-hint">${this.options.browseText}</p>
          <p class="file-upload-hint">Max size: ${this.formatSize(this.options.maxSize)}</p>
          <input type="file"
                 accept="${this.options.accept}"
                 ${this.options.multiple ? 'multiple' : ''}>
        </div>
        <div class="file-info hidden">
          <div>
            <div class="file-info-name"></div>
            <div class="file-info-size"></div>
          </div>
          <button class="btn btn-sm btn-secondary file-remove">Remove</button>
        </div>
      `;

      this.dropZone = this.container.querySelector('.file-upload');
      this.fileInput = this.container.querySelector('input[type="file"]');
      this.fileInfo = this.container.querySelector('.file-info');
      this.fileNameEl = this.container.querySelector('.file-info-name');
      this.fileSizeEl = this.container.querySelector('.file-info-size');
      this.removeBtn = this.container.querySelector('.file-remove');
    }

    /**
     * Bind events
     */
    bindEvents() {
      // Click to browse
      this.dropZone.addEventListener('click', () => {
        this.fileInput.click();
      });

      // Keyboard accessibility
      this.dropZone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.fileInput.click();
        }
      });

      // File input change
      this.fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.handleFile(e.target.files[0]);
        }
      });

      // Drag and drop
      this.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.add('dragover');
      });

      this.dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.remove('dragover');
      });

      this.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.remove('dragover');

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          this.handleFile(e.dataTransfer.files[0]);
        }
      });

      // Remove button
      this.removeBtn.addEventListener('click', () => {
        this.clear();
      });
    }

    /**
     * Handle file selection
     * @param {File} file - Selected file
     */
    async handleFile(file) {
      // Validate size
      if (file.size > this.options.maxSize) {
        const error = `File size (${this.formatSize(file.size)}) exceeds the maximum allowed size (${this.formatSize(this.options.maxSize)})`;
        this.showError(error);
        if (this.options.onError) {
          this.options.onError(new Error(error));
        }
        return;
      }

      this.file = file;

      // Update UI
      this.fileNameEl.textContent = file.name;
      this.fileSizeEl.textContent = this.formatSize(file.size);
      this.dropZone.classList.add('hidden');
      this.fileInfo.classList.remove('hidden');

      // Read file data
      try {
        this.fileData = await this.readFile(file);

        if (this.options.onFile) {
          this.options.onFile(file, this.fileData);
        }
      } catch (err) {
        this.showError('Failed to read file');
        if (this.options.onError) {
          this.options.onError(err);
        }
      }
    }

    /**
     * Read file as ArrayBuffer
     * @param {File} file - File to read
     * @returns {Promise<ArrayBuffer>}
     */
    readFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          resolve(reader.result);
        };

        reader.onerror = () => {
          reject(reader.error);
        };

        reader.readAsArrayBuffer(file);
      });
    }

    /**
     * Read file as text
     * @param {File} file - File to read
     * @param {string} encoding - Text encoding
     * @returns {Promise<string>}
     */
    readFileAsText(file, encoding = 'utf-8') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          resolve(reader.result);
        };

        reader.onerror = () => {
          reject(reader.error);
        };

        reader.readAsText(file, encoding);
      });
    }

    /**
     * Read file as Data URL
     * @param {File} file - File to read
     * @returns {Promise<string>}
     */
    readFileAsDataURL(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          resolve(reader.result);
        };

        reader.onerror = () => {
          reject(reader.error);
        };

        reader.readAsDataURL(file);
      });
    }

    /**
     * Clear the selected file
     */
    clear() {
      this.file = null;
      this.fileData = null;
      this.fileInput.value = '';
      this.dropZone.classList.remove('hidden');
      this.fileInfo.classList.add('hidden');
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
      // Create or update error element
      let errorEl = this.container.querySelector('.file-upload-error');
      if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'info-box error file-upload-error';
        this.container.appendChild(errorEl);
      }

      errorEl.textContent = message;

      // Auto-hide after 5 seconds
      setTimeout(() => {
        errorEl.remove();
      }, 5000);
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
     * Get the selected file
     * @returns {File|null}
     */
    getFile() {
      return this.file;
    }

    /**
     * Get the file data as ArrayBuffer
     * @returns {ArrayBuffer|null}
     */
    getData() {
      return this.fileData;
    }

    /**
     * Get the file data as Uint8Array
     * @returns {Uint8Array|null}
     */
    getBytes() {
      return this.fileData ? new Uint8Array(this.fileData) : null;
    }

    /**
     * Set accepted file types
     * @param {string} accept - Accept attribute value
     */
    setAccept(accept) {
      this.options.accept = accept;
      this.fileInput.setAttribute('accept', accept);
    }

    /**
     * Set maximum file size
     * @param {number} maxSize - Max size in bytes
     */
    setMaxSize(maxSize) {
      this.options.maxSize = maxSize;
      const hintEl = this.container.querySelector('.file-upload-hint:last-of-type');
      if (hintEl) {
        hintEl.textContent = `Max size: ${this.formatSize(maxSize)}`;
      }
    }
  }

  // Export to global scope
  window.FileUpload = FileUpload;

})();
