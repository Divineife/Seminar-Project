//allows me to access env var via process.env.varName in dev mode
if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");

//ejs engine
const ejsMate = require("ejs-mate");
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const userRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campground');
const reviewsRoutes = require('./routes/review');



//method to override post request when put or patch is required. 
const methodOverride = require("method-override");

//mongoose connection
mongoose.connect('mongodb://localhost:27017/campground', { useNewUrlParser: true})
    // .then(()=>{ 
    //     console.log("Mongo Connection Open");
    // })
    // .catch(err => {
    //     console.log("OH No mongo connection error!!!")
    //     console.log(err)
    // });

    //alernative error checking
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", ()=> {
        console.log("Database connected");
    });

const app = express();

function wrapAsync(fn) {
    return function(req, res, next) {
     fn(req, res, next).catch(e => next(e))
   }

}

//app configurations
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//overrides the default ejs engine
app.engine('ejs', ejsMate);

//sessions plugin
const sessionConfig = {
    secret: 'thisshouldbemoresecret',
    resave: false, 
    saveUninitialized:true,
    cookie: {
        httpOnly:true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge : 1000*60*60*24*7
    }
}

//middlewares to render success and error messages
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//res.locals make variables global to any route;
app.use((req, res, next)=>{
    // console.log(req.session)
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
})

//allows data in the req.body to be parsed across pages. 
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));

app.use('/', userRoutes);
app.use('/campgrounds/', campgroundsRoutes);
app.use('/campgrounds/:id/reviews/', reviewsRoutes);

//home route cmd+d
app.get('/', (req, res)=>{
    res.send('home');
})

app.all("*", (req, res, next)=>{
    //passes error to next that is handled by the generic error handler
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next)=> {
    //destructuring err and setting default vals
    const{statusCode =500} = err;
    if(!err.message ) err.message = "something went wrong"
    res.status(statusCode).render('error', {err});
})
//stack trace
// app.use((req, res)=>{
//     res.status(404).send('NOT FOUND')
// })

app.listen(3000, ()=>{
    console.log("app listening on 3000")
})