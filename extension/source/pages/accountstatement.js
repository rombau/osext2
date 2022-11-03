
Page.AccountStatement = class extends Page {

	/**
	 * @param {Number} season
	 */
	constructor(season) {

		super('Kontoauszug', 'ka.php');

		if (season) {
			this.method = HttpMethod.POST;
			this.name += ` (Saison ${season})`;
			this.params.push(new Page.Param('saison', season, true));
		}
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		let season = +doc.querySelector('select[name=saison]').value;
		this.params.push(new Page.Param('saison', season, true));

		let matches = /Kontoauszug - Kontostand : ([-\d.]+) Euro/gm.exec(doc.querySelector('b > font').textContent);
		if (matches) {
			data.team.accountBalance = +matches[1].replaceAll('.', '');
		}
		
		this.table = new ManagedTable(this.name,
			new Column('Datum'),
			new Column('Eingang'),
			new Column('Ausgang'),
			new Column('Buchungstext'),
			new Column('Kontostand nach Buchung')
		);
		
		this.table.initialize(doc, false);
			
		let zat;
		this.table.rows.slice(1).forEach(row => {
			
			let balanceText = row.cells['Kontostand nach Buchung'].textContent;
			if (!balanceText.includes('Nicht möglich')) {
				matches = /Abrechnung ZAT (\d+)/gm.exec(row.cells['Buchungstext'].textContent);
				if (matches) zat = +matches[1];
				if (zat) {
					let matchday = data.team.getMatchDay(season, zat);
					let bookingValue = row.cells['Eingang'].textContent ? 
						+row.cells['Eingang'].textContent.replaceAll('.', '') : +row.cells['Ausgang'].textContent.replaceAll('.', '');
					if (matches) {
						matchday.accountBalance = +balanceText.replaceAll('.', '');
						matchday.accountBalanceBefore = matchday.accountBalance - bookingValue;
						matchday.otherBookings = {};
					} else {
						let label = row.cells['Buchungstext'].textContent.split(' ')[0];
						matchday.otherBookings[label] = (matchday.otherBookings[label] || 0) + bookingValue;
						matchday.accountBalanceBefore = matchday.accountBalanceBefore - bookingValue;
					}
				}
			}
		});

	}
}
