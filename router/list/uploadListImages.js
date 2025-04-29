const router = require("express").Router();
const fs = require("fs");
const multer = require("multer");
const path = require("path");

// Setting up Storage Engine
const storage = multer.diskStorage({
  destination: "./public/uploads/listImages/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname +
        "_" +
        Date.now() +
        "_" +
        Math.floor(100000 + Math.random() * 900000) +
        "_" +
        file.originalname
    );
  },
});

// Initialize Upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000 * 1000 * 5 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).array("listImages", 5);

function checkFileType(file, cb) {
  // Allowed Extentions
  const fileTypes = /.jpg|.png/;

  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb({ code: "NOT_AN_IMAGE" }, false);
  }
}

module.exports.upload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(403).json({
          message: "File size must be less than 5Mb",
          // message : errorMsg(803, req.user.language)
        });
      }
      if (err.code === "NOT_AN_IMAGE") {
        return res.status(403).json({
          message: "Only .JPG or .PNG images are allowed",
          // message :errorMsg(802, req.user.language)
        });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          message: "Max 5 pictures can be uploaded",
          // message :errorMsg(801, req.user.language)
        });
      } else {
        console.log(err);
        return res.json(err);
      }
    } else {
      next();
    }
  });
};

module.exports.discardImage = (req, res, next) => {
  req.files.map((file) => {
    fs.unlinkSync(file.path);
  });
};
