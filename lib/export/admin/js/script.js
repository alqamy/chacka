$(document).ready(function(){
	//Editor
	$('.editor select.category').change(function(){
		if($(this).val()=='add_new_cat'){
			$('.new_cat').show()
		}else{
			$('.new_cat').hide()
		}
	});
});