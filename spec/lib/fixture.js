const Fixture = {

	_base : '/base/spec/fixtures/',
	
	_parser : new DOMParser(),
 
	createDocument (html) {
		return Fixture._parser.parseFromString(html, 'text/html');
	},
	
	getDocument (path, callback) {
		if (path.indexOf('.html') < 0) {
			path += '.html';
		}
		path = path.replace(/\?/, '_');
		
		var xhr = new XMLHttpRequest();
		xhr.open("GET", Fixture._base + path, true);
		xhr.responseType = "document";
		xhr.onload = e => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					callback(xhr.responseXML);
				} else {
					throw new Error(`Cannot find ${path} in ${Fixture.base}.`);
				}
			}
		};
		xhr.onerror = function (e) {
			throw new Error(`Error when loading ${path} from ${Fixture.base}.`);
		};
		xhr.send(null);
	}
};
