# HarvestConnect - Network Setup Guide

## Overview

This guide helps you set up HarvestConnect to work on your local network, allowing other devices to access your application using your computer's IP address.

## Quick Start (Network Access)

### Option 1: Use the Batch Script (Windows)
1. Double-click `start-network.bat` in the root directory
2. The script will automatically detect your IP and start both servers
3. Access the application at `http://[YOUR-IP]:8080`

### Option 2: Manual Setup

#### 1. Start Backend Server
```bash
cd backend
npm run dev
```
The backend will be available at:
- Localhost: `http://localhost:5000`
- Network: `http://[YOUR-IP]:5000`

#### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```
The frontend will be available at:
- Localhost: `http://localhost:8080`
- Network: `http://[YOUR-IP]:8080`

## Network Configuration

### What Was Fixed

1. **Backend Server Configuration**
   - Changed server to listen on `0.0.0.0` instead of `localhost`
   - Updated CORS to allow local network IPs
   - Added health check endpoint at `/api/health`

2. **Frontend API Configuration**
   - Dynamic API base URL detection
   - Automatic switching between localhost and network IP
   - Network connectivity testing
   - Better error handling for network issues

3. **Network Utilities**
   - `NetworkConfig` utility for network detection
   - `NetworkStatus` component for debugging connectivity
   - Connection testing functionality

### Current Network Settings

#### Backend (`server.js`)
- Listens on: `0.0.0.0:5000` (all network interfaces)
- CORS allows:
  - `http://localhost:8080`
  - `http://localhost:3000`
  - `http://192.168.1.9:8080` (your current network IP)
  - Any local network IP pattern (192.168.x.x, 10.x.x.x, 172.16-31.x.x)

#### Frontend (`vite.config.ts`)
- Listens on: `::` (IPv6 all interfaces, includes IPv4)
- Port: `8080`
- Automatically detects and uses correct backend URL

## Finding Your Network IP Address

### Windows (PowerShell/Command Prompt)
```cmd
ipconfig | findstr "IPv4"
```

### Windows (PowerShell alternative)
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -eq "Wi-Fi" -or $_.InterfaceAlias -eq "Ethernet"}
```

### macOS/Linux
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

## Troubleshooting

### Connection Issues

1. **Backend not accessible from network:**
   - Check Windows Firewall settings
   - Ensure port 5000 is allowed through firewall
   - Verify backend is running with `0.0.0.0` binding

2. **Frontend shows network errors:**
   - Check browser console for detailed error messages
   - Use the NetworkStatus component to diagnose issues
   - Verify both frontend and backend are on same network

3. **CORS errors:**
   - Check that your IP is included in the CORS origin list
   - The configuration should automatically handle most local network IPs

### Firewall Configuration (Windows)

If you're having connectivity issues, you may need to allow the applications through Windows Firewall:

1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Click "Change Settings" then "Allow another app"
4. Add Node.js for the backend server
5. Make sure both "Private" and "Public" are checked

### Testing Connectivity

1. **Manual Backend Test:**
   Open browser and go to: `http://[YOUR-IP]:5000/api/health`
   You should see: `{"status":"OK","message":"HarvestConnect API is healthy",...}`

2. **Frontend Network Status:**
   The NetworkStatus component will show detailed connectivity information and help diagnose issues.

## Development vs Production

### Development (Current Setup)
- Frontend: Vite dev server on port 8080
- Backend: Node.js/Express on port 5000
- Hot reload enabled
- Debug logging enabled

### Production Considerations
For production deployment, you would:
1. Build the frontend: `npm run build`
2. Serve static files through a web server (nginx, Apache)
3. Use a process manager like PM2 for the backend
4. Configure proper domain names and SSL certificates
5. Set up environment-specific configurations

## Security Notes

- This setup is for development/local network use only
- For production, implement proper authentication, HTTPS, and security headers
- Consider using environment variables for different deployment targets
- The current CORS configuration is permissive for development convenience

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Check the backend terminal for server logs
3. Use the NetworkStatus component for connectivity diagnostics
4. Verify firewall settings
5. Ensure both devices are on the same network

## File Changes Summary

### Backend Changes
- `server.js`: Added network binding and CORS configuration
- `.env`: Added PORT configuration
- Added health check endpoint

### Frontend Changes
- `src/services/api.ts`: Dynamic API URL detection
- `src/lib/network-config.ts`: Network utility functions
- `src/components/NetworkStatus.tsx`: Network diagnostics component
- `vite.config.ts`: Already configured for network access

### Additional Files
- `start-network.bat`: Automated startup script for Windows
- This README file with comprehensive setup instructions
