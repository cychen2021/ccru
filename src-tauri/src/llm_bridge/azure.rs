use super::LLMServiceError;
use super::{LLMBridge, LLMRequest, LLMResponse, Prompt};
use async_trait::async_trait;
use reqwest::Client;
use serde::{Deserialize, Serialize};

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
    pub fn new(base_url: &str, model: &str, api_key: &str) -> Self {
        Self {
            base_url: base_url.to_string(),
            model: model.to_string(),
            api_key: api_key.to_string(),
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
impl LLMBridge for AzureBridge {
    fn name(&self) -> &str {
        "AzureAI"
    }

    fn model(&self) -> &str {
        &self.model
    }

    async fn complete(&self, request: LLMRequest) -> Result<LLMResponse, LLMServiceError> {
        let azure_req = AzureRequest {
            input: Self::format_prompts(request.messages),
            parameters: Parameters {
                max_new_tokens: 800,
                temperature: 0.7,
            },
        };

        let response = self
            .client
            .post(format!(
                "{}/text/completions?api-version=2023-05-01",
                self.base_url
            ))
            .header("api-key", &self.api_key)
            .json(&azure_req)
            .send()
            .await
            .map_err(|e| LLMServiceError {
                error: format!("Azure request failed: {}", e),
            })?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.map_err(|e| LLMServiceError {
                error: format!("Failed to read error response: {}", e),
            })?;
            return Err(LLMServiceError {
                error: format!("Azure API error: {} - {}", status, error_text),
            });
        }

        let azure_resp: AzureResponse = response.json().await.map_err(|e| LLMServiceError {
            error: format!("Failed to parse Azure response: {}", e),
        })?;

        let content = azure_resp
            .outputs
            .first()
            .ok_or_else(|| LLMServiceError {
                error: "No completion outputs returned".to_string(),
            })?
            .text
            .clone();

        Ok(LLMResponse { content })
    }

    async fn health_check(&self) -> Result<bool, LLMServiceError> {
        let azure_req = AzureRequest {
            input: "Hi".to_string(),
            parameters: Parameters {
                max_new_tokens: 1,
                temperature: 0.7,
            },
        };

        let response = self
            .client
            .post(format!(
                "{}/text/completions?api-version=2023-05-01",
                self.base_url
            ))
            .header("api-key", &self.api_key)
            .json(&azure_req)
            .send()
            .await
            .map_err(|e| LLMServiceError {
                error: format!("Health check failed: {}", e),
            })?;

        Ok(response.status().is_success())
    }
}
