# Changelog - Filesystem Plus

All notable changes to the Filesystem Plus extension will be documented in this file.

## [2025.8.1] - 2025-08-27

### Initial Release - Core Security Features
- **Read-Only Directory Protection**: Granular permission control with dual directory configuration
- **Blazing Fast File Operations**: 600x+ performance improvement for copy operations using direct OS operations
- **Enhanced Security**: Prevents accidental modification of important files while maintaining full read access
- **Cross-Platform Support**: Windows, macOS, and Linux compatibility with proper path normalization
- **DXT Installation**: One-click installation support via drag-and-drop .dxt files
- **MIT Licensed**: Proper attribution to Anthropic's original filesystem extension

### Performance Optimizations
- **Ultra-Fast Copying**: Direct fs.copyFile() operations (300MB in 1 second vs 10+ minutes)
- **Memory Efficient**: Eliminates content buffering for large file operations
- **Direct MCP Integration**: Uses @modelcontextprotocol/sdk for maximum performance
- **Graceful Error Handling**: Missing directories don't crash the extension

### User Interface
- **Dual Directory Configuration**: Separate selection for read-write and read-only directories
- **Clear Permission Indicators**: Visual indicators showing permission levels for each directory
- **Helpful Error Messages**: Clear feedback when write operations are blocked
- **Configuration Screenshot**: Included visual guide for directory setup

## Upcoming Features (Future Releases)

### v2025.9.1 (Planned)
- Pattern-based directory permissions (file type filtering)
- Enhanced logging and debugging capabilities
- Community feedback integration
- Advanced configuration options

### v2025.10.1 (Planned)
- Performance optimizations for additional file operations
- Enhanced UI indicators within Claude Desktop
- Improved error reporting and diagnostics
- Additional security features based on user feedback

## Notes

- Based on the original Anthropic Filesystem extension
- Maintains full compatibility with existing Claude Desktop setups
- Community-driven enhancement project
- Focuses on security and user safety while preserving functionality

---

**Version Format**: [YYYY.MM.V] following Home Assistant versioning style
**Date Format**: YYYY-MM-DD
