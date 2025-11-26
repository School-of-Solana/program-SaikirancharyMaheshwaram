

use anchor_lang::prelude::*;
declare_id!("FyDH94Zi7Rsehwr2jbCKioydseojDtpSHuQppLF2MatF");
pub mod errors;

#[program]
pub mod accountability_log {
    use crate::errors::CustomError;

    use super::*;

    pub fn create_log(
        ctx: Context<CreateLog>,
        timestamp: i64,
        hash: [u8; 32],
        category: String,
    ) -> Result<()> {
        let log = &mut ctx.accounts.log_account;
        log.owner = ctx.accounts.user.key();
        log.timestamp = timestamp;
        log.hash = hash;
        // Keep category length reasonable to avoid big account size
        require!(category.len() <= 32, CustomError::CategoryTooLong);
        log.category = category;
        log.bump = ctx.bumps.log_account;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(timestamp: i64, hash: [u8;32], category: String)]
pub struct CreateLog<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: PDA being created for storing log data
    #[account(
        init,
        payer = user,
        space = LogAccount::INIT_SPACE,
        seeds = [b"log", user.key().as_ref(), &timestamp.to_le_bytes()],
        bump
    )]
    pub log_account: Account<'info, LogAccount>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct LogAccount {
    pub owner: Pubkey,  // 32
    pub timestamp: i64, // 8
    pub hash: [u8; 32],
    #[max_len(32)]
    pub category: String, // 4 + len (we'll cap)
    pub bump: u8, // 1
}

// helper: calculate space required
impl LogAccount {
    // discriminator (8) + owner(32) + timestamp(8) + hash(32) + category (4 + 32) + bump(1)
    // pub const LEN: usize = 8 + 32 + 8 + 32 + 4 + 32 + 1;
}
