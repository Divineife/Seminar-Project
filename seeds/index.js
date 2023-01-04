const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const axios = require("axios");
require('dotenv').config();

const {API_ID, API_COLLECTION} = process.env.API_ID

//mongoose connection
mongoose.connect('mongodb://localhost:27017/campground', { useNewUrlParser: true})
    // error checking
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", ()=> {
        console.log("Database connected");
    });

const sample = (array)=> array[Math.floor(Math.random()*array.length)];

// api call to unsplash to get random img
async function seedImg() {
    try {
      const resp = await axios.get('https://api.unsplash.com/photos/random', {
        params: {
          client_id: API_ID,
          collections: API_COLLECTION
        },
      })
      return resp.data.urls.small
    } catch (err) {
      console.error(err)
    }
  }

const seedDB = async ()=>{
    await Campground.deleteMany({});
    for(let i=0; i< 50; i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground ({
            author: "6358ac167b258feffc6d4e66",
            // imageUrl: await seedImg(),
            title : `${sample(descriptors)}, ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Molestie ac feugiat sed lectus vestibulum mattis ullamcorper velit. Malesuada bibendum arcu vitae elementum curabitur vitae nunc sed velit. Viverra aliquet eget sit amet. Integer enim neque volutpat ac tincidunt vitae semper quis. Ornare arcu odio ut sem. Quis imperdiet massa tincidunt nunc. Cum sociis natoque penatibus et. Nulla facilisi nullam vehicula ipsum a. Risus ultricies tristique nulla aliquet enim tortor at. Massa tincidunt dui ut ornare lectus sit amet est placerat. Elit sed vulputate mi sit amet mauris.",
            price:price,
            images : [
              {
                url: 'https://res.cloudinary.com/fdi/image/upload/v1671248080/Campground/gm5e0sv5kt03shrhrnh9.jpg',
                filename: 'Campground/gm5e0sv5kt03shrhrnh9'
              },
              {
                url: 'https://res.cloudinary.com/fdi/image/upload/v1671248080/Campground/knugoh0lzff4cakldxg9.jpg',
                filename: 'Campground/knugoh0lzff4cakldxg9'
              }
            ]
        })
        await camp.save();
        //console.log(camp);

    }
    
}
seedDB().then(()=> {
    mongoose.connection.close();
})