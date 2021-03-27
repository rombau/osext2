class HtmlUtil {
	constructor (doc = document) {
		this.doc = doc;
	}
	
	getTableByHeader (...headers) {
		return Array.from(this.doc.getElementsByTagName('table')).find((table, t) => {
			return Array.from(table.rows[0].cells).every((cell, i) => {
				return cell.textContent === headers[i];
			});
		});
	}

	getTableRowsByHeader (...headers) {
		let rows = Array.from(this.getTableByHeader(...headers).rows);
		rows.splice(0, 1);
		return rows;
	}

	getTableRowsByHeaderAndFooter (...headers) {
		let rows = this.getTableRowsByHeader(...headers);
		rows.splice(-1, 1);
		return rows;
	}
	
	appendScript (text) {
		let script = this.doc.createElement('script');
		script.appendChild(this.doc.createTextNode(text));
		this.doc.body.appendChild(script);
	}
	
	static extractIdFromHref (href) {
		return +(/(javascript:.+|st\.php.+c=|sp\.php.+s=|faceprev\.php.+id=)(\d+)/.exec(href))[2];
	}

}
