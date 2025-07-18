// Network configuration utility
export const NetworkConfig = {
  // Get current environment info
  getCurrentHost: () => window.location.hostname,
  getCurrentPort: () => window.location.port,
  getCurrentProtocol: () => window.location.protocol,
  
  // Check if running on localhost
  isLocalhost: () => {
    const host = window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1';
  },
  
  // Check if running on local network
  isLocalNetwork: () => {
    const host = window.location.hostname;
    return (
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
    );
  },
  
  // Get the backend URL based on current environment
  getBackendUrl: () => {
    const currentHost = window.location.hostname;
    
    if (NetworkConfig.isLocalhost()) {
      return 'http://localhost:5000';
    }
    
    // Use same IP as frontend but port 5000 for backend
    return `http://${currentHost}:5000`;
  },
  
  // Get the API base URL
  getApiBaseUrl: () => `${NetworkConfig.getBackendUrl()}/api`,
  
  // Display current network configuration
  logNetworkInfo: () => {
    console.log('=== Network Configuration ===');
    console.log('Frontend URL:', window.location.origin);
    console.log('Backend URL:', NetworkConfig.getBackendUrl());
    console.log('API Base URL:', NetworkConfig.getApiBaseUrl());
    console.log('Is Localhost:', NetworkConfig.isLocalhost());
    console.log('Is Local Network:', NetworkConfig.isLocalNetwork());
    console.log('============================');
  }
};

export default NetworkConfig;
