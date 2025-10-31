import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({});
const BUCKET = process.env.MEDIA_BUCKET || "your-production-bucket";

export const deleteObject = async (req, res) => {
  const { key } = req.query;
  if (!key) return res.status(400).json({ message: "Missing key" });

  const params = { Bucket: BUCKET, Key: key };
  try {
    await s3.send(new DeleteObjectCommand(params));
    return res.json({ ok: true, key });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to delete object", error: err.message });
  }
};