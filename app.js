var http=require('http');
var path = require('path');
var zlib = require('zlib');
var readline = require('readline');


var fs = require('fs.extra');
var express=require('express.js');
var colors=require('colors');
var Sequence=require('sequence').Sequence;
var swig =require('swig');
var mongoose = require('mongoose');

_config=_site= _alq={}; //Global value
//it can be accessed from anywhere in the project

var EOL=require('os').EOL;//End of Line
var CWD=process.cwd();//Current working directory
var pkg=require('./package.json');//package



var model=require('./model');//database structure
var Post=mongoose.model('Post');
var User=mongoose.model('User');
var Meta=mongoose.model('Meta');
var Term=mongoose.model('Term');



// initialize express
var app = express();


//setting the values to express
app.engine('html',swig.renderFile);
app.set('view engine', 'html');
app.set('views', CWD);
app.set('view cache', false);

//Express: middlewares
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({secret: pkg.name}));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());


//always run this module
module.exports=function(port){
	
	//setting port number
	_alq.port=port;
	

	var welcomeMessage='';
	welcomeMessage+='\n\n'+(" AL Qamy").green+(" Started at the port "+_alq.port);
	welcomeMessage+='\n'+("-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-").green+'\n';
	
	http.createServer(app).listen(_alq.port, function(){
		console.log(welcomeMessage);
	});
	
	//Creating a new interface for reading the string from stdin and stdout
	var rl = readline.createInterface({
	  input: process.stdin,
	  output: process.stdout
	});


	rl.on('line', function (cmd) {
		switch(cmd){
			case 'exit':
				process.exit(0);
				break;
			case 'restart':
				process.exit(0);
				break;
			case 'show':
				console.log(_config);
				break;
		}
	});


	Sequence
		.create()
		.then(init)
		.then(run);


};


function init(next){
	
	//checks config file exist or not
	var _config=fs.existsSync(CWD+"/config.js");

	//if not exist config file run as installation
	//otherwise run it as normal
	if(!_config){
		next('development');
	}else{

		//parse the config file
		_config=JSON.parse(_config);
		
		//connect to DB
		dbConnect();

		//stores the site data to the site variable
		//if meta is not defined jump t
		Meta.findOne({'key':'site'},function(err,data){
			if(err){
				throw err;
			}
				
			if(data){
				_site=JSON.parse(data.value);
				next('production');
			}		
			if(!data){
				next('development');
			}
		});
	}
}


function run(next,_state){
	if(_state=='development'){
		app.use('/install',express.static(path.join(__dirname ,'lib','installation','public')));
		app.use('/installation',installation);
		app.use(function(req,res,next){
			res.render(path.join(__dirname ,'lib','installation','index'));
		});
	}else{
		app.use(app.router);
		app.use('/admin',express.static(path.join(CWD, 'admin')));
		app.use('/',express.static(path.join(CWD,'themes',_site.theme.folder,'public')));
		app.use(function(req,res){
			res.render(theme('404'));
		});
		require('./routes')(app);
	}
}



function dbConnect(){
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  fs.readFile(path.join(CWD,'config.js'), 'utf8', function (err, data) {
	  if (err) {
	    console.log(('Error: ' + err).red);
	    return;
	  }
	 var config_file = JSON.parse(data);
	 mongoose.connect(config_file.db, options);

	mongoose.connection.on('error', function (err) {
	  console.log(err);
	  throw new Error('connection Error');
	});

	mongoose.connection.on('disconnected', function () {
	  dbConnect();
	});

});
}

function installation(req,res,next){
	if(fs.existsSync(path.join(CWD,'admin'))||fs.existsSync(path.join(CWD,'themes'))){
		res.render(path.join(__dirname ,'lib','installation','error_file'));
		return;
	}
	if(req.query.step=='1'){
		if(req.method=='GET'||req.method=='get'){
				res.render(path.join(__dirname ,'lib','installation','step1'));
			
		}else if(req.method=='POST'||req.method=='post'){
			var host=req.body.host;
			var DBName=req.body.db;
			var siteName=req.body.site;
			var email=req.body.email;
			var name=req.body.name;
			var username=req.body.uname;
			var password=req.body.password;
			if(!(host&&DBName&&siteName&&email&&username&&name&&password)){
				res.render(install('step1'),{err:{message:'Fill all fields',type:'mongo'},data:req.body});
				return ;
			}			
			var config_out={
				db:'mongodb://'+host+'/'+DBName,
			};
			mongoose.connection.on('error', function (err) {
				console.log('Failed to connect to database'.red);
				res.render(install('step1'),{err:{message:'Failed to connect to Monogo DB',type:'mongo'},data:req.body});
			});
			var sequence=Sequence.create();
			sequence.
				then(function(next){
					mongoose.connect(config_out.db);
					console.log('connecting to database...'.yellow);
					mongoose.connection.once('open',function(){
						console.log('connected to database...'.yellow);
						next();
					});				
				}).
				then(function(next){
					User.remove({},function(err){
						if(err)
							throw err;
						console.log('Emptying User Collection'.yellow);			
						next();
					});
				}).
				then(function(next){
					Meta.remove({},function(err){
						if(err)
							throw err;
						console.log('Emptying User Meta'.yellow);
						next();
					});
				}).
				then(function(next){
					Post.remove({},function(err){
						if(err)
							throw err;
						console.log('Emptying User Post'.yellow);
						next();
					});
				}).
				then(function(next){
					var site={
						name:siteName,
						email:email,
						theme:{
							name:'Name of the theme',
							folder:'two'
						},
						created:Date.now(),
						updated:Date.now()
					};
					site=JSON.stringify(site);
					var meta=new Meta({
						key:'site',
						value:site
					});
					meta.save(function(err){
						if(err){
							res.send(err);
							throw err;
						}
						console.log('Storing Site Data '.yellow);
						next();
					});
				})
				.then(function(next){
					var user=new User({
						name:name,
						username:username,
						email:email,
						password:password,
						type:'sadmin',
						created:Date.now(),
						updated:Date.now()
					});
					user.save(function(err){
						if(err){
							res.send(err);
							throw err;
						}
						console.log('Storing Admin Data '.yellow);				
						next();
					});				
				})
				.then(function(next){
						fs.copyRecursive(path.join(__dirname,'lib','export'), CWD, function (err) {
							if (err) {
								throw err;
							}
							console.log('Exporting  themes'.yellow);
							next();					
						});						
				})
				.then(function(next){
					var err=fs.writeFileSync(path.join(CWD,'config.js'), JSON.stringify(config_out));
						if(err) {
							res.send(err);
							throw err;
						}
						console.log('Saving config File '.yellow);
						console.log('Redirecting to /admin '.yellow);
						res.redirect('/admin'.yellow);
						console.log('Exit the process '.yellow);
						setInterval(function(){
							process.exit(0);
						},5000);
						
				});						
		}		
	}else{
		res.render(install('index'));
	}	
}


function admin(_in){
	return path.join('admin',_in);
}
function theme(_in){
	return path.join('themes',_site.theme.folder,_in);
}
function install(_in){
	return path.join(__dirname ,'lib','installation',_in);
}