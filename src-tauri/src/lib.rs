mod chat;
mod config;
mod llm_bridge;
mod agent;

use crate::chat::ChatHistory;
use crate::config::Config;
use crate::llm_bridge::LLMBridge;
use std::sync::Arc;
use tokio::sync::Mutex;
use tauri::Manager;

#[derive(Default)]
pub struct AppState {
    config: Option<Config>,
    llm_bridge: Option<Arc<dyn LLMBridge>>,
    chat_history: Option<Arc<ChatHistory>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_state = AppState::default();
            app.manage(Mutex::new(app_state));
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            config::load_config,
            config::save_config,
            llm_bridge::get_completion,
            chat::create_session,
            chat::delete_session,
            chat::get_session,
            chat::list_sessions,
            chat::add_message,
            chat::ask_question,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
