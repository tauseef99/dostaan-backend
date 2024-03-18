const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const POST = mongoose.model("POST");
const USER = mongoose.model("USER");

// to get user profile API
router.get("/user/:id", async (req, res) => {
  try {
    const user = await USER.findOne({ _id: req.params.id }).select("-password");
    const post = await POST.find({ postedBy: req.params.id }).populate(
      "postedBy",
      "_id"
    );

    res.status(200).json({ user, post });
  } catch (error) {
    return res.status(404).json({ error: "user not found" });
  }
});
// to follow user API
router.put("/follow", requireLogin, async (req, res) => {
  try {
    const updatedFollowedUser = await USER.findByIdAndUpdate(
      req.body.followId,
      {
        $push: { followers: req.user._id },
      },
      {
        new: true,
      }
    ).select("-password");

    const updatedCurrentUser = await USER.findByIdAndUpdate(
      req.user._id,
      {
        $push: { following: req.body.followId },
      },
      {
        new: true,
      }
    ).select("-password");

    res.json(updatedCurrentUser);
  } catch (error) {
    res.status(422).json({ error: error.message });
  }
});

// to Unfollow user API
router.put("/unfollow", requireLogin, async (req, res) => {
  try {
    const updatedUnfollowedUser = await USER.findByIdAndUpdate(
      req.body.followId,
      {
        $pull: { followers: req.user._id },
      },
      {
        new: true,
      }
    );

    const updatedCurrentUser = await USER.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { following: req.body.followId },
      },
      {
        new: true,
      }
    ).select("-password");

    res.json(updatedCurrentUser);
  } catch (error) {
    res.status(422).json({ error: error.message });
  }
});
//  upload profile pic api
router.put("/uploadProfilePic", requireLogin, (req, res) => {
  console.log("Received profile picture:", req.body.pic);
  USER.findByIdAndUpdate(
    req.user._id,
    {
      $set: { Photo: req.body.pic },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      res.json(result);
    }
  });
});

module.exports = router;
