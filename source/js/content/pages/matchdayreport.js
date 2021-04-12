
class MatchDayReportPage extends Page {
	
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

}
