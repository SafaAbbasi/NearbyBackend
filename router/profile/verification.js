const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const { errorMsg, successMsg } = require("../../model/Logs");
const passport = require("passport");
const User = require("../../model/User");
require("../../configurations/verifyToken");

router.get("/",passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let user = await User.findById(req.user._id);
    if (user) {
      return res.json({
        message: await successMsg(866, req.user.language),
        userVerification: user.profile.userVerification,
      });
    }
  }
);

// Setting up Storage Engine
const storage = multer.diskStorage({
  destination: "./public/uploads/userVerification/",
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
}).array("userVerification", 3);

function checkFileType(file, cb) {
  // Allowed Extentions
  const fileTypes = /.jpg|.png|.jpeg/;

  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb({ code: "NOT_AN_IMAGE" }, false);
  }
}

router.post(
  "/upload",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // return res.send("...My verifications...")

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
            //message :errorMsg(802, req.user.language)
          });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            message: {
              desc: "All three images are required to process verification",
            },
            //message :errorMsg(801, req.user.language)
          });
        } else {
          console.log(err);
          return res.json(err);
        }
      } else {
        if (req.files.length < 3 || req.files === undefined) {
          return res.status(400).json({
            message: "All three images are required to process verification",
            //message :errorMsg(801, req.user.language)
          });
        } else {
          User.findById(req.user._id)
            .then((user) => {
              if (user) {
                user.profile.userVerification.status = "Pending";
                user.profile.userVerification.captures.idFront =
                  req.files[0].path;
                user.profile.userVerification.captures.idBack =
                  req.files[1].path;
                user.profile.userVerification.captures.selfie =
                  req.files[2].path;

                user
                  .save()
                  .then((result) => {
                    return res.json({
                      message: "Your request for verification is sent..",
                      response: user.profile.userVerification,
                    });
                  })
                  .catch((err) => {
                    console.log(err);
                    return res.json(err);
                  });
              }
            })
            .catch((err) => {
              console.log(err);
              res.json(err);
            });
        }
      }
    });
  }
);

module.exports = router;
