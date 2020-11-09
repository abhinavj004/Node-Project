const mongoose= require('mongoose');
const Schema = mongoose.Schema;

const UploadSchema= new mongoose.Schema({
    
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true
    },
    file:{
        type: String,
        required: true,
    },
    uploadedBy: {
       type: Schema.Types.ObjectId,
       ref:'users'
   },
   date:{
       type:String,
       required: true
   },
}, {usePushEach: true})
const Upload= mongoose.model('uploads', UploadSchema);

module.exports={Upload};