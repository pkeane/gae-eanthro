$(document).ready(function(){
	$('div.step_thumbnails ul li').click(function(){
		var step = $(this).index() + 1;
		$('div.step_viewer').children('div').removeClass('selected').filter('div.step'+step).addClass('selected');
	});

	$('div.step_viewer button').click(function(){
		if($(this).attr('id') === 'next_step'){
			if($('div.step_viewer div.selected').next('div').length != 0){
				$('div.step_viewer div.selected').removeClass('selected').next('div').addClass('selected');
			}
		} else{
			if($('div.step_viewer div.selected').prev('div').length != 0){
				$('div.step_viewer div.selected').removeClass('selected').prev('div').addClass('selected');
			}
		}

	});


});
