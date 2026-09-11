use serde_json::Value;
use std::path::PathBuf;
use std::process::Command;
use tauri::State;

struct LaunchOptions {
    workspace: PathBuf,
    goal: Option<String>,
}

fn argument(name: &str) -> Option<String> {
    let args: Vec<String> = std::env::args().collect();
    args.iter()
        .position(|value| value == name)
        .and_then(|index| args.get(index + 1))
        .cloned()
}

#[tauri::command]
fn read_learning_map(
    goal: Option<String>,
    options: State<'_, LaunchOptions>,
) -> Result<Value, String> {
    let script = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../..")
        .join("_shared/scripts/learning-view.mjs");
    let mut command = Command::new("node");
    command.args([
        script.as_os_str(),
        "--workspace".as_ref(),
        options.workspace.as_os_str(),
        "--map".as_ref(),
        "--format".as_ref(),
        "json".as_ref(),
    ]);
    if let Some(goal_id) = goal.or_else(|| options.goal.clone()) {
        command.args(["--goal", &goal_id]);
    }
    let output = command
        .output()
        .map_err(|error| format!("Unable to run Node projection: {error}"))?;
    if !output.status.success() {
        let message = String::from_utf8_lossy(&output.stderr).trim().to_string();
        return Err(if message.is_empty() {
            "Learning projection failed".into()
        } else {
            message
        });
    }
    serde_json::from_slice(&output.stdout)
        .map_err(|error| format!("Learning projection returned invalid JSON: {error}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let workspace = argument("--workspace")
        .map(PathBuf::from)
        .unwrap_or_else(|| std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")));
    let goal = argument("--goal");
    tauri::Builder::default()
        .manage(LaunchOptions { workspace, goal })
        .invoke_handler(tauri::generate_handler![read_learning_map])
        .run(tauri::generate_context!())
        .expect("error while running Learning Companion");
}
