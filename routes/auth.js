const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const USER = mongoose.model("USER");
const bcrypt =  require("bcrypt");
const jwt = require("jsonwebtoken")
const {jwt_secret} = require("../keys");
const requireLogin = require("../middlewares/requireLogin");


router.get('/', (req, res) => {
    res.send("helloooo");
});



router.post("/signUp", (req, res) => {
    const { name, userName, email, password } = req.body;
    if (!name || !userName || !email || !password) {
        return res.status(422).json({ error: "please fill all the fields" });
    }

    USER.findOne({ $or: [{ email: email }, { userName: userName }] }).then((savedUser) => {
        if (savedUser) {
            return res.status(422).json({ error: "already exists with this email or username" });
        }

        // password bcrypt code
        bcrypt.hash(password, 12).then((hashedPassword) => {
            const user = new USER({
                name,
                userName,
                email,
                password: hashedPassword
            });
            user.save()
                .then(user => {
                    res.json({ message: "saved successfully" });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: "An error occurred while saving the user." });
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "An error occurred while hashing the password." });
        });
    });
});

router.post("/signIn",(req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(422).json({error:"please add email and password"})
    }
    USER.findOne({email:email}).then((savedUser)=>{
        if(!savedUser){
            return res.status(422).json({error:"invalid email"})
        }
       bcrypt.compare(password,savedUser.password).then((match)=>{
        if(match){
            // return res.status(200).json({message:"sign in successfully"})
            const token = jwt.sign({_id:savedUser.id},jwt_secret)
            const {_id,name,email,userName} = savedUser
            
            res.json({token,user:{_id,name,email,userName}})
            console.log({token,user:{_id,name,email,userName}})
        }else{
            return res.status(422).json({error:"invalid password"})
        }
       })
       .catch(err=>console.log(err))
    })

})

module.exports = router;
