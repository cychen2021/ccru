use super::{LLMBridge, LLMRequest, LLMResponse, Prompt};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use reqwest::Client;

pub struct OllamaBridge {
    base_url: String,
    model: String,
    client: Client,
}

#[derive(Serialize)]
struct OllamaRequest {
    model: String,
    prompt: String,
    stream: bool,
}

#[derive(Deserialize)]
struct OllamaResponse {
    response: String,
}

impl OllamaBridge {
    pub fn new(base_url: String, model: String) -> Self {
        Self {
            base_url,
            model,
            client: Client::new(),
        }
    }

    fn format_prompts(prompts: Vec<Prompt>) -> String {
        prompts.into_iter()
            .map(|p| format!("{}: {}", p.role, p.content))
            .collect::<Vec<_>>()
            .join("\n")
    }
}

#[async_trait]
impl LLMBridge for OllamaBridge {
    fn name(&self) -> &str {
        "Ollama"
    }

    fn model(&self) -> &str {
        &self.model
    }

    async fn complete(&self, request: LLMRequest) -> Result<LLMResponse, Box<dyn std::error::Error + Send + Sync>> {
        let ollama_req = OllamaRequest {
            model: self.model.clone(),
            prompt: Self::format_prompts(request.messages),
            stream: false,
        };

        let response = self.client
            .post(format!("{}/api/generate", self.base_url))
            .json(&ollama_req)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(format!("Ollama API error: {} - {}", response.status(), error_text).into());
        }

        let ollama_resp: OllamaResponse = response.json().await?;
        
        Ok(LLMResponse {
            content: ollama_resp.response,
        })
    }

    async fn health_check(&self) -> Result<bool, Box<dyn std::error::Error + Send + Sync>> {
        let response = self.client
            .get(format!("{}/api/version", self.base_url))
            .send()
            .await?;
        
        Ok(response.status().is_success())
    }
} 