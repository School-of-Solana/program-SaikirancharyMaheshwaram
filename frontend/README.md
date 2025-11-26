# 📝 Accountability Logger (Solana + Anchor + Next.js)

Accountability Logger is a decentralized application (dApp) built on **Solana** using **Anchor framework** and a **Next.js frontend**.  
It allows users to **record proof‑of‑work logs** with categories and hashed values, ensuring transparency and immutability on‑chain while keeping original values locally for reference.

---

## Live Link
👉 [Accountability Logger Live](https://accountability-log.vercel.app)

## ✨ Features

- 🔐 **Wallet Connection**  
  Connect your Solana wallet using `@solana/wallet-adapter`.

- 🏷️ **Create Logs**  
  Submit a log with:
  - **Category** (short label, max 32 chars)
  - **Original Value** (stored locally)
  - **Hashed Value** (stored on-chain)

- 📜 **View Logs**  
  Fetch all logs tied to your wallet:
  - On‑chain hash (hex)
  - Original value (from localStorage)
  - Category & timestamp
  - Explorer link for verification

- 🎨 **Modern UI/UX**  
  Built with TailwindCSS + shadcn/ui for a clean, professional dashboard experience.

---

## 🛠️ Tech Stack

### Smart Contract (Anchor)
- **Language**: Rust
- **Framework**: Anchor
- **Program**: `accountability_log`
- **Account**: `LogAccount` stores owner, timestamp, hash, category, bump.

### Frontend (Next.js + React)
- **Framework**: Next.js (App Router, Client Components)
- **Wallet Adapter**: `@solana/wallet-adapter-react`
- **UI**: TailwindCSS + shadcn/ui
- **Icons**: Lucide React

---

## 🚀 Getting Started

### Prerequisites
- Node.js (>= 18)
- Yarn or npm
- Rust + Solana CLI
- Anchor framework installed

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/SaikirancharyMaheshwaram/accountability-log.git
   cd accountability-logger
   
   # Install dependencies
   pnpm install
   
   # Run dev server
   pnpm dev
