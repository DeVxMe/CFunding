import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import { IDL } from "@/types/crowdfunding";
import { RPC_URL } from "./solana";

// Program ID from the test file
export const CROWDFUNDING_PROGRAM_ID = new PublicKey(
  "CeS7WEPrgnfvgLrVPw3BmTDkt9hz6Cu9oUb1ZPjCMymm"
);

// Hardcoded deployer keypair for platform operations
export const DEPLOYER_KEYPAIR = anchor.web3.Keypair.fromSecretKey(
  new Uint8Array([6,147,209,54,119,156,70,207,13,251,56,101,154,187,138,215,112,132,65,136,21,27,77,217,60,70,197,118,104,226,162,233,25,153,41,78,169,112,9,212,17,140,110,161,71,155,11,8,190,89,28,133,238,250,23,194,204,139,35,50,232,42,174,248])
);

export function getAnchorProvider(wallet: any, connection?: Connection): anchor.AnchorProvider {
  const conn = connection || new Connection(RPC_URL, 'confirmed');
  return new anchor.AnchorProvider(conn, wallet, {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
  });
}

export function getCrowdfundingProgram(provider: anchor.AnchorProvider): Program<any> {
  return new Program(IDL as any, provider);
}

// PDA derivation functions using the program ID
export function getProgramStatePDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    CROWDFUNDING_PROGRAM_ID
  );
}

export function getCampaignPDA(campaignId: number | anchor.BN): [PublicKey, number] {
  const campaignIdBN = typeof campaignId === 'number' ? new anchor.BN(campaignId) : campaignId;
  return PublicKey.findProgramAddressSync(
    [Buffer.from("campaign"), campaignIdBN.toArrayLike(Buffer, "le", 8)],
    CROWDFUNDING_PROGRAM_ID
  );
}

export function getDonationPDA(
  donor: PublicKey, 
  campaignId: number | anchor.BN, 
  donorCount: number | anchor.BN
): [PublicKey, number] {
  const campaignIdBN = typeof campaignId === 'number' ? new anchor.BN(campaignId) : campaignId;
  const donorCountBN = typeof donorCount === 'number' ? new anchor.BN(donorCount) : donorCount;
  
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("donor"),
      donor.toBuffer(),
      campaignIdBN.toArrayLike(Buffer, "le", 8),
      donorCountBN.toArrayLike(Buffer, "le", 8),
    ],
    CROWDFUNDING_PROGRAM_ID
  );
}

export function getWithdrawalPDA(
  creator: PublicKey,
  campaignId: number | anchor.BN,
  withdrawalCount: number | anchor.BN
): [PublicKey, number] {
  const campaignIdBN = typeof campaignId === 'number' ? new anchor.BN(campaignId) : campaignId;
  const withdrawalCountBN = typeof withdrawalCount === 'number' ? new anchor.BN(withdrawalCount) : withdrawalCount;
  
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("withdraw"),
      creator.toBuffer(),
      campaignIdBN.toArrayLike(Buffer, "le", 8),
      withdrawalCountBN.toArrayLike(Buffer, "le", 8),
    ],
    CROWDFUNDING_PROGRAM_ID
  );
}