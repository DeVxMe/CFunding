// Simplified types to work with Anchor
export const IDL = {
  address: "CeS7WEPrgnfvgLrVPw3BmTDkt9hz6Cu9oUb1ZPjCMymm",
  metadata: {
    name: "crowdfunding",
    version: "0.1.0",
    spec: "0.1.0",
  },
  version: "0.1.0",
  name: "crowdfunding",
  instructions: [
    {
      name: "initialize",
      accounts: [
        {
          name: "deployer",
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: "createCampaign",
      accounts: [
        {
          name: "creator",
          isMut: true,
          isSigner: true,
        },
        {
          name: "campaign",
          isMut: true,
          isSigner: false,
        },
        {
          name: "programState",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "title",
          type: "string",
        },
        {
          name: "description",
          type: "string",
        },
        {
          name: "imageUrl",
          type: "string",
        },
        {
          name: "goal",
          type: "u64",
        },
      ],
    },
    {
      name: "donate",
      accounts: [
        {
          name: "donor",
          isMut: true,
          isSigner: true,
        },
        {
          name: "transaction",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "campaignId",
          type: "u64",
        },
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "withdraw",
      accounts: [
        {
          name: "creator",
          isMut: true,
          isSigner: true,
        },
        {
          name: "transaction",
          isMut: true,
          isSigner: false,
        },
        {
          name: "programState",
          isMut: true,
          isSigner: false,
        },
        {
          name: "platformAddress",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "campaignId",
          type: "u64",
        },
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "programState",
      type: {
        kind: "struct",
        fields: [
          {
            name: "initialized",
            type: "bool",
          },
          {
            name: "campaignCount",
            type: "u64",
          },
          {
            name: "platformFee",
            type: "u16",
          },
          {
            name: "platformAddress",
            type: "publicKey",
          },
        ],
      },
    },
    {
      name: "campaign",
      type: {
        kind: "struct",
        fields: [
          {
            name: "cid",
            type: "u64",
          },
          {
            name: "creator",
            type: "publicKey",
          },
          {
            name: "title",
            type: "string",
          },
          {
            name: "description",
            type: "string",
          },
          {
            name: "imageUrl",
            type: "string",
          },
          {
            name: "goal",
            type: "u64",
          },
          {
            name: "amountRaised",
            type: "u64",
          },
          {
            name: "donors",
            type: "u64",
          },
          {
            name: "withdrawals",
            type: "u64",
          },
          {
            name: "balance",
            type: "u64",
          },
          {
            name: "active",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "transaction",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: "publicKey",
          },
          {
            name: "cid",
            type: "u64",
          },
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "credited",
            type: "bool",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "TitleTooLong",
      msg: "Title is too long",
    },
    {
      code: 6001,
      name: "DescriptionTooLong",
      msg: "Description is too long",
    },
    {
      code: 6002,
      name: "InvalidGoalAmount",
      msg: "Goal must be at least 1 SOL",
    },
    {
      code: 6003,
      name: "InvalidDonationAmount",
      msg: "Donation must be at least 1 SOL",
    },
    {
      code: 6004,
      name: "Unauthorized",
      msg: "You are not authorized to perform this action",
    },
    {
      code: 6005,
      name: "InvalidWithdrawalAmount",
      msg: "Withdrawal must be at least 1 SOL",
    },
    {
      code: 6006,
      name: "InsufficientFund",
      msg: "Insufficient funds in campaign",
    },
  ],
} as const;