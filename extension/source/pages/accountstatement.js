
Page.AccountStatement = class extends Page {

	/**
	 * @param {Number} season
	 */
	constructor (season) {

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
	extract (doc, data) {

		let seasonSelect = doc.querySelector('select[name=saison]');
		let season = +seasonSelect.value;
		let currentSeason = seasonSelect.length == season;

		this.params.push(new Page.Param('saison', season, true));

		let matches = /Kontoauszug - Kontostand : ([-\d.]+) Euro/gm.exec(doc.querySelector('b > font').textContent);
		if (matches) {
			data.team.accountBalance = +matches[1].replaceAll('.', '');
			data.lastMatchDay.accountBalance = data.team.accountBalance;
		}

		this.table = new ManagedTable(this.name,
			new Column('Datum'),
			new Column('Eingang'),
			new Column('Ausgang'),
			new Column('Buchungstext'),
			new Column('Kontostand nach Buchung')
		);

		this.table.initialize(doc, false);

		let zat = data.nextMatchDay.zat;

		if (currentSeason && zat === 1 && this.table.rows.slice(1).find(row => /Abrechnung ZAT (\d+)/gm.exec(row.cells['Buchungstext'].textContent))) {
			// before zat 1 with balanced matchday the old account statement is displayed
			// so bookings must be assigned to the last season zat
			zat = (season === 1 ? RELEGATION_START_MATCH_DAY : SEASON_MATCH_DAYS);
		}

		this.table.rows.slice(1).forEach(row => {

			let matchdayBooking = /Abrechnung ZAT (\d+)/gm.exec(row.cells['Buchungstext'].textContent);
			if (matchdayBooking) zat = +matchdayBooking[1];
			let matchday = data.team.getMatchDay(season, zat);
			let bookingValue = +(row.cells['Eingang'].textContent || row.cells['Ausgang'].textContent).replaceAll('.', '');
			if (matchdayBooking && currentSeason) {
				matchday.accountBalance = +row.cells['Kontostand nach Buchung'].textContent.replaceAll('.', '');
				matchday.accountBalanceBefore = matchday.accountBalance - bookingValue;
				matchday.otherBookings = {};
			} else if (!matchdayBooking) {
				matchday.otherBookings = matchday.otherBookings || {};
				let label = row.cells['Buchungstext'].textContent;
				if (label.includes('Saisonendpr')) {
					let ranking = +/Saisonendprämie Platz (\d+)/gm.exec(label)[1];
					if (data.team.league.size == 10) ranking = ranking * 2 - 1;
					let advertising = PREMIUM_ADVERTISING[ranking - 1];
					let merchandising = PREMIUM_MERCHANDISING[ranking - 1];
					matchday.advertisingIncome = Math.round(bookingValue * (advertising / (advertising + merchandising)));
					matchday.merchandisingIncome = Math.round(bookingValue * (merchandising / (advertising + merchandising)));
				} else {
					matchday.otherBookings[label.split(' ')[0]] = (matchday.otherBookings[label.split(' ')[0]] || 0) + bookingValue;
					if (currentSeason) matchday.accountBalanceBefore = (matchday.accountBalanceBefore || data.team.accountBalance) - bookingValue;
				}
			}
		});
	}
}
