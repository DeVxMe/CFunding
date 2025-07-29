import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { PROGRAM_ID as PROGRAM_ID_CONST } from '@/types/program';

export const PROGRAM_ID = PROGRAM_ID_CONST;

// Environment configuration
export const NETWORK = (import.meta.env.VITE_SOLANA_NETWORK || 'devnet') as 'devnet' | 'mainnet-beta';
export const RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl(NETWORK);

// Create connection
export const connection = new Connection(RPC_URL, 'confirmed');

// PDA derivation functions
export const getProgramStatePDA = (): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('program_state')],
    PROGRAM_ID
  );
};

export const getCampaignPDA = (campaignId: number): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('campaign'),
      Buffer.from(campaignId.toString().padStart(8, '0'), 'utf8').reverse(),
    ],
    PROGRAM_ID
  );
};

export const getDonationPDA = (
  donor: PublicKey,
  campaignId: number,
  donorCount: number
): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('donor'),
      donor.toBuffer(),
      Buffer.from(campaignId.toString().padStart(8, '0'), 'utf8').reverse(),
      Buffer.from(donorCount.toString().padStart(8, '0'), 'utf8').reverse(),
    ],
    PROGRAM_ID
  );
};

export const getWithdrawalPDA = (
  creator: PublicKey,
  campaignId: number,
  withdrawalCount: number
): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('withdraw'),
      creator.toBuffer(),
      Buffer.from(campaignId.toString().padStart(8, '0'), 'utf8').reverse(),
      Buffer.from(withdrawalCount.toString().padStart(8, '0'), 'utf8').reverse(),
    ],
    PROGRAM_ID
  );
};

// Utility functions
export const lamportsToSol = (lamports: number): number => {
  return lamports / 1_000_000_000;
};

export const solToLamports = (sol: number): number => {
  return Math.floor(sol * 1_000_000_000);
};

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