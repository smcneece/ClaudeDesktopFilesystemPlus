#!/usr/bin/env node

/**
 * Enhanced Filesystem MCP Server with Read-Only Directory Support
 * Filesystem Plus - Community Enhanced Version
 * 
 * Direct integration with MCP SDK - No child process needed!
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import os from 'os';
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { createTwoFilesPatch } from 'diff';
import { minimatch } from 'minimatch';

// Command line argument parsing
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error("No directories configured. Please configure directories in Claude Desktop Settings > Extensions > Filesystem Plus");
    // Continue with empty configuration instead of exiting
}

/**
 * Parse command line arguments for read-write and read-only directories
 */
function parseArguments() {
  const config = {
    readWriteDirs: [],
    readOnlyDirs: []
  };

  let currentMode = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--readwrite') {
      currentMode = 'readwrite';
    } else if (arg === '--readonly') {
      currentMode = 'readonly';
    } else if (currentMode === 'readwrite') {
      // Handle comma-separated directories from the UI
      const dirs = arg.split(',').map(dir => dir.trim()).filter(dir => dir);
      config.readWriteDirs.push(...dirs);
    } else if (currentMode === 'readonly') {
      // Handle comma-separated directories from the UI
      const dirs = arg.split(',').map(dir => dir.trim()).filter(dir => dir);
      config.readOnlyDirs.push(...dirs);
    } else {
      // Legacy support - directories without flags are treated as read-write
      if (!arg.startsWith('--')) {
        config.readWriteDirs.push(arg);
      }
    }
  }

  return config;
}

// Parse config and setup
const config = parseArguments();

console.error(`Filesystem Plus configuration:`);
console.error(`  Read-Write directories: ${config.readWriteDirs.length > 0 ? config.readWriteDirs.join(', ') : 'none'}`);
console.error(`  Read-Only directories: ${config.readOnlyDirs.length > 0 ? config.readOnlyDirs.join(', ') : 'none'}`);

// Combine all directories for validation
const allDirectories = [...config.readWriteDirs, ...config.readOnlyDirs];

if (allDirectories.length === 0) {
  console.error('No directories configured. Server will start with no filesystem access.');
  console.error('Configure directories in Claude Desktop Settings > Extensions > Filesystem Plus');
}

/**
 * Normalize path for consistent comparison across Windows/Unix
 */
function normalizePath(filePath) {
  return path.normalize(filePath);
}

function expandHome(filepath) {
  if (filepath.startsWith('~/') || filepath === '~') {
    return path.join(os.homedir(), filepath.slice(1));
  }
  return filepath;
}

// Store allowed directories in normalized form (will be updated after validation)
let allowedDirectories = allDirectories.map(dir => normalizePath(path.resolve(expandHome(dir))));

// Validate that all directories exist and are accessible
const validDirectories = [];
const invalidDirectories = [];

await Promise.all(allDirectories.map(async (dir) => {
    try {
        const stats = await fs.stat(dir);
        if (!stats.isDirectory()) {
            console.error(`Warning: ${dir} is not a directory - skipping`);
            invalidDirectories.push({ dir, reason: 'Not a directory' });
        } else {
            validDirectories.push(dir);
        }
    }
    catch (error) {
        console.error(`Warning: Cannot access directory ${dir} - skipping (${error.message})`);
        invalidDirectories.push({ dir, reason: error.message });
    }
}));

// Update configs to only include valid directories
config.readWriteDirs = config.readWriteDirs.filter(dir => validDirectories.includes(dir));
config.readOnlyDirs = config.readOnlyDirs.filter(dir => validDirectories.includes(dir));

if (validDirectories.length === 0) {
    console.error('No valid directories found. Server will start with no filesystem access.');
    console.error('Please check your directory configuration in Claude Desktop Settings.');
}

if (invalidDirectories.length > 0) {
    console.error(`Filesystem Plus started with warnings - ${invalidDirectories.length} directories skipped:`);
    invalidDirectories.forEach(({dir, reason}) => {
        console.error(`  - ${dir}: ${reason}`);
    });
    console.error(`Valid directories: ${validDirectories.join(', ')}`);
}

// Update allowedDirectories to only include valid ones
allowedDirectories = validDirectories.map(dir => normalizePath(path.resolve(expandHome(dir))));

console.error(`Filesystem Plus validated - using ${allowedDirectories.length} directories:`);
console.error(`  Final Read-Write directories: ${config.readWriteDirs.length > 0 ? config.readWriteDirs.join(', ') : 'none'}`);
console.error(`  Final Read-Only directories: ${config.readOnlyDirs.length > 0 ? config.readOnlyDirs.join(', ') : 'none'}`);

/**
 * Check if a file path is within a read-only directory
 */
function isReadOnlyPath(filePath, readOnlyDirs) {
  const normalizedPath = normalizePath(filePath);
  
  return readOnlyDirs.some(roDir => {
    const normalizedRODir = normalizePath(roDir);
    return normalizedPath.startsWith(normalizedRODir + path.sep) || normalizedPath === normalizedRODir;
  });
}

// Security utilities
async function validatePath(requestedPath) {
    const expandedPath = expandHome(requestedPath);
    const absolute = path.isAbsolute(expandedPath)
        ? path.resolve(expandedPath)
        : path.resolve(process.cwd(), expandedPath);
    const normalizedRequested = normalizePath(absolute);
    
    // Check if path is within allowed directories
    const isAllowed = allowedDirectories.some(dir => normalizedRequested.startsWith(dir));
    if (!isAllowed) {
        throw new Error(`Access denied - path outside allowed directories: ${absolute} not in ${allowedDirectories.join(', ')}`);
    }
    
    // Handle symlinks by checking their real path, but handle Windows drive roots gracefully
    try {
        const realPath = await fs.realpath(absolute);
        const normalizedReal = normalizePath(realPath);
        const isRealPathAllowed = allowedDirectories.some(dir => normalizedReal.startsWith(dir));
        if (!isRealPathAllowed) {
            throw new Error("Access denied - symlink target outside allowed directories");
        }
        return realPath;
    }
    catch (error) {
        // fs.realpath() often fails on Windows drive roots (Y:\), so try fs.access first
        try {
            await fs.access(absolute);
            // Path exists, return it
            return absolute;
        }
        catch (accessError) {
            // For new files that don't exist yet, verify parent directory
            const parentDir = path.dirname(absolute);
            if (parentDir === absolute) {
                // This is a root directory (like Y:\), and access failed
                throw new Error(`Cannot access drive: ${absolute}`);
            }
            
            try {
                await fs.access(parentDir);
                const normalizedParent = normalizePath(parentDir);
                const isParentAllowed = allowedDirectories.some(dir => normalizedParent.startsWith(dir));
                if (!isParentAllowed) {
                    throw new Error("Access denied - parent directory outside allowed directories");
                }
                return absolute;
            }
            catch {
                throw new Error(`Parent directory does not exist: ${parentDir}`);
            }
        }
    }
}

// Schema definitions - same as original filesystem server
const ReadFileArgsSchema = z.object({
    path: z.string(),
});

const ReadMultipleFilesArgsSchema = z.object({
    paths: z.array(z.string()),
});

const WriteFileArgsSchema = z.object({
    path: z.string(),
    content: z.string(),
});

const EditOperation = z.object({
    oldText: z.string().describe('Text to search for - must match exactly'),
    newText: z.string().describe('Text to replace with')
});

const EditFileArgsSchema = z.object({
    path: z.string(),
    edits: z.array(EditOperation),
    dryRun: z.boolean().default(false).describe('Preview changes using git-style diff format')
});

const CreateDirectoryArgsSchema = z.object({
    path: z.string(),
});

const ListDirectoryArgsSchema = z.object({
    path: z.string(),
});

const DirectoryTreeArgsSchema = z.object({
    path: z.string(),
});

const MoveFileArgsSchema = z.object({
    source: z.string(),
    destination: z.string(),
});

const CopyFileArgsSchema = z.object({
    source: z.string(),
    destination: z.string(),
});

const SearchFilesArgsSchema = z.object({
    path: z.string(),
    pattern: z.string(),
    excludePatterns: z.array(z.string()).default([])
});

const GetFileInfoArgsSchema = z.object({
    path: z.string(),
});

const DeleteFileArgsSchema = z.object({
    path: z.string(),
});

// Create MCP server instance  
const server = new Server({
    name: "secure-filesystem-server",
    version: "0.2.0",
}, {
    capabilities: {
        tools: {},
    },
});

// Enhanced list_allowed_directories with permission levels
function getEnhancedDirectoryList() {
    const dirList = [];
    
    config.readWriteDirs.forEach(dir => {
        dirList.push(`${dir} (Read-Write)`);
    });
    
    config.readOnlyDirs.forEach(dir => {
        dirList.push(`${dir} (Read-Only)`);
    });
    
    return dirList.length > 0 
        ? `Allowed directories:\n${dirList.join('\n')}`
        : "No directories configured.";
}

// Permission checking wrapper
function checkWritePermission(toolName, toolArgs) {
    const writeOperations = ['write_file', 'edit_file', 'create_directory', 'move_file', 'copy_file'];
    
    if (!writeOperations.includes(toolName)) {
        return null; // No permission check needed
    }
    
    let pathToCheck = null;
    
    // Extract the path being operated on
    switch (toolName) {
        case 'write_file':
        case 'edit_file':
        case 'create_directory':
            pathToCheck = toolArgs.path;
            break;
        case 'move_file':
            // Check both source and destination for move operations
            if (isReadOnlyPath(toolArgs.source, config.readOnlyDirs)) {
                return `Permission denied: Cannot move files from read-only directory.\nSource: ${toolArgs.source}\nThis directory is configured as read-only.`;
            }
            
            if (isReadOnlyPath(toolArgs.destination, config.readOnlyDirs)) {
                return `Permission denied: Cannot move files to read-only directory.\nDestination: ${toolArgs.destination}\nThis directory is configured as read-only.`;
            }
            return null; // Both paths are allowed
        case 'copy_file':
            // For copy operations, only check destination (can copy FROM read-only)
            if (isReadOnlyPath(toolArgs.destination, config.readOnlyDirs)) {
                return `Permission denied: Cannot copy files to read-only directory.\nDestination: ${toolArgs.destination}\nThis directory is configured as read-only.`;
            }
            return null; // Copy allowed
    }
    
    // Check if the operation is on a read-only path
    if (pathToCheck && isReadOnlyPath(pathToCheck, config.readOnlyDirs)) {
        return `Permission denied: Cannot ${toolName} in read-only directory.\nPath: ${pathToCheck}\n\nThis directory is configured as read-only. You can read files but cannot modify them.`;
    }
    
    return null; // Permission granted
}

// Start the direct integration server
async function startServer() {
    // Register list tools handler
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: [
                {
                    name: "read_file",
                    description: "Read the complete contents of a file from the file system. Handles various text encodings and provides detailed error messages if the file cannot be read. Use this tool when you need to examine the contents of a single file. Only works within allowed directories.",
                    inputSchema: zodToJsonSchema(ReadFileArgsSchema),
                },
                {
                    name: "read_multiple_files", 
                    description: "Read the contents of multiple files simultaneously. This is more efficient than reading files one by one when you need to analyze or compare multiple files. Each file's content is returned with its path as a reference. Failed reads for individual files won't stop the entire operation. Only works within allowed directories.",
                    inputSchema: zodToJsonSchema(ReadMultipleFilesArgsSchema),
                },
                {
                    name: "write_file",
                    description: "Create a new file or completely overwrite an existing file with new content. Use with caution as it will overwrite existing files without warning. Handles text content with proper encoding. Only works within allowed directories.",
                    inputSchema: zodToJsonSchema(WriteFileArgsSchema),
                },
                {
                    name: "edit_file",
                    description: "Make line-based edits to a text file. Each edit replaces exact line sequences with new content. Returns a git-style diff showing the changes made. Only works within allowed directories.",
                    inputSchema: zodToJsonSchema(EditFileArgsSchema),
                },
                {
                    name: "create_directory",
                    description: "Create a new directory or ensure a directory exists. Can create multiple nested directories in one operation. If the directory already exists, this operation will succeed silently. Perfect for setting up directory structures for projects or ensuring required paths exist. Only works within allowed directories.",
                    inputSchema: zodToJsonSchema(CreateDirectoryArgsSchema),
                },
                {
                    name: "list_directory",
                    description: "Get a detailed listing of all files and directories in a specified path. Results clearly distinguish between files and directories with [FILE] and [DIR] prefixes. This tool is essential for understanding directory structure and finding specific files within a directory. Only works within allowed directories.",
                    inputSchema: zodToJsonSchema(ListDirectoryArgsSchema),
                },
                {
                    name: "directory_tree",
                    description: "Get a recursive tree view of files and directories as a JSON structure. Each entry includes 'name', 'type' (file/directory), and 'children' for directories. Files have no children array, while directories always have a children array (which may be empty). The output is formatted with 2-space indentation for readability. Only works within allowed directories.",
                    inputSchema: zodToJsonSchema(DirectoryTreeArgsSchema),
                },
                {
                    name: "move_file",
                    description: "Move or rename files and directories. Can move files between directories and rename them in a single operation. If the destination exists, the operation will fail. Works across different directories and can be used for simple renaming within the same directory. Both source and destination must be within allowed directories.",
                    inputSchema: zodToJsonSchema(MoveFileArgsSchema),
                },
                {
                    name: "copy_file",
                    description: "Copy files and directories using direct OS operations for maximum performance. Much faster than read+write for large files. If the destination exists, the operation will fail. Both source and destination must be within allowed directories. Cannot copy to read-only directories.",
                    inputSchema: zodToJsonSchema(CopyFileArgsSchema),
                },
                {
                    name: "search_files",
                    description: "Recursively search for files and directories matching a pattern. Searches through all subdirectories from the starting path. The search is case-insensitive and matches partial names. Returns full paths to all matching items. Great for finding files when you don't know their exact location. Only searches within allowed directories.",
                    inputSchema: zodToJsonSchema(SearchFilesArgsSchema),
                },
                {
                    name: "get_file_info",
                    description: "Retrieve detailed metadata about a file or directory. Returns comprehensive information including size, creation time, last modified time, permissions, and type. This tool is perfect for understanding file characteristics without reading the actual content. Only works within allowed directories.",
                    inputSchema: zodToJsonSchema(GetFileInfoArgsSchema),
                },
                {
                    name: "delete_file",
                    description: "PERMANENTLY DELETE a file or directory. This operation cannot be undone! Use with extreme caution. Blocked in read-only directories. For directories, all contents will be recursively deleted.",
                    inputSchema: zodToJsonSchema(DeleteFileArgsSchema),
                },
                {
                    name: "list_allowed_directories",
                    description: "Returns the list of directories that this server is allowed to access. Use this to understand which directories are available before trying to access files.",
                    inputSchema: zodToJsonSchema(z.object({})),
                }
            ],
        };
    });
    
    // Register call tool handler
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        
        try {
            // Check write permissions before executing
            const permissionError = checkWritePermission(name, args);
            if (permissionError) {
                return {
                    content: [{ type: "text", text: permissionError }],
                    isError: true,
                };
            }

            switch (name) {
                case "read_file": {
                    const parsed = ReadFileArgsSchema.parse(args);
                    const validPath = await validatePath(parsed.path);
                    const content = await fs.readFile(validPath, "utf-8");
                    return {
                        content: [{ type: "text", text: content }],
                    };
                }

                case "read_multiple_files": {
                    const parsed = ReadMultipleFilesArgsSchema.parse(args);
                    const results = await Promise.allSettled(
                        parsed.paths.map(async (filePath) => {
                            const validPath = await validatePath(filePath);
                            const content = await fs.readFile(validPath, "utf-8");
                            return { path: filePath, content };
                        })
                    );

                    const output = results.map((result, index) => {
                        const path = parsed.paths[index];
                        if (result.status === "fulfilled") {
                            return `--- ${path} ---\n${result.value.content}`;
                        } else {
                            return `--- ${path} (ERROR) ---\nError reading file: ${result.reason}`;
                        }
                    }).join('\n\n');

                    return {
                        content: [{ type: "text", text: output }],
                    };
                }

                case "write_file": {
                    const parsed = WriteFileArgsSchema.parse(args);
                    const validPath = await validatePath(parsed.path);
                    await fs.writeFile(validPath, parsed.content, "utf-8");
                    return {
                        content: [{ type: "text", text: `Successfully wrote to ${parsed.path}` }],
                    };
                }

                case "edit_file": {
                    const parsed = EditFileArgsSchema.parse(args);
                    const validPath = await validatePath(parsed.path);
                    
                    let content;
                    try {
                        content = await fs.readFile(validPath, 'utf-8');
                    } catch (error) {
                        throw new Error(`Could not read file: ${error}`);
                    }

                    let modifiedContent = content;
                    const changes = [];
                    
                    for (const edit of parsed.edits) {
                        if (!modifiedContent.includes(edit.oldText)) {
                            throw new Error(`Text not found: "${edit.oldText}"`);
                        }
                        
                        const beforeReplace = modifiedContent;
                        modifiedContent = modifiedContent.replace(edit.oldText, edit.newText);
                        
                        if (beforeReplace === modifiedContent) {
                            throw new Error(`No changes made when replacing "${edit.oldText}" with "${edit.newText}"`);
                        }
                        
                        changes.push({ oldText: edit.oldText, newText: edit.newText });
                    }

                    const diff = createTwoFilesPatch(
                        parsed.path,
                        parsed.path, 
                        content,
                        modifiedContent,
                        "before",
                        "after"
                    );

                    if (parsed.dryRun) {
                        return {
                            content: [{ 
                                type: "text", 
                                text: `Dry run - changes that would be made:\n\n${diff}` 
                            }],
                        };
                    }

                    await fs.writeFile(validPath, modifiedContent, 'utf-8');
                    
                    return {
                        content: [{ 
                            type: "text", 
                            text: `Successfully edited ${parsed.path}\n\n${diff}` 
                        }],
                    };
                }

                case "create_directory": {
                    const parsed = CreateDirectoryArgsSchema.parse(args);
                    const validPath = await validatePath(parsed.path);
                    await fs.mkdir(validPath, { recursive: true });
                    return {
                        content: [{ type: "text", text: `Successfully created directory ${parsed.path}` }],
                    };
                }

                case "list_directory": {
                    const parsed = ListDirectoryArgsSchema.parse(args);
                    const validPath = await validatePath(parsed.path);
                    
                    try {
                        const entries = await fs.readdir(validPath, { withFileTypes: true });
                        const formatted = entries.map(entry => {
                            const type = entry.isDirectory() ? '[DIR]' : '[FILE]';
                            return `${type} ${entry.name}`;
                        }).join('\n');
                        
                        return {
                            content: [{ type: "text", text: formatted || "Directory is empty" }],
                        };
                    } catch (error) {
                        throw new Error(`Could not read directory: ${error}`);
                    }
                }

                case "directory_tree": {
                    const parsed = DirectoryTreeArgsSchema.parse(args);
                    const validPath = await validatePath(parsed.path);
                    
                    async function buildTree(currentPath, depth = 0) {
                        const MAX_DEPTH = 10;
                        if (depth > MAX_DEPTH) return null;
                        
                        try {
                            const stats = await fs.stat(currentPath);
                            const name = path.basename(currentPath);
                            
                            if (stats.isFile()) {
                                return { name, type: 'file' };
                            } else if (stats.isDirectory()) {
                                const entries = await fs.readdir(currentPath, { withFileTypes: true });
                                const children = [];
                                
                                for (const entry of entries) {
                                    const entryPath = path.join(currentPath, entry.name);
                                    const child = await buildTree(entryPath, depth + 1);
                                    if (child) children.push(child);
                                }
                                
                                return { name, type: 'directory', children };
                            }
                        } catch (error) {
                            console.error(`Error processing ${currentPath}:`, error);
                            return null;
                        }
                    }
                    
                    const tree = await buildTree(validPath);
                    if (!tree) {
                        throw new Error("Could not build directory tree");
                    }
                    
                    return {
                        content: [{ type: "text", text: JSON.stringify(tree, null, 2) }],
                    };
                }

                case "move_file": {
                    const parsed = MoveFileArgsSchema.parse(args);
                    const validSourcePath = await validatePath(parsed.source);
                    const validDestPath = await validatePath(parsed.destination);
                    
                    try {
                        await fs.stat(validDestPath);
                        throw new Error(`Destination already exists: ${parsed.destination}`);
                    } catch (error) {
                        if (error.code !== 'ENOENT') throw error;
                    }
                    
                    await fs.rename(validSourcePath, validDestPath);
                    return {
                        content: [{ type: "text", text: `Successfully moved ${parsed.source} to ${parsed.destination}` }],
                    };
                }

                case "copy_file": {
                    const parsed = CopyFileArgsSchema.parse(args);
                    const validSourcePath = await validatePath(parsed.source);
                    const validDestPath = await validatePath(parsed.destination);
                    
                    try {
                        await fs.stat(validDestPath);
                        throw new Error(`Destination already exists: ${parsed.destination}`);
                    } catch (error) {
                        if (error.code !== 'ENOENT') throw error;
                    }
                    
                    // Use direct OS copy operation for maximum speed
                    await fs.copyFile(validSourcePath, validDestPath);
                    return {
                        content: [{ type: "text", text: `Successfully copied ${parsed.source} to ${parsed.destination}` }],
                    };
                }

                case "search_files": {
                    const parsed = SearchFilesArgsSchema.parse(args);
                    const validPath = await validatePath(parsed.path);
                    const results = [];

                    async function searchRecursive(currentPath, pattern, excludePatterns, depth = 0) {
                        const MAX_DEPTH = 20;
                        if (depth > MAX_DEPTH) return;

                        try {
                            const entries = await fs.readdir(currentPath, { withFileTypes: true });
                            
                            for (const entry of entries) {
                                const fullPath = path.join(currentPath, entry.name);
                                
                                const shouldExclude = excludePatterns.some(excludePattern => {
                                    return minimatch(entry.name, excludePattern, { nocase: true }) ||
                                           minimatch(fullPath, excludePattern, { nocase: true });
                                });
                                
                                if (shouldExclude) continue;
                                
                                const matchesPattern = minimatch(entry.name, pattern, { nocase: true });
                                if (matchesPattern) {
                                    const type = entry.isDirectory() ? 'directory' : 'file';
                                    results.push(`${type}: ${fullPath}`);
                                }
                                
                                if (entry.isDirectory()) {
                                    await searchRecursive(fullPath, pattern, excludePatterns, depth + 1);
                                }
                            }
                        } catch (error) {
                            console.error(`Error searching ${currentPath}:`, error);
                        }
                    }

                    await searchRecursive(validPath, parsed.pattern, parsed.excludePatterns);
                    
                    const output = results.length > 0 
                        ? results.join('\n')
                        : `No files found matching pattern "${parsed.pattern}" in ${parsed.path}`;
                    
                    return {
                        content: [{ type: "text", text: output }],
                    };
                }

                case "get_file_info": {
                    const parsed = GetFileInfoArgsSchema.parse(args);
                    const validPath = await validatePath(parsed.path);
                    
                    try {
                        const stats = await fs.stat(validPath);
                        const info = {
                            path: parsed.path,
                            name: path.basename(validPath),
                            type: stats.isDirectory() ? 'directory' : 'file',
                            size: stats.size,
                            created: stats.birthtime.toISOString(),
                            modified: stats.mtime.toISOString(),
                            permissions: `${(stats.mode & parseInt('777', 8)).toString(8)}`
                        };
                        
                        return {
                            content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
                        };
                    } catch (error) {
                        throw new Error(`Could not get file info: ${error}`);
                    }
                }

                case "delete_file": {
                    const parsed = DeleteFileArgsSchema.parse(args);
                    
                    try {
                        // CRITICAL SAFETY CHECKS
                        
                        // 1. Validate and normalize the path
                        const validatedPath = await validatePath(parsed.path, allowedDirectories);
                        
                        // 2. Extra safety: Block if path contains certain dangerous patterns
                        const dangerousPatterns = [
                            /^[A-Z]:\\?$/, // Drive roots like C:\
                            /^\/$/,       // Unix root
                            /system32/i,  // Windows system directory
                            /windows/i,   // Windows directory  
                            /boot/i,      // Boot directory
                            /etc/i,       // Unix system config
                            /bin/i,       // Unix binaries
                            /usr/i,       // Unix user binaries
                            /var/i,       // Unix variable data
                        ];
                        
                        const normalizedForCheck = normalizePath(validatedPath).toLowerCase();
                        for (const pattern of dangerousPatterns) {
                            if (pattern.test(normalizedForCheck)) {
                                throw new Error(`Deletion blocked: Path appears to be a system directory: ${parsed.path}`);
                            }
                        }
                        
                        // 3. Check if this is a read-only directory (write operations blocked)
                        if (isReadOnlyPath(validatedPath, config.readOnlyDirs)) {
                            return {
                                content: [{
                                    type: "text",
                                    text: `Permission denied: Cannot delete_file in read-only directory.\nPath: ${parsed.path}\n\nThis directory is configured as read-only. You can read files but cannot modify them.`
                                }],
                                isError: true
                            };
                        }
                        
                        // 4. Check if file/directory exists
                        const stats = await fs.stat(validatedPath);
                        
                        // 5. Perform the deletion with appropriate method
                        if (stats.isDirectory()) {
                            // Delete directory and all contents recursively  
                            await fs.rm(validatedPath, { recursive: true, force: true });
                            return {
                                content: [{ type: "text", text: `Successfully deleted directory and all contents: ${validatedPath}` }],
                            };
                        } else {
                            // Delete single file
                            await fs.unlink(validatedPath);
                            return {
                                content: [{ type: "text", text: `Successfully deleted file: ${validatedPath}` }],
                            };
                        }
                        
                    } catch (error) {
                        if (error.code === 'ENOENT') {
                            throw new Error(`File or directory does not exist: ${parsed.path}`);
                        } else if (error.code === 'EACCES' || error.code === 'EPERM') {
                            throw new Error(`Permission denied: Cannot delete ${parsed.path} - check file permissions`);
                        } else if (error.code === 'ENOTEMPTY') {
                            throw new Error(`Directory not empty: ${parsed.path} - use recursive deletion or empty first`);
                        } else {
                            throw new Error(`Could not delete file: ${error.message}`);
                        }
                    }
                }

                case "list_allowed_directories": {
                    return {
                        content: [{ type: "text", text: getEnhancedDirectoryList() }],
                    };
                }

                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
        } catch (error) {
            return {
                content: [{ type: "text", text: `Error: ${error.message}` }],
                isError: true,
            };
        }
    });
    
    console.error('Filesystem Plus server started successfully with direct integration');
}

// Run server
async function runServer() {
    await startServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Secure MCP Filesystem Server running on stdio");
    console.error("Allowed directories:", allowedDirectories);
}

runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});
