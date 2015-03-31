var mongoose=require('mongoose');
var User=mongoose.model('User');
var Company=mongoose.model('Company');
var Deal=mongoose.model('Deal');
var Log=mongoose.model('Log');
exports.createPost=function(req,res){
	var deal=new Deal({
		name:req.body.name,
		created:Date.now(),
		updated:Date.now(),
		company:_comapany 
	});
	deal.save(function(err){
		if(err){
			console.log(err);
		}else{

			var log=new Log({
				type:'addDeal',
				arg1:_comapany,
				arg2:deal._id,
				date:Date.now()
			});
			log.save();
			_out={}
			_out.id=deal._id
			res.send(_out);
		}
	});
	
}