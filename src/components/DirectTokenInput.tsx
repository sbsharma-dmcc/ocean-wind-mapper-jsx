import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { setDirectDTNToken, clearDirectDTNToken } from '@/utils/dtnTokenManager';

const DirectTokenInput: React.FC = () => {
  const [tokenInput, setTokenInput] = useState('');
  const { toast } = useToast();

  const handleSetToken = () => {
    if (!tokenInput.trim()) {
      toast({
        title: "Token Required",
        description: "Please enter a DTN token",
        variant: "destructive"
      });
      return;
    }

    setDirectDTNToken(tokenInput.trim());
    setTokenInput('');
    
    toast({
      title: "Token Set Successfully",
      description: "Initializing wind layer with new DTN token..."
    });

    // Trigger map refresh - this will hide the modal and apply wind layers
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('dtnTokenUpdated'));
    }, 500);
  };

  const handleClearToken = () => {
    clearDirectDTNToken();
    setTokenInput('');
    
    toast({
      title: "Token Cleared",
      description: "DTN token has been cleared"
    });

    // Trigger map refresh
    window.dispatchEvent(new CustomEvent('dtnTokenUpdated'));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Direct DTN Token</Label>
            <Input
              type="text"
              placeholder="Enter DTN Bearer token..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full"
            />
            <div className="flex gap-2">
              <Button onClick={handleSetToken} size="sm" className="flex-1">
                Set Token
              </Button>
              <Button onClick={handleClearToken} variant="outline" size="sm" className="flex-1">
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectTokenInput;