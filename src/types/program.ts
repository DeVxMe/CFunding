import { PublicKey } from '@solana/web3.js';

export interface ProgramState {
  initialized: boolean;
  campaignCount: number;
  platformFee: number;
  platformAddress: PublicKey;
}

export interface Campaign {
  cid: number;
  creator: PublicKey;
  title: string;
  description: string;
  imageUrl: string;
  goal: number;
  amountRaised: number;
  timestamp: number;
  donors: number;
  withdrawals: number;
  balance: number;
  active: boolean;
}

export interface Transaction {
  owner: PublicKey;
  cid: number;
  amount: number;
  timestamp: number;
  credited: boolean;
}

export interface CampaignWithKey extends Campaign {
  publicKey: PublicKey;
}

export interface TransactionWithKey extends Transaction {
  publicKey: PublicKey;
}

export const PROGRAM_ID = new PublicKey('CeS7WEPrgnfvgLrVPw3BmTDkt9hz6Cu9oUb1ZPjCMymm');

export const ERRORS = {
  AlreadyInitialized: 'The program has already been initialized.',
  TitleTooLong: 'Title exceeds the maximum length of 64 characters.',
  DescriptionTooLong: 'Description exceeds the maximum length of 512 characters.',
  ImageUrlTooLong: 'Image URL exceeds the maximum length of 256 characters.',
  InvalidGoalAmount: 'Invalid goal amount. Goal must be greater than zero.',
  Unauthorized: 'Unauthorized access.',
  CampaignNotFound: 'Campaign not found.',
  InactiveCampaign: 'Campaign is inactive.',
  InvalidDonationAmount: 'Donation amount must be at least 1 SOL.',
  CampaignGoalActualized: 'Campaign goal reached.',
  InvalidWithdrawalAmount: 'Withdrawal amount must be at least 1 SOL.',
  InsufficientFund: 'Insufficient funds in the campaign.',
  InvalidPlatformAddress: 'The provided platform address is invalid.',
  InvalidPlatformFee: 'Invalid platform fee percentage.',
};