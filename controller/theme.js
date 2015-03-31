var fs=require('fs');
var path = require('path');
var mongoose=require('mongoose');
var Post=mongoose.model('Post');
var User=mongoose.model('User');
var Meta=mongoose.model('Meta');
var Term=mongoose.model('Term');

var CWD=process.cwd();
var themeFolder=path.join(CWD,'themes');

exports.index=function(req,res){
    Meta.findOne({key:'siteTheme'},function(err,siteTheme){
      if(err){
        console.log(err)
        return
      }

      var themes=fs.readdirSync(themeFolder)
      .filter(function (file) {
        var _fullPath=path.join(themeFolder, file);
        if(fs.statSync(_fullPath).isDirectory()){
          try{
            if(fs.statSync(path.join(_fullPath,'theme.json')).isFile())
            return true
        }catch(e){
          console.log(e)
          return false
        }

      }
    })
    .map(function(file){
      var _fullPath=path.join(themeFolder, file);
      var data=fs.readFileSync(path.join(_fullPath,'theme.json'));
      if(!data){
        return null
      }
      var js=JSON.parse(data)
      js.path=_fullPath
      if(file==_site.theme.folder){
        js.active=true
      }
      js.folder=file;
      console.log(js)
      return js
    })
  
    res.render(path.join('admin','themes'),{themes:themes})
  })
 
}


exports.activate=function(req,res){
  var theme=req.params.theme;
  if(!theme){
    res.redirect('/admin');
    return;
  }
   fs.readFile(path.join(CWD,'themes',theme,'theme.json'), 'utf8', function (err, data) {
    if (err) {
      console.log(('Error: ' + err).red)
      return;
    }
     var themeData = JSON.parse(data);
     //if(thmeData.name)
     _site.theme={
        name:themeData.name,
        path:themeData.path,
        folder:theme
     }
     var siteStrin=JSON.stringify(_site);
     Meta.update({key:'site'},{value:siteStrin},function(err){
      if(err){
        console.log(err);
      }
        res.redirect('/admin/themes');
     })

  })

}