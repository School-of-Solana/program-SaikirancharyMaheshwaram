"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getLogAddress, getProgram } from "@/lib/program";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { SystemProgram } from "@solana/web3.js";
import { FileText, Link as LinkIcon } from "lucide-react";

export default function CreateLog() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [category, setCategory] = useState("");
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [explorerUrl, setExplorerUrl] = useState("");

  const CLUSTER = "devnet";

  const handleSubmit = async () => {
    if (!wallet.publicKey) return;

    setLoading(true);
    setMessage("");
    setExplorerUrl("");

    try {
      const program = getProgram(connection, wallet);
      const timestamp = Math.floor(Date.now() / 1000);

      const inputBytes = Buffer.from(hash, "utf8");
      const hashBytes = Buffer.alloc(32);
      inputBytes.copy(hashBytes, 0, 0, Math.min(32, inputBytes.length));

      const [logPda] = getLogAddress(
        wallet.publicKey,
        timestamp,
        program.programId,
      );

      const tx = await program.methods
        .createLog(new anchor.BN(timestamp), hashBytes, category)
        .accounts({
          user: wallet.publicKey,
          logAccount: logPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      localStorage.setItem(`log-original-${timestamp}`, hash);

      const url = `https://explorer.solana.com/tx/${tx}?cluster=${CLUSTER}`;
      setExplorerUrl(url);

      setMessage("✅ Log created successfully!");
    } catch (err: any) {
      console.error(err);
      setMessage(`❌ ${err.message || "Failed to create log"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 border-2 shadow-md space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Create Accountability Log
          </h2>
          <p className="text-sm text-muted-foreground">
            Record your proof of work with a category and original value.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">
            Category
          </label>
          <Input
            placeholder="e.g. Coding, Research, Workout"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            A short label (max 32 chars) describing the type of work.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">
            Original Value
          </label>
          <Input
            placeholder="Enter the raw data or description"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This will be hashed and stored on-chain. The original stays local
            for reference.
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full font-semibold"
        >
          {loading ? "Submitting..." : "Create Log"}
        </Button>

        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.startsWith("✅")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm mt-2"
          >
            <LinkIcon className="w-4 h-4" />
            View transaction on Explorer
          </a>
        )}
      </div>
    </Card>
  );
}
