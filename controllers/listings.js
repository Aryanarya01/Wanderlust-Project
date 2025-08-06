//MVC INPLEMENTED

const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

//INDEX
module.exports.index = async(req,res)=>{
   const allListings =await Listing.find({}) ;
   res.render("listings/index.ejs",{allListings});
}

//NEW
module.exports.renderNewForm = (req,res)=>{
     res.render("listings/new.ejs");
}

//SHOW
module.exports.showListing = async(req,res)=>{
    let {id} =req.params;
    const listing =  await Listing.findById(id).populate({path :"reviews",populate: {path : "author"},}).populate("owner");//jo humere reviews jo har aak listing ke sath hai une populate karna hai;
    //          Failure Partials
    if(!listing){
         req.flash("error","Listing you requested for does not exist!");
         res.redirect("/listings");
    }
    console.log(listing)
    res.render("listings/show.ejs",{listing});
}

//CREATE
module.exports.createListing = async(req,res,next)=>{ 
let response = await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1,
})
  .send();
 
 


    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    console.log(req.user);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    newListing.geometry = response.body.features[0].geometry;
   let savedListing = await newListing.save();
   console.log("Saved Listing",savedListing);

    //             Success Partials
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
}

// EDIT
module.exports.renderEditForm = async(req,res)=>{
let {id} =req.params;
  const listing = await  Listing.findById(id);
   //          Failure Partials
    if(!listing){
         req.flash("error","Listing you requested for does not exist!");
         res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
   originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
 res.render("listings/edit.ejs",{listing, originalImageUrl});
}

//UPDATE
module.exports.updateListing = async(req,res)=>{
    let {id}= req.params;
   let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});

   if(typeof req.file !=="undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url,filename};
    await listing.save();
}
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
}

//DELETE
module.exports.destroyListing = async(req,res)=>{
    let {id} =req.params;
   let deleteListing =  await Listing.findByIdAndDelete(id);
   console.log("Deleted Listing",deleteListing);
   req.flash("success"," Listing Deleted!");
    res.redirect("/listings");
}