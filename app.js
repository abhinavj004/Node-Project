const express= require('express');
const mongoose= require('mongoose');
const upload= require('express-fileupload');
const bodyParser= require('body-parser');
const exphbs= require('express-handlebars');
const path= require('path');
const methodOverride= require('method-override');
const session= require('express-session');
const flash= require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


//Loading Routes
const auth= require('./routes/auth');
const uploads= require('./routes/uploads');
const profile= require('./routes/profile');


const app= express();
const port= process.env.PORT || 8000;


mongoose.Promise= global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nodejs-assignment',{ useNewUrlParser: true });


app.use(express.static(path.join(__dirname, 'public')));


//upload-middleware
app.use(upload());                              


//body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


//handlebars view engine
app.engine('handlebars', exphbs({}));
app.set('view engine', 'handlebars');


//method-override
app.use(methodOverride('_method'));


//session-middleware
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'abhinavjaiswal@gmail.com',
  resave: true,
  saveUninitialized: true
}))


//flash-middleware
app.use(flash());
app.use((req,res,next)=> {
    res.locals.user= req.user || null;
    res.locals.success_message=req.flash('success_message');
    res.locals.error_message=req.flash('error_message');
    res.locals.error=req.flash('error');
    res.locals.success=req.flash('success');
    next();
});


//passport.js-middleware
//resposible for req.user and req.isAuthenticated()
app.use(passport.initialize());
app.use(passport.session());


//using imported routes
app.use('/',auth);
app.use('/profile',profile);
app.use('/user',uploads);


app.listen(port,()=> {
    console.log(`Started on port ${port}`);
})
