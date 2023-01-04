const express = require('express');
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const campgrounds = require("../controllers/campgrounds")
const ExpressError = require('../utils/ExpressError');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');
//cloudinary setup, storage is required to store data elsewhere other than local
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage: storage});

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn,upload.array("image"), validateCampground,catchAsync(campgrounds.createCampground));

//isLoggedIn is the authentication middle ware that protects the route.
router.get("/new", isLoggedIn, campgrounds.renderNewForm) ;

//router.route helps to group endpoints together
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn,isAuthor, catchAsync(campgrounds.deleteCampground));



router.get('/:id/edit',isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));
module.exports = router;