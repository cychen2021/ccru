mod config;
mod llm_bridge;

#[derive(Default)]
struct AppState {
  config: Option<Config>,
  llm_bridge: Option<Arc<dyn LLMBridge>>,
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
    .invoke_handler(tauri::generate_handler![config::load_config, config::save_config])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
