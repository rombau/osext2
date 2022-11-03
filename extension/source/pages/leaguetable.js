
Page.LeagueTable = class extends Page {

	constructor() {

		super('Ligatabelle', 'lt.php');
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

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

		if (+doc.querySelector('select[name=ligaauswahl]').value && 
			+doc.querySelector('select[name=landauswahl]').value && 
			!(+doc.querySelector('select[name=tabauswahl]').value) &&
			doc.querySelector('select[name=saauswahl]').value === doc.querySelector('select[name=saauswahl] :last-child').value) {

			let size = 0;
			let leagueOfCurrentTeam = false;

			this.table.rows.slice(1).forEach(row => {

				size++;
				if (HtmlUtil.extractIdFromHref(row.cells['Club'].firstChild.href) === data.team.id) {
					data.viewSettings.leagueRanking = size;
					leagueOfCurrentTeam = true;
				}
			});

			if (leagueOfCurrentTeam) data.team.league.size = size;
		}
	}
}
