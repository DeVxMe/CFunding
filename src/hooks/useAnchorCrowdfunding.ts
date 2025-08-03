import { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { toast } from '@/hooks/use-toast';
import { 
  getAnchorProvider,
  getCrowdfundingProgram,
  getProgramStatePDA,
  getCampaignPDA,
  getDonationPDA,
  getWithdrawalPDA,
  DEPLOYER_KEYPAIR
} from '@/lib/anchor';
import { solToLamports } from '@/lib/solana';

export const useAnchorCrowdfunding = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const [loading, setLoading] = useState(false);

  const getProgram = useCallback(() => {
    if (!publicKey || !signTransaction || !signAllTransactions) {
      throw new Error('Wallet not connected');
    }
    
    const wallet = {
      publicKey,
      signTransaction,
      signAllTransactions,
    };
    
    const provider = getAnchorProvider(wallet, connection);
    return getCrowdfundingProgram(provider);
  }, [publicKey, signTransaction, signAllTransactions, connection]);

  const initializeProgram = useCallback(async () => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    setLoading(true);
    try {
      const program = getProgram();
      const [programStatePda] = getProgramStatePDA();
      
      // Check if already initialized
      try {
        await (program.account as any).programState.fetch(programStatePda);
        toast({
          title: "Already Initialized",
          description: "Program is already initialized.",
        });
        return;
      } catch (error) {
        // Program not initialized, continue with initialization
      }
      
      await program.methods
        .initialize()
        .accounts({
          deployer: publicKey,
        })
        .rpc();
      
      toast({
        title: "Program Initialized!",
        description: "The crowdfunding program has been initialized successfully.",
      });

    } catch (error: any) {
      console.error('Error initializing program:', error);
      
      toast({
        title: "Initialization Failed",
        description: error.message || "Failed to initialize program",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [publicKey, getProgram]);

  const createCampaign = useCallback(async (
    title: string,
    description: string,
    imageUrl: string,
    goalSol: number
  ) => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    setLoading(true);
    try {
      const program = getProgram();
      const [programStatePda] = getProgramStatePDA();
      
      // Get program state to determine next campaign ID
      let campaignCount = 0;
      try {
        const programState = await (program.account as any).programState.fetch(programStatePda);
        campaignCount = programState.campaignCount.toNumber();
      } catch (error) {
        // Auto-initialize if not initialized
        await initializeProgram();
        campaignCount = 0;
      }

      // Use current timestamp as campaign ID (similar to test approach)
      const campaignId = new anchor.BN(Math.floor(Date.now() / 1000));
      const [campaignPda] = getCampaignPDA(campaignId);
      
      const goalLamports = new anchor.BN(solToLamports(goalSol));
      
      await program.methods
        .createCampaign(title, description, imageUrl, goalLamports)
        .accounts({
          creator: publicKey,
          campaign: campaignPda,
          programState: programStatePda,
        })
        .rpc();
      
      toast({
        title: "Campaign Created!",
        description: `Campaign "${title}" has been created successfully.`,
      });

      return { campaignId: campaignId.toNumber() };
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      
      // Parse Anchor program errors
      let errorMessage = error.message || "Failed to create campaign";
      if (error.error?.errorCode?.code === 'TitleTooLong') {
        errorMessage = 'Title is too long (max 64 characters)';
      } else if (error.error?.errorCode?.code === 'DescriptionTooLong') {
        errorMessage = 'Description is too long (max 512 characters)';
      } else if (error.error?.errorCode?.code === 'InvalidGoalAmount') {
        errorMessage = 'Goal must be at least 1 SOL';
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [publicKey, getProgram, initializeProgram]);

  const donateToCampaign = useCallback(async (
    campaignId: number,
    amountSol: number
  ) => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    setLoading(true);
    try {
      const program = getProgram();
      const [campaignPda] = getCampaignPDA(campaignId);
      
      // Get current campaign state to calculate donor count
      const campaign = await (program.account as any).campaign.fetch(campaignPda);
      const nextDonorCount = campaign.donors.add(new anchor.BN(1));
      
      const [donationPda] = getDonationPDA(publicKey, campaignId, nextDonorCount);
      
      const amountLamports = new anchor.BN(solToLamports(amountSol));
      const campaignIdBN = new anchor.BN(campaignId);
      
      await program.methods
        .donate(campaignIdBN, amountLamports)
        .accounts({
          donor: publicKey,
          transaction: donationPda,
        })
        .rpc();
      
      toast({
        title: "Donation Successful!",
        description: `You donated ${amountSol} SOL to the campaign.`,
      });

    } catch (error: any) {
      console.error('Error donating:', error);
      
      let errorMessage = error.message || "Failed to process donation";
      if (error.error?.errorCode?.code === 'InvalidDonationAmount') {
        errorMessage = 'Donation must be at least 1 SOL';
      } else if (error.error?.errorCode?.code === 'CampaignNotFound') {
        errorMessage = 'Campaign not found';
      }
      
      toast({
        title: "Donation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [publicKey, getProgram]);

  const withdrawFromCampaign = useCallback(async (
    campaignId: number,
    amountSol: number
  ) => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    setLoading(true);
    try {
      const program = getProgram();
      const [campaignPda] = getCampaignPDA(campaignId);
      const [programStatePda] = getProgramStatePDA();
      
      // Get current campaign state to calculate withdrawal count
      const campaign = await (program.account as any).campaign.fetch(campaignPda);
      const nextWithdrawalCount = campaign.withdrawals.add(new anchor.BN(1));
      
      const [withdrawalPda] = getWithdrawalPDA(publicKey, campaignId, nextWithdrawalCount);
      
      const amountLamports = new anchor.BN(solToLamports(amountSol));
      const campaignIdBN = new anchor.BN(campaignId);
      
      await program.methods
        .withdraw(campaignIdBN, amountLamports)
        .accounts({
          creator: publicKey,
          transaction: withdrawalPda,
          programState: programStatePda,
          platformAddress: DEPLOYER_KEYPAIR.publicKey,
        })
        .rpc();
      
      toast({
        title: "Withdrawal Successful!",
        description: `You withdrew ${amountSol} SOL from the campaign.`,
      });

    } catch (error: any) {
      console.error('Error withdrawing:', error);
      
      let errorMessage = error.message || "Failed to process withdrawal";
      if (error.error?.errorCode?.code === 'Unauthorized') {
        errorMessage = 'You are not authorized to withdraw from this campaign';
      } else if (error.error?.errorCode?.code === 'InvalidWithdrawalAmount') {
        errorMessage = 'Withdrawal must be at least 1 SOL';
      } else if (error.error?.errorCode?.code === 'InsufficientFund') {
        errorMessage = 'Insufficient funds in campaign';
      }
      
      toast({
        title: "Withdrawal Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [publicKey, getProgram]);

  return {
    initializeProgram,
    createCampaign,
    donateToCampaign,
    withdrawFromCampaign,
    loading,
  };
};