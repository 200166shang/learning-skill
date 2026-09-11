use serde_json::{json, Value};
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use tauri::State;

struct LaunchOptions {
    workspace: PathBuf,
    goal: Option<String>,
    node_path: PathBuf,
    projection_script: PathBuf,
    ready_file: Option<PathBuf>,
    focus_file: Option<PathBuf>,
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
    window: tauri::Window,
) -> Result<Value, String> {
    if let Some(focus_file) = &options.focus_file {
        if focus_file.exists() {
            window
                .show()
                .map_err(|error| format!("Unable to show window: {error}"))?;
            window
                .unminimize()
                .map_err(|error| format!("Unable to restore window: {error}"))?;
            window
                .set_focus()
                .map_err(|error| format!("Unable to focus window: {error}"))?;
            fs::remove_file(focus_file)
                .map_err(|error| format!("Unable to acknowledge focus request: {error}"))?;
        }
    }
    let mut command = Command::new(&options.node_path);
    command.args([
        options.projection_script.as_os_str(),
        "--workspace".as_ref(),
        options.workspace.as_os_str(),
        "--map".as_ref(),
        "--format".as_ref(),
        "json".as_ref(),
    ]);
    let effective_goal = goal.or_else(|| options.goal.clone());
    if let Some(goal_id) = &effective_goal {
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
    let projection = serde_json::from_slice(&output.stdout)
        .map_err(|error| format!("Learning projection returned invalid JSON: {error}"))?;
    if let Some(ready_file) = &options.ready_file {
        if !ready_file.exists() {
            if let Some(parent) = ready_file.parent() {
                fs::create_dir_all(parent)
                    .map_err(|error| format!("Unable to create readiness directory: {error}"))?;
            }
            let temporary = ready_file.with_extension(format!("tmp-{}", std::process::id()));
            let payload = json!({
                "pid": std::process::id(),
                "workspace": options.workspace,
                "goal": effective_goal,
            });
            let encoded = serde_json::to_vec(&payload)
                .map_err(|error| format!("Unable to encode readiness signal: {error}"))?;
            fs::write(&temporary, encoded)
                .map_err(|error| format!("Unable to write readiness signal: {error}"))?;
            fs::rename(&temporary, ready_file)
                .map_err(|error| format!("Unable to publish readiness signal: {error}"))?;
        }
    }
    Ok(projection)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let workspace = argument("--workspace")
        .map(PathBuf::from)
        .unwrap_or_else(|| std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")));
    let goal = argument("--goal");
    let node_path = argument("--node-path")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("node"));
    let projection_script = argument("--projection-script")
        .map(PathBuf::from)
        .unwrap_or_else(|| {
            PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                .join("../..")
                .join("_shared/scripts/learning-view.mjs")
        });
    let ready_file = argument("--ready-file").map(PathBuf::from);
    let focus_file = argument("--focus-file").map(PathBuf::from);
    tauri::Builder::default()
        .manage(LaunchOptions {
            workspace,
            goal,
            node_path,
            projection_script,
            ready_file,
            focus_file,
        })
        .invoke_handler(tauri::generate_handler![read_learning_map])
        .run(tauri::generate_context!())
        .expect("error while running Learning Companion");
}
