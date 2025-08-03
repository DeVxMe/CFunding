import { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Transaction, 
  SystemProgram,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
  Keypair
} from '@solana/web3.js';
import { toast } from '@/hooks/use-toast';
import { 
  PROGRAM_ID, 
  getCampaignPDA, 
  getProgramStatePDA,
  getDonationPDA,
  getWithdrawalPDA,
  solToLamports 
} from '@/lib/solana';

// Hardcoded deployer keypair for initialization
const DEPLOYER_KEYPAIR = Keypair.fromSecretKey(new Uint8Array([6,147,209,54,119,156,70,207,13,251,56,101,154,187,138,215,112,132,65,136,21,27,77,217,60,70,197,118,104,226,162,233,25,153,41,78,169,112,9,212,17,140,110,161,71,155,11,8,190,89,28,133,238,250,23,194,204,139,35,50,232,42,174,248]));

// Instruction discriminators (first 8 bytes of SHA256 hash of "global:instruction_name")
const INSTRUCTION_DISCRIMINATORS = {
  INITIALIZE: new Uint8Array([175, 175, 109, 31, 13, 152, 155, 237]),
  CREATE_CAMPAIGN: new Uint8Array([156, 233, 61, 246, 168, 45, 149, 174]),
  DONATE: new Uint8Array([184, 12, 86, 149, 70, 196, 97, 225]),
  WITHDRAW: new Uint8Array([183, 18, 70, 156, 148, 109, 161, 34]),
};

export const useCrowdfunding = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);

  const initializeProgram = useCallback(async () => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    setLoading(true);
    try {
      const [programStatePda] = getProgramStatePDA();
      
      // Check if already initialized
      const existingAccount = await connection.getAccountInfo(programStatePda);
      if (existingAccount) {
        toast({
          title: "Already Initialized",
          description: "Program is already initialized.",
        });
        return;
      }
      
      // Platform fee: 2.5% (250 basis points)
      const platformFee = 250;
      const platformAddress = DEPLOYER_KEYPAIR.publicKey;
      
      // Create instruction data
      const platformFeeBytes = new Uint8Array(2);
      const view = new DataView(platformFeeBytes.buffer);
      view.setUint16(0, platformFee, true); // little endian
      
      const instructionData = new Uint8Array([
        ...INSTRUCTION_DISCRIMINATORS.INITIALIZE,
        ...platformFeeBytes,
        ...platformAddress.toBytes()
      ]);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: programStatePda, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: Buffer.from(instructionData),
      });

      const transaction = new Transaction().add(instruction);
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast({
        title: "Program Initialized!",
        description: "The crowdfunding program has been initialized successfully.",
      });

      return signature;
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
  }, [publicKey, connection, sendTransaction]);

  const createCampaign = useCallback(async (
    title: string,
    description: string,
    imageUrl: string,
    goalSol: number
  ) => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    setLoading(true);
    try {
      const [programStatePda] = getProgramStatePDA();
      
      // Get program state to determine next campaign ID
      let programStateAccount;
      try {
        programStateAccount = await connection.getAccountInfo(programStatePda);
        if (!programStateAccount) {
          // Auto-initialize if not initialized
          await initializeProgram();
          programStateAccount = await connection.getAccountInfo(programStatePda);
        }
      } catch (error) {
        // Auto-initialize if not initialized
        await initializeProgram();
        programStateAccount = await connection.getAccountInfo(programStatePda);
      }

      // For now, we'll estimate the campaign ID (in production, parse the account data)
      const campaignId = Math.floor(Date.now() / 1000); // Use timestamp as ID
      const [campaignPda] = getCampaignPDA(campaignId);
      
      // Create instruction data using Borsh serialization format expected by Anchor
      const goalLamports = BigInt(solToLamports(goalSol));
      const goalBytes = new Uint8Array(8);
      const goalView = new DataView(goalBytes.buffer);
      goalView.setBigUint64(0, goalLamports, true);
      
      // Encode strings as UTF-8
      const encoder = new TextEncoder();
      const titleBytes = encoder.encode(title);
      const descriptionBytes = encoder.encode(description);
      const imageUrlBytes = encoder.encode(imageUrl);
      
      // Create length prefixed strings (Borsh format)
      const titleLengthBytes = new Uint8Array(4);
      const titleLengthView = new DataView(titleLengthBytes.buffer);
      titleLengthView.setUint32(0, titleBytes.length, true);
      
      const descLengthBytes = new Uint8Array(4);
      const descLengthView = new DataView(descLengthBytes.buffer);
      descLengthView.setUint32(0, descriptionBytes.length, true);
      
      const urlLengthBytes = new Uint8Array(4);
      const urlLengthView = new DataView(urlLengthBytes.buffer);
      urlLengthView.setUint32(0, imageUrlBytes.length, true);
      
      // Combine all data in Borsh serialization order
      const instructionData = new Uint8Array([
        ...INSTRUCTION_DISCRIMINATORS.CREATE_CAMPAIGN,
        ...titleLengthBytes,
        ...titleBytes,
        ...descLengthBytes,
        ...descriptionBytes,
        ...urlLengthBytes,
        ...imageUrlBytes,
        ...goalBytes
      ]);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: programStatePda, isSigner: false, isWritable: true },
          { pubkey: campaignPda, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: Buffer.from(instructionData),
      });

      const transaction = new Transaction().add(instruction);
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast({
        title: "Campaign Created!",
        description: `Campaign "${title}" has been created successfully.`,
      });

      return { signature, campaignId };
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      
      // Parse Solana program errors
      let errorMessage = error.message || "Failed to create campaign";
      if (error.message?.includes('TitleTooLong')) {
        errorMessage = 'Title is too long (max 64 characters)';
      } else if (error.message?.includes('DescriptionTooLong')) {
        errorMessage = 'Description is too long (max 512 characters)';
      } else if (error.message?.includes('InvalidGoalAmount')) {
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
  }, [publicKey, connection, sendTransaction]);

  const donateToCampaign = useCallback(async (
    campaignId: number,
    amountSol: number
  ) => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    setLoading(true);
    try {
      const [campaignPda] = getCampaignPDA(campaignId);
      
      // Check if campaign exists
      const campaignAccount = await connection.getAccountInfo(campaignPda);
      if (!campaignAccount) {
        throw new Error('Campaign not found');
      }

      // For donation transaction PDA, we need the donor count from the campaign
      // For now, use timestamp as unique identifier
      const donorCount = Math.floor(Date.now() / 1000);
      const [donationPda] = getDonationPDA(publicKey, campaignId, donorCount);
      
      const amountLamports = BigInt(solToLamports(amountSol));
      
      // Create instruction data using Uint8Array
      const campaignIdBytes = new Uint8Array(8);
      const amountBytes = new Uint8Array(8);
      
      const campaignIdView = new DataView(campaignIdBytes.buffer);
      const amountView = new DataView(amountBytes.buffer);
      
      campaignIdView.setBigUint64(0, BigInt(campaignId), true);
      amountView.setBigUint64(0, amountLamports, true);
      
      const instructionData = new Uint8Array([
        ...INSTRUCTION_DISCRIMINATORS.DONATE,
        ...campaignIdBytes,
        ...amountBytes
      ]);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: campaignPda, isSigner: false, isWritable: true },
          { pubkey: donationPda, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: Buffer.from(instructionData),
      });

      const transaction = new Transaction().add(instruction);
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast({
        title: "Donation Successful!",
        description: `You donated ${amountSol} SOL to the campaign.`,
      });

      return signature;
    } catch (error: any) {
      console.error('Error donating:', error);
      
      let errorMessage = error.message || "Failed to process donation";
      if (error.message?.includes('InvalidDonationAmount')) {
        errorMessage = 'Donation must be at least 1 SOL';
      } else if (error.message?.includes('CampaignNotFound')) {
        errorMessage = 'Campaign not found';
      } else if (error.message?.includes('InactiveCampaign')) {
        errorMessage = 'Campaign is inactive';
      } else if (error.message?.includes('CampaignGoalActualized')) {
        errorMessage = 'Campaign goal has been reached';
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
  }, [publicKey, connection, sendTransaction]);

  const withdrawFromCampaign = useCallback(async (
    campaignId: number,
    amountSol: number
  ) => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    setLoading(true);
    try {
      const [campaignPda] = getCampaignPDA(campaignId);
      const [programStatePda] = getProgramStatePDA();
      
      // Check if campaign exists
      const campaignAccount = await connection.getAccountInfo(campaignPda);
      if (!campaignAccount) {
        throw new Error('Campaign not found');
      }

      // For withdrawal transaction PDA
      const withdrawalCount = Math.floor(Date.now() / 1000);
      const [withdrawalPda] = getWithdrawalPDA(publicKey, campaignId, withdrawalCount);
      
      // Get program state for platform address
      const programStateAccount = await connection.getAccountInfo(programStatePda);
      if (!programStateAccount) {
        throw new Error('Program state not found');
      }
      
      // Use the generated deployer keypair as platform address
      const platformAddress = DEPLOYER_KEYPAIR.publicKey;
      
      const amountLamports = BigInt(solToLamports(amountSol));
      
      // Create instruction data using Uint8Array
      const campaignIdBytes = new Uint8Array(8);
      const amountBytes = new Uint8Array(8);
      
      const campaignIdView = new DataView(campaignIdBytes.buffer);
      const amountView = new DataView(amountBytes.buffer);
      
      campaignIdView.setBigUint64(0, BigInt(campaignId), true);
      amountView.setBigUint64(0, amountLamports, true);
      
      const instructionData = new Uint8Array([
        ...INSTRUCTION_DISCRIMINATORS.WITHDRAW,
        ...campaignIdBytes,
        ...amountBytes
      ]);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: campaignPda, isSigner: false, isWritable: true },
          { pubkey: withdrawalPda, isSigner: false, isWritable: true },
          { pubkey: programStatePda, isSigner: false, isWritable: true },
          { pubkey: platformAddress, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: Buffer.from(instructionData),
      });

      const transaction = new Transaction().add(instruction);
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast({
        title: "Withdrawal Successful!",
        description: `You withdrew ${amountSol} SOL from the campaign.`,
      });

      return signature;
    } catch (error: any) {
      console.error('Error withdrawing:', error);
      
      let errorMessage = error.message || "Failed to process withdrawal";
      if (error.message?.includes('Unauthorized')) {
        errorMessage = 'You are not authorized to withdraw from this campaign';
      } else if (error.message?.includes('InvalidWithdrawalAmount')) {
        errorMessage = 'Withdrawal must be at least 1 SOL';
      } else if (error.message?.includes('InsufficientFund')) {
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
  }, [publicKey, connection, sendTransaction]);

  return {
    initializeProgram,
    createCampaign,
    donateToCampaign,
    withdrawFromCampaign,
    loading,
  };
};