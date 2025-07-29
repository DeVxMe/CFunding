import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CampaignCard } from '@/components/CampaignCard';
import { DonationModal } from '@/components/DonationModal';
import { 
  Rocket, 
  Shield, 
  Zap, 
  Globe,
  ArrowRight,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';
import { CampaignWithKey } from '@/types/program';
import { PublicKey } from '@solana/web3.js';

// Mock data for featured campaigns
const featuredCampaigns: CampaignWithKey[] = [
  {
    publicKey: new PublicKey('11111111111111111111111111111111'),
    cid: 1,
    creator: new PublicKey('22222222222222222222222222222222'),
    title: 'Solar-Powered Water Purification System',
    description: 'Bringing clean water to remote communities using sustainable solar technology. Our innovative purification system can serve 1000+ people daily.',
    imageUrl: 'https://images.unsplash.com/photo-1581092795442-1930a7b61527?w=800&h=600&fit=crop',
    goal: 50000000000, // 50 SOL
    amountRaised: 37500000000, // 37.5 SOL
    timestamp: Date.now() / 1000,
    donors: 157,
    withdrawals: 0,
    balance: 37500000000,
    active: true,
  },
  {
    publicKey: new PublicKey('33333333333333333333333333333333'),
    cid: 2,
    creator: new PublicKey('44444444444444444444444444444444'),
    title: 'Open Source Learning Platform',
    description: 'Building a decentralized educational platform that makes quality education accessible to everyone, everywhere.',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
    goal: 30000000000, // 30 SOL
    amountRaised: 18000000000, // 18 SOL
    timestamp: Date.now() / 1000,
    donors: 89,
    withdrawals: 0,
    balance: 18000000000,
    active: true,
  },
  {
    publicKey: new PublicKey('55555555555555555555555555555555'),
    cid: 3,
    creator: new PublicKey('66666666666666666666666666666666'),
    title: 'Urban Vertical Farm Initiative',
    description: 'Creating sustainable food production in urban areas through innovative vertical farming techniques and community engagement.',
    imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=600&fit=crop',
    goal: 75000000000, // 75 SOL
    amountRaised: 45000000000, // 45 SOL
    timestamp: Date.now() / 1000,
    donors: 203,
    withdrawals: 1,
    balance: 35000000000,
    active: true,
  },
];

const features = [
  {
    icon: Shield,
    title: 'Transparent & Secure',
    description: 'All transactions on Solana blockchain with full transparency and security.',
  },
  {
    icon: Zap,
    title: 'Fast & Low Cost',
    description: 'Lightning-fast transactions with minimal fees thanks to Solana.',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Support projects worldwide without traditional banking barriers.',
  },
];

const stats = [
  { icon: Target, label: 'Total Raised', value: '2.4M SOL' },
  { icon: Users, label: 'Active Campaigns', value: '1,247' },
  { icon: TrendingUp, label: 'Success Rate', value: '94%' },
];

export const HomePage: React.FC = () => {
  const [donationModal, setDonationModal] = useState<{
    open: boolean;
    campaignId: number;
    campaignTitle: string;
  }>({
    open: false,
    campaignId: 0,
    campaignTitle: '',
  });

  const handleDonate = (campaignId: number) => {
    const campaign = featuredCampaigns.find(c => c.cid === campaignId);
    if (campaign) {
      setDonationModal({
        open: true,
        campaignId,
        campaignTitle: campaign.title,
      });
    }
  };

  const handleViewCampaign = (campaignId: number) => {
    // Navigate to campaign details
    window.location.href = `/campaigns/${campaignId}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="hero-gradient py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            <Rocket className="mr-2 h-4 w-4" />
            Powered by Solana
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Fund the Future with
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              {" "}Blockchain
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Launch and support innovative projects on the world's fastest blockchain. 
            Transparent, secure, and decentralized crowdfunding for everyone.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/campaigns">
              <Button size="lg" className="btn-primary-gradient">
                Explore Campaigns
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/create">
              <Button size="lg" variant="outline">
                Start a Campaign
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-2">
                    {stat.value}
                  </h3>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Campaigns
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover innovative projects making a real impact. Support creators 
              and entrepreneurs building the future.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.cid}
                campaign={campaign}
                onDonate={handleDonate}
                onView={handleViewCampaign}
              />
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/campaigns">
              <Button variant="outline" size="lg">
                View All Campaigns
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose SolanaCrowd?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built on Solana's high-performance blockchain for the best 
              crowdfunding experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mb-6">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of creators and supporters building the future together.
          </p>
          <Link to="/create">
            <Button size="lg" className="btn-primary-gradient">
              Launch Your Campaign
              <Rocket className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Donation Modal */}
      <DonationModal
        open={donationModal.open}
        onClose={() => setDonationModal({ ...donationModal, open: false })}
        campaignId={donationModal.campaignId}
        campaignTitle={donationModal.campaignTitle}
        onSuccess={() => {
          // Refresh data or show success message
          console.log('Donation successful');
        }}
      />
    </div>
  );
};