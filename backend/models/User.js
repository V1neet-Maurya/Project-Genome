import mongoose from 'mongoose'
const schema=new mongoose.Schema({firstName:{type:String,required:true},lastName:String,email:{type:String,required:true,unique:true,lowercase:true},password:{type:String,required:true},profilePic:String,role:{type:String,enum:['user','admin','project_manager'],default:'user'},isVerified:{type:Boolean,default:false}},{timestamps:true})
export default mongoose.model('User',schema)
