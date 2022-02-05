/**
 * Utilities for DOM parsing and manipulation.
 */
class HtmlUtil {

	constructor () {
		// utility
	}
	
	/**
	 * Returns the HTML table with the specified headers.
	 * 
	 * The character '|' stands for a additional column in the following data rows.
	 * 
	 * @param  {Document} doc 
	 * @param  {...String} headers 
	 * @returns {HTMLTableElement}
	 */
	static getTableByHeader (doc, ...headers) {
		let table = Array.from(doc.getElementsByTagName('table')).find((table, t) => {
			return Array.from(table.rows[0].cells).every((cell, i) => {
				return cell.textContent === (headers[i].replaceAll('|', ''));
			});
		});
		if (!table) {
			let resource = doc.URL.substring(doc.URL.lastIndexOf('/') + 1);
			throw new Error(`Tabelle nicht gefunden (${resource})!`);
		} else {
			Array.from(table.rows).forEach(row => {
				let cellIndex = 0;
				headers.forEach((header) => {
					try {
						let realHeader = header.replaceAll('|', '');
						let isDataRow = (row.textContent.search(realHeader) === -1);
						if (isDataRow) {
							cellIndex += header.indexOf(realHeader);
							header = header.substring(header.indexOf(realHeader));
						}
						row.cells[realHeader] = row.cells[cellIndex++];
						if (isDataRow) {
							header = header.substring(realHeader.length);
							cellIndex += header.length;
						}
					} catch (error) {
						// Indexed property setter is not supported on HTMLCollection
					}
				});
			});
			return table;
		}
	}

	/**
	 * Returns an array with HTML table rows of the table with the specified headers.
	 * The header (first) row is not part of the array.
	 * 
	 * @param  {Document} doc 
	 * @param  {...String} headers 
	 * @returns {[HTMLTableRowElement]}
	 */
	static getTableRowsByHeader (doc, ...headers) {
		let rows = Array.from(HtmlUtil.getTableByHeader(doc, ...headers).rows);
		rows.splice(0, 1);
		return rows;
	}

	/**
	 * Returns an array with HTML table rows of the table with the specified headers and footers.
	 * The header (first) and footer (last) row are not part of the array.
	 * 
	 * @param  {Document} doc 
	 * @param  {...String} headers 
	 * @returns {[HTMLTableRowElement]}
	 */
	static getTableRowsByHeaderAndFooter (doc, ...headers) {
		let rows = HtmlUtil.getTableRowsByHeader(doc, ...headers);
		rows.splice(-1, 1);
		return rows;
	}
	
	/**
	 * Adds script element with the given code.
	 * 
	 * @param {Document} doc 
	 * @param {String} text
	 */
	static appendScript (doc, text) {
		let script = doc.createElement('script');
		script.appendChild(doc.createTextNode(text));
		doc.body.appendChild(script);
	}
	
	/**
	 * Returns the id extracted from a href.
	 * 
	 * @param {String} href 
	 * @returns {Number} id
	 */
	static extractIdFromHref (href) {
		return +(/(javascript:.+\(|st\.php\?c=|sp\.php\?s=|faceprev\.php\?sid=)(\d+)/.exec(href))[2];
	}
}