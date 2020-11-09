const express= require('express');
const router= express.Router();
const {Upload}= require('../models/Upload');
const fs= require('fs');
const path= require('path');
const flash= require('connect-flash');
const moment= require('moment');

const uploadDir= path.join(__dirname, '../public/uploads/');
      

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


//page for uploading documents
router.get('/upload',isAuthenticated,(req,res)=> {
    res.render('routes_UI/user/upload', {user:req.user});
    
})


//page to show logged in user's uploads
router.get('/my_uploads',isAuthenticated,(req,res)=> {

    Upload.find({uploadedBy:req.user.id}).then((documents)=> {
        res.render('routes_UI/user/my_uploads' ,{documents, user:req.user});
    },(e)=> {
        res.send(e);
    })
})


//route to upload a document
router.post('/upload',isAuthenticated,(req,res)=> {

    const file= req.files.file;
    const filename= Date.now()+'-'+file.name;
    console.log(file);
    
    file.mv('./public/uploads/'+ filename, (err)=> {
        if(err){
            throw err;}
    });
    
    const document= new Upload({
        title:req.body.title,
        file:filename,
        description:req.body.description,
        uploadedBy:req.user.id,
        date:moment().format('MMMM Do YYYY, h:mm:ss a')
    })
      
    document.save().then(()=> {
        req.flash('success_message',`Document ${document.title} uploaded successfully`);
        res.redirect('/user/my_uploads');
    },(e)=> {
        res.send(e);
    })
})


//route to delete a document
router.delete('/my_uploads/:id',isAuthenticated,(req,res)=> {
    
    Upload.findById(req.params.id).then((document)=> {
        
        document.remove();
        fs.unlink(uploadDir+ document.file, (err) => {
          if (err) throw err;
        });  
        req.flash('success_message',`Document ${document.title} deleted successfully`);
        res.redirect('/user/my_uploads');
    })
})


module.exports= router;