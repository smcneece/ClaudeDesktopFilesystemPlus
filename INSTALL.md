# Installation Guide - Filesystem Plus

*Enhanced Claude Desktop extension with read-only protection, safe file deletion, Windows drive root support, and advanced security features*

## ⭐ What You Get

- **🛡️ Read-Only Directory Protection** - Protect sensitive files while allowing analysis
- **🗑️ Safe File Deletion** - Delete files with comprehensive safety checks and system protection
- **💾 Windows Drive Root Access** - Full support for `C:\`, `D:\`, UNC paths, and network drives
- **⚡ Ultra-Fast File Operations** - Optimized copying with 600x+ performance improvements
- **🔐 Granular Permissions** - Mix read-write and read-only directories as needed
- **🌐 Cross-Platform** - Seamless Windows, macOS, and Linux compatibility

## 🚀 Quick Installation (Recommended)

### Method 1: Manual Installation ⭐ **RECOMMENDED**
> **✅ Fully Working:** Manual installation ensures all features work correctly including extension details display.

1. Download the release and extract the `filesystem-plus` folder
2. Open Claude Desktop → **Settings** → **Extensions**
3. Click **Install Extension** and select the folder
4. Installation complete!

### Method 2: DXT Installation ⚠️ **UNDER INVESTIGATION**
> **🔧 Known Issue:** DXT may not display complete extension details in Claude Desktop. We're actively investigating this issue.

1. Download `filesystem-plus.dxt` from [releases](https://github.com/smcneece/ClaudeDesktopFilesystemPlus/releases/latest)
2. Open Claude Desktop → **Settings** → **Extensions**
3. **Windows**: Drag and drop the `.dxt` file into the extensions area
   **Mac/Linux**: Go to **Advanced** → **Install Extension** → Select the `.dxt` file  
4. Installation complete (but details may not show properly)

## ⚙️ Configuration

After installation, configure your directories:

1. In Claude Desktop → **Settings** → **Extensions** → **Filesystem Plus**
2. Configure directories:
   - **Read-Write Directories**: Claude can read, write, create, modify files
   - **Read-Only Directories**: Claude can only read files (no modifications)
3. Click **Save**

## 📁 Example Setup

**Read-Write (Full Access):**
- `~/Documents/Claude-Workspace`
- `~/Downloads/temp-files`

**Read-Only (Protected):**
- `~/Documents/Important-Files`  
- `~/Documents/Archives`

## 🔧 Requirements

- Claude Desktop v0.10.0 or later
- Windows, macOS, or Linux

## ❓ Issues?

- Ensure directories exist and paths are correct
- Restart Claude Desktop if extension doesn't appear
- Check the [README](README.md) for detailed troubleshooting

---

**🎉 Enjoy secure file operations with Filesystem Plus!**