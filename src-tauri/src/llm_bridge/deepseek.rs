use super::{LLMBridge, LLMRequest, LLMResponse, Prompt};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use reqwest::Client;

pub struct DeepSeekBridge {
    api_key: String,
    model: String,
    client: Client,
}

#[derive(Serialize)]
struct DeepSeekRequest {
    model: String,
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

impl DeepSeekBridge {
    pub fn new(api_key: String, model: String) -> Self {
        Self {
            api_key,
            model,
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
impl LLMBridge for DeepSeekBridge {
    fn name(&self) -> &str {
        "DeepSeek"
    }

    fn model(&self) -> &str {
        &self.model
    }

    async fn complete(&self, request: LLMRequest) -> Result<LLMResponse, Box<dyn std::error::Error + Send + Sync>> {
        let deepseek_req = DeepSeekRequest {
            model: self.model.clone(),
            messages: Self::convert_prompts(request.messages),
            temperature: 0.7,
            max_tokens: 800,
            stream: false,
        };

        let response = self.client
            .post("https://api.deepseek.com/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&deepseek_req)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(format!("DeepSeek API error: {} - {}", response.status(), error_text).into());
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
            model: self.model.clone(),
            messages: vec![ChatMessage {
                role: "user".to_string(),
                content: "Hi".to_string(),
            }],
            temperature: 0.7,
            max_tokens: 1,
            stream: false,
        };

        let response = self.client
            .post("https://api.deepseek.com/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&deepseek_req)
            .send()
            .await?;

        Ok(response.status().is_success())
    }
} 