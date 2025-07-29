import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DonationModal } from '@/components/DonationModal';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  Target, 
  Wallet,
  Heart,
  Share2,
  Flag,
  ExternalLink
} from 'lucide-react';
import { formatSol, formatDateTime, calculateProgress, truncateAddress } from '@/lib/solana';
import { useWallet } from '@solana/wallet-adapter-react';

export const CampaignDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { connected } = useWallet();
  const [donationModal, setDonationModal] = useState(false);

  // In a real app, this would fetch the campaign data from the blockchain
  const campaign = null; // No campaign found since we removed mock data

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center py-16">
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Campaign Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              The campaign you're looking for doesn't exist or has been removed.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/campaigns">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Browse Campaigns
                </Button>
              </Link>
              <Link to="/create">
                <Button className="btn-primary-gradient">
                  Create Campaign
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link to="/campaigns">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaigns
            </Button>
          </Link>

          {/* Campaign Content - This would be populated with real data */}
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Campaign #{id}
            </h1>
            <p className="text-muted-foreground">
              Campaign details will be loaded from the blockchain when available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};