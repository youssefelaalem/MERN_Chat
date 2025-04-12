// frontend/utils/fileUploader.js
import { supabase } from "./supabaseConfig";

export async function uploadFile(file) {
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = `files/${fileName}`;

  try {
    // 1. Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("files")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // 2. Get public URL of the uploaded file
    const { data: urlData } = supabase.storage
      .from("files")
      .getPublicUrl(uploadData.path);

    if (!urlData?.publicUrl) {
      throw new Error("Failed to generate public URL");
    }

    // 3. Return data for MongoDB
    return {
      url: urlData.publicUrl,
      path: uploadData.path,
      metadata: {
        filename: fileName,
        mimeType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Upload failed:", error);
    throw error; // Re-throw for handling in components
  }
}