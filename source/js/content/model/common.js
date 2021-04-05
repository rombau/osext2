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

		/** @type {Boolean} flag indicating the extension is already initialized */ 
		this.initialized;

        /** @type {Boolean} flag indicating the extension data is already restored */ 
		this.restored;
		
		/** @type {Team} the current team */ 
		this.currentTeam = new Team();
	}
}