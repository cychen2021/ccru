use super::{LLMBridge, LLMRequest, LLMResponse, Prompt};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use reqwest::Client;

pub struct AzureBridge {
    base_url: String,
    model: String,
    api_key: String,
    client: Client,
}

#[derive(Serialize)]
struct AzureRequest {
    input: String,
    parameters: Parameters,
}

#[derive(Serialize)]
struct Parameters {
    max_new_tokens: u32,
    temperature: f32,
}

#[derive(Deserialize)]
struct AzureResponse {
    outputs: Vec<Output>,
}

#[derive(Deserialize)]
struct Output {
    text: String,
}

impl AzureBridge {
    pub fn new(base_url: String, model: String, api_key: String) -> Self {
        Self {
            base_url,
            model,
            api_key,
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
impl LLMBridge for AzureBridge {
    fn name(&self) -> &str {
        "AzureAI"
    }

    fn model(&self) -> &str {
        &self.model
    }

    async fn complete(&self, request: LLMRequest) -> Result<LLMResponse, Box<dyn std::error::Error + Send + Sync>> {
        let azure_req = AzureRequest {
            input: Self::format_prompts(request.messages),
            parameters: Parameters {
                max_new_tokens: 800,
                temperature: 0.7,
            },
        };

        let endpoint = format!(
            "{}/text/completions?api-version=2023-05-01",
            self.base_url
        );

        let response = self.client
            .post(&endpoint)
            .header("api-key", &self.api_key)
            .json(&azure_req)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(format!("Azure API error: {} - {}", response.status(), error_text).into());
        }

        let azure_resp: AzureResponse = response.json().await?;
        let content = azure_resp.outputs
            .first()
            .ok_or("No completion outputs returned")?
            .text
            .clone();

        Ok(LLMResponse { content })
    }

    async fn health_check(&self) -> Result<bool, Box<dyn std::error::Error + Send + Sync>> {
        let azure_req = AzureRequest {
            input: "Hi".to_string(),
            parameters: Parameters {
                max_new_tokens: 1,
                temperature: 0.7,
            },
        };

        let endpoint = format!(
            "{}/text/completions?api-version=2023-05-01",
            self.base_url
        );

        let response = self.client
            .post(&endpoint)
            .header("api-key", &self.api_key)
            .json(&azure_req)
            .send()
            .await?;

        Ok(response.status().is_success())
    }
} 