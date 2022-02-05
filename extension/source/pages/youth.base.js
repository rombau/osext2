
Page.Youth = class extends Page {
	
	constructor(name, path, ...params) {

		super(name, path, ...params);

	}

	/**
	 * Creates the toolbar for the youth player views.
	 * 
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 * 
	 * @returns {HTMLElement} the toolbar element
	 */
	createToolbar (doc, data) {
		
		let page = this;

		let toolbar = doc.createElement('div');

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
