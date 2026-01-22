/**
 * DevTools - Code Tabs Component
 * Multi-language code example switcher with copy functionality
 */

(function() {
  'use strict';

  class CodeTabs {
    /**
     * Create a CodeTabs instance
     * @param {HTMLElement|string} container - Container element or selector
     * @param {Object} options - Configuration options
     */
    constructor(container, options = {}) {
      this.container = typeof container === 'string'
        ? document.querySelector(container)
        : container;

      if (!this.container) {
        throw new Error('CodeTabs: Container element not found');
      }

      this.options = {
        defaultTab: options.defaultTab || 0,
        ...options
      };

      this.tabs = [];
      this.activeIndex = 0;

      this.init();
    }

    /**
     * Initialize the component
     */
    init() {
      this.container.classList.add('code-tabs');
    }

    /**
     * Set code examples
     * @param {Array<Object>} examples - Array of {lang, label, code}
     */
    setExamples(examples) {
      this.tabs = examples.map((ex, index) => ({
        lang: ex.lang || `lang-${index}`,
        label: ex.label || ex.lang || `Tab ${index + 1}`,
        code: ex.code || ''
      }));

      this.activeIndex = Math.min(this.options.defaultTab, this.tabs.length - 1);
      this.render();
    }

    /**
     * Render the component
     */
    render() {
      if (this.tabs.length === 0) {
        this.container.innerHTML = `
          <div class="code-tabs-header">
            <button class="code-tab active">Code</button>
          </div>
          <div class="code-panel active">
            <pre><code>No code examples available</code></pre>
          </div>
        `;
        return;
      }

      let html = '<div class="code-tabs-header">';

      // Render tabs
      this.tabs.forEach((tab, index) => {
        html += `
          <button class="code-tab${index === this.activeIndex ? ' active' : ''}"
                  data-index="${index}">
            ${this.escapeHtml(tab.label)}
          </button>
        `;
      });

      html += '</div>';

      // Render panels
      this.tabs.forEach((tab, index) => {
        html += `
          <div class="code-panel${index === this.activeIndex ? ' active' : ''}"
               data-index="${index}">
            <button class="copy-btn" data-index="${index}">&#128203; Copy</button>
            <pre><code class="language-${tab.lang}">${this.escapeHtml(tab.code)}</code></pre>
          </div>
        `;
      });

      this.container.innerHTML = html;
      this.bindEvents();
    }

    /**
     * Bind click events
     */
    bindEvents() {
      // Tab click
      this.container.querySelectorAll('.code-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          const index = parseInt(tab.dataset.index, 10);
          this.setActiveTab(index);
        });
      });

      // Copy button click
      this.container.querySelectorAll('.code-panel .copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.dataset.index, 10);
          this.copyCode(index, btn);
        });
      });
    }

    /**
     * Set active tab
     * @param {number} index - Tab index
     */
    setActiveTab(index) {
      if (index < 0 || index >= this.tabs.length) return;

      this.activeIndex = index;

      // Update tab buttons
      this.container.querySelectorAll('.code-tab').forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
      });

      // Update panels
      this.container.querySelectorAll('.code-panel').forEach((panel, i) => {
        panel.classList.toggle('active', i === index);
      });
    }

    /**
     * Copy code to clipboard
     * @param {number} index - Tab index
     * @param {HTMLElement} button - Copy button element
     */
    async copyCode(index, button) {
      if (index < 0 || index >= this.tabs.length) return;

      const code = this.tabs[index].code;

      try {
        await navigator.clipboard.writeText(code);
        this.showCopySuccess(button);
      } catch (err) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
          document.execCommand('copy');
          this.showCopySuccess(button);
        } catch (e) {
          console.error('Copy failed:', e);
        } finally {
          document.body.removeChild(textarea);
        }
      }
    }

    /**
     * Show copy success feedback
     * @param {HTMLElement} button - Copy button element
     */
    showCopySuccess(button) {
      const originalText = button.innerHTML;
      button.innerHTML = '&#10003; Copied';
      button.classList.add('copied');

      setTimeout(() => {
        button.innerHTML = originalText;
        button.classList.remove('copied');
      }, 2000);
    }

    /**
     * Escape HTML special characters
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    /**
     * Get current active tab index
     * @returns {number}
     */
    getActiveIndex() {
      return this.activeIndex;
    }

    /**
     * Get code of current active tab
     * @returns {string}
     */
    getActiveCode() {
      return this.tabs[this.activeIndex]?.code || '';
    }
  }

  // Predefined code templates
  CodeTabs.templates = {
    unixTimestamp: {
      javascript: `// Get current Unix timestamp (seconds)
const timestampSeconds = Math.floor(Date.now() / 1000);

// Get current Unix timestamp (milliseconds)
const timestampMs = Date.now();

// Convert timestamp to Date
const date = new Date(timestampSeconds * 1000);

// Convert Date to timestamp
const timestamp = Math.floor(date.getTime() / 1000);`,

      python: `import time
from datetime import datetime

# Get current Unix timestamp (seconds)
timestamp_seconds = int(time.time())

# Get current Unix timestamp (milliseconds)
timestamp_ms = int(time.time() * 1000)

# Convert timestamp to datetime
dt = datetime.fromtimestamp(timestamp_seconds)

# Convert datetime to timestamp
timestamp = int(dt.timestamp())`,

      java: `import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

// Get current Unix timestamp (seconds)
long timestampSeconds = Instant.now().getEpochSecond();

// Get current Unix timestamp (milliseconds)
long timestampMs = System.currentTimeMillis();

// Convert timestamp to LocalDateTime
LocalDateTime dateTime = LocalDateTime.ofInstant(
    Instant.ofEpochSecond(timestampSeconds),
    ZoneId.systemDefault()
);

// Convert LocalDateTime to timestamp
long timestamp = dateTime.atZone(ZoneId.systemDefault())
    .toInstant().getEpochSecond();`,

      swift: `import Foundation

// Get current Unix timestamp (seconds)
let timestampSeconds = Int(Date().timeIntervalSince1970)

// Get current Unix timestamp (milliseconds)
let timestampMs = Int(Date().timeIntervalSince1970 * 1000)

// Convert timestamp to Date
let date = Date(timeIntervalSince1970: TimeInterval(timestampSeconds))

// Convert Date to timestamp
let timestamp = Int(date.timeIntervalSince1970)`,

      go: `package main

import (
    "time"
)

func main() {
    // Get current Unix timestamp (seconds)
    timestampSeconds := time.Now().Unix()

    // Get current Unix timestamp (milliseconds)
    timestampMs := time.Now().UnixMilli()

    // Convert timestamp to Time
    t := time.Unix(timestampSeconds, 0)

    // Convert Time to timestamp
    timestamp := t.Unix()
}`
    },

    base64: {
      javascript: `// Encode string to Base64
const encoded = btoa('Hello, World!');
// With UTF-8 support
const encodedUtf8 = btoa(unescape(encodeURIComponent('Hello, \u4e16\u754c!')));

// Decode Base64 to string
const decoded = atob(encoded);
// With UTF-8 support
const decodedUtf8 = decodeURIComponent(escape(atob(encodedUtf8)));

// URL-safe Base64
const urlSafe = encoded.replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=/g, '');`,

      python: `import base64

# Encode string to Base64
encoded = base64.b64encode('Hello, World!'.encode()).decode()

# Decode Base64 to string
decoded = base64.b64decode(encoded).decode()

# URL-safe Base64
url_safe_encoded = base64.urlsafe_b64encode('Hello, World!'.encode()).decode()
url_safe_decoded = base64.urlsafe_b64decode(url_safe_encoded).decode()`,

      java: `import java.util.Base64;
import java.nio.charset.StandardCharsets;

// Encode string to Base64
String encoded = Base64.getEncoder()
    .encodeToString("Hello, World!".getBytes(StandardCharsets.UTF_8));

// Decode Base64 to string
byte[] decodedBytes = Base64.getDecoder().decode(encoded);
String decoded = new String(decodedBytes, StandardCharsets.UTF_8);

// URL-safe Base64
String urlSafe = Base64.getUrlEncoder()
    .encodeToString("Hello, World!".getBytes(StandardCharsets.UTF_8));`,

      swift: `import Foundation

// Encode string to Base64
let data = "Hello, World!".data(using: .utf8)!
let encoded = data.base64EncodedString()

// Decode Base64 to string
let decodedData = Data(base64Encoded: encoded)!
let decoded = String(data: decodedData, encoding: .utf8)!`,

      go: `package main

import (
    "encoding/base64"
)

func main() {
    // Encode string to Base64
    encoded := base64.StdEncoding.EncodeToString([]byte("Hello, World!"))

    // Decode Base64 to string
    decoded, _ := base64.StdEncoding.DecodeString(encoded)

    // URL-safe Base64
    urlSafe := base64.URLEncoding.EncodeToString([]byte("Hello, World!"))
}`
    },

    urlEncode: {
      javascript: `// encodeURIComponent - encodes all special characters
const encoded1 = encodeURIComponent('Hello World! @#$');
// Result: "Hello%20World!%20%40%23%24"

// encodeURI - preserves URI structure characters
const encoded2 = encodeURI('https://example.com/path?q=hello world');
// Result: "https://example.com/path?q=hello%20world"

// escape (deprecated) - does not encode @*/+
const encoded3 = escape('Hello World! @#$');
// Result: "Hello%20World%21%20@%23%24"

// Decode
const decoded = decodeURIComponent(encoded1);`,

      python: `from urllib.parse import quote, quote_plus, unquote

# quote - similar to encodeURIComponent
encoded1 = quote('Hello World! @#$')
# Result: "Hello%20World%21%20%40%23%24"

# quote_plus - encodes spaces as +
encoded2 = quote_plus('Hello World! @#$')
# Result: "Hello+World%21+%40%23%24"

# Decode
decoded = unquote(encoded1)`,

      java: `import java.net.URLEncoder;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

// Encode (spaces become +)
String encoded = URLEncoder.encode("Hello World! @#$",
    StandardCharsets.UTF_8);
// Result: "Hello+World%21+%40%23%24"

// Replace + with %20 if needed
String encoded2 = encoded.replace("+", "%20");

// Decode
String decoded = URLDecoder.decode(encoded, StandardCharsets.UTF_8);`,

      swift: `import Foundation

// Encode
let original = "Hello World! @#$"
let encoded = original.addingPercentEncoding(
    withAllowedCharacters: .urlQueryAllowed
)!
// Result: "Hello%20World!%20@%23$"

// Encode all special characters
let fullyEncoded = original.addingPercentEncoding(
    withAllowedCharacters: .alphanumerics
)!

// Decode
let decoded = encoded.removingPercentEncoding!`,

      go: `package main

import (
    "net/url"
)

func main() {
    // Encode (QueryEscape encodes space as +)
    encoded := url.QueryEscape("Hello World! @#$")
    // Result: "Hello+World%21+%40%23%24"

    // PathEscape encodes space as %20
    encoded2 := url.PathEscape("Hello World! @#$")

    // Decode
    decoded, _ := url.QueryUnescape(encoded)
}`
    },

    hash: {
      javascript: `// Using Web Crypto API (SHA-256)
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Usage
const hash = await sha256('Hello, World!');`,

      python: `import hashlib

# MD5
md5_hash = hashlib.md5('Hello, World!'.encode()).hexdigest()

# SHA-1
sha1_hash = hashlib.sha1('Hello, World!'.encode()).hexdigest()

# SHA-256
sha256_hash = hashlib.sha256('Hello, World!'.encode()).hexdigest()

# SHA-512
sha512_hash = hashlib.sha512('Hello, World!'.encode()).hexdigest()

# SHA-3 (256)
sha3_hash = hashlib.sha3_256('Hello, World!'.encode()).hexdigest()`,

      java: `import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;

public String hash(String input, String algorithm) throws Exception {
    MessageDigest md = MessageDigest.getInstance(algorithm);
    byte[] hashBytes = md.digest(input.getBytes(StandardCharsets.UTF_8));

    StringBuilder sb = new StringBuilder();
    for (byte b : hashBytes) {
        sb.append(String.format("%02x", b));
    }
    return sb.toString();
}

// Usage
String md5 = hash("Hello, World!", "MD5");
String sha256 = hash("Hello, World!", "SHA-256");`,

      swift: `import CryptoKit
import Foundation

let data = "Hello, World!".data(using: .utf8)!

// SHA-256
let sha256 = SHA256.hash(data: data)
let sha256Hex = sha256.map { String(format: "%02x", $0) }.joined()

// SHA-384
let sha384 = SHA384.hash(data: data)

// SHA-512
let sha512 = SHA512.hash(data: data)

// MD5 (Insecure, for compatibility only)
import var CommonCrypto.CC_MD5_DIGEST_LENGTH
import func CommonCrypto.CC_MD5`,

      go: `package main

import (
    "crypto/md5"
    "crypto/sha1"
    "crypto/sha256"
    "crypto/sha512"
    "encoding/hex"
)

func main() {
    data := []byte("Hello, World!")

    // MD5
    md5Hash := md5.Sum(data)
    md5Hex := hex.EncodeToString(md5Hash[:])

    // SHA-1
    sha1Hash := sha1.Sum(data)
    sha1Hex := hex.EncodeToString(sha1Hash[:])

    // SHA-256
    sha256Hash := sha256.Sum256(data)
    sha256Hex := hex.EncodeToString(sha256Hash[:])

    // SHA-512
    sha512Hash := sha512.Sum512(data)
    sha512Hex := hex.EncodeToString(sha512Hash[:])
}`
    },

    uuid: {
      javascript: `// Generate UUID v4 (random)
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Using crypto API (more secure)
function uuidv4Crypto() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

const uuid = uuidv4();`,

      python: `import uuid

# UUID v4 (random)
uuid4 = uuid.uuid4()

# UUID v3 (MD5 namespace)
uuid3 = uuid.uuid3(uuid.NAMESPACE_DNS, 'example.com')

# UUID v5 (SHA-1 namespace)
uuid5 = uuid.uuid5(uuid.NAMESPACE_DNS, 'example.com')

# UUID v1 (timestamp + MAC)
uuid1 = uuid.uuid1()

# Parse UUID string
parsed = uuid.UUID('550e8400-e29b-41d4-a716-446655440000')`,

      java: `import java.util.UUID;

// UUID v4 (random)
UUID uuid4 = UUID.randomUUID();

// UUID v3 (MD5 namespace)
UUID uuid3 = UUID.nameUUIDFromBytes(
    ("example.com").getBytes()
);

// Parse UUID string
UUID parsed = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");

// Get UUID components
long mostSig = uuid4.getMostSignificantBits();
long leastSig = uuid4.getLeastSignificantBits();`,

      swift: `import Foundation

// Generate UUID v4 (random)
let uuid = UUID()
let uuidString = uuid.uuidString

// Parse UUID string
if let parsed = UUID(uuidString: "550e8400-e29b-41d4-a716-446655440000") {
    print(parsed)
}

// Get UUID bytes
var bytes = [UInt8](repeating: 0, count: 16)
(uuid as NSUUID).getBytes(&bytes)`,

      go: `package main

import (
    "github.com/google/uuid"
)

func main() {
    // UUID v4 (random)
    uuid4 := uuid.New()

    // UUID v3 (MD5 namespace)
    uuid3 := uuid.NewMD5(uuid.NameSpaceDNS, []byte("example.com"))

    // UUID v5 (SHA-1 namespace)
    uuid5 := uuid.NewSHA1(uuid.NameSpaceDNS, []byte("example.com"))

    // Parse UUID string
    parsed, _ := uuid.Parse("550e8400-e29b-41d4-a716-446655440000")

    // Check UUID version
    version := uuid4.Version()
}`
    },

    password: {
      bash: `# 使用 /dev/urandom 生成随机密码
# 生成 16 位包含大小写字母和数字的密码
tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 16; echo

# 生成包含特殊字符的密码
tr -dc 'A-Za-z0-9!@#$%^&*' < /dev/urandom | head -c 16; echo

# 使用 openssl 生成 Base64 密码
openssl rand -base64 12

# macOS: 使用 LC_ALL=C 避免编码问题
LC_ALL=C tr -dc 'A-Za-z0-9!@#$%' < /dev/urandom | head -c 16; echo`,

      javascript: `// 使用 Web Crypto API 生成安全随机密码
function generatePassword(length = 16, options = {}) {
  const {
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true
  } = options;

  let chars = '';
  if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (numbers) chars += '0123456789';
  if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, x => chars[x % chars.length]).join('');
}

// 使用示例
const password = generatePassword(16, { symbols: true });`,

      python: `import secrets
import string

def generate_password(length=16, uppercase=True, lowercase=True,
                      numbers=True, symbols=True):
    chars = ''
    if uppercase: chars += string.ascii_uppercase
    if lowercase: chars += string.ascii_lowercase
    if numbers: chars += string.digits
    if symbols: chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'

    return ''.join(secrets.choice(chars) for _ in range(length))

# 使用示例
password = generate_password(16)
print(password)`,

      java: `import java.security.SecureRandom;

public class PasswordGenerator {
    private static final SecureRandom random = new SecureRandom();
    private static final String UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String DIGITS = "0123456789";
    private static final String SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    public static String generate(int length, boolean upper, boolean lower,
                                  boolean digits, boolean symbols) {
        StringBuilder chars = new StringBuilder();
        if (upper) chars.append(UPPER);
        if (lower) chars.append(LOWER);
        if (digits) chars.append(DIGITS);
        if (symbols) chars.append(SYMBOLS);

        StringBuilder password = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        return password.toString();
    }
}`,

      swift: `import Foundation
import Security

func generatePassword(length: Int = 16,
                      uppercase: Bool = true,
                      lowercase: Bool = true,
                      numbers: Bool = true,
                      symbols: Bool = true) -> String {
    var chars = ""
    if uppercase { chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ" }
    if lowercase { chars += "abcdefghijklmnopqrstuvwxyz" }
    if numbers { chars += "0123456789" }
    if symbols { chars += "!@#$%^&*()_+-=[]{}|;:,.<>?" }

    var password = ""
    for _ in 0..<length {
        var randomByte: UInt8 = 0
        SecRandomCopyBytes(kSecRandomDefault, 1, &randomByte)
        let index = Int(randomByte) % chars.count
        password += String(chars[chars.index(chars.startIndex, offsetBy: index)])
    }
    return password
}`,

      go: `package main

import (
    "crypto/rand"
    "math/big"
)

func generatePassword(length int, upper, lower, digits, symbols bool) string {
    var chars string
    if upper { chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ" }
    if lower { chars += "abcdefghijklmnopqrstuvwxyz" }
    if digits { chars += "0123456789" }
    if symbols { chars += "!@#$%^&*()_+-=[]{}|;:,.<>?" }

    password := make([]byte, length)
    for i := range password {
        n, _ := rand.Int(rand.Reader, big.NewInt(int64(len(chars))))
        password[i] = chars[n.Int64()]
    }
    return string(password)
}`
    }
  };

  // Export to global scope
  window.CodeTabs = CodeTabs;

})();
