

var adminAuth=function(req,res,next){
  next();
}

var commentAuth=function(req,res,next){
  next();
}

module.exports=function(app){

var post=require('./controller/post')
var user=require('./controller/user')
var admin=require('./controller/admin')
var theme=require('./controller/theme')

//admin
app.post('/admin/add',user.adminAuth,post.createPost);
app.get('/admin/user',user.adminAuth,user.getUserPanel);
app.get('/admin/user/edit/name',user.adminAuth,user.getUserNameEditPanel);
app.post('/admin/user/edit/name',user.adminAuth,user.setUserName);
app.post('/admin/users',user.adminAuth,user.getUserEditPanel);
app.get('/admin/add',user.adminAuth,post.renderAdd);
app.get('/admin',user.adminAuth,post.dashboard);
app.get('/admin/setting',function(req,res){
  res.redirect('/admin/setting/theme');
})
app.get('/admin/setting/theme',theme.index)
//app.get('/admin/setting/theme',galllery.index)

app.get('/admin/login',user.getLogInForm)
app.post('/admin/login',user.signin);
app.get('/admin/logout',user.signout);
app.get('/admin/logout',user.signout);
app.get('/admin/logout',user.signout);

app.post('/admin/edit/:id',user.adminAuth,post.editPost)
app.get('/admin/edit/:id',user.adminAuth,post.renderEdit);
app.get('/admin/edit',user.adminAuth,function(req,res){
 res.redirect('/admin');
});
app.get('/admin/posts',user.adminAuth,post.getAllPost);
app.get('/admin/post/delete/:id',user.adminAuth,post.deletePost);


app.get('/admin/themes',user.adminAuth,theme.index);
app.get('/admin/theme/activate/:theme',user.adminAuth,theme.activate);
//front end
app.get('/',post.index);
app.post('/signin',user.signin);
app.get('/:name',post.getPost);
app.get('/p/:id',post.getPostById);
app.post('/comment',commentAuth,post.addComment);
app.get('/:title/comments',post.getComments);
app.get('/p/:id/comments',post.getComments);
app.delete('/:delete',adminAuth,post.deleteComment);
}
