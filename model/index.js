
var mongoose = require('mongoose')
  , Schema = mongoose.Schema 
  , Model = mongoose.model
  , crypto = require('crypto')
  ;

var UserSchema = new Schema({
  username: String,
  name : String ,
  email: { type: String, required: true, index: { unique: true, sparse: true }},
  password:{type:String, default : ''},
  token : String,
  created:Date,
  updated : Date,
  status : String ,
  type  : String,
  meta : [{key : String , value : String}]
})


var PostSchema = new Schema({
  title : String ,
  name : String ,
  excerpt : String ,
  content : String ,
  type : String ,
  mme:String,
  parent : {type : Schema.ObjectId, ref : 'Post'},
  password:{type:String, default : ''},
  //url:String,
  commentStatus : String ,
  status : String ,
  auther :  {type : Schema.ObjectId, ref : 'User'} ,
  meta : [{key : String , value : String}],
  commnets : [
          {
            body:String,
            created:Date,
            updated:String,
            meta:[
            {key:String,vlaue:String}
            ]
          }
          ],
  terms:[ {type : Schema.ObjectId, ref : 'Term'} ],
  hits:Number,
  created:Date,
  updated : Date 
})

var TermSchema=new Schema({
  name:String,
  description:String,
  type:String ,
  status:String,
  parent:  {type : Schema.ObjectId, ref : 'Term'} 
});

var MetaSchema=new Schema({
  key:String,
  value:String
})


mongoose.model('Term',TermSchema);
mongoose.model('Meta',MetaSchema);
mongoose.model('User',UserSchema);
mongoose.model('Post',PostSchema);