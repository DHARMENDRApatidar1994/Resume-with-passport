const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/images");
    },
    filename: (req, file, cb) => {
        const modifiedname =
            "ResumeBuilder-" + Date.now() + path.extname(file.originalname);
        cb(null, modifiedname);
    },
});


function fileFilter(req, file, cb) {
    let filetypes = /jpeg|jpg|png|gif|avif|svg|webp/;
    let mimetype = filetypes.test(file.mimetype);
    let extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
        return cb(null, true);
    }

    cb(new Error("Uploaded filetype not supported."));
}


const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    
});

module.exports = upload;
