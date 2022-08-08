
Page.MatchDayReport = class extends Page {

	/**
	 * @param {Number} season
	 * @param {Number} zat
	 */
	constructor(season, zat) {

		super('ZAT-Report', 'zar.php');

		if (season && zat) {
			this.method = HttpMethod.POST;
			this.name += ` (Saison ${season}, Zat ${zat})`;
			this.params.push(new Page.Param('saison', season, true));
			this.params.push(new Page.Param('zat', zat, true));
		}
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		let season = +doc.querySelector('select[name=saison]').value;
		let zat = +doc.querySelector('select[name=zat]').value;

		let matchday = data.team.getMatchDay(season, zat);

		/** @type {[HTMLTableElement]} */
		let tables = doc.querySelectorAll('table[border="0"]');
		if (tables && tables.length === 2) {
			Array.from(tables[0].rows).filter(row => row.cells.length == 2).forEach(row => {
				let label = row.cells[0].textContent;
				let value = row.cells[1].textContent.replaceAll('.', '').split(' Euro')[0];
				if (label.includes('Zuschauereinnahmen')) {
					matchday.stadiumIncome = +value;
					matchday.friendlyIncome = value;
				} else if (label.includes('Stadionkosten')) {
					matchday.stadiumCosts = -value;
				} else if (label.search('Geh.lter') !== -1) {
					matchday.squadSalary = -value;
				} else if (label.includes('Trainer')) {
					matchday.trainerSalary = -value;
				} else if (label.search('Leihgeb.hr') !== -1) {
					if (value.startsWith('-')) {
						matchday.loanCosts = (matchday.loanCosts || 0) + (-value);
					} else {
						matchday.loanIncome = (matchday.loanIncome || 0) + (+value);
					}
				} else if (label.search('Jugendf.rderung') !== -1) {
					matchday.youthSupport = -value;
				} else if (label.includes('Fernsehgelder')) {
					matchday.advertisingIncome = +value;
				} else if (label.includes('Fanartikel')) {
					matchday.merchandisingIncome = +value;
				} else if (label.includes('Physiotherapeut')) {
					matchday.physio = (matchday.physio || 0) + (-value);
				}
			});

			if (matchday.equals(data.lastMatchDay)) {
				Array.from(tables[1].rows).filter(row => row.cells.length == 2).forEach(row => {
					if (row.cells[1].textContent.includes('erfolgreich')) {
						let id = HtmlUtil.extractIdFromHref(row.cells[0].firstChild.href);
						let player = data.team.getSquadPlayer(id);
						player.lastTraining = player.lastTraining || new SquadPlayer.Training();
						player.lastTraining.successful = true;
					}
				});
			}
		}
	}

}
