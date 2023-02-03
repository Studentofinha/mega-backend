const express = require("express");
const { User } = require("../models/user");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get(`/`, async (req, res) => {
  try {
    const userList = await User.find().select(
      "name phone email country isAdmin percentage"
    );
  
    if (!userList) {
      res.status(500).json({ success: false });
    }
    res.send(userList);
  } catch (error) {
     res.send().json({error})
  }
  
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
  if (!user) {
    res
      .status(500)
      .json({ message: "The user is not found with the given ID" });
  }
  res.status(200).send(user);
  } catch (error) {
    res.send(error)
  }
  
});

router.post("/", async (req, res) => {
  try {
    let user = new User({
      name: req.body.name,
      yuridikName: req.body.yuridikName,
      fizName: req.body.fizName,
      inn: req.body.inn,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.passwordHash, 12),
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
    });
  
    user = await user.save();
  
    if (!user) return res.status(404).send("the user cannot be created");
  
    res.send(user);
  } catch (error) {
    console.error(error)
  }
  
});

router.put("/:id", async (req, res) => {
  try {
    const userExist = await User.findById(req.params.id);
    let newPassword;
    if (req.body.password) {
      newPassword = bcrypt.hashSync(req.body.password, 10);
    } else {
      newPassword = userExist.passwordHash;
    }
  
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        yuridikName: req.body.yuridikName,
        fizName: req.body.fizName,
        inn: req.body.inn,
        email: req.body.email,
        passwordHash: newPassword,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        percentage: req.body.percentage,
      },
      {
        new: true,
      }
    );
    if (!user) return res.status(404).send("the user cannot be created");
  
    res.send(user);
  } catch (error) {
    console.error(error)
  }
 
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.body.phone });
  const secret = process.env.secret;
  if (!user) {
    return res.status(400).send("The user not found");
  }
  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      {
        expiresIn: "1d",
      }
    );
    res.status(200).send({ id: user.id, token: token });
  } else {
    res.status(400).send("password is wrong");
  }
  } catch (error) {
    console.error(error)
  }
  
});

router.post("/register", async (req, res) => {
  try {
    let user = new User({
      name: req.body.name,
      yuridikName: req.body.yuridikName,
      fizName: req.body.fizName,
      inn: req.body.inn,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      percentage: req.body.percentage,
    });
    user = await user.save();
  
    if (!user) return res.status(400).send("the user cannot be created!");
  
    res.send(user);
  } catch (error) {
    console.error(error)
  }
  
});

router.delete("/:id", (req, res) => {
  try {
    User.findByIdAndRemove({ _id: req.params.id })
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "The user is deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "user not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, err: err });
    });
  } catch (error) {
    console.error(error)
  }
  
});

router.get(`/get/count`, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    if (!userCount) {
      res.status(500).json({ success: false });
    }
    res.send({
      userCount: userCount,
    });
  } catch (error) {
    res.send(error)
  }

});

module.exports = router;
