const User = require('../models/user');

module.exports.renderRegister = (req, res)=>{
    res.render('users/register')
}

module.exports.register = async(req, res)=>{
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
    
}

module.exports.renderLogin = (req,res)=>{
    res.render('users/login')
}

// delete cleans up session
module.exports.login = (req,res)=>{
    req.flash('success', 'Welcome back');
    const redirectUrl = req.session.returnTo;
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success', "logging you out!");
      res.redirect('/campgrounds');
    });
  }