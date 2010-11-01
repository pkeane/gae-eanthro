var Dase = {};
Dase.forms = {};

$(document).ready(function() {
	Dase.initForms();
	Dase.initDataSet();
  Dase.initDataForm();
	Dase.initFormDelete();
});

Dase.clearForm = function(id) {
  //from http://stackoverflow.com/questions/680241/blank-out-a-form-with-jquery
  $(':input','#'+id)
    .not(':button, :submit, :reset, :hidden, :radio')
    .val('');
  $(':input','#'+id)
    .removeAttr('checked')
    .removeAttr('selected');
};

Dase.validator = function(id) {
	this.id = id;
	this.elements = {};
	this.errors = [];
}

Dase.validator.prototype.add = function(element_label,element_name,required,type,min,max) {
	var elem = {};
	elem.label = element_label;
	elem.required = required;
	elem.type = type;
	elem.min = min;
	elem.max = max;
	this.elements[element_name] = elem;
}

Dase.validator.prototype.checkType = function(form_elem,elem) {
	if (!form_elem.value) return;
	if ('int' == elem.type) {
		var y = parseInt(form_elem.value);
		if (isNaN(y) || y != form_elem.value) {
			var error = elem.label+' must be an integer';
			this.errors[this.errors.length] = error;
		} else {
			if (elem.min && form_elem.value < elem.min) {
				var error = elem.label+' is too small';
				this.errors[this.errors.length] = error;
			}
			if (elem.max && form_elem.value > elem.max) {
				var error = elem.label+' is too large';
				this.errors[this.errors.length] = error;
			}
		}
	}
	if ('float' == elem.type) {
		var y = parseFloat(form_elem.value);
		if (isNaN(y) || y != form_elem.value) {
			var error = elem.label+' must be a number';
			this.errors[this.errors.length] = error;
		} else {
			if (elem.min && form_elem.value < elem.min) {
				var error = elem.label+' is too small';
				this.errors[this.errors.length] = error;
			}
			if (elem.max && form_elem.value > elem.max) {
				var error = elem.label+' is too large';
				this.errors[this.errors.length] = error;
			}
		}
	}
};

Dase.validator.prototype.validate = function(form) {
	var set = form.serializeArray();
	for (var i=0;i<set.length;i++) {
		if (set[i].name in this.elements)  {
			var elem = this.elements[set[i].name];
			delete this.elements[set[i].name];
			if (elem.required && set[i].value == '') {
				var error = elem.label+' is required';
				this.errors[this.errors.length] = error;
			}
			if (elem.type) {
				this.checkType(set[i],elem);
			}
		}
	}
	for (var n in this.elements) {
		if (this.elements[n].required) {
			var error = this.elements[n].label+' is required';
			this.errors[this.errors.length] = error;
		}
	}
	return this.errors.join("\n");
}

Dase.initForms = function() {
	Dase.forms.data_form = new Dase.validator('data_form');
	Dase.forms.data_form.add('Gender','gender',true,'string');
	Dase.forms.data_form.add('Age','age',true,'int',2,100);
	Dase.forms.data_form.add('Height','height',true,'float',10,250);
	Dase.forms.data_form.add('Foot Length','foot_length',true,'float',5,50);
	Dase.forms.data_form.add('Stride Length','stride_length',false,'float',10,150);
}

Dase.initDataSet = function() {
  var url = $('link[rel="data_set"]').attr('href');
  if (!url) return;
  var json_o = {
    'url': url,
    'dataType':'json',
    'success': function(data) {
      table = new Dase.htmlbuilder('table');
      for (var i=0;i<data.length;i++) {
        tr = table.add('tr');
        var row = data[i];
        td = tr.add('td',null,row.gender);
        td = tr.add('td',null,row.age);
        td = tr.add('td',null,row.foot_length);
        td = tr.add('td',null,row.height);
        td = tr.add('td',null,row.stride_length);
        td = tr.add('td');
        td.add('a',{'class':'delete','href':row.link},'[x]');
      }
      table.attach(document.getElementById('data_table'));
      Dase.initDeletePersonData();
	  $('#ajaxMsg').hide();
    },
    'error': function() {
      alert('sorry, cannot retrieve data set');
    }
  };
  $.ajax(json_o);
}

Dase.initToggle = function(id) {
	$('#'+id).find('a[class="toggle"]').click(function() {
		var id = $(this).attr('id');
		var tar = id.replace('toggle','target');
		$('#'+tar).toggle();
		return false;
	});	
};

Dase.initDataForm = function() {
  Dase.initForms();
	$("#data_form").submit( function() {
		var errors = Dase.forms.data_form.validate($(this));
		if (errors) {
			alert(errors);
			Dase.initForms();
			return false;
		}
		$('#ajaxMsg').show();
    var post_o = {
      'url': window.location.href,
    'data':$(this).serialize(),
    'type':'POST',
    'success': function() {
      Dase.initDataSet();
			Dase.initForms();
      Dase.clearForm('data_form');
    },
    'error': function() {
      alert('sorry, there was an error');
    }
    };
    $.ajax(post_o);
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

Dase.initDeletePersonData = function() {
	$('#data_table').find("a[class='delete']").click(function() {
		$(this).parents('tr').addClass('highlight');
		if (confirm('are you sure?')) {
			var del_o = {
				'url': $(this).attr('href'),
				'type':'DELETE',
				'success': function() {
					Dase.initDataSet();
				},
				'error': function() {
					alert('sorry, cannot delete');
				}
			};
			$.ajax(del_o);
		}
		$(this).parents('tr').removeClass('highlight');
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

