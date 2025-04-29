const User = require("../../model/User");
const router = require("express").Router();
const passport = require("passport");
const { List } = require("../../model/List");

require("../../configurations/verifyToken");
const { successMsg, errorMsg } = require("../../model/Logs");

// All List(s)

router.get(
  "/all-lists",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      if (req.user.lists.length === 0) {
        return res
          .status(200)
          .json({ message: await successMsg(951, req.user.language) });
      } else {
        let newArray = [];
        for (let i = 0; i < req.user.lists.length; i++) {
          let list = await List.findById({ _id: req.user.lists[i] });
          newArray.push(list);
        }

        return res.json({
          message: await successMsg(952, req.user.language),
          your_lists: newArray,
        });
      }
    } catch (error) {
      console.log(error);
      return res.json(error);
    }
  }
);

// Adding List
const { listValidations } = require("./listValidations");
const { upload } = require("./uploadListImages");

router.post(
  "/add",
  passport.authenticate("jwt", { session: false }),
  upload,
  listValidations,
  async (req, res) => {
    try {
      let newList = new List({
        serviceProvider: {
          id: req.user._id,
          fullName: req.user.facebook.displayName
            ? req.user.facebook.displayName
            : req.user.google.displayName
            ? req.user.google.displayName
            : req.user.local.firstName + " " + req.user.local.lastName,
        },
        category: req.body.category,
        subCategory: req.body.subCategory,
        details: {
          title: req.body.title,
          description: req.body.description,
          tags: req.body.tags,
        },
        uploads: await req.files.map((file) => file.path),
        contacts: {
          phoneNum: req.body.phoneNum,
          location: {
            coords: {
              lat: req.body.lat,
              lng: req.body.lng,
            },
            address: req.body.address,
          },
        },
        contactVia: req.body.contactVia,
      });
      await newList.save();

      let thisUser = await User.findById(req.user._id);

      thisUser.lists.push(newList._id);

      await thisUser.save();

      return res.send({
        message: await successMsg(954, req.user.language),
        newList,
      });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }
);

// Delete List
router.delete(
  "/delete/id/:listId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let user = await User.findById(req.user._id);

      if (user) {
        let found = user.lists.find((element) => element == req.params.listId);
        if (!found) {
          return res
            .status(404)
            .json({ message: await errorMsg(914, req.user.language) });
        } else {
          await List.deleteOne({ _id: req.params.listId }, async (err, doc) => {
            if (err) {
              console.log(err);
              return res.send(err);
            } else {
              let updatedLists = await user.lists.filter(
                (element) => element != req.params.listId
              );
              user.lists = updatedLists;
              await user.save();
              return res
                .status(202)
                .json({
                  message: await successMsg(953, req.user.language),
                  data: user.lists,
                });
            }
          });
        }
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);

// Update List
router.put(
  "/update/id/:listId",
  passport.authenticate("jwt", { session: false }),
  upload,
  listValidations,
  async (req, res) => {
    let user = await User.findById(req.user._id);

    let listFound = await user.lists.find(
      (element) => element == req.params.listId
    );

    if (!listFound) {
      return res
        .status(404)
        .json({ message: await errorMsg(914, req.user.language) });
    } else {
      let list = await List.findById(req.params.listId);

      // ============ Update List ===========

      list.serviceProvider = {
        id: req.user._id,
        fullName: req.user.facebook.displayName
          ? req.user.facebook.displayName
          : req.user.google.displayName
          ? req.user.google.displayName
          : req.user.local.firstName + " " + req.user.local.lastName,
      };
      (list.category = req.body.category),
        (list.subCategory = req.body.subCategory),
        (list.details = {
          title: req.body.title,
          description: req.body.description,
          tags: req.body.tags,
        });
      list.uploads = req.files
        ? await req.files.map((file) => file.filename)
        : [];
      (list.contacts = {
        phoneNum: req.body.phoneNum,
        location: {
          coords: {
            lat: req.body.lat,
            lng: req.body.lng,
          },
          address: req.body.address,
        },
      }),
        (list.contactVia = req.body.contactVia);

      // =============
      let updatedList = await list.save();

      return res
        .status(200)
        .json({
          message: await successMsg(955, req.user.language),
          updatedList,
        });
    }
  }
);

router.get(
  "/find-one/id/:listId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let list = await List.findById(req.params.listId);
      if (list) {
        return res
          .status(200)
          .json({ message: await successMsg(956, req.user.language), list });
      } else {
        return res
          .status(404)
          .json({ message: await errorMsg(914, req.user.language) });
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);

module.exports = router;
