const HTTP_PORT = process.env.PORT || 8080;

const express = require("express");
const app = express();
app.use(express.static("public"));  // css files
app.set("view engine", "ejs");      // ejs
app.use(express.urlencoded({ extended: true })); // forms

require("dotenv").config()

const session = require("express-session")
app.use(session({
    secret: "the quick brown fox jumped over the lazy dog",
    resave: false,
    saveUninitialized: false
}));

// ===== DATABASE =====
const mongoose = require('mongoose')

const managerSchema = new mongoose.Schema({
    name: String
})
const Manager = mongoose.model("managers", managerSchema)

const timeslotSchema = new mongoose.Schema({
    time: String,
    customer: String       
})
const Timeslot = mongoose.model("timeslots", timeslotSchema)


// ===== ROUTES =====

// 1. Home Page endpoints
app.get("/", async (req, res) => {    
    // get all the timeslots from the database and display in UI.
    const slots = await Timeslot.find()    
    return res.render("home.ejs", {timeslots:slots})
})
app.post("/book/:id", async (req,res)=>{        
    return res.send(`Success, your reservation number is ${req.params.id}. <a href="/">Home</a>`)
})
app.get("/remind/:id", async (req,res)=>{     
    console.log("sdfdsf")   
    return res.send(`Reminder feature activated! <a href="/">Home</a>`)
})

// 2. Manage Bookings endpoints
app.get("/manage", async (req,res)=>{
    const slots = await Timeslot.find()
    return res.render("manageBookings.ejs", {timeslots:slots})
})
app.get("/cancel/:id", async (req,res)=>{    
    return res.send(`Reservation cancelled. <a href="/manage">Manage Bookings?</a>`)
})


// 3. Login/Logout endpoints
app.get("/login", (req,res)=>{
    return res.render("login.ejs")
})
app.post("/login", async (req,res)=>{    
    return res.redirect("/manage")    
})
app.get("/logout", (req,res) => {        
    return res.redirect("/")
})


// ===== DATABASE POPULATION =====
const populateDatabase = async () => {       
    // Create managers
    const managerCount = await Manager.countDocuments({});
    if (managerCount === 0) {
        await Manager.create({name:"admin"})            
        console.log("DEBUG: Managers created.");
    } else {
        console.log("DEBUG: Managers collection already contains documents, so skipping insert of rows.");
    }

    // Create timeslots
    const timeslotCount = await Timeslot.countDocuments({});
    if (timeslotCount === 0) {
        await Timeslot.insertMany([
            { time: "18:00", customer: "" },
            { time: "18:30", customer: "alice" },
            { time: "19:00", customer: "bob" },
            { time: "19:30", customer: "" },            
        ]);
        console.log("DEBUG: Timeslots created.");
    } else {
        console.log("DEBUG: Timeslots collection already contains documents, so skipping insert of rows.");
    }
}

// ===== START SERVER =====

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        populateDatabase();

        console.log("SUCCESS connecting to MONGO database");
        console.log("STARTING Express web server");

        app.listen(HTTP_PORT, () => {
            console.log(`server listening on: http://localhost:${HTTP_PORT}`);
        });
    } catch (err) {
        console.log("ERROR: connecting to MONGO database");
        console.log(err);
        console.log("Please resolve these errors and try again.");
    }
}

startServer()
