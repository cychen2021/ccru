use super::LLMServiceError;
use super::{LLMBridge, LLMRequest, LLMResponse, Prompt};
use async_trait::async_trait;
use reqwest::Client;
use serde::{Deserialize, Serialize};

pub struct AzureDeepSeekBridge {
    base_url: String,
    model: String,
    api_key: String,
    client: Client,
}

#[derive(Serialize)]
struct DeepSeekRequest {
    messages: Vec<ChatMessage>,
    temperature: f32,
    max_tokens: u32,
    stream: bool,
}

#[derive(Serialize, Deserialize)]
struct ChatMessage {
    role: String,
    content: String,
}

#[derive(Deserialize)]
struct DeepSeekResponse {
    choices: Vec<Choice>,
}

#[derive(Deserialize)]
struct Choice {
    message: ChatMessage,
}

impl AzureDeepSeekBridge {
    pub fn new(base_url: &str, model: &str, api_key: &str) -> Self {
        Self {
            base_url: base_url.to_string(),
            model: model.to_string(),
            api_key: api_key.to_string(),
            client: Client::new(),

        }
    }

    fn convert_prompts(prompts: Vec<Prompt>) -> Vec<ChatMessage> {
        prompts
            .into_iter()
            .map(|p| ChatMessage {
                role: p.role,
                content: p.content,
            })
            .collect()
    }
}

#[async_trait]
impl LLMBridge for AzureDeepSeekBridge {
    fn name(&self) -> &str {
        "AzureDeepSeek"
    }

    fn model(&self) -> &str {
        &self.model
    }

    async fn complete(&self, request: LLMRequest) -> Result<LLMResponse, LLMServiceError> {
        let deepseek_req = DeepSeekRequest {
            messages: Self::convert_prompts(request.messages),
            temperature: 0.7,
            max_tokens: 800,
            stream: false,
        };

        let response = self
            .client
            .post(format!(
                "{}/v1/chat/completions",
                self.base_url
            ))
            .header("Authorization", &self.api_key)
            .json(&deepseek_req)
            .send()
            .await
            .map_err(|e| LLMServiceError {
                error: format!("Azure DeepSeek request failed: {:?}", e),
            })?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.map_err(|e| LLMServiceError {
                error: format!("Failed to read error response: {:?}", e),
            })?;
            return Err(LLMServiceError {
                error: format!("Azure DeepSeek API error: {} - {}", status, error_text),
            });
        }

        let deepseek_resp: DeepSeekResponse =
            response.json().await.map_err(|e| LLMServiceError {
                error: format!("Failed to parse Azure DeepSeek response: {}", e),
            })?;

        let content = deepseek_resp
            .choices
            .first()
            .ok_or_else(|| LLMServiceError {
                error: "No completion choices returned".to_string(),
            })?
            .message
            .content
            .clone();

        Ok(LLMResponse { content })
    }

    async fn health_check(&self) -> Result<bool, LLMServiceError> {
        let deepseek_req = DeepSeekRequest {
            messages: vec![ChatMessage {
                role: "user".to_string(),
                content: "Hi".to_string(),
            }],
            temperature: 0.7,
            max_tokens: 1,
            stream: false,
        };

        let response = self
            .client
            .post(format!(
                "{}/deployments/{}/chat/completions?api-version=2024-02-15-preview",
                self.base_url, self.model
            ))
            .header("api-key", &self.api_key)
            .json(&deepseek_req)
            .send()
            .await
            .map_err(|e| LLMServiceError {
                error: format!("Health check failed: {}", e),
            })?;

        Ok(response.status().is_success())
    }
}
