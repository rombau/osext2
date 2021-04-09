
class ShowteamSeasonPage extends Page {
	
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

		this.headers = ['ZAT', 'Spielart', 'Gegner', 'Ergebnis', 'Bericht'];

		this.unknownGameInfos = ['Blind Friendly gesucht!', 'reserviert', 'spielfrei'];
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 * @returns {[Page]}
	 */
	extract(doc, data) {
		
		data.currentTeam = Object.assign(new Team(), data.currentTeam);
		
		let season = +doc.querySelector('select[name=saison]').value;

		HtmlUtil.getTableRowsByHeader(doc, ...this.headers).forEach(row => {
			let gameInfo = row.cells[1].textContent;
			if (gameInfo && this.unknownGameInfos.indexOf(gameInfo) == -1) {
				let matchday = data.currentTeam.getMatchDay(season, +row.cells[0].textContent);
				if (!matchday.immutable) {
					matchday.competition = gameInfo.split(' : ')[0];
					matchday.location = gameInfo.split(' : ')[1];
					matchday.result = row.cells[3].textContent;
					if (matchday.competition === Competition.FRIENDLY && !matchday.result) {
						matchday.friendlyShare = +row.cells[5].textContent.split('/')[0];
					}
					matchday.immutable = matchday.result ? true : false;
				}
			}
		});

		if (!this.handleNextMatchDay(data, season)) {
			return [new ShowteamSeasonPage(season - 1)];
		}


		// TODO: nextMatchDay and lastMatchDay should be pointers to matchday in the team.matchDays

		
	};

	/**
	 * Handles (and initializes) the next match day, if it isn't fixed (aka immutable).
	 * 
	 * During the season interval there are two possible options for this plan:
	 * - the previous season is shown (with all the already played games):
	 *   the season of the next matchday can be set (season + 1)
	 * - the new season is shown (with or without game schedules):
	 *   the previous season has to be loaded for balance forecast
	 * 
	 * @param {ExtensionData} data the extension data
	 * @param {Number} season the current extracted season
	 * @returns {Boolean} true if the next match day can be handled, false if the previous season is required
	 */
	handleNextMatchDay(data, season) {

		if (!data.nextMatchDay.immutable) { // next match day not fixed
			data.nextMatchDay.season = season;
			if (data.nextMatchDay.zat <= 1 || data.nextMatchDay.zat > SAISON_MATCH_DAYS) { // season interval
				data.nextMatchDay.zat = 1;
				if (data.currentTeam.matchDays.find(matchDay => matchDay.result)) { // previous season with already played games
					data.nextMatchDay.season = season + 1;
					data.nextMatchDay.immutable = true;
				} else {
					return false; // additionally load previous season
				}
			} else {
				data.nextMatchDay.immutable = true;
			}
		}
		return true;
	}
}

Page.register(new ShowteamSeasonPage());