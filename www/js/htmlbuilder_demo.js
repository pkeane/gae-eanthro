var rows = [
	["dataA1", "dataA2", "dataA3", "dataA4", "dataA5"],
	["dataB1", "dataB2", "dataB3", "dataB4", "dataB5"],
	["dataC1", "dataC2", "dataC3", "dataC4", "dataC5"],
	["dataD1", "dataD2", "dataD3", "dataD4", "dataD5"],
	["dataE1", "dataE2", "dataE3", "dataE4", "dataE5"],
	["dataF1", "dataF2", "dataF3", "dataF4", "dataF5"],
	["dataA1", "dataA2", "dataA3", "dataA4", "dataA5"],
	["dataB1", "dataB2", "dataB3", "dataB4", "dataB5"],
	["dataC1", "dataC2", "dataC3", "dataC4", "dataC5"],
	["dataD1", "dataD2", "dataD3", "dataD4", "dataD5"],
	["dataE1", "dataE2", "dataE3", "dataE4", "dataE5"],
	["dataF1", "dataF2", "dataF3", "dataF4", "dataF5"],
	["dataA1", "dataA2", "dataA3", "dataA4", "dataA5"],
	["dataC1", "dataC2", "dataC3", "dataC4", "dataC5"],
	["dataD1", "dataD2", "dataD3", "dataD4", "dataD5"],
	["dataE1", "dataE2", "dataE3", "dataE4", "dataE5"],
	["dataF1", "dataF2", "dataF3", "dataF4", "dataF5"],
	];

	Dase.pageInit = function() {
		table = new Dase.htmlbuilder('table',{'class':'demo'});
		for (var i=0;i<rows.length;i++) {
			var row = rows[i];
			tr = table.add('tr');
			if (i%2) {
				tr.set('class','highlight');
			}
			for (var j=0;j<row.length;j++) {
				var cell = row[j];
				td = tr.add('td',null,cell);
			}
		}
		table.attach(Dase.$('htmlDisplay'));
		Dase.demo_json2atom();
		//alert(table.getString());
	};

	Dase.demo_json2atom = function() {
		var url = "http://quickdraw.laits.utexas.edu/dase1/item/test/000535325.json";
		Dase.getJSON(url,function(json) {
			Dase.$('atomDisplay').innerHTML = Dase.atompub.json2atom(json);
		},null,null,'pkeane','okthen');
	}
