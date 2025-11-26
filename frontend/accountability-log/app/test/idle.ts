export const IDL = {
  address: "FyDH94Zi7Rsehwr2jbCKioydseojDtpSHuQppLF2MatF",
  metadata: {
    name: "accountability_log",
    version: "0.1.0",
    spec: "0.1.0",
    description: "Created with Anchor",
  },
  instructions: [
    {
      name: "create_log",
      discriminator: [215, 95, 248, 114, 153, 204, 208, 48],
      accounts: [
        {
          name: "user",
          writable: true,
          signer: true,
        },
        {
          name: "log_account",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [108, 111, 103],
              },
              {
                kind: "account",
                path: "user",
              },
              {
                kind: "arg",
                path: "timestamp",
              },
            ],
          },
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111",
        },
      ],
      args: [
        {
          name: "timestamp",
          type: "i64",
        },
        {
          name: "hash",
          type: {
            array: ["u8", 32],
          },
        },
        {
          name: "category",
          type: "string",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "LogAccount",
      discriminator: [21, 166, 62, 121, 167, 196, 176, 195],
    },
  ],
  errors: [
    {
      code: 6000,
      name: "CategoryTooLong",
      msg: "Category too long (max 32 chars)",
    },
  ],
  types: [
    {
      name: "LogAccount",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: "pubkey",
          },
          {
            name: "timestamp",
            type: "i64",
          },
          {
            name: "hash",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "category",
            type: "string",
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
  ],
};
