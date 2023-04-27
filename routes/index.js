var express = require('express');
var router = express.Router();
const upload = require("../helpers/multer").single("avatar");
const fs = require("fs");
const User = require("../models/userModel");
const passport = require("passport");
const LocalStrategy = require("passport-local");
passport.use(new LocalStrategy(User.authenticate()));

const nodemailer = require("nodemailer");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: "Home page", isLoggedIn: req.user ? true: false, user: req.user, });
});


router.get('/show',isLoggedIn, function(req, res, next) {
  res.render('show',  { title: "Show", isLoggedIn: req.user ? true: false, user: req.user, });
});

router.get('/signup', function(req, res, next) {
  res.render('signup',  { title: "Home page", isLoggedIn: req.user ? true: false, user: req.user, });
});

router.post('/signup', function(req, res, next) {
  const {username,email,contact,password} = req.body;
  User.register({username,email,contact}, password)
  .then((user)=>{
    res.redirect("signin")
    // res.send(user);
  }) 
  .catch((err) => res.send(err));
  // res.json(req.body);
  // res.redirect("signin")
});

router.get("/profile", isLoggedIn, function (req, res, next){
  console.log(req.user);
  res.render("profile",  { title: "profile", isLoggedIn: req.user ? true: false, user: req.user, });
});

router.get('/signin', function(req, res, next) {
  res.render('signin',  { title: "signin", isLoggedIn: req.user ? true: false, user: req.user, });

  
});

router.post("/signin", passport.authenticate("local", { successRedirect: "/profile", failureRedirect: "/signin",}),
function(req, res, next){} ); 

router.get("/signout",isLoggedIn, function(req, res, next){
  req.logout(()=>{
    res.redirect("/signin");
  })
});

router.get('/resetpassword',isLoggedIn, function(req, res, next) {
  res.render('reset',  { title: "reset", isLoggedIn: req.user ? true: false, user: req.user, });

  
});


router.post("/resetpassword", isLoggedIn, async function(req, res, next){
  try{
    await req.user.changePassword(
      req.body.oldpassword,req.body.newpassword 
    );
    await req.user.save();
    res.redirect("/profile");
  }catch(error){
    res.send(err);
  }
});

router.get('/forgetpassword', function(req, res, next) {
  res.render('forget',  { title: "forget", isLoggedIn: req.user ? true: false, user: req.user, });

  
});


// post send-mail page
router.post("/send-mail", async function (req,res,next){
  const user = await User.findOne({email: req.body.email});
  if (!user) return res.send("user not found");

  const code = Math.floor(Math.random() * 9000 + 1000);

 const transport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
        user: "patidardharmendra1994@gmail.com",
        pass: "bzfsikasilfvkmic",
    },
});

const mailOptions = {
    from: "Dharmendra temp Pvt. Ltd.<dharmendratemp@gmail.com>",
    to: req.body.email,
    subject: "Password Reset Code",
    text: "Do not share this code to anyone.",
    html: `<p>Do not share this code to anyone.</p><h1>${code}</h1>`,
};

transport.sendMail(mailOptions,async (err, info) => {
    if (err) return res.send(err);
    console.log(info);

    await User.findByIdAndUpdate(user._id, { code });
    
    res.redirect("/code/" + user._id);
});
});


/* GET code/id page. */
router.get("/code/:id",async function(req, res, next) {
  res.render("getcode", {title: "code", id: req.params.id , isLoggedIn: req.user ? true: false, user: req.user,});
});

// post  code page
router.post("/code/:id", async function(req,res,next){
  try{
    const user = await User.findById(req.params.id);
  if (user.code == req.body.code)return res.send("wrong code");
  res.redirect(`/forgetpassword/${user._id}`);
  
  
   
  }catch(error){
    res.send(err);
  } 
   }); 

/* GET getpassword page. */
router.get("/forgetpassword/:id",async function(req, res, next) {
  res.render("getpassword", {title: "getpassword", id: req.params.id , isLoggedIn: req.user ? true: false, user: req.user,});
});







  //  post newpassword page
  router.post("/forgetpassword/:id",async function(req,res,next){
    const usr = await User.findById(req.params.id);
    usr.setPassword(req.body.newpassword, function(){
      usr.save();
  });
    res.redirect("/signin" )
 
  
});



// post update page
router.post("/update/:id", isLoggedIn, async function (req, res, next) {
  try {
      const { username, email, contact, linkedin, github, behance } =req.body;
      const updatedUserInfo = { username, email,contact,links: { linkedin, github, behance },
      };
    await User.findOneAndUpdate(req.params.id, updatedUserInfo);
      res.redirect("/profile");
  } catch (error) {
      res.send(err);
  }
});


// post upload page
router.post("/upload",isLoggedIn,async function (req, res, next) {
  upload(req, res, function (err){
    if(err){
      console.log("ERROR>>>>>>", err.massage)
      res.send(err.massage)}
   if (req.file) {
    if (req.user.avatar !== "default.png"){
              fs.unlinkSync("./public/images/" + req.user.avatar);
    }
              req.user.avatar = req.file.filename;
              req.user.save()
              .then(()=>{
              res.redirect("/profile");
          })
      .catch ((err)=> {
          res.send(err);
      });
  }
});
});

router.get('/create',isLoggedIn, function(req, res, next) {
  res.render('Resume/education',  { title: "create", isLoggedIn: req.user ? true: false, user: req.user, }); 
});

router.get("/education", isLoggedIn, function (req, res, next) {
  res.render("Resume/Education", {
      title: "Education",
      isLoggedIn: req.user ? true : false,
      user: req.user,
  });
});

router.post("/add-edu", isLoggedIn, async function (req, res, next) {
  req.user.education.push(req.body);
  await req.user.save();
  res.redirect("/education");
});


router.get("/delete-edu/:index", isLoggedIn,async function (req, res, next){
  const eduCopy = [...req.user.education];
  eduCopy.splice(req.params.index, 1);
  req.user.education = [...eduCopy];
  await req.user.save();
  res.redirect("/education");
})

router.get("/skill", isLoggedIn, function (req, res, next) {
  res.render("Resume/skill", {
      title: "Skill",
      isLoggedIn: req.user ? true : false,
      user: req.user,
  });
});

router.post("/add-skill", isLoggedIn, async function (req, res, next) {
  req.user.skill.push(req.body);
  await req.user.save();
  res.redirect("/skill");
});


router.get("/delete-skill/:index", isLoggedIn,async function (req, res, next){
  const sklCopy = [...req.user.skill];
  sklCopy.splice(req.params.index, 1);
  req.user.skill = [...sklCopy];
  await req.user.save();
  res.redirect("/skill");
})



router.get("/project", isLoggedIn, function (req, res, next) {
  res.render("Resume/project", {
      title: "project",
      isLoggedIn: req.user ? true : false,
      user: req.user,
  });
});

router.post("/add-project", isLoggedIn, async function (req, res, next) {
  req.user.project.push(req.body);
  await req.user.save();
  res.redirect("/project");
});

router.get("/delete-pro/:index", isLoggedIn,async function (req, res, next){
  const proCopy = [...req.user.project];
  proCopy.splice(req.params.index, 1);
  req.user.project = [...proCopy];
  await req.user.save();
  res.redirect("/project");
})

router.get("/experience", isLoggedIn, function (req, res, next) {
  res.render("Resume/experience", {
      title: "experience",
      isLoggedIn: req.user ? true : false,
      user: req.user,
  });
});

router.post("/add-experience", isLoggedIn, async function (req, res, next) {
  req.user.experience.push(req.body);
  await req.user.save();
  res.redirect("/experience");
});

router.get("/delete-exp/:index", isLoggedIn,async function (req, res, next){
  const expCopy = [...req.user.experience];
  expCopy.splice(req.params.index, 1);
  req.user.experience = [...expCopy];
  await req.user.save();
  res.redirect("/experience");
})

router.get("/interest", isLoggedIn, function (req, res, next) {
  res.render("Resume/interest", {
      title: "interest",
      isLoggedIn: req.user ? true : false,
      user: req.user,
  });
});

router.post("/add-interest", isLoggedIn, async function (req, res, next) {
  req.user.interest.push(req.body);
  await req.user.save();
  res.redirect("/interest");
});

router.get("/delete-int/:index", isLoggedIn,async function (req, res, next){
  const intCopy = [...req.user.interest ];
  intCopy.splice(req.params.index, 1);
  req.user.interest = [...intCopy];
  await req.user.save();
  res.redirect("/interest");
})






function isLoggedIn(req, res, next){
  if (req.isAuthenticated()){
    next();
  } else {
    res.redirect("/signin");
  }
}
 
module.exports = router;
