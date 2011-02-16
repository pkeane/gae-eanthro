$(document).ready(function(){
	$('img.default_banner').cross({speed: 500});
	setInterval(changeBanner, 30000);
	function changeBanner(){
		if($('img.default_banner').css('opacity') === '1'){
			$('img.default_banner').trigger('mouseover');
		} else{
			$('img.default_banner').trigger('mouseout');
		}
	}
});
