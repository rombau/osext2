/**
 * Global constants
 */

const SPECIAL_SKILL_LIMIT = 75;
const SAISON_MATCH_DAYS = 72;

/**
 * Extension data
 */
class ExtensionData {
	
	constructor() {

        /** @type {Boolean} flag indicating the extension data is already restored */ 
		this.restored;
		
		/** @type {Team} the current team */ 
		this.currentTeam = new Team();

		/** @type {MatchDay} the last matchday */ 
		this.lastMatchDay;

		/** @type {MatchDay} the next matchday */ 
		this.nextMatchDay;

		this.clear();
	}

	/**
	 * Resets all the extension data
	 */
	clear () {
		this.currentTeam = new Team();
		this.lastMatchDay = new MatchDay();
		this.nextMatchDay = new MatchDay();
	}
}