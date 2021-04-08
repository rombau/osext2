
class GameReportPage extends Page {
	
	/**
	 * @param {MatchDay} matchDay 
	 * @param {Team} homeTeam 
	 * @param {Team} awayTeam 
	 */
	constructor(matchDay, homeTeam, awayTeam) {

		super('Spielbericht', `rep/saison/${matchDay.season}/${matchDay.zat}/${homeTeam.id}-${awayTeam.id}.html`);
	}
}


