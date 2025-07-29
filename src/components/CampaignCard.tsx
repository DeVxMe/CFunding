import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Target, Wallet } from 'lucide-react';
import { formatSol, formatDate, calculateProgress, truncateAddress } from '@/lib/solana';
import { CampaignWithKey } from '@/types/program';

interface CampaignCardProps {
  campaign: CampaignWithKey;
  onDonate?: (campaignId: number) => void;
  onView?: (campaignId: number) => void;
  showActions?: boolean;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onDonate,
  onView,
  showActions = true,
}) => {
  const progress = calculateProgress(campaign.amountRaised, campaign.goal);
  const isCompleted = progress >= 100;
  const isActive = campaign.active;

  return (
    <Card className="card-glow h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-2">
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
          {isCompleted && (
            <Badge variant="default" className="bg-success">
              Funded
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl font-bold text-foreground line-clamp-2">
          {campaign.title}
        </CardTitle>
        <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
          {campaign.imageUrl ? (
            <img
              src={campaign.imageUrl}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Target className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <p className="text-muted-foreground text-sm line-clamp-3">
          {campaign.description}
        </p>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-between items-center">
            <div className="text-center">
              <p className="text-lg font-bold text-primary">
                {formatSol(campaign.amountRaised)}
              </p>
              <p className="text-xs text-muted-foreground">Raised</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">
                {formatSol(campaign.goal)}
              </p>
              <p className="text-xs text-muted-foreground">Goal</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{campaign.donors} donors</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(campaign.timestamp)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Creator: {truncateAddress(campaign.creator.toString())}
          </span>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="pt-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(campaign.cid)}
            className="flex-1"
          >
            View Details
          </Button>
          {isActive && !isCompleted && (
            <Button
              size="sm"
              onClick={() => onDonate?.(campaign.cid)}
              className="flex-1 btn-primary-gradient"
            >
              Donate
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};