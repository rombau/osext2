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
	 * @param  {Document} doc 
	 * @param  {...String} headers 
	 * @returns {HTMLTableElement}
	 */
	static getTableByHeader (doc, ...headers) {
		return Array.from(doc.getElementsByTagName('table')).find((table, t) => {
			return Array.from(table.rows[0].cells).every((cell, i) => {
				return cell.textContent === headers[i];
			});
		});
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
		return +(/(javascript:.+|st\.php.+c=|sp\.php.+s=|faceprev\.php.+id=)(\d+)/.exec(href))[2];
	}

}
