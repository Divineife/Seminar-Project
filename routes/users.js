const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

router.get('/register',(req, res)=>{
    res.render('users/register')
})

router.post('/register', catchAsync  (async(req, res)=>{
    try {
        const{email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        //establishes login session when a new user registers.
        req.login(registeredUser, err=>{
            if(err){
                return next(err)
            }req.flash('success', 'Welcome to campground finder');
            res.redirect('/campgrounds')
        })
        
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('register');
    }
    
}));

router.get('/login', (req,res)=>{
    res.render('users/login')
});

//"keepSessionInfo : true" needed. delete cleans up session
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect:'/login', keepSessionInfo:true}), (req,res)=>{
    req.flash('success', 'Welcome back');
    const redirectUrl = req.session.returnTo;
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success', "logging you out!");
      res.redirect('/campgrounds');
    });
  }); 

module.exports = router;