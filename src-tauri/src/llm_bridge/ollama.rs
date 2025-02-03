use super::LLMServiceError;
use super::{LLMBridge, LLMRequest, LLMResponse, Prompt};
use async_trait::async_trait;
use reqwest::Client;
use serde::{Deserialize, Serialize};

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
    pub fn new(base_url: &str, model: &str) -> Self {
        Self {
            base_url: base_url.to_string(),
            model: model.to_string(),
            client: Client::new(),
        }
    }

    fn format_prompts(prompts: Vec<Prompt>) -> String {
        prompts
            .into_iter()
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

    async fn complete(&self, request: LLMRequest) -> Result<LLMResponse, LLMServiceError> {
        let ollama_req = OllamaRequest {
            model: self.model.clone(),
            prompt: Self::format_prompts(request.messages),
            stream: false,
        };

        let response = self
            .client
            .post(format!("{}/api/generate", self.base_url))
            .json(&ollama_req)
            .send()
            .await
            .map_err(|e| LLMServiceError {
                error: format!("Ollama request failed: {}", e),
            })?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.map_err(|e| LLMServiceError {
                error: format!("Failed to read error response: {}", e),
            })?;
            return Err(LLMServiceError {
                error: format!("Ollama API error: {} - {}", status, error_text),
            });
        }

        let ollama_resp: OllamaResponse = response.json().await.map_err(|e| LLMServiceError {
            error: format!("Failed to parse Ollama response: {}", e),
        })?;

        Ok(LLMResponse {
            content: ollama_resp.response,
        })
    }

    async fn health_check(&self) -> Result<bool, LLMServiceError> {
        let response = self
            .client
            .get(format!("{}/api/version", self.base_url))
            .send()
            .await
            .map_err(|e| LLMServiceError {
                error: format!("Health check failed: {}", e),
            })?;

        Ok(response.status().is_success())
    }
}
