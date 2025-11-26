use anchor_lang::prelude::*;


#[error_code]
pub enum CustomError {
    #[msg("Category too long (max 32 chars)")]
    CategoryTooLong,
}