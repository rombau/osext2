
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
		toolbar.appendChild(zatSlider.create());
		
		let max = doc.createElement('i');
		max.classList.add('fas');
		max.classList.add('fa-toggle-off');
		max.addEventListener('click', (event) => {
			event.target.classList.toggle('fa-toggle-off');
			event.target.classList.toggle('fa-toggle-on');
		});
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
	 * Adjusts youth table header row to make styling possible.
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
