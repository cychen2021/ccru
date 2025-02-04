use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::fmt;

// Custom error type for agent operations
#[derive(Debug)]
pub struct AgentError {
    pub message: String,
    pub kind: AgentErrorKind,
}

#[derive(Debug)]
pub enum AgentErrorKind {
    ActionFailed,
    ObservationFailed,
    PlanningFailed,
    InvalidInput,
    LLMError,
}

impl fmt::Display for AgentError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl Error for AgentError {}

// Represents an action that can be performed by the agent
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Action {
    pub action_type: String,
    pub parameters: serde_json::Value,
    pub description: String,
}

// Represents an observation made by the agent
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Observation {
    pub content: String,
    pub source: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub metadata: Option<serde_json::Value>,
}

// Represents the agent's working memory
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Memory {
    pub observations: Vec<Observation>,
    pub actions_taken: Vec<Action>,
    pub context: serde_json::Value,
}

// Main trait defining the agent's capabilities
#[async_trait]
pub trait Agent {
    // Core capabilities
    async fn observe(&mut self, target: &str) -> Result<Observation, AgentError>;
    async fn plan(&self, goal: &str) -> Result<Vec<Action>, AgentError>;
    async fn execute(&mut self, action: Action) -> Result<Observation, AgentError>;
    
    // Memory management
    fn get_memory(&self) -> &Memory;
    fn update_memory(&mut self, observation: Observation);
    fn clear_memory(&mut self);
    
    // Reflection and learning
    async fn reflect(&self) -> Result<String, AgentError>;
    async fn learn_from_experience(&mut self) -> Result<(), AgentError>;
    
    // Tool usage
    async fn use_tool(&self, tool_name: &str, params: serde_json::Value) -> Result<serde_json::Value, AgentError>;
    
    // State management
    fn get_state(&self) -> serde_json::Value;
    fn set_state(&mut self, state: serde_json::Value) -> Result<(), AgentError>;
}

// Helper struct for implementing agents
pub struct AgentBuilder {
    pub llm_config: LLMConfig,
    pub tools: Vec<Tool>,
    pub initial_memory: Option<Memory>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LLMConfig {
    pub model: String,
    pub temperature: f32,
    pub max_tokens: u32,
}

#[derive(Debug, Clone)]
pub struct Tool {
    pub name: String,
    pub description: String,
    pub handler: Box<dyn Fn(serde_json::Value) -> Result<serde_json::Value, AgentError> + Send + Sync>,
}

impl AgentBuilder {
    pub fn new(llm_config: LLMConfig) -> Self {
        Self {
            llm_config,
            tools: Vec::new(),
            initial_memory: None,
        }
    }

    pub fn with_tool(mut self, tool: Tool) -> Self {
        self.tools.push(tool);
        self
    }

    pub fn with_initial_memory(mut self, memory: Memory) -> Self {
        self.initial_memory = Some(memory);
        self
    }
}

// Default implementation for common agent behaviors
#[async_trait]
impl<T: Agent + Send + Sync> AgentBehavior for T {
    async fn execute_plan(&mut self, goal: &str) -> Result<Vec<Observation>, AgentError> {
        let plan = self.plan(goal).await?;
        let mut observations = Vec::new();
        
        for action in plan {
            let observation = self.execute(action).await?;
            self.update_memory(observation.clone());
            observations.push(observation);
        }
        
        Ok(observations)
    }

    async fn summarize_observations(&self) -> Result<String, AgentError> {
        let memory = self.get_memory();
        if memory.observations.is_empty() {
            return Ok("No observations recorded.".to_string());
        }

        // Implementation would use the LLM to generate a summary
        Ok("Summary of observations...".to_string())
    }
}

// Trait for common agent behaviors
#[async_trait]
pub trait AgentBehavior {
    async fn execute_plan(&mut self, goal: &str) -> Result<Vec<Observation>, AgentError>;
    async fn summarize_observations(&self) -> Result<String, AgentError>;
}

// Helper functions for agent implementations
pub mod utils {
    use super::*;

    pub fn create_observation(
        content: String,
        source: String,
        metadata: Option<serde_json::Value>,
    ) -> Observation {
        Observation {
            content,
            source,
            timestamp: chrono::Utc::now(),
            metadata,
        }
    }

    pub fn create_action(
        action_type: &str,
        parameters: serde_json::Value,
        description: &str,
    ) -> Action {
        Action {
            action_type: action_type.to_string(),
            parameters,
            description: description.to_string(),
        }
    }
}
////////