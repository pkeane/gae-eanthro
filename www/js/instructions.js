$(document).ready(function(){
	$('div.step_thumbnails ul li').click(function(){
		if(!$(this).hasClass('selected')){
			$(this).addClass('selected').siblings('li').removeClass('selected');	
			var step = $(this).index() + 1;
			$('div.step_viewer').children('div').removeClass('selected').filter('div.step'+step).addClass('selected');
		}
	});

	$('div.step_viewer button').click(function(){
		if($(this).attr('id') === 'next_step'){
			if($('div.step_viewer div.selected').next('div').length != 0){
				var next = $('div.step_viewer div.selected').removeClass('selected').next('div');
				$('div.step_thumbnails ul li.'+next.attr('class')).addClass('selected').siblings('li').removeClass('selected');
				next.addClass('selected');
			}
		} else{
			if($('div.step_viewer div.selected').prev('div').length != 0){
				var prev = $('div.step_viewer div.selected').removeClass('selected').prev('div');
				$('div.step_thumbnails ul li.'+prev.attr('class')).addClass('selected').siblings('li').removeClass('selected');
				prev.addClass('selected');
			}
		}
	});


});
