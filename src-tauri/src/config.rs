use crate::llm_bridge::{AzureBridge, DeepSeekBridge, OllamaBridge, AzureDeepSeekBridge};
use crate::AppState;
use serde::{Deserialize, Serialize};
use std::fs;
use std::sync::Arc;
use tokio::sync::Mutex;
use toml;
use std::path::Path;

#[derive(Debug, Deserialize, Serialize, Clone)]

pub struct OllamaConfig {
    #[serde(rename = "baseUrl")]
    base_url: String,
    model: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct AzureConfig {
    #[serde(rename = "baseUrl")]
    base_url: String,
    #[serde(rename = "apiKey")]
    api_key: String,
    model: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct DeepSeekConfig {
    #[serde(rename = "apiKey")]
    api_key: String,
    model: String,
}


#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct AIService {
    provider: String,
    ollama: Option<OllamaConfig>,
    azure: Option<AzureConfig>,
    deepseek: Option<DeepSeekConfig>,
    #[serde(rename = "azure-deepseek", alias = "azureDeepSeek")]
    azure_deepseek: Option<AzureDeepSeekConfig>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Config {
    #[serde(rename = "ai-service")]
    ai_service: AIService,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AzureDeepSeekConfig {
    #[serde(rename = "apiKey")]
    pub api_key: String,
    #[serde(rename = "baseUrl")]
    pub base_url: String,
}


#[derive(Deserialize, Serialize, Clone)]
pub struct LoadConfigResponse {
    config: Config,
    using_default: bool,
}

#[tauri::command]
pub async fn load_config(
    app_state: tauri::State<'_,Mutex<AppState>>,
    config_path: String,
    use_default_when_missing: bool,
) -> Result<LoadConfigResponse, ()> {
    let mut using_default = false;
    let config_str = match fs::read_to_string(&config_path) {
        Ok(content) => content,
        Err(_) if use_default_when_missing => {
            let t = include_str!("../assets/default-config.toml").to_string();
            using_default = true;
            t
        }
        Err(e) => panic!("Failed to read config file: {}", e),
    };

    let config: Config = toml::from_str(&config_str).expect("Failed to parse TOML");

    let mut app_state = app_state.lock().await;
    app_state.config = Some(config.clone());

    match config.ai_service.provider.as_str() {
        "ollama" => {
            app_state.llm_bridge = Some(Arc::new(OllamaBridge::new(
                &config.ai_service.ollama.as_ref().unwrap().base_url,
                &config.ai_service.ollama.as_ref().unwrap().model,
            )));
        }
        "azure" => {
            app_state.llm_bridge = Some(Arc::new(AzureBridge::new(
                &config.ai_service.azure.as_ref().unwrap().base_url,
                &config.ai_service.azure.as_ref().unwrap().model,
                &config.ai_service.azure.as_ref().unwrap().api_key,
            )));
        }
        "deepseek" => {
            app_state.llm_bridge = Some(Arc::new(DeepSeekBridge::new(
                &config.ai_service.deepseek.as_ref().unwrap().api_key,
                &config.ai_service.deepseek.as_ref().unwrap().model,
            )));
        }
        "azure-deepseek" => {
            app_state.llm_bridge = Some(Arc::new(AzureDeepSeekBridge::new(
                &config.ai_service.azure_deepseek.as_ref().unwrap().base_url,
                "DeepSeek-R1",
                &config.ai_service.azure_deepseek.as_ref().unwrap().api_key,
            )));
        }
        _ => panic!("Unsupported AI service provider"),
    }


    Ok(LoadConfigResponse {
        config: config,
        using_default,
    })
}

#[tauri::command]
pub async fn save_config(config: Config, config_path: String) {
    let config_str = toml::to_string(&config).expect("Failed to serialize config to TOML");

    if !Path::new(&config_path).exists() {
        fs::create_dir_all(Path::new(&config_path).parent().unwrap()).expect("Failed to create config directory");
    }

    fs::write(config_path, config_str).expect("Failed to write config file");

}
