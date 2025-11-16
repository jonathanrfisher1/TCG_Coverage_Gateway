/**
 * Validate file type
 * @param {string} mimetype - File MIME type
 * @returns {boolean} Whether file type is allowed
 */
function isAllowedFileType(mimetype) {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/png,application/pdf')
    .split(',')
    .map(type => type.trim());

  return allowedTypes.includes(mimetype);
}

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @returns {boolean} Whether file size is within limit
 */
function isAllowedFileSize(size) {
  const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // 10MB default
  return size <= maxSize;
}

/**
 * Get file extension from filename
 * @param {string} filename - Original filename
 * @returns {string} File extension
 */
function getFileExtension(filename) {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Generate unique filename
 * @param {string} originalName - Original filename
 * @returns {string} Unique filename with timestamp
 */
function generateUniqueFilename(originalName) {
  const timestamp = Date.now();
  const extension = getFileExtension(originalName);
  const randomString = Math.random().toString(36).substring(2, 8);

  return `${timestamp}-${randomString}.${extension}`;
}

/**
 * Validate file for upload
 * @param {Object} file - File object from multer
 * @returns {Object} Validation result
 */
function validateFile(file) {
  const errors = [];

  if (!file) {
    errors.push('No file provided');
    return { valid: false, errors };
  }

  if (!isAllowedFileType(file.mimetype)) {
    errors.push(`File type ${file.mimetype} is not allowed. Allowed types: ${process.env.ALLOWED_FILE_TYPES}`);
  }

  if (!isAllowedFileSize(file.size)) {
    const maxSizeMB = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10) / (1024 * 1024);
    errors.push(`File size exceeds maximum of ${maxSizeMB}MB`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  isAllowedFileType,
  isAllowedFileSize,
  getFileExtension,
  generateUniqueFilename,
  validateFile
};
