
import { IDL } from "@/app/test/idle";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

// The address where your smart contract is deployed on Solana
export const PROGRAM_ID = new PublicKey(
  "FyDH94Zi7Rsehwr2jbCKioydseojDtpSHuQppLF2MatF",
);
/**
 * Creates a program instance to interact with your smart contract
 * @param connection - Connection to Solana network
 * @param wallet - The user's connected wallet
 * @returns Program instance
 */
export function getProgram(connection: Connection, wallet: any) {
  // Create a provider (combines connection + wallet)
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  // Create and return the program instance using the IDL
  return new Program(IDL as any, provider);
}

 export function getLogAccountPDA(user: PublicKey, timestamp: number): [PublicKey, number] {
   return PublicKey.findProgramAddressSync(
     [Buffer.from("log"), user.toBuffer(), Buffer.from(new Int32Array([timestamp]).buffer)],
     PROGRAM_ID
   );
 }
 
 export function getLogAddress(
   user: PublicKey,
   timestamp: number,
   programID: PublicKey
 ): [PublicKey, number] {
   const tsLE8 = new anchor.BN(timestamp).toArray("le", 8);

   return PublicKey.findProgramAddressSync(
     [
       Buffer.from("log"),
       user.toBuffer(),
       Buffer.from(tsLE8),
     ],
     programID
   );
 }
 
 // Explorer helper
 export const getExplorerUrl = (txSignature: string, cluster: string = "devnet") =>
   `https://explorer.solana.com/tx/${txSignature}?cluster=${cluster}`;