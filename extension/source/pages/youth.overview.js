
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

			let playerCount = 0;
			HtmlUtil.getTableRowsByHeader(doc, ...Page.YouthOverview.HEADERS)
				.filter(row => this.isPlayerRow(row)).forEach((row, index) => {
		
				// player with pull id?
				let pullInput = row.cells['Aktion'].firstChild;

				let player = data.team.getYouthPlayer(index, pullInput ? +pullInput.value : undefined);
				
				player.age = +row.cells['Alter'].textContent;
				player.birthday = +row.cells['Geb.'].textContent;
				
				if (row.cells['Alter'].className == Position.TOR) {
					player.pos = Position.TOR;
				}
				
				player.countryCode = row.cells['Land'].textContent;
				player.countryName = row.cells['Land'].firstChild.title;
				player.uefa = row.cells['U'].textContent ? false : true;
				
				player.talent = row.cells['Talent'].textContent;	
								
				playerCount++;
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

		if (this.getPullId(doc)) {
		
			// TODO add pull listener and refresh at least all youth players data

			/*
			let requestor = Requestor.create(doc);
			requestor.addPage(new Page.YouthOverview());
			requestor.addPage(new Page.YouthSkills());
			requestor.start();
			*/

		} else {

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
