import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Designate secure storage directory for attachments
export const ATTACHMENTS_DIR = path.resolve(__dirname, '../uploads/attachments');

// Ensure attachments directory exists safely
if (!fs.existsSync(ATTACHMENTS_DIR)) {
  fs.mkdirSync(ATTACHMENTS_DIR, { recursive: true });
}

// Whitelist of allowed MIME types and extensions
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'audio/webm',
  'audio/mp4',
  'audio/ogg',
  'audio/mpeg',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.webm', '.mp4', '.m4a', '.ogg', '.mp3']);

const MIME_EXTENSION_MAP = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'audio/webm': ['.webm'],
  'audio/mp4': ['.mp4', '.m4a'],
  'audio/ogg': ['.ogg'],
  'audio/mpeg': ['.mp3'],
};

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ATTACHMENTS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // Generate unpredictable secure random filename
    const randomHex = crypto.randomBytes(16).toString('hex');
    const safeFilename = `${Date.now()}-${randomHex}${ext}`;
    cb(null, safeFilename);
  },
});

// File filter: strict validation of MIME type and extension
export const validateAttachmentFile = ({ originalname, mimetype, size }) => {
  const mime = mimetype?.toLowerCase();
  const ext = path.extname(originalname || '').toLowerCase();

  if (!ALLOWED_MIME_TYPES.has(mime) || !ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      code: 'UNSUPPORTED_MEDIA_TYPE',
      error: 'Unsupported file type. Only JPEG, PNG, WEBP, PDF, and audio (WEBM, MP4) files are allowed.',
    };
  }

  const validExts = MIME_EXTENSION_MAP[mime] || [];
  if (!validExts.includes(ext)) {
    return {
      valid: false,
      code: 'MIME_EXTENSION_MISMATCH',
      error: 'File extension does not match its MIME type.',
    };
  }

  // Audio size check (5MB limit)
  if (mime?.startsWith('audio/') || ['.webm', '.mp4', '.m4a', '.ogg', '.mp3'].includes(ext)) {
    if (size > 5 * 1024 * 1024) {
      return {
        valid: false,
        code: 'AUDIO_LIMIT_EXCEEDED',
        error: 'Voice note file size exceeds the 5MB limit.',
      };
    }
  }

  if (size > 10 * 1024 * 1024) {
    return {
      valid: false,
      code: 'LIMIT_FILE_SIZE',
      error: 'File size exceeds the 10MB limit.',
    };
  }

  return { valid: true };
};

const fileFilter = (req, file, cb) => {
  const validation = validateAttachmentFile(file);
  if (!validation.valid) {
    const err = new Error(validation.error);
    err.statusCode = 415;
    err.code = validation.code;
    return cb(err, false);
  }

  cb(null, true);
};

// Multer upload instance: 10 MB per file limit
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB overall max
    files: 1, // 1 attachment per message
  },
});

/**
 * Express middleware wrapper to capture Multer errors cleanly and return HTTP 413 / 415
 */
export const handleAttachmentUpload = (fieldName = 'attachment') => {
  const singleUpload = upload.single(fieldName);

  return (req, res, next) => {
    singleUpload(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            success: false,
            message: 'File size exceeds the limit.',
          });
        }
        if (err.code === 'UNSUPPORTED_MEDIA_TYPE' || err.code === 'MIME_EXTENSION_MISMATCH') {
          return res.status(415).json({
            success: false,
            message: err.message,
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error.',
        });
      }

      // Voice note size check: maximum 5MB for audio
      if (req.file && (req.file.mimetype?.startsWith('audio/') || ['.webm', '.mp4', '.m4a', '.ogg', '.mp3'].includes(path.extname(req.file.originalname).toLowerCase()))) {
        if (req.file.size > 5 * 1024 * 1024) {
          try {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
          } catch {}
          return res.status(413).json({
            success: false,
            message: 'Voice note file size exceeds the 5MB limit.',
          });
        }
      }

      next();
    });
  };
};

export default handleAttachmentUpload;
