const multer = require("multer");
const path = require("path");

// Static Path
const express = require("express");
const app = express();
// app.use(express.static('public'))

// Setting up Storage Engine
const storage = multer.diskStorage({
  destination: "./public/uploads/profilePic/",
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
}).single("file");

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

const { errorMsg } = require("../model/Logs");
function initUpload(req, res, next) {
  upload(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(403).json({
          message: "File size must be less than 5Mb",
          // message : await errorMsg(803,'en')
        });
      }
      if (err.code === "NOT_AN_IMAGE") {
        return res.status(403).json({
          message: "Only .JPG or .PNG images are allowed",
          //message :errorMsg(802,'en')
        });
      } else {
        console.log(err);
        return res.json(err);
      }
    } else {
      if (req.file === undefined) {
        return res.status(400).json({
          message: "No File Selected!",
          //message :errorMsg(801,'en')
        });
      } else {
        req.profilePicPath = req.file.path;
        next();
      }
    }
  });
}

module.exports = initUpload;
