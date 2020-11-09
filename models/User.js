const mongoose= require('mongoose');

const UserSchema= new mongoose.Schema({
    
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique:true
    },
    password:{
        type: String,
        required: true
    },
    introduction:{
        type: String,
        required: true
    },
    picture:{
        type: String,
        required: true,
    },
    date:{
        type:String,
        required: true
    },
})
const User= mongoose.model('users', UserSchema);

module.exports={User};

