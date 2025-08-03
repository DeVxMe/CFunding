import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Network configuration
export const NETWORK = 'devnet' as const;
export const RPC_URL = 'https://api.devnet.solana.com';

// Export PROGRAM_ID for compatibility
export const PROGRAM_ID = new PublicKey("CeS7WEPrgnfvgLrVPw3BmTDkt9hz6Cu9oUb1ZPjCMymm");

// Utility functions
export const solToLamports = (sol: number): number => {
  return Math.floor(sol * LAMPORTS_PER_SOL);
};

export const lamportsToSol = (lamports: number): number => {
  return lamports / LAMPORTS_PER_SOL;
};

// Keep these legacy PDA functions for compatibility
// Note: The actual PDA functions are now in /lib/anchor.ts
export const getProgramStatePDA = (): [PublicKey, number] => {
  const PROGRAM_ID = new PublicKey("CeS7WEPrgnfvgLrVPw3BmTDkt9hz6Cu9oUb1ZPjCMymm");
  return PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    PROGRAM_ID
  );
};

export const getCampaignPDA = (campaignId: number): [PublicKey, number] => {
  const PROGRAM_ID = new PublicKey("CeS7WEPrgnfvgLrVPw3BmTDkt9hz6Cu9oUb1ZPjCMymm");
  const campaignIdBuffer = Buffer.alloc(8);
  campaignIdBuffer.writeBigUInt64LE(BigInt(campaignId), 0);
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from("campaign"), campaignIdBuffer],
    PROGRAM_ID
  );
};

export const getDonationPDA = (donor: PublicKey, campaignId: number, donorCount: number): [PublicKey, number] => {
  const PROGRAM_ID = new PublicKey("CeS7WEPrgnfvgLrVPw3BmTDkt9hz6Cu9oUb1ZPjCMymm");
  const campaignIdBuffer = Buffer.alloc(8);
  const donorCountBuffer = Buffer.alloc(8);
  
  campaignIdBuffer.writeBigUInt64LE(BigInt(campaignId), 0);
  donorCountBuffer.writeBigUInt64LE(BigInt(donorCount), 0);
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from("donor"), donor.toBuffer(), campaignIdBuffer, donorCountBuffer],
    PROGRAM_ID
  );
};

export const getWithdrawalPDA = (creator: PublicKey, campaignId: number, withdrawalCount: number): [PublicKey, number] => {
  const PROGRAM_ID = new PublicKey("CeS7WEPrgnfvgLrVPw3BmTDkt9hz6Cu9oUb1ZPjCMymm");
  const campaignIdBuffer = Buffer.alloc(8);
  const withdrawalCountBuffer = Buffer.alloc(8);
  
  campaignIdBuffer.writeBigUInt64LE(BigInt(campaignId), 0);
  withdrawalCountBuffer.writeBigUInt64LE(BigInt(withdrawalCount), 0);
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from("withdraw"), creator.toBuffer(), campaignIdBuffer, withdrawalCountBuffer],
    PROGRAM_ID
  );
};

// Additional utility functions for compatibility
export const formatSol = (lamports: number): string => {
  return lamportsToSol(lamports).toFixed(2) + ' SOL';
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString();
};

export const formatDateTime = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

export const truncateAddress = (address: string): string => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const calculateProgress = (raised: number, goal: number): number => {
  return Math.min((raised / goal) * 100, 100);
};

export const isValidSolAmount = (amount: number): boolean => {
  return amount >= 1 && amount <= 1000000;
};