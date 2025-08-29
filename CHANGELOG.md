# Changelog - Filesystem Plus

All notable changes to the Filesystem Plus extension will be documented in this file.

## [2025.8.3] - 2025-08-29

### New Features
- **Delete File/Directory Tool**: New delete_file function with comprehensive safety checks
  - Supports both file and directory deletion (recursive)
  - Blocked in read-only directories for safety
  - System directory protection (prevents deletion of C:\, /system32/, etc.)
  - Requires individual user permission approval in Claude Desktop
- **Enhanced Manifest**: Complete tool descriptions for all 12 available functions

### Technical Improvements
- **Auto-Detection**: Deploy script now automatically finds live extension regardless of installation method
- **Path Safety**: Multiple validation layers to prevent accidental system file deletion
- **Error Handling**: Detailed error messages for different deletion failure scenarios

### Known Issues
- **DXT Installation**: Currently investigating issues with DXT packaging that may prevent complete extension details from showing in Claude Desktop
- **Recommended**: Use manual installation method until DXT issues are resolved
- **Status**: All functionality works correctly; only the installation method is affected

## [2025.8.1] - 2025-08-27

### Core Features
- **Read-Only Directory Protection**: Configure directories that Claude can read but never modify
- **Dual Directory Configuration**: Separate selection for read-write and read-only directories  
- **Enhanced Security**: Prevents accidental modification of important files while maintaining full read access
- **Cross-Platform Support**: Windows, macOS, and Linux compatibility with proper path normalization
- **DXT Installation**: One-click installation support via drag-and-drop .dxt files
- **MIT Licensed**: Proper attribution to Anthropic's original filesystem extension

### Performance Enhancement
- **Ultra-Fast File Copying**: New copy_file tool using direct fs.copyFile() operations (300MB in 1 second vs 10+ minutes)
- **Direct OS Operations**: Bypasses content serialization for massive performance improvement on file copying
- **Graceful Error Handling**: Missing directories don't crash the extension

### User Experience  
- **Clear Permission Indicators**: Visual indicators showing permission levels for each directory
- **Helpful Error Messages**: Clear feedback when write operations are blocked on read-only directories
- **Configuration Interface**: Intuitive setup page with visual guide for directory permissions

## Future Considerations

Future releases may include community-requested features based on user feedback and actual needs. No specific features are currently planned or promised.

## Notes

- Based on the original Anthropic Filesystem extension
- Maintains full compatibility with existing Claude Desktop setups
- Community-driven enhancement project
- Focuses on security and user safety while preserving functionality

---

**Version Format**: [YYYY.MM.V] following Home Assistant versioning style
**Date Format**: YYYY-MM-DD
