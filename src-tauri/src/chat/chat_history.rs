use serde::{Deserialize, Serialize};
use std::sync::Mutex;

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

pub struct ChatHistory {
    sessions: Mutex<Vec<ChatSession>>,
}

impl ChatHistory {
    pub fn new() -> Self {
        Self {
            sessions: Mutex::new(Vec::new()),
        }
    }

    pub fn create_session(&self) -> String {
        let mut sessions = self.sessions.lock().unwrap();
        let session_id = uuid::Uuid::new_v4().to_string();
        let now = chrono::Utc::now().timestamp();
        
        sessions.push(ChatSession {
            id: session_id.clone(),
            messages: Vec::new(),
            created_at: now,
            updated_at: now,
        });

        session_id
    }

    pub fn add_message(&self, session_id: &str, role: String, content: String) -> Result<(), String> {
        let mut sessions = self.sessions.lock().unwrap();
        let session = sessions
            .iter_mut()
            .find(|s| s.id == session_id)
            .ok_or_else(|| "Session not found".to_string())?;

        let now = chrono::Utc::now().timestamp();
        session.messages.push(ChatMessage {
            role,
            content,
            timestamp: now,
        });
        session.updated_at = now;

        Ok(())
    }

    pub fn get_session(&self, session_id: &str) -> Option<ChatSession> {
        let sessions = self.sessions.lock().unwrap();
        sessions.iter().find(|s| s.id == session_id).cloned()
    }

    pub fn list_sessions(&self) -> Vec<ChatSession> {
        let sessions = self.sessions.lock().unwrap();
        sessions.clone()
    }

    pub fn delete_session(&self, session_id: &str) -> Result<(), String> {
        let mut sessions = self.sessions.lock().unwrap();
        let position = sessions
            .iter()
            .position(|s| s.id == session_id)
            .ok_or_else(|| "Session not found".to_string())?;
        
        sessions.remove(position);
        Ok(())
    }

    pub fn clear_session(&self, session_id: &str) -> Result<(), String> {
        let mut sessions = self.sessions.lock().unwrap();
        let session = sessions
            .iter_mut()
            .find(|s| s.id == session_id)
            .ok_or_else(|| "Session not found".to_string())?;

        session.messages.clear();
        session.updated_at = chrono::Utc::now().timestamp();
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_chat_history() {
        let history = ChatHistory::new();
        
        // Test session creation
        let session_id = history.create_session();
        assert!(history.get_session(&session_id).is_some());
        
        // Test message addition
        history.add_message(&session_id, "user".to_string(), "Hello".to_string()).unwrap();
        let session = history.get_session(&session_id).unwrap();
        assert_eq!(session.messages.len(), 1);
        assert_eq!(session.messages[0].content, "Hello");
        
        // Test session clearing
        history.clear_session(&session_id).unwrap();
        let session = history.get_session(&session_id).unwrap();
        assert_eq!(session.messages.len(), 0);
        
        // Test session deletion
        history.delete_session(&session_id).unwrap();
        assert!(history.get_session(&session_id).is_none());
    }
}
