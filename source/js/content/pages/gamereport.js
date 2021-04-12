
class GameReportPage extends Page {
	
	/**
	 * @param {Number} season 
	 * @param {Number} zat 
	 * @param {Number} homeTeamId 
	 * @param {Number} awayTeamId 
	 */
	constructor(season, zat, homeTeamId, awayTeamId) {

		super('Spielbericht', `rep/saison/${season}/${zat}/${homeTeamId}-${awayTeamId}.html`);

	}

}


