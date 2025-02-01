
const ATTR_ORIGINAL = 'osext-orig';

// This observer is used to store original table cell values (excluding line breaks) in an attribute.
// If the content has been manipulated by a user script, the page processing can use the original value.
new MutationObserver((records, observer) => {
	records.forEach(record => {
		if (record.target.nodeName == 'TR') {
			record.addedNodes.forEach(node => {
				if (node.nodeName == 'TD' && node.textContent.length > 0 && !node.textContent.match(/[\r\n]+/)) {
					if (!node.getAttribute(ATTR_ORIGINAL) && (!node.getAttribute('class') || !node.getAttribute('class').includes(STYLE_ELEMENT))) {
						node.setAttribute(ATTR_ORIGINAL, node.textContent);
					}
				}
			});
		}
		else if (record.target.nodeName == 'BODY' && record.addedNodes.length > 0 && record.addedNodes.item(0) instanceof Element
			&& record.addedNodes.item(0).getAttribute('id') == ID_MARKER) {
			observer.disconnect();
		}
	});
}).observe(document, {childList: true, subtree: true});

/**
 * Utilities for user script handling.
 */
class ScriptUtil {

	constructor () {
		// utility
	}

	/**
	 * Returns the original (or initial) value for the given cell.
	 *
	 * @param {HTMLTableCellElement} cell the table cell
	 * @param {Boolean} textContentIfNull if true, the current textContent is returned if ther is no original value (false by default)
	 * @returns {String} value
	 */
	static getCellContent (cell, textContentIfNull = false) {
		if (cell instanceof HTMLTableCellElement) {
			let original = cell.getAttribute(ATTR_ORIGINAL);
			return original || (textContentIfNull ? cell.textContent : null);
		}
		return null;
	}

}
