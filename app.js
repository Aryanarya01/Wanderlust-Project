if(process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
 
 
 

const express = require("express");
const app =express();
const mongoose = require("mongoose");

 
const dbUrl = process.env.ATLASDB_URL;

const path =require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
 const session = require("express-session");
 const MongoStore = require('connect-mongo');
const ExpressError = require("./utils/ExpressError.js");
const flash = require("connect-flash");
 const passport = require("passport");
 const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
 


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));


main()
.then(()=>{
    console.log("Connected to DB");
})
.catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret : process.env.SECRET,
    },
    touchAfter: 24 * 3600, // time period in seconds
});

store.on("error",  (e)=>{
    console.log("Session Store Error",e);
});

const sessionOptions = {
    store: store,
    secret :  process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie :{
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    },
};

// app.get("/",(req,res)=>{
//     res.send("Hi i am Root");
// });

 

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize()); // passport ko start karta hai
app.use(passport.session());   // login user ko yaad karne ke liye
passport.use(new LocalStrategy(User.authenticate()));//user login krta hai

passport.serializeUser(User.serializeUser());  //user ki information id ke form mai DB mai store krata hai
passport.deserializeUser(User.deserializeUser());  //User ki information jo id ke form mai hai usse pura object lao har page pe

// middleware locals
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

        //  app.get("/demouser",async (req,res)=>{
        //     let fakeUser = new User({
        //         email : "Student@gmail.com",
        //         username : "delta-student"
        //     });
        //     let registerUser = await User.register(fakeUser,"helloworld");
        //     res.send(registerUser);
        //  })


 //EXPRESS ROUTER
app.use("/listings",listingRouter);//JAHA PAR BHI /listings aayaga waha par hum listings ko use karenge;
 app.use("/listings/:id/reviews",reviewRouter);
 app.use("/",userRouter)

//  CATCH ERROR FOR NON EXISTING ROUTE
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// Custom ExpressError
app.use((err,req,res,next)=>{
    let {statusCode =500 ,message= "Something went wrong"} = err;
    res.status(statusCode).render("error.ejs",{message});
     //res.status(statusCode).send(message);
});

app.listen(8080,()=>{
    console.log("server is listining on port 8080");
});