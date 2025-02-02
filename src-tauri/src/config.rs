use serde::{Deserialize, Serialize};
use toml;
use std::fs;

#[derive(Deserialize, Serialize)]
pub struct OllamaConfig {
    #[serde(rename = "baseUrl")]
    base_url: String,
    model: String,
}

#[derive(Deserialize, Serialize)]
pub struct AzureConfig {
    #[serde(rename = "baseUrl")]
    base_url: String,
    #[serde(rename = "apiKey")]
    api_key: String,
    model: String,
}

#[derive(Deserialize, Serialize)]
pub struct DeepSeekConfig {
    #[serde(rename = "apiKey")]
    api_key: String,
    model: String,
}

#[derive(Deserialize, Serialize)]
pub struct AIService {
    provider: String,
    ollama: Option<OllamaConfig>,
    azure: Option<AzureConfig>,
    deepseek: Option<DeepSeekConfig>,
}

#[derive(Deserialize, Serialize)]
pub struct Config {
    #[serde(rename = "ai-service")]
    ai_service: AIService,
}

#[derive(Deserialize, Serialize)]
pub struct LoadConfigResponse {
    config: Config,
    using_default: bool,
}

#[tauri::command]
pub fn load_config(app_state: tauri::State<AppState>, config_path: String, use_default_when_missing: bool) -> LoadConfigResponse {
    let mut using_default = false;
    let config_str = match fs::read_to_string(&config_path) {
        Ok(content) => content,
        Err(_) if use_default_when_missing => {
            include_str!("../assets/default-config.toml").to_string();
            using_default = true;
        },
        Err(e) => panic!("Failed to read config file: {}", e)
    };
    
    let c = toml::from_str(&config_str)
        .expect("Failed to parse TOML");

    let mut app_state = app_state.lock().unwrap();
    app_state.config = Some(c);
    match config.ai_service.provider.as_str() {
        "ollama" => {
            app_state.llm_bridge = Some(Arc::new(OllamaBridge::new(config.ai_service.ollama.unwrap())));
        },
        "azure" => {
            app_state.llm_bridge = Some(Arc::new(AzureBridge::new(config.ai_service.azure.unwrap())));
        },
        "deepseek" => {
            app_state.llm_bridge = Some(Arc::new(DeepSeekBridge::new(config.ai_service.deepseek.unwrap())));
        },
        _ => panic!("Unsupported AI service provider"),
    }


    LoadConfigResponse {
        config: c,
        using_default,
    }


}

#[tauri::command]
pub fn save_config(config: Config, config_path: String) {
    let config_str = toml::to_string(&config)
        .expect("Failed to serialize config to TOML");
    
    fs::write(config_path, config_str)
        .expect("Failed to write config file");
}

