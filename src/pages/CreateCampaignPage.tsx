import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useCrowdfunding } from '@/hooks/useCrowdfunding';
import { isValidSolAmount } from '@/lib/solana';
import { 
  Loader2, 
  Upload, 
  Eye, 
  Target,
  Calendar,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface FormData {
  title: string;
  description: string;
  imageUrl: string;
  goal: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  imageUrl?: string;
  goal?: string;
}

export const CreateCampaignPage: React.FC = () => {
  const navigate = useNavigate();
  const { connected } = useWallet();
  const { createCampaign, loading } = useCrowdfunding();
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    imageUrl: '',
    goal: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPreview, setShowPreview] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 64) {
      newErrors.title = 'Title must be 64 characters or less';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 512) {
      newErrors.description = 'Description must be 512 characters or less';
    }

    // Image URL validation
    if (formData.imageUrl && formData.imageUrl.length > 256) {
      newErrors.imageUrl = 'Image URL must be 256 characters or less';
    }

    // Goal validation
    if (!formData.goal.trim()) {
      newErrors.goal = 'Goal amount is required';
    } else {
      const goalAmount = parseFloat(formData.goal);
      if (isNaN(goalAmount) || goalAmount <= 0) {
        newErrors.goal = 'Please enter a valid goal amount';
      } else if (!isValidSolAmount(goalAmount)) {
        newErrors.goal = 'Goal must be between 1 and 1,000,000 SOL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const result = await createCampaign(
        formData.title,
        formData.description,
        formData.imageUrl,
        parseFloat(formData.goal)
      );
      
      // Navigate to the created campaign
      navigate(`/campaigns/${result.campaignId}`);
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  Connect Wallet to Create Campaign
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  You need to connect your Solana wallet to create a campaign.
                </p>
                <WalletMultiButton className="!bg-primary hover:!bg-primary/90" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Create Your Campaign
            </h1>
            <p className="text-muted-foreground">
              Launch your project on Solana blockchain and reach supporters worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Campaign Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Campaign Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter your campaign title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={errors.title ? 'border-destructive' : ''}
                      maxLength={64}
                    />
                    <div className="flex justify-between text-sm">
                      {errors.title && (
                        <span className="text-destructive">{errors.title}</span>
                      )}
                      <span className="text-muted-foreground ml-auto">
                        {formData.title.length}/64
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your project, goals, and how funds will be used"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className={`min-h-[120px] ${errors.description ? 'border-destructive' : ''}`}
                      maxLength={512}
                    />
                    <div className="flex justify-between text-sm">
                      {errors.description && (
                        <span className="text-destructive">{errors.description}</span>
                      )}
                      <span className="text-muted-foreground ml-auto">
                        {formData.description.length}/512
                      </span>
                    </div>
                  </div>

                  {/* Image URL */}
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                    <Input
                      id="imageUrl"
                      placeholder="https://example.com/image.jpg"
                      value={formData.imageUrl}
                      onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                      className={errors.imageUrl ? 'border-destructive' : ''}
                      maxLength={256}
                    />
                    <div className="flex justify-between text-sm">
                      {errors.imageUrl && (
                        <span className="text-destructive">{errors.imageUrl}</span>
                      )}
                      <span className="text-muted-foreground ml-auto">
                        {formData.imageUrl.length}/256
                      </span>
                    </div>
                  </div>

                  {/* Goal */}
                  <div className="space-y-2">
                    <Label htmlFor="goal">Funding Goal (SOL) *</Label>
                    <Input
                      id="goal"
                      type="number"
                      min="1"
                      step="0.1"
                      placeholder="Enter goal amount in SOL"
                      value={formData.goal}
                      onChange={(e) => handleInputChange('goal', e.target.value)}
                      className={errors.goal ? 'border-destructive' : ''}
                    />
                    {errors.goal && (
                      <span className="text-destructive text-sm">{errors.goal}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex-1"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {showPreview ? 'Hide Preview' : 'Preview'}
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 btn-primary-gradient"
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Campaign
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Preview/Guidelines */}
            <div className="space-y-6">
              {showPreview ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        {formData.imageUrl ? (
                          <img
                            src={formData.imageUrl}
                            alt="Campaign preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-lg">
                        {formData.title || 'Campaign Title'}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {formData.description || 'Campaign description will appear here...'}
                      </p>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {formData.goal ? `${formData.goal} SOL` : '0 SOL'}
                        </p>
                        <p className="text-sm text-muted-foreground">Goal</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Guidelines */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Campaign Guidelines
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold">Title Tips:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Keep it clear and descriptive</li>
                          <li>• Highlight the main benefit or innovation</li>
                          <li>• Maximum 64 characters</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold">Description Best Practices:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Explain what you're building</li>
                          <li>• Share your motivation and goals</li>
                          <li>• Detail how funds will be used</li>
                          <li>• Maximum 512 characters</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold">Funding Goal:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Set a realistic and achievable target</li>
                          <li>• Minimum 1 SOL required</li>
                          <li>• Consider platform fees (5%)</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Platform Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Platform Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Platform Fee:</span>
                        <span>5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Blockchain:</span>
                        <span>Solana</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Min Donation:</span>
                        <span>1 SOL</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Withdrawal Fee:</span>
                        <span>Network fees only</span>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};