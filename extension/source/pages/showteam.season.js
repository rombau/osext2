
Page.ShowteamSeason = class extends Page {
	
	/**
	 * @param {Number} season
	 */
	constructor(season) {

		super('Saisonplan', 'showteam.php', new Page.Param('s', 6));

		if (season) {
			this.method = HttpMethod.POST;
			this.name += ` (Saison ${season})`;
			this.params.push(new Page.Param('saison', season, true));
		}	
	}
	
	static HEADERS = ['ZAT', 'Spielart', 'Gegner', 'Ergebnis', 'Bericht'];

	static GAMEINFO_NOT_SET = ['Blind Friendly gesucht!', 'reserviert', 'spielfrei'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {
		
		let season = +doc.querySelector('select[name=saison]').value;
		this.params.push(new Page.Param('saison', season, true));

		HtmlUtil.getTableRowsByHeader(doc, ...Page.ShowteamSeason.HEADERS).forEach(row => {
			let gameInfo = row.cells['Spielart'].textContent;
			if (gameInfo && !Page.ShowteamSeason.GAMEINFO_NOT_SET.includes(gameInfo)) {
				let matchday = data.team.getMatchDay(season, +row.cells['ZAT'].textContent);
				matchday.competition = gameInfo.split(' : ')[0];
				matchday.location = gameInfo.split(' : ')[1];
				matchday.result = row.cells['Ergebnis'].textContent;
				if (matchday.competition === Competition.FRIENDLY && !matchday.result) {
					matchday.friendlyShare = +row.cells[5].textContent.split('/')[0];
				}
				let opponentCell = row.cells['Gegner'];
				if (opponentCell.textContent) {
					matchday.opponent = new Team(HtmlUtil.extractIdFromHref(opponentCell.firstChild.href), opponentCell.textContent);
				}
			}
		});

		if (!data.initNextSeason(season)) {
			this.logger.info(`Initiate loading of previous season (${season-1}) matchday schedule`);
			data.pagesToRequest.push(new Page.ShowteamSeason(season - 1));
		}
	}
}
