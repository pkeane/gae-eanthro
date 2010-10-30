var Dase = {};
Dase.forms = {};

$(document).ready(function() {
	Dase.initDelete('data_form');
	Dase.initForms();
	Dase.initFormValidation('data_form');
	Dase.initFormDelete();
});

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


Dase.initToggle = function(id) {
	$('#'+id).find('a[class="toggle"]').click(function() {
		var id = $(this).attr('id');
		var tar = id.replace('toggle','target');
		$('#'+tar).toggle();
		return false;
	});	
};

Dase.initFormValidation = function(id) {
	var form = $("#"+id);
	form.submit( function() {
		var errors = Dase.forms[id].validate($(this));
		if (errors) {
			alert(errors);
			Dase.initForms();
			return false;
		}
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

