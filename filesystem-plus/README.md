# Filesystem Plus - Enhanced Claude Desktop MCP Extension

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/smcneece/filesystem-plus)](https://github.com/smcneece/filesystem-plus/releases)
[![GitHub commit activity](https://img.shields.io/github/commit-activity/y/smcneece/filesystem-plus.svg)](https://github.com/smcneece/filesystem-plus/commits/main)
[![GitHub](https://img.shields.io/github/license/smcneece/filesystem-plus)](LICENSE)
[![Maintainer](https://img.shields.io/badge/maintainer-Shawn%20McNeece%20%40smcneece-blue.svg)](https://github.com/smcneece)

> [![Sponsor](https://img.shields.io/badge/Sponsor-💖-pink)](https://github.com/sponsors/smcneece) <-- Why not sponsor me, even a few bucks shows you appreciate the work and gives encouragement. You can sponsor me monthly, or just a one time thing. Check out my [other HA Automations & Blueprints](https://github.com/smcneece?tab=repositories) while you're here.

> **Enhanced MCP Extension**: This is an improved version of the original Claude Desktop filesystem extension with read-only directory protection, blazing fast copy operations, and comprehensive permission control for secure AI file access.

> ⭐ **Help Others Find This Extension!** If Filesystem Plus is working well for you, please star this repository to help other Claude Desktop users discover these security and performance improvements!
>
> [![GitHub stars](https://img.shields.io/github/stars/smcneece/filesystem-plus?style=social)](https://github.com/smcneece/filesystem-plus/stargazers) [![GitHub forks](https://img.shields.io/github/forks/smcneece/filesystem-plus?style=social)](https://github.com/smcneece/filesystem-plus/network/members)

> 📬 **Stay Updated:** Click the "Watch" button (top-right of this repo) → "Releases only" to get email notifications when new versions are released!

## What Makes This Enhanced?

**Core Security Improvements:**
- **Read-Only Directory Protection**: Prevent Claude from modifying critical directories while maintaining read access
- **Granular Permission Control**: Separate read-write and read-only directory configuration
- **Write Operation Blocking**: Comprehensive protection against unintended file modifications
- **Path Validation**: Robust security checks and symlink protection

**Performance Enhancements:**
- **Blazing Fast Copy Operations**: Direct OS copy operations (300MB files in 1 second vs 10+ minutes)
- **Optimized File Handling**: Efficient memory usage and streamlined operations
- **Enhanced User Experience**: Clear permission feedback and error messages

**Technical Improvements:**
- **Direct MCP Integration**: No child process overhead for maximum performance
- **Comprehensive Tool Set**: 11 filesystem tools including the new high-speed copy_file
- **Cross-Platform Support**: Works on Windows, macOS, and Linux
- **Modern Architecture**: Built with latest MCP SDK and ES modules

## Installation

### Requirements

**Claude Desktop**: This extension requires Claude Desktop with MCP extension support.
**Node.js**: Ensure Node.js is installed on your system.

### Method 1: Replace Original Filesystem Extension (Recommended)

**Step-by-Step Installation:**

1. **Locate Claude Desktop Extensions Directory**
   - **Windows**: `%APPDATA%\Claude\Claude Extensions\`
   - **macOS**: `~/Library/Application Support/Claude/Claude Extensions/`
   - **Linux**: `~/.config/Claude/Claude Extensions/`

2. **Backup Original Extension** (Optional but recommended)
   - Copy the existing `filesystem` folder to `filesystem-original`

3. **Install Filesystem Plus**
   - Copy the `filesystem-plus` folder to your Claude Desktop extensions directory
   - Rename `filesystem-plus` to `filesystem` (replacing the original)

4. **Restart Claude Desktop**

5. **Configure Extension**
   - Go to Claude Desktop Settings → Extensions
   - Find "Filesystem Plus" and configure your directories

### Method 2: Side-by-Side Installation

1. Copy `filesystem-plus` folder to extensions directory (keep original name)
2. Add via Claude Desktop Settings → Extensions → Add MCP Extension
3. Configure directory permissions as needed

### Configuration

**Directory Setup:**

| Configuration | Description | Example |
|---------------|-------------|---------|
| **Read-Write Directories** | Claude can read, write, create, and modify files | `C:\Projects`, `~/Documents/Code` |
| **Read-Only Directories** | Claude can only read files - no modifications allowed | `C:\Windows`, `~/Documents/Important` |

**Permission Model:**
- **Copy FROM read-only**: Allowed (can copy files out of protected directories)
- **Copy TO read-only**: Blocked (prevents writing to protected directories)
- **Move operations**: Both source and destination must be writable
- **All read operations**: Always allowed regardless of directory type

## Available Tools

### File Operations
- **read_file**: Read complete contents of a single file
- **read_multiple_files**: Read multiple files simultaneously  
- **write_file**: Create or overwrite files with new content
- **edit_file**: Make targeted edits with git-style diff output
- **copy_file**: **NEW** - Ultra-fast direct OS copy operations
- **move_file**: Move or rename files and directories

### Directory Operations  
- **list_directory**: Get detailed directory listings
- **directory_tree**: Recursive JSON tree structure
- **create_directory**: Create directories with recursive support
- **search_files**: Pattern-based file search with exclusions

### Utility Operations
- **get_file_info**: Retrieve file metadata and permissions
- **list_allowed_directories**: View configured directory permissions

## Performance Improvements

**Copy Operations:**
- **Before**: 300MB file = 10+ minutes (read+write approach)
- **After**: 300MB file = 1 second (direct OS copy)
- **Improvement**: 600x+ performance gain for file copying

**The copy_file Advantage:**
Traditional approach required reading entire files into memory, processing content, then writing line-by-line. Our direct OS copy bypasses all content processing for maximum speed.

**When to Use Each Tool:**
- **copy_file**: File-to-file duplication (blazing fast)
- **write_file**: When Claude generates new content
- **move_file**: Renaming or relocating files (already optimized)

## Permission Examples

**Real-World Configuration Example:**
```
Read-Write Directories:
- F:\OneDrive\Documents\HomeAssistantCode  # Your main development folder

Read-Only Directories:  
- F:\OneDrive\Documents\HomeAssistantCode\github_staging  # Protected staging area
```

**Why This Setup?**
- **Main Development Access**: Claude can create, modify, and organize files in your coding projects
- **Protected Staging**: The `github_staging` folder contains ready-to-commit files that shouldn't be accidentally modified
- **Workflow Protection**: Prevents Claude from changing files you've prepared for GitHub deployment

**Additional Use Cases:**
- **System Protection**: Block access to `C:\Windows`, `/etc`, system directories  
- **Document Safety**: Protect important documents while allowing reference access
- **Backup Protection**: Read-only access to backup directories
- **Configuration Safety**: Read system configs without modification risk

## Troubleshooting

**Common Issues:**

**Extension Not Loading:**
- Verify Node.js is installed and accessible
- Check Claude Desktop logs for error messages
- Ensure directory permissions allow access

**Missing Directory Error (FIXED):**
- **Symptom**: Claude Desktop crashes when a configured directory is deleted
- **Solution**: Extension now gracefully handles missing directories
- **Behavior**: Missing directories are automatically skipped, extension continues with valid directories
- **Logging**: Check Claude Desktop logs for "Warning: Cannot access directory" messages

**Permission Denied Errors:**
- Verify directories are configured correctly
- Check file system permissions on target directories
- Ensure paths are absolute and valid

**Copy Operations Slow:**
- Large files should use copy_file tool instead of write_file
- Verify direct OS access isn't blocked by antivirus

**For detailed troubleshooting**: Check Claude Desktop's extension logs and verify MCP server connectivity.

## Technical Details

**Architecture:**
- **Direct MCP Integration**: Uses @modelcontextprotocol/sdk directly
- **No Child Processes**: Eliminates process spawning overhead
- **ES Modules**: Modern JavaScript with proper import/export
- **Comprehensive Validation**: Path normalization and security checks

**Security Features:**
- **Path Traversal Protection**: Prevents access outside allowed directories
- **Symlink Validation**: Checks real paths for symlinked files
- **Permission Inheritance**: Consistent security model across all operations
- **Error Isolation**: Secure error handling without information leakage

## Contributing

We welcome contributions! Please:
1. Fork this repository
2. Create a feature branch  
3. Test thoroughly with real Claude Desktop usage
4. Submit a pull request with detailed description

**Development Guidelines:**
- Maintain backward compatibility with existing configurations
- Follow existing code style and patterns
- Add comprehensive error handling
- Test both Windows and Unix-style paths

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits & Attribution

- **Original Filesystem Extension**: Anthropic - Foundation MCP filesystem server
- **Enhanced Edition**: [@smcneece](https://github.com/smcneece) - Community-driven security and performance improvements

## Support

- **Issues**: [GitHub Issues](https://github.com/smcneece/filesystem-plus/issues)
- **Discussions**: [GitHub Discussions](https://github.com/smcneece/filesystem-plus/discussions)
- **Community**: [Claude Desktop Community](https://github.com/anthropics/claude-desktop)

## Performance Notes

**Content Generation Delays**: While we've optimized file operations significantly, Claude Desktop's content generation process (the "Continue" button issue) is outside our extension's scope. This delay occurs before MCP tools are called and represents Claude's internal AI processing time.

**Community Recommendation**: Users experiencing frequent "Continue" button interruptions should request improvements from Anthropic for Claude Desktop's content generation handling.

---

**Enjoying secure file access with blazing fast copy operations, comprehensive permission control, and enhanced Claude Desktop integration? Consider starring this repository to help others discover these improvements!**