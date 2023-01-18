const mongoose = require("mongoose");
const { campgroundSchema } = require("../schemas");
const Schema = mongoose.Schema;
const Review = require('./review');

const CampgroundSchema = new Schema({
    // imageUrl: String,
    title: String,
    images:[
        {
            url:String,
            filename:String
        }
    ],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
})

CampgroundSchema.post('findOneAndDelete', async function(doc){
    //delete all reviews in the document accessed post deletion of a campground
    if(doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})
module.exports = mongoose.model('Campground', CampgroundSchema);