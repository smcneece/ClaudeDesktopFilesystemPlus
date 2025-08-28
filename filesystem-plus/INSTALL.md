# Quick Installation Guide - Filesystem Plus

## 🚀 How to Install Filesystem Plus Extension

### Step 1: Locate Your Claude Desktop Extensions Folder
The location depends on your operating system:

**Windows:**
```
%APPDATA%\Claude\Claude Extensions\
```

**macOS:**
```
~/Library/Application Support/Claude/extensions/
```

**Linux:**
```
~/.config/Claude/extensions/
```

### Step 2: Copy the Extension
1. Copy the entire `filesystem-plus` folder to your Claude Desktop extensions directory
2. The final path should look like:
   - Windows: `%APPDATA%\Claude\Claude Extensions\filesystem-plus\`
   - macOS: `~/Library/Application Support/Claude/extensions/filesystem-plus/`
   - Linux: `~/.config/Claude/extensions/filesystem-plus/`

### Step 3: Install via Claude Desktop
1. Open Claude Desktop
2. Go to **Settings** > **Extensions**
3. Click **Install Extension**
4. Select the `filesystem-plus` folder you copied
5. Confirm installation

### Step 4: Configure Permissions
1. In the extension settings, you'll see two sections:
   - **Read-Write Directories**: Folders Claude can modify
   - **Read-Only Directories**: Folders Claude can only read
2. Add your desired directories to each section
3. Click **Save** to apply changes

### Step 5: Test the Extension
1. Try reading a file from a read-only directory ✅ Should work
2. Try modifying a file in a read-only directory ❌ Should be blocked
3. Try creating a file in a read-write directory ✅ Should work

## 🔧 Example Configuration

**Read-Write Directories (Full Access):**
- `C:\Users\YourName\Documents\Projects\`
- `C:\Users\YourName\Desktop\Temp\`

**Read-Only Directories (Safe Access):**
- `C:\Users\YourName\Documents\Important\`
- `C:\Users\YourName\Documents\Archives\`

## ❓ Troubleshooting

### Extension Won't Install
- Ensure Node.js 16.0+ is installed
- Check that all files are in the correct location
- Restart Claude Desktop and try again

### Permissions Not Working
- Verify directory paths are correct
- Check that directories exist
- Make sure you saved the configuration

### Need Help?
- Check the main README.md for detailed documentation
- Ensure you're using Claude Desktop 0.10.0 or higher

---

**🎉 Enjoy your enhanced filesystem security with Filesystem Plus!**
