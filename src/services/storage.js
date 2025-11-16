const { supabase, supabaseAdmin } = require('./supabase');

/**
 * Upload a file to Supabase Storage
 * @param {string} bucket - Storage bucket name
 * @param {string} filePath - Path where file will be stored
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} contentType - MIME type of the file
 * @returns {Promise<Object>} Upload result with public URL
 */
async function uploadFile(bucket, filePath, fileBuffer, contentType) {
  try {
    const client = supabaseAdmin || supabase;

    const { data, error } = await client.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = client.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      path: data.path,
      publicUrl
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Delete a file from Supabase Storage
 * @param {string} bucket - Storage bucket name
 * @param {string} filePath - Path to file to delete
 * @returns {Promise<Object>} Deletion result
 */
async function deleteFile(bucket, filePath) {
  try {
    const client = supabaseAdmin || supabase;

    const { error } = await client.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('File deletion error:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Get file public URL
 * @param {string} bucket - Storage bucket name
 * @param {string} filePath - Path to file
 * @returns {string} Public URL
 */
function getPublicUrl(bucket, filePath) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

module.exports = {
  uploadFile,
  deleteFile,
  getPublicUrl
};
