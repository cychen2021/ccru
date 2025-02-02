mod ollama;
mod azure;
mod azure_deepseek;
mod deepseek;

use serde::{Deserialize, Serialize};
use async_trait::async_trait;

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

#[async_trait]
pub trait LLMBridge: Send + Sync {
    fn name(&self) -> &str;
    fn model(&self) -> &str;
    async fn complete(&self, request: LLMRequest) -> Result<LLMResponse, Box<dyn std::error::Error + Send + Sync>>;
    async fn health_check(&self) -> Result<bool, Box<dyn std::error::Error + Send + Sync>>;
}
