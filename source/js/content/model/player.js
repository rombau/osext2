/**
 * Enum for positions.
 * @readonly
 */
const Position = Object.freeze({
	TOR: 'TOR',
	ABW: 'ABW',
	DMI: 'DMI',
	MIT: 'MIT',
	OMI: 'OMI',
	STU: 'STU'
});

/**
 * Enum for special skills.
 * @readonly
 */
 const SpecialSkill = Object.freeze({
	E: { description: 'Elfmetertöter' },
	L: { description: 'Libero' },
	S: { description: 'Spielmacher' },
	F: { description: 'Freistoßspezialist' },
	T: { description: 'Torinstinkt' },
	G: { description: 'Flankengott' },
	K: { description: 'Kapitän' },
	P: { description: 'Pferdelunge' }
});

/**
 * Enum for skills.
 * @readonly
 */
 const Skill = Object.freeze({
	SCH: 'sch',
	BAK: 'bak',
	KOB: 'kob',
	ZWK: 'zwk',
	DEC: 'dec',
	GES: 'ges',
	FUQ: 'fuq',
	ERF: 'erf',
	AGG: 'agg',
	PAS: 'pas',
	AUS: 'aus',
	UEB: 'ueb',
	WID: 'wid',
	SEL: 'sel',
	DIS: 'dis',
	ZUV: 'zuv',
	EIN: 'ein'
});

/**
 * Skillset of a player.
 */
 class Skillset {

	constructor() {

		this.sch = 0;
		this.bak = 0;
		this.kob = 0;
		this.zwk = 0;
		this.dec = 0;
		this.ges = 0;
		this.fuq = 0;
		this.erf = 0;
		this.agg = 0;
		this.pas = 0;
		this.aus = 0;
		this.ueb = 0;
		this.wid = 0;
		this.sel = 0;
		this.dis = 0;
		this.zuv = 0;
		this.ein = 0;
	}
}

/**
 * Abstract player representation.
 */
class Player {

	constructor() {

		/** @type {Number} the internal id; generated for youth player */ 
		this.id;

		/** @type {Number} the age */
		this.age;

		/** @type {Number} the brithday ZAT */
		this.birthday;
		
		/** @type {String} the country FIFA code, e.g. IRL for Ireland */
		this.countryCode;
		
		/** @type {String} the country Name, e.g. "Irland" */
		this.countryName;

		/** @type {boolean} flag indicating UEFA membership */
		this.uefa;
		
		/** the skills of the player */
		this.skills = new Skillset();
	}
	
	/**
	 * Returns the average of the given or all skills. 
	 * 
	 * @param {Skillset} skills the skills to calculate the average for; if omitted all the current skills are used
	 */
	getAverage (skills = this.skills) {
		return Number((Object.values(skills)
			.reduce((sum, value) => sum + value, 0) / Object.values(skills).length).toFixed(2));
	}

	/**
	 * Returns the optimized average ("Opti") for the given or current position.
	 * 
	 * @param {Position} pos the position to calculate the average for; if omitted the current position is used
	 */
	getOpti (pos = this.pos) {
		let sumAll = Object.values(this.skills).reduce((sum, value) => sum + value, 0);
		let sumPrimaries = Object.values(this.getPrimarySkills(pos)).reduce((sum, value) => sum + value, 0);
		return Number(((sumAll + (sumPrimaries * 4)) / 27).toFixed(2));
	}

	/**
	 * Returns the primary skills based on the given or current position.
	 * 
	 * @param {Position} pos the position to extract the skills for; if omitted the current position is used
	 * @returns {Skillset} an object with the primary skills only
	 */
	getPrimarySkills (pos = this.pos) {
		return Object.keys(this.skills)
			.filter(key => {
				return (pos === Position.TOR && [Skill.KOB, Skill.ZWK, Skill.DEC, Skill.GES].includes(key)) || 
				   (pos === Position.ABW && [Skill.KOB, Skill.ZWK, Skill.DEC, Skill.ZUV].includes(key)) || 
				   (pos === Position.DMI && [Skill.BAK, Skill.PAS, Skill.UEB, Skill.DEC].includes(key)) || 
				   (pos === Position.MIT && [Skill.BAK, Skill.PAS, Skill.UEB, Skill.ZWK].includes(key)) || 
				   (pos === Position.OMI && [Skill.BAK, Skill.PAS, Skill.UEB, Skill.GES].includes(key)) || 
				   (pos === Position.STU && [Skill.SCH, Skill.KOB, Skill.ZWK, Skill.GES].includes(key));
			})
			.reduce((obj, key) => {
				obj[key] = this.skills[key];
				return obj;
			}, {});
	}

	/**
	 * Returns the secondary skills based on the given or current position.
	 * 
	 * @param {Position} pos the position to extract the skills for; if omitted the current position is used
	 * @returns {Skillset} an object with the secondary skills only
	 */
	getSecondarySkills (pos = this.pos) {
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
	 * Returns the unchangable skills.
	 * 
	 * @returns {Skillset} an object with the unchangable skills only
	 */
	 getUnchangeableSkills () {
		return Object.keys(this.skills)
			.filter(key => {
				return [Skill.WID, Skill.SEL, Skill.DIS, Skill.EIN].includes(key);
			})
			.reduce((obj, key) => {
				obj[key] = this.skills[key];
				return obj;
			}, {});
	}

	/**
	 * Returns a list with the special skills based on the given or current position.
	 * 
	 * @param {Position} pos the position to get the special skills for; if omitted the current position is used
	 * @return {[SpecialSkill]} an array of special skills
	 */
	getSpecialSkills (pos = this.pos) {
		let specials = [];
		let limit = SPECIAL_SKILL_LIMIT;
		if (pos === Position.TOR && 
		    this.skills.kob >= limit && this.skills.dec >= limit && this.skills.ges >= limit) { 
			specials.push(SpecialSkill.E);
		}
		if ((pos === Position.ABW || pos === Position.DMI) && 
		    this.skills.dec >= limit && this.skills.ueb >= limit && this.skills.zwk >= limit) {
			specials.push(SpecialSkill.L);
		}
		if (pos !== Position.TOR && 
		    this.skills.ueb >= limit && this.skills.pas >= limit && this.skills.bak >= limit) { 
			specials.push(SpecialSkill.S);
		}
		if (pos !== Position.TOR && 
		    this.skills.sch >= limit && this.skills.ueb >= limit && this.skills.bak >= limit) { 
			specials.push(SpecialSkill.F);
		}
		if (pos !== Position.TOR && 
		    this.skills.sch >= limit && this.skills.kob >= limit && this.skills.ges >= limit) { 
			specials.push(SpecialSkill.T);
		}
		if (pos !== Position.TOR && 
		    this.skills.bak >= limit && this.skills.pas >= limit && this.skills.ges >= limit) { 
			specials.push(SpecialSkill.G);
		}
		if (this.skills.fuq >= limit && this.skills.erf >= limit && this.skills.ein >= limit) { 
			specials.push(SpecialSkill.K);
		}
		if (pos !== Position.TOR && 
		    this.skills.aus >= limit && this.skills.ges >= limit && this.skills.zuv >= limit) { 
			specials.push(SpecialSkill.P);
		}
		return specials;
	}
}
