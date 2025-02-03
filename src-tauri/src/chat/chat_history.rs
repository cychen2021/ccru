use crate::llm_bridge::Prompt;
use serde::{Deserialize, Serialize};
use tokio::sync::Mutex;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
    pub timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatSession {
    pub id: String,
    pub messages: Vec<ChatMessage>,
    pub created_at: i64,
    pub updated_at: i64,
}

impl Into<Vec<ChatMessage>> for ChatSession {
    fn into(self) -> Vec<ChatMessage> {
        self.messages
    }
}

impl Into<Vec<Prompt>> for ChatSession {
    fn into(self) -> Vec<Prompt> {
        self.messages
            .into_iter()
            .map(|m| Prompt {
                role: m.role,
                content: m.content,
            })
            .collect()
    }
}

pub struct ChatHistory {
    sessions: Mutex<Vec<ChatSession>>,
}

impl ChatHistory {
    pub fn new() -> Self {
        Self {
            sessions: Mutex::new(Vec::new()),
        }
    }

    pub async fn create_session(&self) -> String {
        let mut sessions = self.sessions.lock().await;
        let session_id = Uuid::new_v4().to_string();
        let now = chrono::Utc::now().timestamp();

        sessions.push(ChatSession {
            id: session_id.clone(),
            messages: Vec::new(),
            created_at: now,
            updated_at: now,
        });

        session_id
    }

    pub async fn add_message(
        &self,
        session_id: &str,
        role: &str,
        content: &str,
    ) -> Result<(), String> {
        let mut sessions = self.sessions.lock().await;
        let session = sessions
            .iter_mut()
            .find(|s| s.id == session_id)
            .ok_or_else(|| "Session not found".to_string())?;

        let now = chrono::Utc::now().timestamp();
        session.messages.push(ChatMessage {
            role: role.to_string(),
            content: content.to_string(),
            timestamp: now,
        });

        session.updated_at = now;

        Ok(())
    }

    pub async fn get_session(&self, session_id: &str) -> Option<ChatSession> {
        let sessions = self.sessions.lock().await;
        sessions.iter().find(|s| s.id == session_id).cloned()
    }

    pub async fn list_sessions(&self) -> Vec<ChatSession> {
        let sessions = self.sessions.lock().await;
        sessions.clone()
    }

    pub async fn delete_session(&self, session_id: &str) -> Result<(), String> {
        let mut sessions = self.sessions.lock().await;
        let position = sessions
            .iter()
            .position(|s| s.id == session_id)
            .ok_or_else(|| "Session not found".to_string())?;

        sessions.remove(position);
        Ok(())
    }

    pub async fn clear_session(&self, session_id: &str) -> Result<(), String> {
        let mut sessions = self.sessions.lock().await;
        let session = sessions
            .iter_mut()
            .find(|s| s.id == session_id)
            .ok_or_else(|| "Session not found".to_string())?;

        session.messages.clear();
        session.updated_at = chrono::Utc::now().timestamp();
        Ok(())
    }
}
