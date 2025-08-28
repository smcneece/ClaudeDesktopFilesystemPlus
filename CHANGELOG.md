# Changelog - Filesystem Plus

All notable changes to the Filesystem Plus extension will be documented in this file.

## [1.1.0] - 2025-08-24 (In Development)

### UI Enhancement: Two-List Configuration
- **Enhanced Interface**: Replaced single directory list with dual-list approach
- **📁 Full Access Directories**: Clear section for read-write permissions
- **🔒 Read-Only Directories**: Dedicated section for protected directories
- **Improved UX**: More intuitive than checkbox concept, easier to implement
- **Visual Clarity**: Icons and descriptive headers make permissions obvious
- **Intentional Configuration**: Users must deliberately choose permission level

### Technical Improvements
- **Updated Manifest Schema**: New `full_access_directories` and `read_only_directories` configuration
- **Backward Compatibility**: Can migrate from legacy single-list configurations
- **Standard Components**: Uses existing Claude Desktop directory picker patterns
- **Enhanced Documentation**: Comprehensive UI design and implementation guides

## [1.0.0] - 2025-08-24

### Added
- **Read-Only Directory Support**: New capability to configure directories as read-only
- **Enhanced Manifest**: Extended user_config schema with separate read-write and read-only directory selections
- **Permission Checking Middleware**: Server wrapper that intercepts write operations and enforces read-only restrictions
- **Enhanced Error Messages**: Clear, helpful feedback when operations are blocked due to permissions
- **Improved list_allowed_directories**: Now shows permission levels (📁 Read-Write, 🔒 Read-Only)
- **Comprehensive Documentation**: README with use cases, examples, and security benefits

### Enhanced
- **User Interface**: Changed "Allowed Directories" to "Read-Write Directories" for clarity
- **Tool Descriptions**: Updated all tool descriptions to indicate permission behavior
- **Security**: Granular permission control prevents accidental modification of important files

### Technical
- **Path Normalization**: Robust Windows/Unix path handling for accurate permission checking
- **Argument Parsing**: Support for --readwrite and --readonly command line flags
- **Fallback Support**: Graceful fallback to original filesystem server if enhanced server fails
- **Permission Validation**: Comprehensive checking for move operations (both source and destination)

### Infrastructure
- **Node.js Support**: Compatible with Node.js 16.0.0+
- **Cross-Platform**: Windows, macOS, and Linux support
- **MCP Integration**: Built on @modelcontextprotocol/server-filesystem v0.5.0
- **Extension Format**: Follows Claude Desktop extension specification v0.1

## Development Phases Completed

### Phase 1: Foundation ✅
- Project structure setup
- Original extension analysis and copying
- Enhanced manifest.json creation
- Basic server wrapper implementation

### Phase 2: Core Implementation ✅  
- Permission checking middleware
- Path validation and normalization
- Error handling and messaging
- Tool operation interception

### Phase 3: Documentation & Polish ✅
- Comprehensive README.md
- Usage examples and best practices
- Installation instructions
- Security benefits explanation

## Upcoming Features (Future Releases)

### v1.1.0 (Planned)
- UI enhancements with checkboxes for directory permissions
- Visual indicators in Claude Desktop settings
- Pattern-based directory permissions
- Advanced configuration options

### v1.2.0 (Planned)
- Integration with original filesystem server (full delegation instead of basic implementation)
- Performance optimizations
- Enhanced logging and debugging
- Community feedback integration

## Notes

- Based on the original Anthropic Filesystem extension
- Maintains full compatibility with existing Claude Desktop setups
- Community-driven enhancement project
- Focuses on security and user safety while preserving functionality

---

**Version Format**: [Major.Minor.Patch] following Semantic Versioning
**Date Format**: YYYY-MM-DD
