const express= require('express');
const router= express.Router();
const path= require('path');
const fs= require('fs');
const {User}= require('../models/User');

const uploadDir= path.join(__dirname, '../public/profilePictures/');


router.all('/*',(req,res,next)=> {
    req.app.locals.layout= 'user';
    next();
})

//middleware to check if user is authenticated or not
const isAuthenticated= (req,res,next)=> {
    if(req.isAuthenticated()){  
        next();
    }else{
        req.flash('error',`You are not logged in.`);
        res.redirect('/login');
    }
}

//profile page
router.get('/',isAuthenticated, (req,res)=> {
    console.log('hello');
    console.log(req.user);
    res.render('routes_UI/user/profile',{user:req.user});
})


//route to delete profile
router.delete('/:id',isAuthenticated,(req,res)=> {
    
    User.findById(req.params.id).then((user)=> {
        
        user.remove();
        fs.unlink(uploadDir+ user.picture, (err) => {
          if (err) throw err;
        });  
        req.flash('success_message',`Your account deleted successfully`);
        res.redirect('/login');
    })
})



module.exports= router;