import multer from 'multer';
import multerS3 from 'multer-s3';
import s3 from '../Config/s3.js';

const fileFilter = (req, file, cb) => {
  // reject a file
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/webp' ||
    file.mimetype === 'image/gif' ||
    file.mimetype === 'image/svg+xml'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.MEDIA_BUCKET || "your-production-bucket",
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname)
    }
  }),
  fileFilter: fileFilter
});
