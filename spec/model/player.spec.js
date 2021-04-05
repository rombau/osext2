describe('Player', () => {
	
	/** @type {Player} */ 
	let player;
	
	beforeEach(() => {
		player = new Player();
	});
	
	it('should return primary skills', () => {
		
		expect(player.getPrimarySkills(Position.TOR)).toEqual({ kob: 0, zwk: 0, dec: 0, ges: 0 });
		expect(player.getPrimarySkills(Position.ABW)).toEqual({ kob: 0, zwk: 0, dec: 0, zuv: 0 });
		expect(player.getPrimarySkills(Position.DMI)).toEqual({ bak: 0, pas: 0, ueb: 0, dec: 0 });
		expect(player.getPrimarySkills(Position.MIT)).toEqual({ bak: 0, pas: 0, ueb: 0, zwk: 0 });
		expect(player.getPrimarySkills(Position.OMI)).toEqual({ bak: 0, pas: 0, ueb: 0, ges: 0 });
		expect(player.getPrimarySkills(Position.STU)).toEqual({ sch: 0, kob: 0, zwk: 0, ges: 0 });
	
	});

	it('should return secondary skills', () => {
		
		expect(player.getSecondarySkills(Position.TOR)).toEqual({ sch: 0, bak: 0, fuq: 0, erf: 0, agg: 0, pas: 0, aus: 0, ueb: 0, zuv: 0 });
		expect(player.getSecondarySkills(Position.ABW)).toEqual({ sch: 0, bak: 0, ges: 0, fuq: 0, erf: 0, agg: 0, pas: 0, aus: 0, ueb: 0 });
		expect(player.getSecondarySkills(Position.DMI)).toEqual({ sch: 0, kob: 0, zwk: 0, ges: 0, fuq: 0, erf: 0, agg: 0, aus: 0, zuv: 0 });
		expect(player.getSecondarySkills(Position.MIT)).toEqual({ sch: 0, kob: 0, dec: 0, ges: 0, fuq: 0, erf: 0, agg: 0, aus: 0, zuv: 0 });
		expect(player.getSecondarySkills(Position.OMI)).toEqual({ sch: 0, kob: 0, zwk: 0, dec: 0, fuq: 0, erf: 0, agg: 0, aus: 0, zuv: 0 });
		expect(player.getSecondarySkills(Position.STU)).toEqual({ bak: 0, dec: 0, fuq: 0, erf: 0, agg: 0, pas: 0, aus: 0, ueb: 0, zuv: 0 });
	
	});

	it('should return unchangable skills', () => {
		
		expect(player.getUnchangeableSkills()).toEqual({ wid: 0, sel: 0, dis: 0, ein: 0 });
	
	});

	it('should return average from skills', () => {
		
		expect(player.getAverage()).toEqual(0);
		expect(player.getAverage(player.getPrimarySkills(Position.TOR))).toEqual(0);
		expect(player.getAverage(player.getSecondarySkills(Position.TOR))).toEqual(0);
		expect(player.getAverage(player.getUnchangeableSkills())).toEqual(0);
	
	});

	it('should return special skills', () => {

		expect(player.getSpecialSkills(Position.TOR)).toEqual([]);
		expect(player.getSpecialSkills(Position.ABW)).toEqual([]);
		expect(player.getSpecialSkills(Position.DMI)).toEqual([]);
		expect(player.getSpecialSkills(Position.MIT)).toEqual([]);
		expect(player.getSpecialSkills(Position.OMI)).toEqual([]);
		expect(player.getSpecialSkills(Position.STU)).toEqual([]);

		Object.keys(player.skills).forEach(s => player.skills[s] = SPECIAL_SKILL_LIMIT);

		expect(player.getSpecialSkills(Position.TOR)).toEqual([SpecialSkill.E, SpecialSkill.K]);
		
		expect(player.getSpecialSkills(Position.ABW)).toEqual([SpecialSkill.L, SpecialSkill.S, SpecialSkill.F, SpecialSkill.T, SpecialSkill.G, SpecialSkill.K, SpecialSkill.P]);
		expect(player.getSpecialSkills(Position.DMI)).toEqual([SpecialSkill.L, SpecialSkill.S, SpecialSkill.F, SpecialSkill.T, SpecialSkill.G, SpecialSkill.K, SpecialSkill.P]);
		expect(player.getSpecialSkills(Position.MIT)).toEqual([SpecialSkill.S, SpecialSkill.F, SpecialSkill.T, SpecialSkill.G, SpecialSkill.K, SpecialSkill.P]);
		expect(player.getSpecialSkills(Position.OMI)).toEqual([SpecialSkill.S, SpecialSkill.F, SpecialSkill.T, SpecialSkill.G, SpecialSkill.K, SpecialSkill.P]);
		expect(player.getSpecialSkills(Position.STU)).toEqual([SpecialSkill.S, SpecialSkill.F, SpecialSkill.T, SpecialSkill.G, SpecialSkill.K, SpecialSkill.P]);

	});


});
