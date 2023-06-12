/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// Node.js is not a framework it is a runtime environment for JavaScript just like JRE which is a runtime 
// environment for Java  
// ExpressJS is a Node.js module; express is the name of the module, and also the name we typically give to 
// the variable we use to refer to its main function in code such as what you quoted. NodeJS provides the 
// require function, whose job is to load modules and give you access to their exports. You don't have to 
// call the variable express, you can do var foo = require('express'); and use foo instead, but convention 
// is that you'd use the module's name.
const express = require('express');  

// To set up our actual server we're going to create an app variable which is just by calling the 
// express() function. By calling express() as a function we create an application which allows us to 
// set up our entire server.
const app = express();

// The Embedded JavaScript file layout.ejs in the views folder acts as the default layout for all server 
// side views rendered by this app. Before one of your custom views is sent to the client, it is injected 
// into this file. It is this file that is actually sent to the client.
// EJS, out of the box, does not support layouts (or master pages as .NET’s ASPX view engine calls them). 
// However the following express-layout package can be added that adds layout support. 
// With the following statement your application can use layouts using layout.ejs file located in the views folder.
const layout = require('express-layout');

// We used a middleware express.static function. This express.static function takes the name of the folder 
// where all of our static files are. In our case, all such files (css, fonts, images etc.) are placed in 
// public folder. So we passed the folder name 'public' to express.static function and this is going to serve 
// all the files from our public folder.

const middleware=[    
    layout(),
    express.static('public')
]
app.use(middleware);

// The Session and cookies are used by different websites for storing user's data across different pages 
// of the site. Both session and cookies are important as they keep track of the information provided by 
// a visitor for different purposes. The main difference between both of them is that sessions are saved on 
// the server-side, whereas cookies are saved on the user's browser or client-side.
// A session is used to temporarily store the information on the server to be used across multiple pages 
// of the website. The user is identified with the help of sessionID, which is a unique number saved inside 
// the server. It is saved as a cookie, form field, or URL.  
// A cookie is a key-value pair that is stored in the browser. The browser attaches cookies to every 
// HTTP request that is sent to the server. In a cookie, you can’t store a lot of data. A cookie cannot 
// store any sort of user credentials or secret information. If we did that, a hacker could easily get 
// hold of that information and steal personal data for malicious activities.
// On the other hand, the session data is stored on the server-side, i.e., a database or a session store. 
// Hence, it can accommodate larger amounts of data. To access data from the server-side, a session is 
// authenticated with a secret key or a session id that we get from the cookie on every request.
// Note that Session data is not saved in the cookie itself, just the session ID. Session data is stored 
// server-side.
// In this application we are going to use session and cookies to store information of the logged in user for
// authorization purpose.
// cookie-parser is a middleware which parses cookies attached to the client request object. 
const cookieParser = require("cookie-parser");  

// Express-session is used to create and manage sessions in the app. It is an HTTP server-side framework 
// used to create and manage a session middleware. 
const sessions = require('express-session');    
// creating 24 hours from milliseconds. One hour = 3600000 i.e. 1000 * 60 * 60 
const oneDay = 1000 * 60 * 60 * 24;

app.use(sessions({
    // secret - a random unique string key used to authenticate a session. It is stored in an environment 
    // variable and can’t be exposed to the public. The key is usually long and randomly generated in a 
    // production environment.
    secret: "eriomnvbhfsdweer095lkfhrgfgrfrty84fwir767",
    // saveUninitialized - this allows any uninitialized session to be sent to the store. When a session is 
    // created but not modified, it is referred to as uninitialized.
    saveUninitialized:true,
    // cookie: { maxAge: oneDay } - this sets the cookie expiry time. The browser will delete the cookie 
    // after the set duration elapses. The cookie will not be attached to any of the requests in the future. 
    // In this case, we’ve set the maxAge to a single day as computed arithmetically one line 66.
    cookie: { maxAge: oneDay },
    // resave - takes a Boolean value. It enables the session to be stored back to the session store, 
    // even if the session was never modified during the request. This can result in a race situation 
    // in case a client makes two parallel requests to the server. Thus modification made on the session 
    // of the first request may be overwritten when the second request ends. The default value is true. 
    //However, this may change at some point. Using false is a better alternative.
    resave: false
}));

// Cookie parser middleware is used to parse cookie header to store data on the browser whenever a session 
// is established on the server-side.
app.use(cookieParser());

// parsing the incoming data
// Without using the urlencoded middleware you'll get an error that says cannot read property 
// "id" of undefined while posting form values using "req.body.id." This is because we cannot access
// the body at all and that's because by default express does not allow us to access the body. For this,
// we need to use the urlencoded middleware which allows us to access information coming from forms.
// Inside of here we also need to pass an object that has extended set to true.
app.use(express.urlencoded({ extended: true })); 

// view engine (ejs) is used to render files from the views folder.
// We are telling our server to use EJS template engine 
app.set('view engine','ejs');  

// We invoke the home page (indexed.html) of the application in the code below using this app.js file. 
// We can call as many file as we need 
// from it, but that will make app.js a huge file. In order to keep the app.js file small, the express team 
// implemented the idea of a router, which is essentially a way for you to create another instance of your 
// application that is its own little mini application that has all of its own logic applied to it and you 
// can just insert it into this main application as follows.
// The routes.js file resides in the root directory of the application so we used ./ that represents root directory.
const routes = require('./routes');  

// Routes handle user navigation to various URLs throughout your application. 
// In order to link up the routes here (that are created in routes.js file), we need to call "app.use"
// We use it for linking a route to a particular path. Here we pass to this the actual path that we start our 
// things with. So we started all of these with a forward slash to mount all routes that are specified 
// in "routes.js" file. 
app.use('/',routes);

// The home page of the application (index.html) is invoked using the render method.
app.get('/', (req,res) => {         
    res.render('index')             
})                                  

// To make our server actually run we use app.listen. We pass in it a port number. 
// This app starts a server and listens on port 3001 for connections. 
app.listen(3000,function(){
    console.log("Server started on Port 3000");
})
