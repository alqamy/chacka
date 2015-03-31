var mongoose=require('mongoose');
var Post=mongoose.model('Post');
var User=mongoose.model('User');
var Meta=mongoose.model('Meta');
var Term=mongoose.model('Term');

exports.adminAuth=function(req,res,next){
 if(req.session.user&&req.session.user.type=='admin'){
    req.userId=req.session.user.id;
    next();
  }else{
	backto=req.route.path;
	res.render('admin/login',backto)
   return
  } 
}


exports.signout=function(req,res,next){
	req.session.user=null;
	res.render('admin/login');
}

exports.getLogInForm=function(req,res,next){
	if(req.session.user&&req.session.user.type=='admin'){
		  res.render('admin')
	}else{
		backto=req.route.path;
		 res.render('admin/login',backto)
	}
}

exports.getUserPanel=function(req,res,next){
	User.findById(req.userId,function(err,user){
		if(err){
			console.log(err);
			res.redirect('/admin')
		}
		res.render('admin/user',{user:user})
	})
	
}
exports.getUserEditPanel=function(req,res,next){
	res.render('admin/user_edit');
}
exports.getUserNameEditPanel=function(req,res,next){
	User.findById(req.userId,function(err,user){
		if(err){
			console.log(err);
			res.redirect('/admin')
		}
	res.render('admin/user-edit-name',{user:user});
	})
}
exports.setUserName=function(req,res,next){
	name=req.body.name;

	User.findById(req.userId,function(err,user){
		if(err){
			console.log(err);
			res.redirect('/admin')
			return
		}
		if(!name){
			res.redirect('/admin/user/edit/name');
		}
		user.name=name;
		user.save(function(err){
			if(err){
				console.log(err);
				res.redirect('/admin')
				return
			}
			res.redirect('/admin/user/edit/name');
		})
		
	})
}


exports.signin=function(req,res){
	req.session.user=null;
	var _uname=req.body.uname;
	var _email=req.body.email;
	var _password=req.body.password;
	if(!_password||(!_uname)){
		res.render('admin/login',{err:{type:'in',message:'Provide All fields'}});
		return
	}
	User.findOne({username:_uname},function(err,user){
		if(err){
			res.render('admin/login',{err:{type:'db',message:err.message}});
			return
		}else{
			if(user){
				salt=user.salt;
				//_password=crypto.createHmac('sha1', salt).update(req.body.password).digest('hex');
				if(user.password==_password){
					var _user={
						id:user._id,
						type:'admin'
					} 
					req.session.user=_user;
					//console.log(req)
					if(req.query.backto){
						res.redirect(req.query.backto);
					}else{
						res.redirect('/admin');
					}
				}else{
					res.render('admin/login',{err:{type:'auth',message:'Try again the Username or Password is incorrect'}});
					return
				}
			}else{
				res.render('admin/login',{err:{type:'auth',message:'Try again the Username or Password is incorrect'}});
				return
			}
		}
	})
}
