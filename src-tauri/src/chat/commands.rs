use crate::chat::ChatMessage;
use crate::llm_bridge::{LLMRequest, LLMServiceError};
use crate::AppState;
use std::sync::Mutex;

#[tauri::command]
pub async fn create_session(app_state: tauri::State<'_, Mutex<AppState>>) -> Result<String, ()> {
    let holder = app_state.lock().unwrap();
    let chat_history = holder.chat_history.as_ref().unwrap();
    Ok(chat_history.create_session().await)
}

#[tauri::command]
pub async fn add_message(
    app_state: tauri::State<'_, Mutex<AppState>>,
    session_id: String,
    role: String,
    content: String,
) -> Result<(), String> {
    let holder = app_state.lock().unwrap();
    let chat_history = holder.chat_history.as_ref().unwrap();
    chat_history.add_message(&session_id, &role, &content).await
}

#[tauri::command]
pub async fn get_session(
    app_state: tauri::State<'_, Mutex<AppState>>,
    session_id: String,
) -> Result<Vec<ChatMessage>, ()> {
    let holder = app_state.lock().unwrap();
    let chat_history = holder.chat_history.as_ref().unwrap();
    chat_history
        .get_session(&session_id)
        .await
        .map(|session| session.into())
        .ok_or(())
}

#[tauri::command]
pub async fn list_sessions(
    app_state: tauri::State<'_, Mutex<AppState>>,
) -> Result<Vec<String>, ()> {
    let holder = app_state.lock().unwrap();
    let chat_history = holder.chat_history.as_ref().unwrap();
    Ok(chat_history
        .list_sessions()
        .await
        .into_iter()
        .map(|session| session.id)
        .collect())
}

#[tauri::command]
pub async fn delete_session(
    app_state: tauri::State<'_, Mutex<AppState>>,
    session_id: String,
) -> Result<(), String> {
    let holder = app_state.lock().unwrap();
    let chat_history = holder.chat_history.as_ref().unwrap();
    chat_history.delete_session(&session_id).await
}

#[tauri::command]
pub async fn ask_question(
    app_state: tauri::State<'_, Mutex<AppState>>,
    session_id: String,
    question: String,
) -> Result<String, LLMServiceError> {
    let holder = app_state.lock().unwrap();
    let chat_history = holder.chat_history.as_ref().unwrap();
    chat_history
        .add_message(&session_id, "user", &question)
        .await
        .map_err(|e| LLMServiceError { error: e })?;
    let session = chat_history.get_session(&session_id).await.unwrap();
    let llm_bridge = holder.llm_bridge.as_ref().unwrap();
    let llm_request = LLMRequest {
        messages: session.into(),
    };
    let response = llm_bridge.complete(llm_request).await?;
    chat_history
        .add_message(&session_id, "assistant", &response.content)
        .await
        .map_err(|e| LLMServiceError { error: e })?;
    Ok(response.content)
}
