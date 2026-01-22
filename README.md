# DevTools - 开发者工具集

一个纯前端的开发者工具网站，提供常用的编码/解码、加密/哈希、时间转换等工具。

## 特性

- **隐私安全**: 所有计算在浏览器本地完成，数据不会上传至任何服务器
- **主题切换**: 支持亮色/暗色主题切换，自动跟随系统偏好
- **代码示例**: 提供 JavaScript、Python、Java、Swift、Go 等多语言代码示例
- **文件支持**: 支持拖拽上传文件进行编解码或哈希计算（最大 50MB）

## 工具列表

| 工具 | 功能 |
|------|------|
| [Unix 时间戳](tools/unix-timestamp.html) | 时间戳与日期时间的双向转换，支持秒/毫秒格式 |
| [Base64 编解码](tools/base64.html) | Base64 文本和文件的编码与解码，支持标准和 URL 安全模式 |
| [URL 编解码](tools/url-encode.html) | URL 编码与解码，支持 encodeURI、encodeURIComponent 等模式 |
| [Hash 计算器](tools/hash.html) | 计算 MD5、SHA1、SHA256、SHA3 等哈希值 |
| [UUID 生成器](tools/uuid.html) | 生成 UUID v3、v4、v5，支持命名空间和批量生成 |

## 快速开始

### 本地运行

无需安装任何依赖，直接在浏览器中打开 `index.html` 即可使用。

```bash
# 方式一：直接打开文件
open index.html

# 方式二：使用 Python 启动本地服务器
python3 -m http.server 8080
# 然后访问 http://localhost:8080

# 方式三：使用 Node.js serve
npx serve .
```

### 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 目录结构

```
devtools/
├── index.html           # 首页（工具导航）
├── css/
│   └── style.css        # 全局样式 + 主题变量
├── js/
│   ├── common.js        # 全局功能（主题切换）
│   ├── hex-view.js      # HEX 视图组件
│   ├── code-tabs.js     # 多语言代码切换组件
│   └── file-upload.js   # 文件上传组件
├── tools/
│   ├── unix-timestamp.html
│   ├── base64.html
│   ├── url-encode.html
│   ├── hash.html
│   └── uuid.html
└── libs/
    └── crypto-js.min.js # MD5/SHA3 支持
```

## 技术栈

- **前端**: 原生 HTML/CSS/JavaScript，无构建工具
- **加密**: Web Crypto API (SHA 系列) + crypto-js (MD5/SHA3)
- **文件处理**: File API + FileReader

## 许可证

MIT License
