const express= require('express');
const router= express.Router();
const {User}= require('../models/User');
const bcrypt = require('bcryptjs');
const gravatar= require('gravatar');
const moment= require('moment');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


router.all('/*',(req,res,next)=> {
    req.app.locals.layout= 'auth';
    next();
})


//middleware to check if user is authenticated or not
const isNotAuthenticated= (req,res,next)=> {
    if(! req.isAuthenticated()){
        next();
    }else{
        req.flash('error',`You need to logout first.`);
        res.redirect('/profile');
    }
}


//login page
router.get('/login',isNotAuthenticated, (req,res)=> {
    res.render('routes_UI/auth/login');
})


//register page
router.get('/',isNotAuthenticated, (req,res)=> {
    res.render('routes_UI/auth/register');
})


//route to register a user
router.post('/',(req,res)=> {
    
    let errors=[];
    let isEmail=  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email);
    
    if(!req.body.name){
        errors.push({message:'Enter name'});
    }
    if(!req.body.email){
        errors.push({message:'Enter email'});
    }
    if(!isEmail){
        errors.push({message:'Invalid email'});
    }
    if(!req.body.password){
        errors.push({message:'Enter password'});
    }
    if(req.body.password.length<4){
        errors.push({message:'Password length must be greater than 3'});
    }

    
    if(errors.length>0){
        res.render('routes_UI/auth/register', {errors});
    }else{
        
        User.findOne({email: req.body.email}).then((user)=> {
            if(user){
               req.flash('error_message',`A user with this email already exists`);
               res.redirect('/');
            }else{
                bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(req.body.password, salt, function(err, hash) {

                    // const avatar= gravatar.url(req.body.email,{
                    //     s:'200',
                    //     r:'pg',
                    //     d:'mm'
                    // })

                    const picture= req.files.picture;
                    const pictureName= Date.now()+'-'+picture.name;
                    console.log(picture);
                    
                    picture.mv('./public/profilePictures/'+ pictureName, (err)=> {
                        if(err){
                            throw err;
                        }
                    });

                    const user= new User({
                            name:req.body.name,
                            email:req.body.email,
                            introduction:req.body.introduction,
                            picture:pictureName,
                            password:hash,
                            // avatar:avatar,
                            date:moment().format('MMMM Do YYYY, h:mm:ss a')
                        });

                    user.save().then(()=> {
                        req.flash('success_message',`You have registered successfully, please login`);
                        res.redirect('/login');
                    });
                    });
                });
            }
        })   
    }   
})



passport.use(new LocalStrategy({usernameField: 'email'},
  (email, password, done)=> {   
    User.findOne({email:email}).then((user)=> {       
      if (!user) {
        return done(null, false);
      }      
        bcrypt.compare(password, user.password,(err, matched)=> {  
                if(matched){
                    return done(null, user);
                }
                else{
                    return done(null, false);
                }
        });
    })
   }
));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


//route to login a user
router.post('/login',
  passport.authenticate('local'
        , {successRedirect: '/profile',
            failureRedirect: '/login',
            failureFlash: 'Invalid username or password.',
            successFlash: 'Welcome!'}
        ));


//route to logout a signed in user
router.get('/logout',(req, res)=>{
  req.logout();
  res.redirect('/login');
});


module.exports= router;
