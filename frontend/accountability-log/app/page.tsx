"use client";

import CreateLog from "@/component/create-log";
import WalletConnection from "@/component/wallet-connection";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getProgram } from "@/lib/program";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

interface LogData {
  owner: string;
  timestamp: number;
  hash: number[]; // [u8;32]
  category: string;
  originalHash?: string | null;
}

const CLUSTER = "devnet";

const Home = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState("");
  const [logs, setLogs] = useState<LogData[]>([]);

  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const wallet = useWallet();

  const fetchLogs = async () => {
    const program = getProgram(connection, wallet);
    setLogsLoading(true);
    setLogsError("");

    try {
      const accounts = await program.account.logAccount.all([
        {
          memcmp: {
            offset: 8, // discriminator
            bytes: wallet.publicKey!.toBase58(), // filter by owner
          },
        },
      ]);

      // Sort by newest first (optional)
      accounts.sort(
        (a: any, b: any) =>
          b.account.timestamp.toNumber() - a.account.timestamp.toNumber(),
      );

      const logsArray = accounts.map((acc) => {
        const data = acc.account as any;
        const ts = data.timestamp.toNumber();
        const original = localStorage.getItem(`log-original-${ts}`);
        return {
          owner: data.owner.toBase58(),
          timestamp: ts,
          hash: data.hash,
          category: data.category,
          originalHash: original || null,
        };
      });

      setLogs(logsArray);
    } catch (err: any) {
      console.error("Error fetching logs:", err);
      setLogsError(err.message || "Failed to fetch logs");
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      fetchLogs();
      setIsConnected(true);
    } else {
      setLogs([]);
      setLogsError("");
      setIsConnected(false);
    }
  }, [connected, publicKey]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Accountability Logger
              </h1>
              <p className="text-muted-foreground mt-1">
                Your Personal Proof of Work and Accountability
              </p>
            </div>

            <div className="text-sm text-muted-foreground">
              Status:{" "}
              <span
                className={
                  isConnected
                    ? "text-green-400 font-semibold"
                    : "text-destructive font-semibold"
                }
              >
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="py-5 space-y-4">
        {/* Create Log Form */}

        <div className="mb-10">
          <WalletConnection onConnected={setIsConnected} />
        </div>
        <CreateLog />

        {/* Logs Section */}
        {isConnected && (
          <Card className="p-8 border-2 bg-card shadow-lg mt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Your Logs</h3>
              <Button
                onClick={fetchLogs}
                disabled={logsLoading}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${logsLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>

            {logsLoading && (
              <p className="mt-4 text-muted-foreground">Loading logs...</p>
            )}
            {logsError && <p className="mt-4 text-destructive">{logsError}</p>}

            {!logsLoading && !logsError && logs.length > 0 ? (
              <div className="space-y-4 mt-6">
                {logs.map((log, i) => {
                  const chainHex = Buffer.from(log.hash).toString("hex");
                  const explorerAddressUrl = `https://explorer.solana.com/address/${log.owner}?cluster=${CLUSTER}`;
                  return (
                    <div
                      key={`${log.owner}-${log.timestamp}-${i}`}
                      className="p-5 border rounded-lg bg-muted/20 hover:bg-muted/40 transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm text-muted-foreground">
                          {new Date(log.timestamp * 1000).toLocaleString()}
                        </div>
                        <a
                          href={explorerAddressUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline text-sm"
                        >
                          View on Explorer
                        </a>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div className="p-4 rounded-xl bg-card border">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            Category
                          </p>
                          <p className="text-lg font-semibold text-foreground">
                            {log.category}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-card border">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            On‑chain hash (hex)
                          </p>
                          <p className="text-xs font-mono break-all">
                            {chainHex}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-card border md:col-span-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            Original value (local)
                          </p>
                          {log.originalHash ? (
                            <p className="text-sm text-primary break-words">
                              {log.originalHash}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Not available locally. It’s only stored on-chain
                              as a hash.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 text-muted-foreground">Your Logs are Empty</p>
            )}
          </Card>
        )}
      </main>
    </div>
  );
};

export default Home;
