/**
 * Abstract player representation.
 */
class Player {
	constructor() {
		this.id = undefined;
		this.age = undefined;
		this.birthday = undefined;
		this.country = undefined;
		this.uefa = undefined;
		
		this.skills = {
			sch : 0,
			bak : 0,
			kob : 0,
			zwk : 0,
			dec : 0,
			ges : 0,
			fuq : 0,
			erf : 0,
			agg : 0,
			pas : 0,
			aus : 0,
			ueb : 0,
			wid : 0,
			sel : 0,
			dis : 0,
			zuv : 0,
			ein : 0,
		};
	}
	
	/**
	 * Returns the average (skillschnitt) of the given or all skills as Number. 
	 */
	getAverage (skills = this.skills) {
		return Number((Object.values(skills)
			.reduce((sum, value) => sum + value, 0) / Object.values(skills).length).toFixed(2));
	}

	/**
	 * Returns the optimized average (opti) for the given or current position as Number.
	 */
	getOpti (pos = this.pos) {
		let sumAll = Object.values(this.skills).reduce((sum, value) => sum + value, 0);
		let sumPrimaries = Object.values(this.getPrimarySkills(pos)).reduce((sum, value) => sum + value, 0);
		return Number(((sumAll + (sumPrimaries * 4)) / 27).toFixed(2));
	}

	/**
	 * Returns the primary skills extracted from the players skills object 
	 * for the given or current position. 
	 */
	getPrimarySkills (pos = this.pos) {
		pos = pos.toLowerCase();
		return Object.keys(this.skills)
			.filter(key => {
				return (pos === 'tor' && ['kob','zwk','dec','ges'].includes(key)) || 
				   (pos === 'abw' && ['kob','zwk','dec','zuv'].includes(key)) || 
				   (pos === 'dmi' && ['bak','pas','ueb','dec'].includes(key)) || 
				   (pos === 'mit' && ['bak','pas','ueb','zwk'].includes(key)) || 
				   (pos === 'omi' && ['bak','pas','ueb','ges'].includes(key)) || 
				   (pos === 'stu' && ['sch','kob','zwk','ges'].includes(key));
			})
			.reduce((obj, key) => {
				obj[key] = this.skills[key];
				return obj;
			}, {});
	}

	/**
	 * Returns the secondary skills extracted from the players skills object 
	 * for the given or current position. 
	 */
	getSecondarySkills (pos = this.pos) {
		pos = pos.toLowerCase();
		return Object.keys(this.skills)
			.filter(key => {
				return !Object.keys(this.getPrimarySkills(pos)).includes(key) &&
					!Object.keys(this.getUnchangeableSkills()).includes(key);
			})
			.reduce((obj, key) => {
				obj[key] = this.skills[key];
				return obj;
			}, {});
	}
	
	/**
	 * Returns the unchangable skills extracted from the players skills object 
	 * for the given or current position. 
	 */
	getUnchangeableSkills () {
		return Object.keys(this.skills)
			.filter(key => {
				return ['wid','sel','dis','ein'].includes(key);
			})
			.reduce((obj, key) => {
				obj[key] = this.skills[key];
				return obj;
			}, {});
	}

	/**
	 * Returns a list with the special skills for the given position.
	 * @param pos position of the player as String 
	 */
	getSpecialSkills (pos = this.pos) {
		pos = pos.toLowerCase();
		let sonderskills = [];
		let limit = 75;
		if (pos == 'tor' && 
		    this.skills.kob >= limit && this.skills.dec >= limit && this.skills.ges >= limit) { 
			sonderskills.push({abbr: 'E', description: 'Elfmetertöter'});
		}
		if ((pos == 'dmi' || pos == 'abw') && 
		    this.skills.dec >= limit && this.skills.ueb >= limit && this.skills.zwk >= limit) {
			sonderskills.push({abbr: 'L', description: 'Libero'});
		}
		if (pos != 'tor' && 
		    this.skills.ueb >= limit && this.skills.pas >= limit && this.skills.bak >= limit) { 
			sonderskills.push({abbr: 'S', description: 'Spielmacher'});
		}
		if (pos != 'tor' && 
		    this.skills.sch >= limit && this.skills.ueb >= limit && this.skills.bak >= limit) { 
			sonderskills.push({abbr: 'F', description: 'Freistoßspezialist'});
		}
		if (pos != 'tor' && 
		    this.skills.sch >= limit && this.skills.kob >= limit && this.skills.ges >= limit) { 
			sonderskills.push({abbr: 'T', description: 'Torinstinkt'});
		}
		if (pos != 'tor' && 
		    this.skills.bak >= limit && this.skills.pas >= limit && this.skills.ges >= limit) { 
			sonderskills.push({abbr: 'G', description: 'Flankengott'});
		}
		if (this.skills.fuq >= limit && this.skills.erf >= limit && this.skills.ein >= limit) { 
			sonderskills.push({abbr: 'K', description: 'Kapitän'});
		}
		if (pos != 'tor' && 
		    this.skills.aus >= limit && this.skills.ges >= limit && this.skills.zuv >= limit) { 
			sonderskills.push({abbr: 'P', description: 'Pferdelunge'});
		}
		return sonderskills;
	}
}

/**
 * Squad player representation.
 */
class SquadPlayer extends Player {
	constructor() {
		super();
		
		this.nr = undefined;
		this.name = undefined;
		this.pos = undefined;
		this.moral = undefined;
		this.fitness = undefined;
		this.banned = undefined;
		this.injured = undefined;
		this.state = undefined;
		this.locked = undefined;
		this.contract = undefined;
		this.salary = undefined;
		this.value = undefined;
		
	}
}

/**
 * Youth player representation.
 */
class YouthPlayer extends Player {
	constructor() {
		super();
	}
}