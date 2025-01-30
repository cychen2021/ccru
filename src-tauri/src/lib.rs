use serde::{Deserialize, Serialize};
use std::fs;
use toml;

#[derive(Deserialize, Serialize)]
struct AIServiceConfig {
    #[serde(rename = "ai-service")]
    ai_service: AIService,
}

#[derive(Deserialize, Serialize)]
struct AIService {
    provider: String,
    #[serde(flatten)]
    provider_config: toml::Value,
}

#[tauri::command]
fn get_config(config_path: String) -> AIServiceConfig {
    let config_str = fs::read_to_string(config_path)
        .expect("Failed to read config file");
    
    let config: AIServiceConfig = toml::from_str(&config_str)
        .expect("Failed to parse TOML");
        
    config
} 

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![get_config])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
