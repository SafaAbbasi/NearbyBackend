const router = require("express").Router();
const passport = require("passport");
require("../../configurations/verifyToken");

const { successMsg, errorMsg } = require("../../model/Logs");
const User = require("../../model/User");

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    return res
      .status(200)
      .json({
        message: await successMsg(858, req.user.language),
        contactInformation: await contactInfoResponse(req, res),
      });
  }
);

// ===================================== Contact Information (UPDATE) ======================================= //

// New secondary Email

async function secondaryEmailValidation(req, res, next) {
  const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!req.body.secondaryEmail) {
    return res
      .status(400)
      .json({ message: await errorMsg(807, req.user.language) });
  }

  if (!emailRegexp.test(req.body.secondaryEmail)) {
    return res
      .status(422)
      .json({ message: await errorMsg(808, req.user.language) });
  }

  let emailExists = await User.findOne({
    $or: [
      { "profile.contactInformation.primaryEmail": req.body.secondaryEmail },
      { "profile.contactInformation.secondaryEmails": req.body.secondaryEmail },
    ],
  });
  if (emailExists) {
    return res
      .status(409)
      .json({ message: await errorMsg(809, req.user.language) });
  }
  next();
}

const {
  addEmailVerification,
} = require("../../configurations/emailVerification");

router.post(
  "/add/email",
  passport.authenticate("jwt", { session: false }),
  secondaryEmailValidation,
  addEmailVerification
);

router.put(
  "/add/email/verify",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      if (!req.session.verification_code || !req.session.secondaryEmail) {
        return res.status(403).json({
          message: await errorMsg(700, req.user.language),
        });
      }

      if (req.body.verification_code !== req.session.verification_code) {
        return res.status(400).json({
          message: await errorMsg(717, req.user.language),
        });
      }

      let user = await User.findById(req.user._id);
      if (user) {
        if (!user.profile.contactInformation.primaryEmail) {
          user.profile.contactInformation.primaryEmail =
            req.session.secondaryEmail;
        } else {
          user.profile.contactInformation.secondaryEmails = [
            ...user.profile.contactInformation.secondaryEmails,
            req.session.secondaryEmail,
          ];
        }
        await user.save();
        req.session.destroy();
        res
          .status(200)
          .json({
            message: await successMsg(852, req.user.language),
            contactInformation: await contactInfoResponse(req, res),
          });
      }
    } catch (error) {
      console.log(error);
      return res.json(error);
    }
  }
);

// New Secondary PhoneNum

const {
  addPhoneNumVerification,
} = require("../../configurations/phoneNumVerification");

async function secondaryPhoneNumValidation(req, res, next) {
  req.body.secondaryPhoneNum = req.body.secondaryPhoneNum.replace(/\s/g, "");

  if (!req.body.secondaryPhoneNum) {
    return res
      .status(400)
      .json({ message: await errorMsg(810, req.user.language) });
  }
  if (
    isNaN(req.body.secondaryPhoneNum) ||
    req.body.secondaryPhoneNum.length !== 11
  ) {
    return res
      .status(422)
      .json({ message: await errorMsg(811, req.user.language) });
  }

  let phoneNumExists = await User.findOne({
    $or: [
      {
        "profile.contactInformation.primaryPhoneNum":
          req.body.secondaryPhoneNum,
      },
      {
        "profile.contactInformation.secondaryPhoneNums":
          req.body.secondaryPhoneNum,
      },
    ],
  });
  if (phoneNumExists) {
    return res
      .status(409)
      .json({ message: await errorMsg(812, req.user.language) });
  }
  next();
}

router.post(
  "/add/phonenum",
  passport.authenticate("jwt", { session: false }),
  secondaryPhoneNumValidation,
  addPhoneNumVerification
);
router.put(
  "/add/phonenum/verify",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      if (!req.session.verification_code || !req.session.secondaryPhoneNum) {
        return res.status(403).json({
          message: await errorMsg(700, req.user.language),
        });
      }
      if (req.body.verification_code !== req.session.verification_code) {
        return res.status(400).json({
          message: await errorMsg(717, req.user.language),
        });
      }

      let user = await User.findById(req.user._id);

      if (user) {
        if (user.profile.contactInformation.primaryPhoneNum === null) {
          user.profile.contactInformation.primaryPhoneNum =
            req.session.secondaryPhoneNum;
        } else {
          user.profile.contactInformation.secondaryPhoneNums = [
            ...user.profile.contactInformation.secondaryPhoneNums,
            req.session.secondaryPhoneNum,
          ];
        }
        await user.save();
        req.session.destroy();
        res
          .status(200)
          .json({
            message: await successMsg(853, req.user.language),
            contactInformation: await contactInfoResponse(req, res),
          });
      }
    } catch (error) {
      console.log(error);
      return res.json(error);
    }
  }
);

// Make Primary Email

router.post(
  "/makeprimary/email",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.body.email) {
      return res
        .status(403)
        .json({ message: errorMsg(807, req.user.language) });
    }
    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegexp.test(req.body.email)) {
      return res
        .status(422)
        .json({ message: await errorMsg(808, req.user.language) });
    }

    let user = await User.findOne(req.user._id);

    if (user) {
      if (user.profile.contactInformation.primaryEmail === req.body.email) {
        return res
          .status(409)
          .json({ message: await errorMsg(817, req.user.language) });
      }

      let exists = user.profile.contactInformation.secondaryEmails.find(
        (item) => item === req.body.email
      );

      if (exists) {
        let { primaryEmail, secondaryEmails } = user.profile.contactInformation;
        user.profile.contactInformation.secondaryEmails = [
          ...secondaryEmails,
          primaryEmail,
        ];
        user.profile.contactInformation.primaryEmail = req.body.email;
        await user.save();
        res
          .status(200)
          .json({
            message: await successMsg(854, req.user.language),
            contactInformation: await contactInfoResponse(req, res),
          });
      } else {
        return res
          .status(404)
          .json({ message: await errorMsg(813, req.user.language) });
      }
    }
  }
);

// Make Primary Phone number
router.post(
  "/makeprimary/phone",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    req.body.phoneNum = req.body.phoneNum.replace(/\s/g, "");

    if (!req.body.phoneNum) {
      return res
        .status(403)
        .json({ message: await errorMsg(810, req.user.language) });
    }
    if (isNaN(req.body.phoneNum) || req.body.phoneNum.length !== 11) {
      return res
        .status(422)
        .json({ message: await errorMsg(811, req.user.language) });
    }

    let user = await User.findById(req.user._id);
    if (user) {
      if (
        user.profile.contactInformation.primaryPhoneNum === req.body.phoneNum
      ) {
        return res
          .status(200)
          .json({ message: await errorMsg(818, req.user.language) });
      }

      let exists = user.profile.contactInformation.secondaryPhoneNums.find(
        (item) => item === req.body.phoneNum
      );
      if (exists) {
        let {
          primaryPhoneNum,
          secondaryPhoneNums,
        } = user.profile.contactInformation;
        user.profile.contactInformation.secondaryPhoneNums = [
          ...secondaryPhoneNums,
          primaryPhoneNum,
        ];
        user.profile.contactInformation.primaryPhoneNum = req.body.phoneNum;
        await user.save();
        res
          .status(200)
          .json({
            message: await successMsg(855, req.user.language),
            contactInformation: await contactInfoResponse(req, res),
          });
      } else {
        return res
          .status(404)
          .json({ message: await errorMsg(814, req.user.language) });
      }
    }
  }
);

// Delete Email
router.post(
  "/delete/email",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    req.body.email = req.body.email.replace(/\s/g, "");

    if (!req.body.email) {
      return res
        .status(403)
        .json({ message: await errorMsg(807, req.user.language) });
    }

    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegexp.test(req.body.email)) {
      return res
        .status(422)
        .json({ message: await errorMsg(808, req.user.language) });
    }

    let user = await User.findById(req.user._id);
    if (user) {
      if (user.profile.contactInformation.primaryEmail === req.body.email) {
        if (user.profile.contactInformation.secondaryEmails.length > 0) {
          user.profile.contactInformation.primaryEmail =
            user.profile.contactInformation.secondaryEmails[0];
          await user.save();
          return res
            .status(200)
            .json({
              message: await successMsg(856, req.user.language),
              contactInformation: await contactInfoResponse(req, res),
            });
        } else {
          return res
            .status(403)
            .json({ message: await errorMsg(815, req.user.language) });
        }
      }
      let deleteFromSecondary = await user.profile.contactInformation.secondaryEmails.find(
        (item) => item === req.body.email
      );
      if (deleteFromSecondary) {
        user.profile.contactInformation.secondaryEmails = await user.profile.contactInformation.secondaryEmails.filter(
          (item) => item !== req.body.email
        );
        await user.save();
        return res
          .status(200)
          .json({
            message: await successMsg(856, req.user.language),
            contactInformation: await contactInfoResponse(req, res),
          });
      }
    }
    return res
      .status(404)
      .json({ message: await errorMsg(813, req.user.language) });
  }
);

// Delete Phone Num

router.post(
  "/delete/phone",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    req.body.phoneNum = req.body.phoneNum.replace(/\s/g, "");
    if (!req.body.phoneNum) {
      return res
        .status(400)
        .json({ message: await errorMsg(810, req.user.language) });
    }
    if (isNaN(req.body.phoneNum) || req.body.phoneNum.length !== 11) {
      return res
        .status(422)
        .json({ message: await errorMsg(811, req.user.language) });
    }

    let user = await User.findById(req.user._id);
    if (user) {
      if (
        user.profile.contactInformation.primaryPhoneNum === req.body.phoneNum
      ) {
        if (user.profile.contactInformation.secondaryPhoneNums.length > 0) {
          user.profile.contactInformation.primaryPhoneNum =
            user.profile.contactInformation.secondaryPhoneNums[0];
          await user.save();
          return res
            .status(200)
            .json({
              message: await successMsg(857, req.user.language),
              contactInformation: await contactInfoResponse(req, res),
            });
        } else {
          return res
            .status(403)
            .json({ message: await errorMsg(816, req.user.language) });
        }
      }
      let deleteFromSecondary = await user.profile.contactInformation.secondaryPhoneNums.find(
        (item) => item === req.body.phoneNum
      );
      if (deleteFromSecondary) {
        user.profile.contactInformation.secondaryPhoneNums = user.profile.contactInformation.secondaryPhoneNums.filter(
          (item) => item !== req.body.phoneNum
        );
        await user.save();
        return res
          .status(200)
          .json({
            message: await successMsg(857, req.user.language),
            contactInformation: await contactInfoResponse(req, res),
          });
      }
    }
    return res
      .status(404)
      .json({ message: await errorMsg(814, req.user.language) });
  }
);

// function for responses
async function contactInfoResponse(req, res) {
  try {
    let user = await User.findById(req.user._id);
    if (user) {
      user.profile.contactInformation = {
        primaryEmail: (await user.profile.contactInformation.primaryEmail)
          ? await user.profile.contactInformation.primaryEmail
          : (await user.google.email)
          ? await user.google.email
          : (await user.facebook.email)
          ? await user.facebook.email
          : (await user.local.email)
          ? await user.local.email
          : (await user.profile.contactInformation.secondaryEmails[0])
          ? await user.profile.contactInformation.secondaryEmails[0]
          : null,

        secondaryEmails: await user.profile.contactInformation.secondaryEmails.filter(
          (item) => item !== user.profile.contactInformation.primaryEmail
        ),

        primaryPhoneNum: (await user.profile.contactInformation.primaryPhoneNum)
          ? await user.profile.contactInformation.primaryPhoneNum
          : (await user.local.phoneNum)
          ? await user.local.phoneNum
          : (await user.profile.contactInformation.secondaryPhoneNums[0])
          ? await user.profile.contactInformation.secondaryPhoneNums[0]
          : null,

        secondaryPhoneNums: await user.profile.contactInformation.secondaryPhoneNums.filter(
          (item) => item !== user.profile.contactInformation.primaryPhoneNum
        ),
      };
      await user.save();
      return await user.profile.contactInformation;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}

module.exports = router;
