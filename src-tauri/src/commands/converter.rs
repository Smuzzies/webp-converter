use serde::{Deserialize, Serialize};
use image::{DynamicImage, GenericImageView};
use webp::Encoder;
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NamingOptions {
    scheme: String,
    suffix: Option<String>,
    custom_pattern: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConversionResult {
    success: bool,
    output_path: String,
    original_size: usize,
    new_size: usize,
    error: Option<String>,
    base64_data: Option<String>,
}

#[tauri::command]
pub async fn convert_to_webp(
    image_data: Vec<u8>,
    file_name: String,
    quality: f32,
    naming_options: NamingOptions,
) -> Result<ConversionResult, String> {
    // Load the image from bytes
    let img = match image::load_from_memory(&image_data) {
        Ok(img) => img,
        Err(e) => {
            return Ok(ConversionResult {
                success: false,
                output_path: String::new(),
                original_size: image_data.len(),
                new_size: 0,
                error: Some(format!("Failed to load image: {}", e)),
                base64_data: None,
            });
        }
    };

    // Convert to WebP
    let webp_data = match encode_webp(&img, quality) {
        Ok(data) => data,
        Err(e) => {
            return Ok(ConversionResult {
                success: false,
                output_path: String::new(),
                original_size: image_data.len(),
                new_size: 0,
                error: Some(format!("Failed to encode WebP: {}", e)),
                base64_data: None,
            });
        }
    };

    // Generate output filename
    let output_name = generate_output_name(&file_name, &naming_options);
    
    // Convert to base64 for frontend display
    let base64_data = BASE64.encode(&webp_data);
    
    Ok(ConversionResult {
        success: true,
        output_path: output_name,
        original_size: image_data.len(),
        new_size: webp_data.len(),
        error: None,
        base64_data: Some(base64_data),
    })
}

fn encode_webp(img: &DynamicImage, quality: f32) -> Result<Vec<u8>, String> {
    let (width, height) = img.dimensions();
    let rgba_image = img.to_rgba8();
    let raw_data = rgba_image.as_raw();
    
    // Create WebP encoder - webp 0.2 doesn't return Result
    let encoder = Encoder::from_rgba(raw_data, width, height);
    
    // Encode with quality (0.0 to 100.0 scale)
    let webp_memory = encoder.encode(quality * 100.0);
    
    Ok(webp_memory.to_vec())
}

fn generate_output_name(original_name: &str, options: &NamingOptions) -> String {
    let name_without_ext = original_name
        .rsplit_once('.')
        .map(|(name, _)| name)
        .unwrap_or(original_name);
    
    match options.scheme.as_str() {
        "keep-original" => format!("{}.webp", name_without_ext),
        "add-suffix" => {
            let suffix = options.suffix.as_deref().unwrap_or("_compressed");
            format!("{}{}.webp", name_without_ext, suffix)
        },
        "custom" => {
            let pattern = options.custom_pattern.as_deref().unwrap_or("{name}_{index}");
            pattern
                .replace("{name}", name_without_ext)
                .replace("{index}", "001")
                .replace("{date}", &chrono::Local::now().format("%Y%m%d").to_string())
                + ".webp"
        },
        _ => format!("{}.webp", name_without_ext),
    }
}

#[tauri::command]
pub async fn save_webp_file(
    base64_data: String,
    file_path: String,
) -> Result<bool, String> {
    // Decode base64
    let webp_data = BASE64.decode(base64_data)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;
    
    // Ensure parent directory exists
    if let Some(parent) = Path::new(&file_path).parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    
    // Write file
    fs::write(&file_path, webp_data)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    
    Ok(true)
}

#[tauri::command]
pub async fn convert_and_save_webp(
    source_path: String,
    quality: f32,
    naming_options: NamingOptions,
) -> Result<ConversionResult, String> {
    // Read the source file
    let image_data = fs::read(&source_path)
        .map_err(|e| format!("Failed to read source file: {}", e))?;
    
    // Load the image
    let img = match image::load_from_memory(&image_data) {
        Ok(img) => img,
        Err(e) => {
            return Ok(ConversionResult {
                success: false,
                output_path: String::new(),
                original_size: image_data.len(),
                new_size: 0,
                error: Some(format!("Failed to load image: {}", e)),
                base64_data: None,
            });
        }
    };

    // Convert to WebP
    let webp_data = match encode_webp(&img, quality) {
        Ok(data) => data,
        Err(e) => {
            return Ok(ConversionResult {
                success: false,
                output_path: String::new(),
                original_size: image_data.len(),
                new_size: 0,
                error: Some(format!("Failed to encode WebP: {}", e)),
                base64_data: None,
            });
        }
    };

    // Generate output path in the same directory as source
    let source_path = Path::new(&source_path);
    let file_name = source_path.file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("image");
    let output_name = generate_output_name(file_name, &naming_options);
    
    let output_path = source_path.parent()
        .map(|p| p.join(&output_name))
        .unwrap_or_else(|| PathBuf::from(&output_name));
    
    // Save the file
    fs::write(&output_path, &webp_data)
        .map_err(|e| format!("Failed to write WebP file: {}", e))?;
    
    // Convert to base64 for preview
    let base64_data = BASE64.encode(&webp_data);
    
    Ok(ConversionResult {
        success: true,
        output_path: output_path.to_string_lossy().to_string(),
        original_size: image_data.len(),
        new_size: webp_data.len(),
        error: None,
        base64_data: Some(base64_data),
    })
}