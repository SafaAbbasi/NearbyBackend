const router = require("express").Router();
const passport = require("passport");
require("../../configurations/verifyToken");

const { successMsg, errorMsg } = require("../../model/Logs");

// ===================================== Profile ===================================== //

router.get("/",passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    res
      .status(200)
      .json({
        message: await successMsg(716, req.user.language),
        local: {
          firstName: req.user.local.firstName,
          lastName: req.user.local.lastName,
          email: req.user.local.email,
          isEmailVerified: req.user.local.isEmailVerified,
        },
        facebook: req.user.facebook,
        google: req.user.google,
        profile: req.user.profile,
      });
  }
);
// ===================================== Check User Type ======================================= //
async function emailAndPhoneValidations(req, res, next) {
  const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!req.body.emailOrPhone) {
    return res
      .status(400)
      .json({ message: await errorMsg(708, req.user.language) });
  }

  if (isNaN(req.body.emailOrPhone.replace(/\s/g, ""))) {
    if (!emailRegexp.test(req.body.emailOrPhone)) {
      return res
        .status(422)
        .json({ message: await errorMsg(704, req.user.language) });
    }
  }
  if (!isNaN(req.body.emailOrPhone.replace(/\s/g, ""))) {
    if (req.body.emailOrPhone.replace(/\s/g, "").length != 11) {
      return res
        .status(422)
        .json({ message: await errorMsg(705, req.user.language) });
    }
  }
  next();
}
router.get("/checkUserType",passport.authenticate("jwt", { session: false }),
  emailAndPhoneValidations,
  (req, res) => {
    req.body.emailOrPhone = req.body.emailOrPhone.replace(/\s/g, "");
    User.findOne({
      $or: [
        { "profile.contactInformation.primaryEmail": req.body.emailOrPhone },
        { "profile.contactInformation.secondaryEmails": req.body.emailOrPhone },
        { "profile.contactInformation.primaryPhoneNum": req.body.emailOrPhone },
        {
          "profile.contactInformation.secondaryPhoneNums":
            req.body.emailOrPhone,
        },
      ],
    })
      .then(async (doc) => {
        if (!doc) {
          return res.status(404).json({
            message: await errorMsg(709, req.user.language),
          });
        } else {
          return res
            .status(200)
            .json({
              message: await successMsg(861, req.user.language),
              strategies: doc.signupStrategies,
            });
        }
      })
      .catch((err) => {
        return res.status(400).json(err);
      });
  }
);

// before logging in

async function emailAndPhoneValidationsWithoutToken(req, res, next) {
  console.log(req.body);
  const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!req.body.emailOrPhone) {
    return res
      .status(400)
      .json({ message: await errorMsg(708, req.params.lng) });
  }

  if (isNaN(req.body.emailOrPhone.replace(/\s/g, ""))) {
    if (!emailRegexp.test(req.body.emailOrPhone)) {
      return res
        .status(422)
        .json({ message: await errorMsg(704, req.params.lng) });
    }
  }
  if (!isNaN(req.body.emailOrPhone.replace(/\s/g, ""))) {
    if (req.body.emailOrPhone.replace(/\s/g, "").length != 11) {
      return res
        .status(422)
        .json({ message: await errorMsg(705, req.params.lng) });
    }
  }
  next();
}

router.post(
  "/checkUserType/:lng",
  emailAndPhoneValidationsWithoutToken,
  (req, res) => {
    req.body.emailOrPhone = req.body.emailOrPhone.replace(/\s/g, "");
    User.findOne({
      $or: [
        { "profile.contactInformation.primaryEmail": req.body.emailOrPhone },
        { "profile.contactInformation.secondaryEmails": req.body.emailOrPhone },
        { "profile.contactInformation.primaryPhoneNum": req.body.emailOrPhone },
        {
          "profile.contactInformation.secondaryPhoneNums":
            req.body.emailOrPhone,
        },
      ],
    })
      .then(async (doc) => {
        if (!doc) {
          return res.status(404).json({
            message: await errorMsg(709, req.params.lng),
          });
        } else {
          return res
            .status(200)
            .json({
              message: await successMsg(861, req.params.lng),
              strategies: doc.signupStrategies,
            });
        }
      })
      .catch((err) => {
        return res.status(400).json(err);
      });
  }
);
// ===================================== Image Uploading ======================================= //

const uploadImg = require("../../configurations/uploadImages");
const User = require("../../model/User");

router.post(
  "/uploadimage",
  passport.authenticate("jwt", { session: false }),
  uploadImg,
  async (req, res) => {
    try {
      let user = await User.findById(req.user._id);
      if (user) {
        user.profile.profilePic = req.profilePicPath;
        await user.save();
        res
          .status(200)
          .json({
            message: await successMsg(863, req.user.language),
            profilePicture: user.profile.profilePic,
          });
      }
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }
);

// ===================================== Language end point =================================== //

router.put(
  "/language",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.body.language) {
      return res.send("type language");
    }

    try {
      let user = await User.findOne(req.user._id);
      if (user) {
        user.language = req.body.language;
        await user.save();
        return res
          .status(200)
          .json({ message: await successMsg(862, await req.user.language) });
      }
    } catch (error) {
      console.log(error);
    }
  }
);

//  Account Information

router.use("/account-information", require("./accountInformation"));

//  Contact Information

router.use("/contact-information", require("./contactInformation"));

//  My Verifications

router.use("/user-verifications", require("./verification"));

//  Security Settings

router.use("/security-settings", require("./securitySetting"));

module.exports = router;
