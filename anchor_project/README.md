# 📜 Accountability Logger – Anchor Program

This repository contains the **Solana smart contract** for the Accountability Logger.  
It enables users to record immutable accountability logs on-chain, storing a hashed proof of work while keeping original values off-chain for privacy and reference.

---

## ✨ Features

- 📝 **Create Log Instruction**
  - Stores:
    - `owner` (Pubkey of user)
    - `timestamp` (i64, unique per log)
    - `hash` (`[u8;32]`, cryptographic digest of original value)
    - `category` (short label, max 32 chars)
    - `bump` (PDA bump seed)
  - Validates category length to avoid oversized accounts.

- 📦 **LogAccount PDA**
  - Derived from seeds:  
    ```
    [b"log", user_pubkey, timestamp_le]
    ```
  - Ensures each log is uniquely tied to a user and timestamp.

- 🔒 **Transparency & Security**
  - Original values are **not stored on-chain** (only hashes).
  - Prevents tampering and ensures accountability.
  - Users can keep original values locally (e.g., frontend/localStorage).

---

## 🛠️ Tech Stack

- **Language**: Rust
- **Framework**: [Anchor](https://book.anchor-lang.com/)
- **Blockchain**: Solana
- **Error Handling**: Custom errors via `errors.rs`

---

## 📂 Program Structure

programs/accountability_log/ 
├─ src/ 
│ 
├─ lib.rs # Main program logic 
│
├─ errors.rs # Custom error definitions


---

## 🚀 Getting Started

### Prerequisites
- Rust + Cargo
- Solana CLI
- Anchor framework

### Build & Deploy

```bash
# Build the program
anchor build

# Deploy to devnet
anchor deploy



solana program show FyDH94Zi7Rsehwr2jbCKioydseojDtpSHuQppLF2MatF

