const express = require('express');
const path = require("path");
const mongoose = require("mongoose");
//ejs engine
const ejsMate = require("ejs-mate");
const {campgroundSchema, reviewSchema} = require('./schemas.js');
const catchAsync = require("./utils/catchAsync");
const ExpressError = require('./utils/ExpressError');


//method to override post request when put or patch is required. 
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const Review = require("./models/review");
//const campground = require("./models/campground");

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

//ejs stuff
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//overrides the default ejs engine
app.engine('ejs', ejsMate);

//allows data in the req.body to be parsed across pages. 
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) =>{
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    }else{
        next();
    }
}

const validateReview = (req, res, next)=> {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    }else{
        next();
    }
}

//home route
app.get('/', (req, res)=>{
    res.send('home');
})

app.get("/campgrounds", catchAsync(async(req, res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}))

app.get("/campgrounds/new", (req, res)=>{
    res.render('campgrounds/new')
}) 

app.post('/campgrounds', validateCampground, catchAsync(async(req, res, next)=>{
    //handles errors on submission of invalid campground data via postman 
    //if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.get("/campgrounds/:id", catchAsync(async(req, res)=>{
    const campground = await Campground.findById(req.params.id).populate('reviews');
    //console.log(campground)
    res.render('campgrounds/show',{campground})
}))

app.get('/campgrounds/:id/edit', catchAsync(async(req, res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit',{campground})
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async(req, res)=>{
    const {id}= req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async(req, res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}))

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req, res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async(req, res)=>{
    //res.send(req.params)
    const {id, reviewId}= req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

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