import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure Upload Directories Exist
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};
ensureDirExists('./public/students');
ensureDirExists('./public/assignments');

// Multer Storage for Student Images
const studentStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './public/students'),
  filename: (req, file, cb) => cb(null, `student_${Date.now()}${path.extname(file.originalname)}`)
});

export const studentUpload = multer({
  storage: studentStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase()) && allowedTypes.test(file.mimetype);
    isValid ? cb(null, true) : cb(new Error('Only JPG, JPEG, PNG allowed!'), false);
  }
});

// Multer Storage for Assignment Uploads
const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './public/assignments'),
  filename: (req, file, cb) => cb(null, `assignment_${Date.now()}${path.extname(file.originalname)}`)
});

export const assignmentUpload = multer({
  storage: assignmentStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase()) && allowedTypes.test(file.mimetype);
    isValid ? cb(null, true) : cb(new Error('Only PDF, DOC, DOCX allowed!'), false);
  }
});
