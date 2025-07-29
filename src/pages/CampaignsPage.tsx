import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { Search, Filter, Grid, List, ArrowRight } from 'lucide-react';
import { CampaignWithKey } from '@/types/program';

// Empty campaigns array - will be populated from blockchain
const allCampaigns: CampaignWithKey[] = [];

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
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-foreground mb-2">
              {allCampaigns.length === 0 ? 'No Campaigns Found' : 'No Results Found'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {allCampaigns.length === 0 
                ? 'Be the first to create a campaign on our platform!'
                : 'Try adjusting your search or filters to find campaigns.'
              }
            </p>
            {allCampaigns.length === 0 && (
              <Link to="/create">
                <Button className="btn-primary-gradient">
                  Create First Campaign
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
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

        {/* Load More - only show if there are campaigns */}
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