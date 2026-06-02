// backend/services/uploadService.js
// Upload/Download abstraction.
// Temporary implementation: if Cloudflare R2 env vars are set, upload to R2.
// Otherwise, fall back to returning a file:// URL (current behavior).

const fs = require('fs');

// Optional AWS SDK compatible client (works with Cloudflare R2)
let S3Client = null;
let PutObjectCommand = null;
let GetObjectCommand = null;
let getSignedUrl = null;

try {
  // These dependencies are not guaranteed in your current package.json,
  // so load dynamically and keep server boot safe.
  // If aws-sdk v2 is present, we'll still just provide fallback.
  // (Your package.json already includes aws-sdk, not @aws-sdk/client-s3.)
  S3Client = require('aws-sdk');
} catch (e) {
  S3Client = null;
}

function hasR2Config() {
  return (
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET &&
    process.env.R2_REGION &&
    process.env.R2_ENDPOINT
  );
}

module.exports = {
  async uploadVideo(file) {
    if (!file) throw new Error('No file provided');

    // Fallback: local file URL
    if (!hasR2Config()) {
      return `file://${file.path || ''}`;
    }

    const s3 = new S3Client.S3({
      endpoint: process.env.R2_ENDPOINT,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      region: process.env.R2_REGION,
      s3ForcePathStyle: true,
      signatureVersion: 'v4'
    });

    const fileBuffer = fs.readFileSync(file.path);
    const key = `videos/${Date.now()}_${file.originalname || 'upload'}`;

    await s3
      .upload({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: file.mimetype || 'application/octet-stream'
      })
      .promise();

    // Public URL if your bucket is public.
    // Otherwise, configure a signed URL in downloadFile.
    const publicBase = process.env.R2_PUBLIC_BASE_URL || '';
    if (publicBase) return `${publicBase}/${key}`;

    return key; // downloadFile can handle signing/download
  },

  async downloadFile(urlOrKey) {
    if (!urlOrKey) throw new Error('No url provided');

    // If not configured, just return original.
    if (!hasR2Config()) return urlOrKey;

    // If this is already a URL, send it to python service.
    if (/^https?:\/\//i.test(urlOrKey)) return urlOrKey;

    // Otherwise treat as R2 key and return a signed URL.
    const s3 = new S3Client.S3({
      endpoint: process.env.R2_ENDPOINT,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      region: process.env.R2_REGION,
      s3ForcePathStyle: true,
      signatureVersion: 'v4'
    });

    // Signed URL (valid for Python fetch)
    const params = { Bucket: process.env.R2_BUCKET, Key: urlOrKey };
    return s3.getSignedUrl('getObject', { ...params, Expires: 60 * 5 });
  }
};


