mod codegen;

use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::get,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::sync::Arc;

#[derive(Clone, Deserialize, Serialize)]
pub struct Icon {
    name: String,
    svg: String,
}

type Catalog = Arc<Vec<Icon>>;
type ApiError = (StatusCode, Json<Value>);

async fn catalog(State(icons): State<Catalog>) -> Json<Vec<Icon>> {
    Json(icons.as_ref().clone())
}

async fn code(
    State(icons): State<Catalog>,
    Path(name): Path<String>,
) -> Result<Json<Value>, ApiError> {
    let icon = icons.iter().find(|icon| icon.name == name)
        .ok_or((StatusCode::NOT_FOUND, Json(json!({"error": "Icon not found"}))))?;
    let code = codegen::generate_code(icon);
    Ok(Json(json!({"name": icon.name, "code": code})))
}

#[tokio::main]
async fn main() {
    let icons: Vec<Icon> = serde_json::from_str(include_str!("../data/icons.json"))
        .expect("Bundled icon catalog must be valid");
    let count = icons.len();
    let app = Router::new()
        .route("/api/healthz", get(|| async { Json(json!({"status": "ok"})) }))
        .route("/api/icons", get(catalog))
        .route("/api/icons/{name}/code", get(code))
        .fallback(|| async { (StatusCode::NOT_FOUND, Json(json!({"error": "Not found"}))) })
        .with_state(Arc::new(icons));
    let port = std::env::var("PORT").expect("PORT must be provided");
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}"))
        .await.expect("Could not bind server");
    eprintln!("Rust icon API listening on {port}; {count} icons loaded");
    axum::serve(listener, app).await.expect("Server failed");
}
