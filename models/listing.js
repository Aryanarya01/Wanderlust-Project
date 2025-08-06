const { ref } = require("joi");
const mongoose = require("mongoose");
const Review = require("./review.js");
const Schema = mongoose.Schema;


 const listingSchema = new Schema({
    title:{
        type : String,
        require : true,
    },
    description : {
        type : String,
    },
 image: { 
  url:String,
  filename:String,
},
    price :{
        type : Number,
        require : true,
    },
    location :{
        type : String,
        require : true,
    },
    country :{
        type : String,
        require : true,
    },
    reviews : [
      {
      type : Schema.Types.ObjectId,
      ref : "Review",
    }
  ],
  owner : {
    type :  Schema.Types.ObjectId,
    ref : "User",
  },
  geometry :{
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
 });



 //mongoose middleware
 listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
    await Review.deleteMany({_id: { $in: listing.reviews}});
  }
 });

 const Listing  = mongoose.model("Listing",listingSchema);
 module.exports = Listing;









//   image: {
//    type: String,
//    default:"https://images.unsplash.com/photo-1691498118924-c486ce38f78e?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//    set : (v)=>
//     v===""
//    ?"https://images.unsplash.com/photo-1691498118924-c486ce38f78e?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
//    : v,
// },