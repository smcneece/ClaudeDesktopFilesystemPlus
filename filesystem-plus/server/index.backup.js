#!/usr/bin/env node

/**
 * Enhanced Filesystem MCP Server with Read-Only Directory Support
 * Filesystem Plus - Community Enhanced Version
 * 
 * This server acts as a proxy to add permission checking to the original filesystem server
 */

const path = require('path');
const { spawn } = require('child_process');

/**
 * Parse command line arguments for read-write and read-only directories
 */
function parseArguments() {
  const args = process.argv.slice(2);
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

/**
 * Normalize path for consistent comparison across Windows/Unix
 */
function normalizePath(filePath) {
  return path.resolve(filePath).toLowerCase().replace(/\\/g, '/');
}

/**
 * Check if a file path is within a read-only directory
 */
function isReadOnlyPath(filePath, readOnlyDirs) {
  const normalizedPath = normalizePath(filePath);
  
  return readOnlyDirs.some(roDir => {
    const normalizedRODir = normalizePath(roDir);
    return normalizedPath.startsWith(normalizedRODir + '/') || normalizedPath === normalizedRODir;
  });
}

/**
 * Start the enhanced server with permission checking
 */
async function startEnhancedServer() {
  try {
    const config = parseArguments();
    
    console.error(`Filesystem Plus starting with:`);
    console.error(`  Read-Write directories: ${config.readWriteDirs.length > 0 ? config.readWriteDirs.join(', ') : 'none'}`);
    console.error(`  Read-Only directories: ${config.readOnlyDirs.length > 0 ? config.readOnlyDirs.join(', ') : 'none'}`);

    // Combine all directories for the underlying filesystem server
    const allDirectories = [...config.readWriteDirs, ...config.readOnlyDirs];
    
    if (allDirectories.length === 0) {
      console.error('Error: No directories specified. Please configure at least one directory.');
      process.exit(1);
    }

    // Import and start the original filesystem server
    const originalServerPath = path.join(__dirname, '../node_modules/@modelcontextprotocol/server-filesystem/dist/index.js');
    
    // Start the original server as a child process
    const serverProcess = spawn('node', [originalServerPath, ...allDirectories], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Handle incoming requests and add permission checking
    process.stdin.on('data', (data) => {
      const message = data.toString().trim();
      
      try {
        const request = JSON.parse(message);
        
        // Check for write operations that need permission checking
        if (request.method === 'tools/call') {
          const { name: toolName, arguments: toolArgs } = request.params;
          const writeOperations = ['write_file', 'edit_file', 'create_directory', 'move_file'];
          
          if (writeOperations.includes(toolName)) {
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
                  const errorResponse = {
                    jsonrpc: "2.0",
                    id: request.id,
                    error: {
                      code: -32000,
                      message: `Permission denied: Cannot move files from read-only directory.\nSource: ${toolArgs.source}\nThis directory is configured as read-only.`
                    }
                  };
                  process.stdout.write(JSON.stringify(errorResponse) + '\n');
                  return;
                }
                
                if (isReadOnlyPath(toolArgs.destination, config.readOnlyDirs)) {
                  const errorResponse = {
                    jsonrpc: "2.0",
                    id: request.id,
                    error: {
                      code: -32000,
                      message: `Permission denied: Cannot move files to read-only directory.\nDestination: ${toolArgs.destination}\nThis directory is configured as read-only.`
                    }
                  };
                  process.stdout.write(JSON.stringify(errorResponse) + '\n');
                  return;
                }
                break;
            }
            
            // Check if the operation is on a read-only path
            if (pathToCheck && isReadOnlyPath(pathToCheck, config.readOnlyDirs)) {
              const errorResponse = {
                jsonrpc: "2.0",
                id: request.id,
                error: {
                  code: -32000,
                  message: `Permission denied: Cannot ${toolName} in read-only directory.\nPath: ${pathToCheck}\n\nThis directory is configured as read-only. You can read files but cannot modify them.`
                }
              };
              process.stdout.write(JSON.stringify(errorResponse) + '\n');
              return;
            }
          }
          
          // Handle enhanced list_allowed_directories
          if (toolName === 'list_allowed_directories') {
            const dirList = [];
            
            config.readWriteDirs.forEach(dir => {
              dirList.push(`${dir} (Read-Write)`);
            });
            
            config.readOnlyDirs.forEach(dir => {
              dirList.push(`${dir} (Read-Only)`);
            });
            
            const response = {
              jsonrpc: "2.0",
              id: request.id,
              result: {
                content: [{
                  type: "text",
                  text: dirList.length > 0 
                    ? `Allowed directories:\n${dirList.join('\n')}`
                    : "No directories configured."
                }]
              }
            };
            process.stdout.write(JSON.stringify(response) + '\n');
            return;
          }
        }
        
        // Forward all other requests to the original server
        serverProcess.stdin.write(data);
      } catch (error) {
        // If we can't parse it as JSON, just forward it
        serverProcess.stdin.write(data);
      }
    });

    // Forward responses from the original server
    serverProcess.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    // Forward error messages
    serverProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    // Handle server process exit
    serverProcess.on('exit', (code) => {
      console.error(`Original filesystem server exited with code ${code}`);
      process.exit(code);
    });

    // Handle our own exit
    process.on('exit', () => {
      serverProcess.kill();
    });

    process.on('SIGTERM', () => {
      serverProcess.kill();
      process.exit();
    });

    process.on('SIGINT', () => {
      serverProcess.kill();
      process.exit();
    });

    console.error('Filesystem Plus server started successfully with permission checking');

  } catch (error) {
    console.error('Failed to start Filesystem Plus server:', error);
    
    // Fallback: try to start the original filesystem server directly
    console.error('Attempting to fallback to original filesystem server...');
    
    try {
      const { spawn } = require('child_process');
      const originalServerPath = path.join(__dirname, '../node_modules/@modelcontextprotocol/server-filesystem/dist/index.js');
      const allDirectories = [...parseArguments().readWriteDirs, ...parseArguments().readOnlyDirs];
      
      const fallbackProcess = spawn('node', [originalServerPath, ...allDirectories], {
        stdio: ['inherit', 'inherit', 'inherit']
      });
      
      fallbackProcess.on('exit', (code) => {
        process.exit(code);
      });
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      process.exit(1);
    }
  }
}

// Start the enhanced server
startEnhancedServer().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
