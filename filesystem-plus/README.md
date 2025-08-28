Sun# Filesystem Plus - Enhanced Claude Desktop Extension

**Filesystem Plus** is an enhanced version of the Claude Desktop filesystem extension that adds support for read-only directories and granular permission control.

## 🚀 Key Features

- **📁 Read-Write Directories**: Full access - Claude can read, write, create, and modify files
- **🔒 Read-Only Directories**: Safe access - Claude can only read files, no modifications allowed
- **🛡️ Permission Protection**: Prevents accidental changes to important directories
- **📊 Enhanced Security**: Granular control over what Claude can access
- **💡 User-Friendly**: Familiar interface with clear permission indicators

## ⚡ Quick Start

1. **Copy Extension**: Place the `filesystem-plus` folder in your Claude Desktop extensions directory
2. **Install Extension**: Use Claude Desktop's extension manager to install
3. **Configure Directories**: 
   - Add **Read-Write Directories** for folders Claude can modify
   - Add **Read-Only Directories** for folders that should be protected
4. **Enjoy Enhanced Security**: Claude will now respect your permission settings

## 📋 Configuration

### In Claude Desktop Extension Settings:

**Read-Write Directories:**
- Directories where Claude has full access
- Can read, write, create, modify, and delete files
- Best for: Working directories, temporary files, project folders

**Read-Only Directories:** 
- Directories where Claude can only read files
- All write operations (create, modify, delete) are blocked
- Best for: Important documents, reference materials, system files

## 🔧 How It Works

Filesystem Plus extends the standard MCP filesystem server with:

1. **Enhanced Manifest**: Supports separate read-write and read-only directory configurations
2. **Permission Middleware**: Intercepts filesystem operations and checks permissions
3. **Path Validation**: Ensures operations respect directory permission settings
4. **Clear Error Messages**: Helpful feedback when operations are blocked

## 💻 Supported Operations

### Read Operations (Work in both directory types):
- `read_file` - Read file contents
- `read_multiple_files` - Read multiple files at once  
- `list_directory` - List directory contents
- `directory_tree` - Show directory structure
- `search_files` - Search for files
- `get_file_info` - Get file metadata
- `list_allowed_directories` - Show configured directories with permissions

### Write Operations (Blocked in read-only directories):
- `write_file` - Create or overwrite files
- `edit_file` - Modify existing files
- `create_directory` - Create new directories
- `move_file` - Move or rename files/directories

## 🛡️ Security Benefits

- **Prevent Accidents**: No more accidentally modifying important files
- **Granular Control**: Mix read-only and read-write access as needed
- **Clear Boundaries**: Always know what Claude can and cannot modify
- **Data Protection**: Keep critical documents safe while enabling automation

## 🔍 Example Use Cases

**Development Projects:**
- Read-Write: `~/projects/current-work/`
- Read-Only: `~/projects/archived/`, `~/projects/references/`

**Document Management:**  
- Read-Write: `~/documents/drafts/`
- Read-Only: `~/documents/important/`, `~/documents/archives/`

**System Administration:**
- Read-Write: `~/temp/`, `~/workspace/`
- Read-Only: `~/configs/`, `~/backups/`

## 🚨 Error Messages

When Claude tries to perform write operations in read-only directories:

```
❌ Permission denied: Cannot perform write operation in read-only directory.
Path: /path/to/readonly/file.txt
Operation: write_file

This directory is configured as read-only in Filesystem Plus. 
You can read files but cannot modify, create, or delete them.
```

## 🆚 Comparison with Standard Extension

| Feature | Standard Filesystem | Filesystem Plus |
|---------|-------------------|----------------|
| Directory Access | All-or-nothing | Granular permissions |
| Safety | Limited | Read-only protection |
| Configuration | Single directory list | Separate read-write/read-only |
| Error Messages | Basic | Detailed permission info |
| Use Cases | General access | Security-conscious workflows |

## 📦 Installation Requirements

- **Claude Desktop**: Version 0.10.0 or higher
- **Node.js**: Version 16.0.0 or higher
- **Platforms**: Windows, macOS, Linux

## 🔧 Technical Details

- **Built on**: @modelcontextprotocol/server-filesystem
- **Architecture**: Permission-checking middleware wrapper
- **Path Handling**: Robust Windows/Unix path normalization
- **Error Handling**: Graceful fallback to standard filesystem server

## 🤝 Contributing

This is a community-enhanced extension. Contributions welcome!

- **Report Issues**: GitHub Issues
- **Feature Requests**: Discussion forum
- **Pull Requests**: Follow contribution guidelines

## 📄 License

MIT License - Same as the original Claude Desktop filesystem extension.

---

**Stay Safe, Stay Productive! 🚀**

With Filesystem Plus, you can give Claude the access it needs while keeping your important files protected.
