import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AccountabilityLog } from "../target/types/accountability_log";
import { PublicKey } from "@solana/web3.js";
import { assert } from "chai";
import { sha256 } from "@noble/hashes/sha256";

const LOG_SEED = "log";

describe("accountability-log", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AccountabilityLog as Program<AccountabilityLog>;

  const alice = anchor.web3.Keypair.generate();
  const bob = anchor.web3.Keypair.generate();

  async function airdrop(to: PublicKey, amount = 1 * anchor.web3.LAMPORTS_PER_SOL) {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(to, amount),
      "confirmed"
    );
  }

  function getLogAddress(
    user: PublicKey,
    timestamp: number,
    programID: PublicKey
  ): [PublicKey, number] {
    const tsLE8 = new anchor.BN(timestamp).toArray("le", 8);

    return PublicKey.findProgramAddressSync(
      [
        Buffer.from(LOG_SEED),
        user.toBuffer(),
        Buffer.from(tsLE8),
      ],
      programID
    );
  }

  async function checkLog(
    program: Program<AccountabilityLog>,
    logPda: PublicKey,
    owner?: PublicKey,
    timestamp?: number,
    hash?: Buffer,
    category?: string,
    bump?: number
  ) {
    const log = await program.account.logAccount.fetch(logPda);

    if (owner) {
      assert.strictEqual(
        log.owner.toString(),
        owner.toString(),
        `Owner mismatch: expected ${owner}, got ${log.owner}`
      );
    }
    if (timestamp !== undefined) {
      assert.strictEqual(
        log.timestamp.toNumber(),
        timestamp,
        `Timestamp mismatch`
      );
    }
    if (hash) {
      const stored = Buffer.from(log.hash);
      assert.deepEqual(stored, hash, "Hash mismatch");
    }
    if (category !== undefined) {
      assert.strictEqual(
        log.category,
        category,
        `Category mismatch: expected ${category}, got ${log.category}`
      );
    }
    if (bump !== undefined) {
      assert.strictEqual(log.bump, bump, `Bump mismatch`);
    }
  }

  //----------------------------------------------------------------------
  // Create Log Tests
  //----------------------------------------------------------------------

  describe("Create Log", () => {
    it("Creates a log successfully", async () => {
      await airdrop(alice.publicKey);

      const timestamp = Math.floor(Date.now() / 1000);
      const text = "Studied Solana PDAs and Anchor";
      const hash32 = Buffer.from(sha256(text)).slice(0, 32);

      const [logPda, bump] = getLogAddress(alice.publicKey, timestamp, program.programId);

      await program.methods
        .createLog(new anchor.BN(timestamp), Array.from(hash32), "Coding")
        .accounts({
          user: alice.publicKey,
          logAccount: logPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([alice])
        .rpc();

      await checkLog(
        program,
        logPda,
        alice.publicKey,
        timestamp,
        hash32,
        "Coding",
        bump
      );
    });

    it("Fails to create duplicate log (same user + timestamp)", async () => {
      await airdrop(bob.publicKey);

      const timestamp = Math.floor(Date.now() / 1000) + 999;
      const text = "Duplicate test";
      const hash32 = Buffer.from(sha256(text)).slice(0, 32);

      const [logPda] = getLogAddress(bob.publicKey, timestamp, program.programId);

      // First should succeed
      await program.methods
        .createLog(new anchor.BN(timestamp), Array.from(hash32), "Study")
        .accounts({
          user: bob.publicKey,
          logAccount: logPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([bob])
        .rpc();

      // Second should fail
      let failed = false;
      try {
        await program.methods
          .createLog(new anchor.BN(timestamp), Array.from(hash32), "Study")
          .accounts({
            user: bob.publicKey,
            logAccount: logPda,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([bob])
          .rpc();
      } catch (err) {
        failed = true;
        assert.isTrue(
          err.logs?.some((l) => l.includes("already in use")),
          "Expected 'already in use' PDA error"
        );
      }

      assert.isTrue(failed, "Duplicate PDA creation should fail");
    });
  });
});
