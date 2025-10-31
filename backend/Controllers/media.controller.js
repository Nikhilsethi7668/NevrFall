import crypto from "crypto";
import AWS from "aws-sdk";

const s3 = new AWS.S3();
const BUCKET = process.env.MEDIA_BUCKET || "your-production-bucket";
const CDN_BASE = process.env.CDN_BASE || "https://your-cdn-domain.com/";

const ALLOW_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);



export const deleteObject = async (req, res) => {
  const { key } = req.query;
  if (!key) return res.status(400).json({ message: "Missing key" });

  const params = { Bucket: BUCKET, Key: key };
  try {
    await s3.deleteObject(params).promise();
    return res.json({ ok: true, key });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to delete object", error: err.message });
  }
};
