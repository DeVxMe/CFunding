import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAnchorCrowdfunding } from '@/hooks/useAnchorCrowdfunding';
import { isValidSolAmount } from '@/lib/solana';
import { Loader2, Heart } from 'lucide-react';

interface DonationModalProps {
  open: boolean;
  onClose: () => void;
  campaignId: number;
  campaignTitle: string;
  onSuccess?: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  open,
  onClose,
  campaignId,
  campaignTitle,
  onSuccess,
}) => {
  const { connected } = useWallet();
  const { donateToCampaign, loading } = useAnchorCrowdfunding();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const validateAmount = (value: string): boolean => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    if (!isValidSolAmount(num)) {
      setError('Amount must be between 1 and 1,000,000 SOL');
      return false;
    }
    if (num < 1) {
      setError('Minimum donation is 1 SOL');
      return false;
    }
    setError('');
    return true;
  };

  const handleDonate = async () => {
    if (!validateAmount(amount)) return;

    try {
      await donateToCampaign(campaignId, parseFloat(amount));
      setAmount('');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Donation failed:', error);
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (value) {
      validateAmount(value);
    } else {
      setError('');
    }
  };

  const handleClose = () => {
    setAmount('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Support Campaign
          </DialogTitle>
          <DialogDescription>
            Make a donation to "{campaignTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!connected ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Connect your wallet to make a donation
              </p>
              <WalletMultiButton className="!bg-primary hover:!bg-primary/90" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="amount">Donation Amount (SOL)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.1"
                  placeholder="Enter amount in SOL"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className={error ? 'border-destructive' : ''}
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[1, 5, 10].map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAmountChange(preset.toString())}
                  >
                    {preset} SOL
                  </Button>
                ))}
              </div>

              <div className="bg-muted p-3 rounded-lg text-sm">
                <p className="text-muted-foreground">
                  • Minimum donation: 1 SOL
                </p>
                <p className="text-muted-foreground">
                  • Donations are processed on Solana blockchain
                </p>
                <p className="text-muted-foreground">
                  • Transaction fees will apply
                </p>
              </div>
            </>
          )}
        </div>

        {connected && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleDonate}
              disabled={loading || !amount || !!error}
              className="btn-primary-gradient"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Donate {amount && `${amount} SOL`}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};