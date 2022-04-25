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
			return headers.every((header, i) => {
				return table.rows[0].cells[i].textContent === (header.replaceAll('|', ''));
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
	 * Adds script element with the given code.
	 * 
	 * @param {Document} doc 
	 * @param {String} text
	 */
	static allowStickyToolbar (doc) {
		doc.querySelector('body > div').style.display = 'inline-block';
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

	/**
	 * @callback changeCallback
	 * @param {*} value changed numeric value
	 */

	/**
	 * Returns a element (div) containing the numeric slider and the view (span) showing the current value.
	 * 
	 * @param {HTMLElement} containerElement the container element where the slider should be created in
	 * @param {Number} width the width of the slider in pixel
	 * @param {Number} min the min value
	 * @param {Number} max the max value
	 * @param {Number} inital the inital value
	 * @param {changeCallback} changeCallback the callback method called on slider change
	 * @returns {HTMLElement} slider element (container)
	 */
	static createNumericSlider (containerElement, width, min, max, inital, changeCallback = (value) => {}) {

		let viewInfo = containerElement.ownerDocument.createElement('span');
		viewInfo.update = (value) => {
			viewInfo.textContent = ` ${value}`;
		};
		viewInfo.update(inital);
		
		let rangeSlider = containerElement.ownerDocument.createElement('input');
		rangeSlider.type = 'range';
		rangeSlider.min = min;
		rangeSlider.max = max;
		rangeSlider.value = inital;
		rangeSlider.addEventListener('input', (event) => {
			viewInfo.update(event.target.value);
		});
		rangeSlider.addEventListener('change', (event) => {
			changeCallback(event.target.value);
		});
		
		let slider = containerElement.ownerDocument.createElement('div');
		slider.style.width = (width + 'px');
		slider.appendChild(rangeSlider);
		slider.appendChild(viewInfo);

		return slider;
	}

	/**
	 * Returns a element (div) containing the matchday slider and the view (span) showing the current matchday.
	 * 
	 * @param {HTMLElement} containerElement the container element where the slider should be created in
	 * @param {MatchDay} lastMatchDay the last match day
	 * @param {MatchDay} matchday the match day reference adjusted by slider
	 * @param {changeCallback} changeCallback the callback method called on slider change
	 * @returns {HTMLElement} slider element (container)
	 */
	static createMatchDaySlider (containerElement, lastMatchDay, matchday, changeCallback = () => {}) {

		let viewInfo = containerElement.ownerDocument.createElement('span');
		viewInfo.update = (season, zat) => {
			viewInfo.textContent = ` Saison ${season} / Zat ${zat}`;
		};
		viewInfo.update(matchday.season, matchday.zat);
		
		let rangeSlider = containerElement.ownerDocument.createElement('input');
		rangeSlider.type = 'range';
		rangeSlider.min = lastMatchDay.season * SEASON_MATCH_DAYS + lastMatchDay.zat;
		rangeSlider.max = (lastMatchDay.season + Options.forecastSeasons) * SEASON_MATCH_DAYS;
		rangeSlider.value = matchday.season * SEASON_MATCH_DAYS + matchday.zat;
		rangeSlider.addEventListener('input', (event) => {
			matchday.season = Math.floor(event.target.value / SEASON_MATCH_DAYS);
			matchday.zat = event.target.value % SEASON_MATCH_DAYS;
			if (matchday.zat === 0) {
				matchday.season--;
				matchday.zat = SEASON_MATCH_DAYS;
			}
			viewInfo.update(matchday.season, matchday.zat);
		});
		rangeSlider.addEventListener('change', (event) => {
			changeCallback(matchday);
		});

		let slider = containerElement.ownerDocument.createElement('div');
		slider.appendChild(rangeSlider);
		slider.appendChild(viewInfo);
		
		changeCallback(matchday);
	
		return slider;
	}

	/**
	 * Returns a abbreviation element.
	 * 
	 * @param {String} title 
	 * @param {String} content 
	 * @param {Document} doc 
	 */
	static createAbbreviation (title, content, doc = document) {
		let abbr = doc.createElement('abbr');
		abbr.title = title;
		abbr.textContent = content;
		return abbr;
	}
	/**
	 * Returns a div element with content element or text.
	 * 
	 * @param {Element|String} content 
	 * @param {String} className 
	 * @param {Document} doc
	 */
	static createDivElement (content, className, doc = document) {
		let div = doc.createElement('div');
		if (className) div.className = className;
		if (content instanceof Element) {
			div.appendChild(content);
		} else {
			div.textContent = content;
		}
		return div;
	}

	/**
	 * Returns a div element containing a left label and a right value element.
	 * 
	 * @param {String} label 
	 * @param {String} value 
	 * @param {String} valueClass 
	 * @param {Document} doc 
	 */
	static createLabelValueElement (label, value, valueClass, doc = document) {
		let div = doc.createElement('div');
		div.appendChild(HtmlUtil.createDivElement(label, 'left'));
		div.appendChild(HtmlUtil.createDivElement(value, 'right ' + valueClass));
		return div;
	}

	/**
	 * Returns a new element with Fontawesome style.
	 * 
	 * @param {Document} doc document for element creation
	 * @param {String} styleClass Fontawesome class name
	 * @param {Function} listener default click listener
	 * @returns {HTMLElement}
	 */
	static createAwesomeButton (doc, styleClass, listener, title) {
		let button = doc.createElement('i');
		button.classList.add('fas');
		button.classList.add(styleClass);
		button.addEventListener('click', listener);
		if (title) button.title = title;
		return button;
	}

	/**
	 * Returns a new message box element (status, warning, error).
	 * 
	 * @param {Document} doc the document for element creation
	 * @param {String} styleClass message box class name, e.g. STYLE_STATUS
	 * @param {String} message the message to show
	 * @param {String} id the id of the message box element
	 * @param {Boolean} autoClose true, if the message box ahould be closed on click
	 * @returns {HTMLElement}
	 */
	static createMessageBox (doc, styleClass, message, id, autoClose = true) {

		doc.querySelectorAll('.' + STYLE_MESSAGE).forEach(message => message.remove());

		let container = doc.createElement('div');
		if (id) container.id = id;
		container.classList.add(STYLE_MESSAGE);
		container.classList.add(styleClass);
		if (autoClose) container.addEventListener('click', (event) => {
			container.remove();
		});

		let icon = doc.createElement('i');
		switch (styleClass) {
			case STYLE_STATUS:
				icon.className = 'fas fa-spinner';
				break;
			case STYLE_WARNING:
				icon.className = 'fas fa-frown';
				break;
			case STYLE_ERROR:
				icon.className = 'fas fa-frown';
				break;
			default:
				break;
		}

		let text = doc.createElement('span');
		text.style.paddingLeft = '7px';
		if (message) text.textContent = message;

		container.appendChild(icon);
		container.appendChild(text);

		return container;
	}
}
