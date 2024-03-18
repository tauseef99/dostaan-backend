const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const USER = mongoose.model("USER");
const requireLogin = require("../middlewares/requireLogin");
const POST = mongoose.model("POST");

// routes
router.get("/allposts", requireLogin, (req, res) => {
  POST.find()
    .populate("postedBy", "_id name Photo")
    .populate("comments.postedBy", "_id name")
    .sort("-createdAt")
    .then((posts) => res.json(posts))
    .catch((err) => console.log(err));
});
router.post("/createPost", requireLogin, (req, res) => {
  const { body, pic } = req.body;
  console.log(pic);
  if (!body || !pic) {
    return res.status(422).json({ erro: "please add all the field" });
  }
  req.user;
  const post = new POST({
    body,
    photo: pic,
    postedBy: req.user,
  });
  post
    .save()
    .then((result) => {
      return res.json({ post: result });
    })
    .catch((err) => console.log(err));
});

router.get("/myposts", requireLogin, (req, res) => {
  POST.find({ postedBy: req.user._id })
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .sort("-createdAt")
    .then((myposts) => {
      res.json(myposts);
    });
});
router.put("/like", requireLogin, async (req, res) => {
  try {
    const result = await POST.findByIdAndUpdate(
      req.body.postId,
      {
        $push: { likes: req.user._id },
      },
      {
        new: true,
      }
    )
      .populate("postedBy", "_id name Photo")
      .exec();

    res.json(result);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

router.put("/unlike", requireLogin, async (req, res) => {
  try {
    const result = await POST.findByIdAndUpdate(
      req.body.postId,
      {
        $pull: { likes: req.user._id },
      },
      {
        new: true,
      }
    )
      .populate("postedBy", "_id name Photo")
      .exec();

    res.json(result);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

router.put("/comment", requireLogin, (req, res) => {
  const comment = {
    comment: req.body.text,
    postedBy: req.user._id,
  };

  POST.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { comments: comment },
    },
    {
      new: true,
    }
  )
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.status(422).json({ error: err.message });
    });
});

router.get("/mypost", requireLogin, (req, res) => {
  POST.find
    .populate(
      "postedBy",
      "_id name"
    )({ postedBy: req.user._id })
    .then((myposts) => {
      res.json(myposts);
    });
});
//toUpload profile pic
router.put("/uploadProfilePic", requireLogin, (req, res) => {
  USER.findByIdAndUpdate;
});
// api to delete post
router.delete("/deletePost/:postId", requireLogin, async (req, res) => {
  try {
    const post = await POST.findOne({ _id: req.params.postId })
      .populate("postedBy", "_id")
      .exec();

    if (!post) {
      return res.status(422).json({ error: "Post not found" });
    }

    if (post.postedBy._id.toString() === req.user._id.toString()) {
      await POST.deleteOne({ _id: req.params.postId });
      return res.json({ message: "Successfully deleted" });
    } else {
      return res
        .status(401)
        .json({ error: "Unauthorized: You can only delete your own posts" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
