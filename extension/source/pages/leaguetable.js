
Page.LeagueTable = class extends Page {

	constructor(leagueSelection) {

		super('Ligatabelle', 'lt.php');

		if (leagueSelection) {
			this.params.push(new Page.Param('ligaauswahl', leagueSelection));
		}
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		let leagueSelection = +doc.querySelector('select[name=ligaauswahl]').value;
		if (leagueSelection && 
			+doc.querySelector('select[name=landauswahl]').value && 
			!(+doc.querySelector('select[name=tabauswahl]').value) &&
			doc.querySelector('select[name=saauswahl]').value === doc.querySelector('select[name=saauswahl] :last-child').value) {

			this.table = new ManagedTable(this.name,
				new Column('#'),
				new Column(''),
				new Column('Club'),
				new Column('Spiele'),
				new Column('Si.'),
				new Column('Un.'),
				new Column('Ni.'),
				new Column('Tore+'),
				new Column('Tore-'),
				new Column('Tore +/-'),
				new Column('Punkte')
			);

			this.table.initialize(doc, false);

			let size = 0;
			let leagueOfCurrentTeam = false;

			this.table.rows.slice(1).forEach(row => {
				size++;
				if (HtmlUtil.extractIdFromHref(row.cells['Club'].firstChild.href) === data.team.id) {
					data.viewSettings.leagueRanking = size;
					leagueOfCurrentTeam = true;
				}
			});

			if (leagueOfCurrentTeam) {
				data.team.league.size = size;
				// relegation match on zat 70?
				if (size === 10 && leagueSelection > 1) {
					if (leagueSelection === 2 || leagueSelection === 4) {
						data.pagesToRequest.push(new Page.LeagueTable(leagueSelection + 1));
					} else {
						data.team.league.relegation = true;
					}
				}
			} else if (size &&
				doc.querySelector('select[name=landauswahl]').selectedOptions[0].text === data.team.league.countryName && 
				doc.querySelector('select[name=ligaauswahl]').selectedOptions[0].text.startsWith(data.team.league.level)) {
					data.team.league.relegation = true;
			}
		}
	}
}
