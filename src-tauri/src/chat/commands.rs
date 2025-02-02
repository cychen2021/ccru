use crate::AppState;
use crate::chat::{ChatHistory, Prompt};
use std::sync::Mutex;
use std::sync::Arc;


#[tauri::command]
pub async fn create_session(app_state: tauri::State<AppState>) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    let chat_history = app_state.chat_history.as_ref().unwrap();
    chat_history.create_session()
}


#[tauri::command]
pub async fn add_message(app_state: tauri::State<AppState>, session_id: String, role: String, content: String) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let chat_history = app_state.chat_history.as_ref().unwrap();
    chat_history.add_message(&session_id, role, content)
}

#[tauri::command]
pub async fn get_session(app_state: tauri::State<AppState>, session_id: String) -> Result<Vec<Prompt>, Box<dyn std::error::Error + Send + Sync>> {
    let chat_history = app_state.chat_history.as_ref().unwrap();
    chat_history.get_session(&session_id)
}

#[tauri::command]
pub async fn list_sessions(app_state: tauri::State<AppState>) -> Result<Vec<String>, Box<dyn std::error::Error + Send + Sync>> {
    let chat_history = app_state.chat_history.as_ref().unwrap();
    chat_history.list_sessions()
}

#[tauri::command]
pub async fn delete_session(app_state: tauri::State<AppState>, session_id: String) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let chat_history = app_state.chat_history.as_ref().unwrap();
    chat_history.delete_session(&session_id)
}

#[tauri::command]
pub async fn ask_question(app_state: tauri::State<AppState>, session_id: String, question: String) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    let chat_history = app_state.chat_history.as_ref().unwrap();
    chat_history.add_message(&session_id, "user".to_string(), question);
    let session = chat_history.get_session(&session_id).unwrap();
    let llm_bridge = app_state.llm_bridge.as_ref().unwrap();
    let response = llm_bridge.complete(session).await?;
    chat_history.add_message(&session_id, "assistant".to_string(), response.content);
    Ok(response.content)
}