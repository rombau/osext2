
Page.Youth = class extends Page {
	
	constructor(name, path, ...params) {

		super(name, path, ...params);

	}

	/**
	 * Creates the toolbar for the squad player (showteam) views.
	 * 
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 * 
	 * @returns {HTMLElement} the toolbar element
	 */
	createToolbar (doc, data) {
		
		let page = this;

		let toolbar = doc.createElement('div');
		toolbar.id = 'osext-toolbar-container';

		let toolTitle = doc.createElement('span');
		toolTitle.innerHTML = 'Prognose: ';
		toolbar.appendChild(toolTitle);

		let zatSlider = new ZatSlider(toolbar, data, data.viewSettings.youthPlayerMatchDay, (team, current, matchday) => {
			page.updateWithTeam(team, current, matchday);
		});
		let zatSliderElement = zatSlider.create();
		toolbar.appendChild(zatSliderElement);
		
		let max = doc.createElement('i');
		max.update = (season, zat) => {
			if (data.viewSettings.youthMax) {
				max.classList.add('fa-toggle-on');
				max.classList.remove('fa-toggle-off');
				zatSliderElement.classList.add(STYLE_INACTIVE);
				page.updateWithTeam.call(page, data.team.getForecast(data.lastMatchDay), false);
			} else {
				max.classList.add('fa-toggle-off');
				max.classList.remove('fa-toggle-on');
				zatSliderElement.classList.remove(STYLE_INACTIVE);
				zatSlider.triggerCallback.call(zatSlider);
			}
		};
		max.classList.add('fas');
		max.addEventListener('click', (event) => {
			data.viewSettings.youthMax = !data.viewSettings.youthMax;
			max.update();
		});
		max.update();
		toolbar.appendChild(max);

		let maxTitle = doc.createElement('span');
		maxTitle.innerHTML = ' Max.';
		toolbar.appendChild(maxTitle);

		return toolbar;
	}


	/**
	 * @param {Team} _team
	 * @param {Boolean} _current
	 * @param {MatchDay} _matchDay
	 */
	updateWithTeam (_team, _current, _matchDay) {}

	/**
	 * Checks if the row contains a real player
	 * 
	 * @param {HTMLTableRowElement} row the row to handle
	 * @returns {Boolean}
	 */
	isPlayerRow (row) {
		return row.textContent.trim().length > 0 && !this.isYearHeaderRow(row);
	}

	/**
	 * Checks if the row contains a year header
	 * 
	 * @param {HTMLTableRowElement} row the row to handle
	 * @returns {Boolean}
	 */
	isYearHeaderRow (row) {
		return (row.textContent.indexOf('Jahrgang') !== -1);
	}

	/**
	 * Adjusts year table header row to make styling possible.
	 * 
	 * @param {HTMLTableRowElement} row the row to handle
	 * @returns {Boolean} true if it is a year header
	 */
	handleYearHeader (row) {

		if (!this.isYearHeaderRow(row)) {
			return false;
		}

		row.cells[0].removeChild(row.cells[0].lastChild);
		row.cells[0].removeChild(row.cells[0].lastChild);
		row.cells[0].colSpan = '100';
		row.classList.add(STYLE_YOUTH_YEAR_HEADER);
		return true;
	}
}
