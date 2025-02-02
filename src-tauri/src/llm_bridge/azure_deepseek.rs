use super::{LLMBridge, LLMRequest, LLMResponse, Prompt};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use reqwest::Client;

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
    pub fn new(base_url: String, model: String, api_key: String) -> Self {
        Self {
            base_url,
            model,
            api_key,
            client: Client::new(),
        }
    }

    fn convert_prompts(prompts: Vec<Prompt>) -> Vec<ChatMessage> {
        prompts.into_iter()
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

    async fn complete(&self, request: LLMRequest) -> Result<LLMResponse, Box<dyn std::error::Error + Send + Sync>> {
        let deepseek_req = DeepSeekRequest {
            messages: Self::convert_prompts(request.messages),
            temperature: 0.7,
            max_tokens: 800,
            stream: false,
        };

        let endpoint = format!(
            "{}/deployments/{}/chat/completions?api-version=2024-02-15-preview",
            self.base_url,
            self.model
        );

        let response = self.client
            .post(&endpoint)
            .header("api-key", &self.api_key)
            .json(&deepseek_req)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(format!("Azure DeepSeek API error: {} - {}", response.status(), error_text).into());
        }

        let deepseek_resp: DeepSeekResponse = response.json().await?;
        let content = deepseek_resp.choices
            .first()
            .ok_or("No completion choices returned")?
            .message
            .content
            .clone();

        Ok(LLMResponse { content })
    }

    async fn health_check(&self) -> Result<bool, Box<dyn std::error::Error + Send + Sync>> {
        let deepseek_req = DeepSeekRequest {
            messages: vec![ChatMessage {
                role: "user".to_string(),
                content: "Hi".to_string(),
            }],
            temperature: 0.7,
            max_tokens: 1,
            stream: false,
        };

        let endpoint = format!(
            "{}/deployments/{}/chat/completions?api-version=2024-02-15-preview",
            self.base_url,
            self.model
        );

        let response = self.client
            .post(&endpoint)
            .header("api-key", &self.api_key)
            .json(&deepseek_req)
            .send()
            .await?;

        Ok(response.status().is_success())
    }
} 