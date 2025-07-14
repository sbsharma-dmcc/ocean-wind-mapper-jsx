import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TokenInputProps {
  onValidToken: (token: string) => void;
  currentToken: string;
}

const TokenInput: React.FC<TokenInputProps> = ({ onValidToken, currentToken }) => {
  const [token, setToken] = useState(currentToken);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'testing' | 'valid' | 'invalid'>('idle');

  const validateToken = async () => {
    if (!token.trim()) return;
    
    setIsValidating(true);
    setValidationStatus('testing');
    
    try {
      // Test the token by making a simple request to DTN API
      const testUrl = `https://map.api.dtn.com/v2/tiles/16a81a7a-e6f0-4e5e-9bae-2b9283d1ead5/3/1/1?access_token=${token}`;
      
      const response = await fetch(testUrl, {
        method: 'HEAD', // Just check if endpoint responds
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok || response.status === 200) {
        setValidationStatus('valid');
        onValidToken(token);
      } else {
        setValidationStatus('invalid');
      }
    } catch (error) {
      console.error('Token validation error:', error);
      setValidationStatus('invalid');
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = () => {
    switch (validationStatus) {
      case 'testing':
        return <Key className="h-4 w-4 animate-spin text-primary" />;
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Key className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold">DTN API Authentication Issue</h3>
        </div>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            The DTN API is returning 401 Unauthorized errors. This could be due to:
            <ul className="mt-2 ml-4 list-disc text-sm">
              <li>Expired access token</li>
              <li>Incorrect authentication format</li>
              <li>API endpoint or permissions issue</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="dtn-token" className="text-sm font-medium">
            DTN Access Token
          </Label>
          <div className="flex gap-2">
            <Input
              id="dtn-token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your DTN access token..."
              className="font-mono text-xs"
            />
            <Button
              onClick={validateToken}
              disabled={isValidating || !token.trim()}
              variant="outline"
              className="flex items-center gap-2"
            >
              {getStatusIcon()}
              {isValidating ? 'Testing...' : 'Test'}
            </Button>
          </div>
        </div>

        {validationStatus === 'valid' && (
          <Alert className="border-green-500">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              Token validated successfully! The map will reload with new credentials.
            </AlertDescription>
          </Alert>
        )}

        {validationStatus === 'invalid' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Token validation failed. Please check:
              <ul className="mt-2 ml-4 list-disc text-sm">
                <li>Token is not expired</li>
                <li>Token has correct permissions for map tiles</li>
                <li>Your DTN account is active</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
          <strong>How to get a new DTN token:</strong>
          <ol className="mt-2 ml-4 list-decimal">
            <li>Log in to your DTN Weather API dashboard</li>
            <li>Navigate to API Keys or Authentication section</li>
            <li>Generate a new access token with map tile permissions</li>
            <li>Copy the token and paste it above</li>
          </ol>
        </div>
      </div>
    </Card>
  );
};

export default TokenInput;