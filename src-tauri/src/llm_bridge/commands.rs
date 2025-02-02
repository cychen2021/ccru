use crate::AppState;
use crate::llm_bridge::{LLMRequest, Prompt};

#[tauri::command]
pub async fn get_completion(app_state: tauri::State<AppState>, prompts: Vec<Prompt>) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    let llm_bridge = app_state.llm_bridge.as_ref().unwrap();
    llm_bridge.complete(LLMRequest { messages: prompts }).await
}