
Page.YouthOverview = class extends Page.Youth {
	
	constructor() {

		super('Jugendübersicht', 'ju.php', new Page.Param('page', 1, true));

		/** @type {HTMLTableElement} */
		this.table;
	}

	static HEADERS = ['Alter', 'Geb.', '|Land', 'U', 'Skillschnitt', 'Talent', 'Aktion', 'Aufwertung'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {
	
		if (!this.getPullId(doc)) {

			// every row with an uefa column is a real player row
			HtmlUtil.getTableRowsByHeader(doc, ...Page.YouthOverview.HEADERS)
				.filter(row => this.isPlayerRow(row)).forEach((row, index) => {
		
				let player = data.team.getYouthPlayer(index);
					
				player.age = +row.cells['Alter'].textContent;
				player.birthday = +row.cells['Geb.'].textContent;

				if (row.cells['Alter'].className && row.cells['Alter'].className == Position.TOR) {
					player.pos = Position.TOR;
				}

				player.countryCode = row.cells['Land'].textContent;
				player.countryName = row.cells['Land'].firstChild.title;
				player.uefa = row.cells['U'].textContent ? false : true;

				player.talent = row.cells['Talent'].textContent;	
				
				let pullInput = row.cells['Aktion'].firstChild;
				player.pullId = pullInput ? +pullInput.value : null;
			});
		}
	}
	
	/**
	 * Returns the internal id of the player taken from the hidden pull input value,
	 * or null if the input is not present (overview page).
	 * 
	 * @param {Document} doc 
	 * @returns {Number}
	 */
	getPullId(doc) {

		let pullInput = doc.querySelector('input[name="ziehmich"][type="hidden"]');
		return pullInput ? +pullInput.value : null;
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		if (!this.getPullId(doc)) {

			doc.getElementsByTagName('div')[0].classList.add(STYLE_YOUTH);

			// remove the remark
			let element = doc.getElementsByTagName('table')[0].nextSibling;
			while (element.nodeName.toLowerCase() != 'form') {
				let next = element.nextSibling;
				element.parentNode.removeChild(element);
				element = next;
			}
			
			this.table = HtmlUtil.getTableByHeader(doc, ...Page.YouthOverview.HEADERS);
			this.table.classList.add(STYLE_YOUTH);

			Array.from(this.table.rows).forEach((row, i) => {

				if (!this.handleYearHeader(row)) {

					// player rows

				}

			});
			
			this.table.parentNode.insertBefore(this.createToolbar(doc, data), this.table);
		}
	}

	/**
	 * @param {Team} team
	 * @param {Boolean} current indicating the current team
	 */
	updateWithTeam (team, current) {

		Array.from(this.table.rows).slice(1, -1).forEach(row => {


		});
	}
}
