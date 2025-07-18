import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { testConnection } from '@/services/api';
import NetworkConfig from '@/lib/network-config';

interface NetworkStatusProps {
  showDetails?: boolean;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ showDetails = false }) => {
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean;
    loading: boolean;
    error?: string;
    lastCheck?: Date;
  }>({
    isConnected: false,
    loading: true
  });

  const checkConnection = async () => {
    setConnectionStatus(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await testConnection();
      setConnectionStatus({
        isConnected: result.success,
        loading: false,
        error: result.success ? undefined : result.error,
        lastCheck: new Date()
      });
    } catch (error) {
      setConnectionStatus({
        isConnected: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date()
      });
    }
  };

  useEffect(() => {
    checkConnection();
    // Log network info on component mount
    NetworkConfig.logNetworkInfo();
  }, []);

  if (!showDetails) {
    return (
      <Badge 
        variant={connectionStatus.isConnected ? 'default' : 'destructive'}
        className="ml-2"
      >
        {connectionStatus.loading ? 'Checking...' : 
         connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
      </Badge>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Network Status
          <Badge 
            variant={connectionStatus.isConnected ? 'default' : 'destructive'}
          >
            {connectionStatus.loading ? 'Checking...' : 
             connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Backend connectivity status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div>
            <strong>Frontend:</strong> {window.location.origin}
          </div>
          <div>
            <strong>Backend:</strong> {NetworkConfig.getBackendUrl()}
          </div>
          <div>
            <strong>API Base:</strong> {NetworkConfig.getApiBaseUrl()}
          </div>
          <div>
            <strong>Environment:</strong> {
              NetworkConfig.isLocalhost() ? 'Localhost' : 
              NetworkConfig.isLocalNetwork() ? 'Local Network' : 'Remote'
            }
          </div>
          {connectionStatus.lastCheck && (
            <div>
              <strong>Last Check:</strong> {connectionStatus.lastCheck.toLocaleTimeString()}
            </div>
          )}
          {connectionStatus.error && (
            <div className="text-red-600">
              <strong>Error:</strong> {connectionStatus.error}
            </div>
          )}
        </div>
        
        <Button 
          onClick={checkConnection} 
          disabled={connectionStatus.loading}
          size="sm"
          className="w-full"
        >
          {connectionStatus.loading ? 'Checking...' : 'Test Connection'}
        </Button>

        {!connectionStatus.isConnected && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <strong>Troubleshooting:</strong>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>Make sure the backend server is running on port 5000</li>
              <li>Check if your firewall allows connections to port 5000</li>
              <li>Verify both frontend and backend are on the same network</li>
              <li>Try accessing {NetworkConfig.getBackendUrl()} directly in browser</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NetworkStatus;
