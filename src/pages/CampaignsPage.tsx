import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CampaignCard } from '@/components/CampaignCard';
import { DonationModal } from '@/components/DonationModal';
import { Search, Filter, Grid, List } from 'lucide-react';
import { CampaignWithKey } from '@/types/program';
import { PublicKey } from '@solana/web3.js';

// Mock data for all campaigns
const allCampaigns: CampaignWithKey[] = [
  {
    publicKey: new PublicKey('11111111111111111111111111111112'),
    cid: 1,
    creator: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    title: 'Solar-Powered Water Purification System',
    description: 'Bringing clean water to remote communities using sustainable solar technology. Our innovative purification system can serve 1000+ people daily.',
    imageUrl: 'https://images.unsplash.com/photo-1581092795442-1930a7b61527?w=800&h=600&fit=crop',
    goal: 50000000000,
    amountRaised: 37500000000,
    timestamp: Date.now() / 1000,
    donors: 157,
    withdrawals: 0,
    balance: 37500000000,
    active: true,
  },
  {
    publicKey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    cid: 2,
    creator: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    title: 'Open Source Learning Platform',
    description: 'Building a decentralized educational platform that makes quality education accessible to everyone, everywhere.',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
    goal: 30000000000,
    amountRaised: 18000000000,
    timestamp: Date.now() / 1000 - 86400,
    donors: 89,
    withdrawals: 0,
    balance: 18000000000,
    active: true,
  },
  {
    publicKey: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    cid: 3,
    creator: new PublicKey('So11111111111111111111111111111111111111112'),
    title: 'Urban Vertical Farm Initiative',
    description: 'Creating sustainable food production in urban areas through innovative vertical farming techniques and community engagement.',
    imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=600&fit=crop',
    goal: 75000000000,
    amountRaised: 45000000000,
    timestamp: Date.now() / 1000 - 172800,
    donors: 203,
    withdrawals: 1,
    balance: 35000000000,
    active: true,
  },
  {
    publicKey: new PublicKey('So11111111111111111111111111111111111111112'),
    cid: 4,
    creator: new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'),
    title: 'AI-Powered Health Monitoring Wearable',
    description: 'Revolutionary wearable device that uses AI to predict health issues before they become serious problems.',
    imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop',
    goal: 100000000000,
    amountRaised: 25000000000,
    timestamp: Date.now() / 1000 - 259200,
    donors: 67,
    withdrawals: 0,
    balance: 25000000000,
    active: true,
  },
  {
    publicKey: new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'),
    cid: 5,
    creator: new PublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'),
    title: 'Community Art Space',
    description: 'Creating a vibrant community space where local artists can showcase their work and teach art to children.',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop',
    goal: 20000000000,
    amountRaised: 20000000000,
    timestamp: Date.now() / 1000 - 345600,
    donors: 145,
    withdrawals: 2,
    balance: 5000000000,
    active: false,
  },
];

export const CampaignsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [donationModal, setDonationModal] = useState<{
    open: boolean;
    campaignId: number;
    campaignTitle: string;
  }>({
    open: false,
    campaignId: 0,
    campaignTitle: '',
  });

  // Filter and sort campaigns
  const filteredCampaigns = allCampaigns
    .filter((campaign) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!campaign.title.toLowerCase().includes(query) &&
            !campaign.description.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Status filter
      if (filterBy === 'active') return campaign.active;
      if (filterBy === 'completed') return !campaign.active;
      if (filterBy === 'funded') return campaign.amountRaised >= campaign.goal;

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.timestamp - a.timestamp;
        case 'oldest':
          return a.timestamp - b.timestamp;
        case 'most-funded':
          return b.amountRaised - a.amountRaised;
        case 'ending-soon':
          // For demo purposes, we'll sort by time remaining (mock calculation)
          return a.timestamp - b.timestamp;
        default:
          return 0;
      }
    });

  const handleDonate = (campaignId: number) => {
    const campaign = allCampaigns.find(c => c.cid === campaignId);
    if (campaign) {
      setDonationModal({
        open: true,
        campaignId,
        campaignTitle: campaign.title,
      });
    }
  };

  const handleViewCampaign = (campaignId: number) => {
    window.location.href = `/campaigns/${campaignId}`;
  };

  const totalCampaigns = allCampaigns.length;
  const activeCampaigns = allCampaigns.filter(c => c.active).length;
  const completedCampaigns = totalCampaigns - activeCampaigns;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Discover Campaigns
          </h1>
          <p className="text-muted-foreground mb-6">
            Explore innovative projects and support creators building the future.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Badge variant="outline" className="text-sm">
              {totalCampaigns} Total Campaigns
            </Badge>
            <Badge variant="outline" className="text-sm">
              {activeCampaigns} Active
            </Badge>
            <Badge variant="outline" className="text-sm">
              {completedCampaigns} Completed
            </Badge>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-card p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="most-funded">Most Funded</SelectItem>
                <SelectItem value="ending-soon">Ending Soon</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter */}
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="funded">Fully Funded</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex border border-border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex-1 rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex-1 rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            Showing {filteredCampaigns.length} of {totalCampaigns} campaigns
          </div>
        </div>

        {/* Campaign Grid/List */}
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No campaigns found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find campaigns.
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.cid}
                campaign={campaign}
                onDonate={handleDonate}
                onView={handleViewCampaign}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {filteredCampaigns.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Campaigns
            </Button>
          </div>
        )}
      </div>

      {/* Donation Modal */}
      <DonationModal
        open={donationModal.open}
        onClose={() => setDonationModal({ ...donationModal, open: false })}
        campaignId={donationModal.campaignId}
        campaignTitle={donationModal.campaignTitle}
        onSuccess={() => {
          console.log('Donation successful');
        }}
      />
    </div>
  );
};