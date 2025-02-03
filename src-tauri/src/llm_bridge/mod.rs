mod azure;
mod azure_deepseek;
mod deepseek;
mod ollama;

use async_trait::async_trait;
use serde::{Deserialize, Serialize};

pub use azure::*;
pub use deepseek::*;
pub use ollama::*;
pub use azure_deepseek::*;

#[derive(Debug, Serialize, Deserialize)]
pub struct LLMResponse {
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Prompt {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LLMRequest {
    pub messages: Vec<Prompt>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LLMServiceError {
    pub error: String,
}

impl std::error::Error for LLMServiceError {}

impl std::fmt::Display for LLMServiceError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.error)
    }
}

#[async_trait]
pub trait LLMBridge: Send + Sync {
    fn name(&self) -> &str;
    fn model(&self) -> &str;
    async fn complete(&self, request: LLMRequest) -> Result<LLMResponse, LLMServiceError>;
    async fn health_check(&self) -> Result<bool, LLMServiceError>;
}

mod commands;
pub use commands::*;
