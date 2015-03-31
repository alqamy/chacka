var mongoose=require('mongoose');
var Post=mongoose.model('Post');
var User=mongoose.model('User');
var Meta=mongoose.model('Meta');
var Term=mongoose.model('Term');

var fs = require('fs.extra');
var path = require('path');
_theme='themes/one';
exports.index=function(req,res){
	Post.find(function(err,posts){
		if(err){
			res.send(err)
		}else{
			res.render(theme('index'),{posts:posts});
		}
	})
	
}
exports.getPost=function(req,res,next){
	Post.findOne({name:req.params.name},function(err,post){
		if(err){
			console.log(err);
			return ;
		}
		if(!post){
			next()
			return;
		}
		Post.update({name:req.params.name},{$inc:{hits:1}},function(er){
			if(err){
				console.log(er)
			}
		})
		res.render(path.join(process.cwd(),'themes','two','post'),{post:post})
	})
}


exports.getAllPost=function(re,res){
	Post.find(function(err,posts){
		if(err){
			res.send(err)
		}
		if(!posts){
			res.send('No posts')
			return
		}
			posts.map(function(post){
				var out={};
				out.name=post.name;
				out.id=post._id;
				return out;
			})
		
			res.render('admin/posts',{posts:posts});
			//res.send(posts)

	})
}

exports.getPostById=function(){
	
}

exports.renderAdd=function(req,res){
	Term.find({},function(err,terms){
		if(err){
			res.send(err)
			console.log('err'+err)
			return
		}
		if(!terms){
			res.send('error')
			return
		}
		console.log(terms+'terms');
		//res.send(terms)
		res.render('admin/add',{terms:terms});	
	})

 }

function slug(title){
	return title.toLowerCase().replace(/\s/g, ' ').replace(/\s/g, '-')
}


exports.createPost=function(req,res){
	var _r=req.body;
	var r=req.body;
	var title=r.title;
	var content=r.content;
	var category=r.category;
	if(!title){
 		res.render(path.join('admin','add'),{err:{type:'title'}});
 		return
	}
	console.log(category)
	if(category=='add_new_cat'){
		if(r.add_new_cat){
			category=r.add_new_cat		
			var  term=new Term({
				name:category,
				description:'',
				type:'category',
				status:'public'
			});
			term.save()
		}else{
			category='uncategory';
		}
	}

	var post=new Post({
		title:_r.title,
		name:slug(_r.title),
		type:'post',
		mme:'text',
		commentStatus:true,
		content:_r.content,
		category:category,
		created:Date.now(),
		updated:Date.now(),
		hits:0
	});
	post.save(function(err){
		if(err){
			console.log(err);
		}else{
			//res.send({id:post._id});
			res.redirect('/admin/edit/'+post._id);
			return

		}
	});
	
}
exports.renderEdit=function(req,res){
	var _r=req.body;
	var _id=req.params.id;
	console.log(_id);
	Post.findById(_id,function(err,post){
		if(!_id){
			res.redirect('/admin')
		}
		if(!post){
			res.redirect('/admin')
		}
		Term.find({},function(err,terms){
			if(err){
				res.send(err)
				console.log('err'+err)
				return
			}
			if(!terms){
				res.send('error')
				return
			}
			console.log(terms+'terms');
		//res.send(terms)	
		res.render('admin/edit',{post:post});	
		})
	})
}


exports.editPost=function(req,res){
	var _r=req.body;
	var _id=req.params.id;
	if(!_id){
		res.redirect('/admin')
	}
	Post.findById(_id,function(err,post){
			if(!_id){
				res.redirect('/admin')
			}
			if(!post){
				res.redirect('/admin')
			}

			post.title=req.body.title;
			post.name=slug(_r.title);
			post.type=_r.title;
			post.mme=_r.mme;
			post.commentStatus=_r.commentStatus;
			post.content=_r.content;
			post.updated=Date.now()

			post.save(function(err){
				if(err){
					console.log(err)
				}
				res.render('admin/edit',{post:post});	
			})			
		})

}

exports.deletePost=function(req,res,next){
	var _id=req.params.id;
	console.log(_id+'dfsfsdfsdfsd')
	if(!_id){
		res.redirect('/admin')
	}
	Post.findByIdAndRemove(_id,function(err){
			res.redirect('/admin/posts');
			return;
	})
}
exports.dashboard=function(req,res,next){
	var out={};
	Post.find({},function(err,posts){
		if(err){

		}
		out.postCount=posts.length;
			if(posts){
				var visits=posts.
					map(function(post){
						return parseInt(post.hits||0)
					})
				if(visits.length>0){
					out.visits=visits.
						reduce(function(previousValue, currentValue, index, array){
							console.log(previousValue)
	 						 return previousValue+ currentValue;
					});
				}
		}else{
			out.visits=0;
		}
		Term.count({},function(err,c){
			out.categoryCount=c;
			User.count({},function(err,c){
				out.userCount=c;
				console.log(out.postCount+'dfd')
				res.render('admin/dashboard',out);	

			})
		})
	})
}
exports.addComment=function(){

}
exports.getComments=function(){

}
exports.deleteComment=function(){
	
}



function theme(_in){
	return path.join('themes',_site.theme.folder,_in);
}

function admin(_in){
	return path.join('admin',_in);
}