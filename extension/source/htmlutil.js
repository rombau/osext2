/**
 * Utilities for DOM parsing and manipulation.
 */
class HtmlUtil {

	constructor () {
		// utility
	}

	/**
	 * Helps creating sticky toolbar by setting div style to 'inline-block' display.
	 *
	 * @param {Document} doc
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
	 * @param {String|Array} className
	 * @param {Document} doc
	 */
	static createDivElement (content, className, doc = document) {
		let div = doc.createElement('div');
		if (className) {
			if (className instanceof Array) {
				className.forEach(c => div.classList.add(c));
			} else {
				div.className = className;
			}
		}
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
	 * @param {Element} container
	 * @param {String} label
	 * @param {String} value
	 * @param {String} valueClass
	 * @param {Document} doc
	 */
	static appendLabelValueElement (container, label, value, valueClass, doc = document) {
		container.appendChild(HtmlUtil.createDivElement(label, STYLE_LEFT));
		container.appendChild(HtmlUtil.createDivElement(value, [STYLE_RIGHT, valueClass]));
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
	 * Returns a new select with options
	 *
	 * @param {Document} doc document for element creation
	 * @param {[String|Object]} options option values and titles
	 * @param {String} defaultoption default option value
	 * @param {Function} listener called on change with new value
	 * @returns {HTMLSelectElement}
	 */
	static createSelect (doc, options, defaultoption, listener = (value) => {}) {
		let select = doc.createElement('select');
		options.forEach(option => {
			let optionElement = doc.createElement('option');
			optionElement.textContent = option.label || option;
			optionElement.value = option.value || option;
			select.appendChild(optionElement);
		});
		select.addEventListener('change', (event) => {
			listener(event.target.value);
		});
		select.changeTo = (value) => {
			select.value = value;
			select.dispatchEvent(new Event('change'));
		};
		if (defaultoption) select.value = defaultoption;
		return select;
	}

	/**
	 * Returns a new message box element (status, warning, error).
	 *
	 * @param {Document} doc the document for element creation
	 * @param {String} styleClass message box class name, e.g. STYLE_STATUS
	 * @param {String|Error} entity the message or error to show
	 * @param {String} id the id of the message box element
	 * @param {Boolean} autoClose true, if the message box ahould be closed on click
	 * @returns {HTMLElement}
	 */
	static createMessageBox (doc, styleClass, entity, id, autoClose = true) {

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
		if (entity) text.textContent = entity.message || entity;

		container.appendChild(icon);
		container.appendChild(text);

		if (styleClass === STYLE_ERROR) {
			let bugReportLink = doc.createElement('a');
			bugReportLink.className = 'fas fa-envelope';
			bugReportLink.title = 'Fehler per eMail melden';
			bugReportLink.href = 'mailto:osext@greenmoon.at?subject=Fehler in der Erweiterung&body=' + entity + '%0D%0A' + entity.stack.replace(/(?:\r\n|\r|\n)/g, '%0D%0A');
			bugReportLink.style.marginLeft = '10px';
			bugReportLink.style.cursor = 'pointer';
			bugReportLink.style.color = 'white';
			container.appendChild(bugReportLink);
		}

		HtmlUtil.styleExtensionElement(container);

		return container;
	}

	/**
	 * Sets an element styling for extension en-/diabling.
	 * 
	 * The element is hidden as long as the CSS class osext-element is not applied,
	 * and this CSS class is injected with extension.css and reverts the display style.
	 * 
	 * If the extesnion is disabled the style is removed from the page and the 
	 * element disapears (falling back to initial element style).
	 * 
	 * @param {HTMLElement} element
	 */
	static styleExtensionElement (element) {
		element.style.display = 'none';
		element.classList.add(STYLE_ELEMENT);
	}
}
