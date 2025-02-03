use crate::llm_bridge::{LLMRequest, LLMServiceError, Prompt};
use crate::AppState;
use tokio::sync::Mutex;

#[tauri::command]
pub async fn get_completion(
    app_state: tauri::State<'_, Mutex<AppState>>,
    prompts: Vec<Prompt>,
) -> Result<String, LLMServiceError> {
    let holder = app_state.lock().await;
    let llm_bridge = holder.llm_bridge.as_ref().unwrap();
    let r = llm_bridge.complete(LLMRequest { messages: prompts }).await;
    match r {
        Ok(response) => Ok(response.content),
        Err(e) => Err(e),
    }
}
