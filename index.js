import express from 'express' ;
import mongoose from 'mongoose' ;
import axios from "axios" ;
import bodyParser from 'body-parser' ;
import dotenv from 'dotenv'

import { User } from './models/User.js' ;

dotenv.config();

const __dirname = import.meta.dirname;

var url =  "https://codeforces.com/api/user.info?handles=" ;

let urlBase = "https://codeforces.com/api/user.info?handles="; // Define the base URL for retrieving data 
let cfUsersData = []; // Define a variable to store the retrieved CF users' data

const app = express() ;
const port = process.env.port ||  3000 ;

// let conn = await mongoose.connect("mongodb://localhost:27017/cfUser") 
try {
     mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/cfUser").then((conn)=>{
        console.log("Connected to database");
     });
    
} catch (e) {
    
        console.error("Error while connecting to database.");
} 

app.use(bodyParser.urlencoded({ extended : true })) ;

app.get("/" , (req,res) => {
    res.sendFile(__dirname + "/public/index.html") ;
})

app.get("/test",(req,res)=>{
    res.send("working!");
})
// this is used to fetch the login page
app.get("/login" , (req,res) => {
    res.sendFile(__dirname + "/public/login.html") ;
})

//this is used to handle post requests to login
app.post("/login", async (req,res) => {
    let formData = req.body ;
    let name = formData["user_name"] ;
    let roll_no = formData["roll_num"] ;
    let handle = formData["cf_handle"] ;

    const userExists = await User.findOne({roll : roll_no}) ;

    if(userExists) {
        console.log("Users already exists") ;
        res.redirect("/exists") ;
        return ;
    } else {

        try {
            const response = await axios.get(`${url}${handle}`) ;
            const result = response.data ;
            console.log(result.status) ;

            if(result.status == "OK") {
                const new_user = new User({user_name: name,roll : roll_no, handle: handle}) ;
                await new_user.save() ;
                // res.send("<h1>User saved successfully</h1>")

                console.log("User successfully saved") ;
                res.redirect("/leaderboard") ;
            } else {
                console.log("Wrong handle entered") ;
                res.redirect("/cfhandle") ;
            }

            //res.send(result) ;
        } catch (error) {
            res.redirect("/error") ;
            // console.log(result.status) ;
            console.error("Failed to make request:", error.message) ;
        }

    }

    // res.send(`<h1>Your handle is ${formData["cf_handle"]}</h1><h1>Your handle is ${formData["roll_num"]}</h1>`)
})

app.get("/exists", (req,res) => {
    res.sendFile(__dirname + "/error_handlers/exists.html") ;
})

app.get("/cfhandle", (req,res) => {
    res.sendFile(__dirname + "/error_handlers/cfHandle.html") ;
})

app.get("/error" , (req,res) => {
    res.sendFile(__dirname + "/error_handlers/error.html")
})

app.get("/roll_err" , (req,res) => {
    res.sendFile(__dirname + "/error_handlers/err_roll.html")
})

app.get("/leaderboard" , (req,res) => {
    res.sendFile(__dirname + "/public/leader.html") ;
})


app.get("/leaderboardData", async (req, res) => {
    var users = await User.find();
    let str = "";
    let userNames=[];
    for (let index = 0; index < users.length; index++) {
        const element = users[index];
        userNames.push(users[index].user_name);
        str += element.handle;
        if (index < users.length - 1) str += ";";
    }
    console.log(str);

    let url = urlBase + str; // Construct the URL for each request

    try {
        const response = await axios.get(url);
        const result = response.data;
       
        console.log(result.status);

        cfUsersData = result.result;
        let i=0;
        cfUsersData.map(user=>{
            user.user_name=userNames[i];
            i++;
        })
        cfUsersData.sort((a, b) => b.rating - a.rating); // sorting users' data in descending order
        console.log(userNames);
        console.log(cfUsersData);

        res.json(cfUsersData) ;
       
        // res.render("index.ejs", { usersData: cfUsersData });
        // sending users' data obtained from API to index.ejs

    } catch (error) {
        console.error("Failed to make request:", error.message);
        // Reset cfUsersData to an empty array in case of error
        cfUsersData = [];
        // Handle the error appropriately, e.g., redirect to a different route
        res.redirect("/error");
    }
})

app.listen(port , () => {
    console.log(`Listening on port ${port}`) ;
})