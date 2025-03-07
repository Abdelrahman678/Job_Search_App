import multer from 'multer';

export const MulterHost = (allowedExtensions = []) => {
    // disk storage
    const storage = multer.diskStorage({})
    // file filter
    const fileFilter = (req, file, cb) => {
        if (allowedExtensions.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type.'));
        }
    }
    const upload = multer({fileFilter, storage});
    return upload;
}
