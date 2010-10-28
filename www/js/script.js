var Dase = {};

$(document).ready(function() {
	Dase.initDelete('data_form');
	Dase.validateDataForm();
	Dase.initFormDelete();
});

Dase.initToggle = function(id) {
	$('#'+id).find('a[class="toggle"]').click(function() {
		var id = $(this).attr('id');
		var tar = id.replace('toggle','target');
		$('#'+tar).toggle();
		return false;
	});	
};

Dase.validateDataForm = function() {
  $("form").submit( function() {
    var set = $(this).serializeArray();
    form_obj = {};
    for (var i=0; i<set.length;i++) {
      var elements = ['gender','age','foot_length','height','stride_length'];
      for (var n in elements) {
        el = elements[n];
        if (el == set[i].name) {
          form_obj[el] = set[i].value;
        }
      }
    }
    alert(jQuery.param(form_obj));
    return false;
  });
};

Dase.initFormDelete = function() {
	$("form[method='delete']").submit(function() {
		if (confirm('are you sure?')) {
			var del_o = {
				'url': $(this).attr('action'),
				'type':'DELETE',
				'success': function() {
					location.reload();
				},
				'error': function() {
					alert('sorry, cannot delete');
				}
			};
			$.ajax(del_o);
		}
		return false;
	});
};

Dase.initDelete = function(id) {
	$('#'+id).find("a[class='delete']").click(function() {
		if (confirm('are you sure?')) {
			var del_o = {
				'url': $(this).attr('href'),
				'type':'DELETE',
				'success': function() {
					location.reload();
				},
				'error': function() {
					alert('sorry, cannot delete');
				}
			};
			$.ajax(del_o);
		}
		return false;
	});
};

