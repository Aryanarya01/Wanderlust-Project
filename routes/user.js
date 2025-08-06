const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js")


router.route("/signup")
//RENDER signup form
.get(userController.renderSignupForm)
//signup
.post(wrapAsync(userController.signup));


router.route("/login")
//render login form
.get(userController.renderLoginForm)
//agr authentication fail ho jye tho msg flash hoga
//LOGIN
.post(
    saveRedirectUrl,
    passport.authenticate("local",{failureRedirect : `/login`,
    failureFlash : true}),  
    userController.login
)

router.get("/logout", userController.logout)

module.exports = router; 