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
		
		Object.keys(player.skills).forEach((skillname, s) => {
			player.skills[skillname] = [68,30,62,53,29,56,0,0,29,24,25,16,95,38,76,26,79][s];
		});

		expect(player.getSkillAverage()).toEqual(41.53);
		expect(player.getSkillAverage(player.getPrimarySkills(Position.TOR))).toEqual(50);
		expect(player.getSkillAverage(player.getSecondarySkills(Position.TOR))).toEqual(24.22);
		expect(player.getSkillAverage(player.getUnchangeableSkills())).toEqual(72);
		
		expect(player.getOpti(Position.ABW).toFixed(2)).toEqual('51.33');
		expect(player.getOpti(Position.DMI).toFixed(2)).toEqual('40.81');
		expect(player.getOpti(Position.MIT).toFixed(2)).toEqual('44.37');
		expect(player.getOpti(Position.OMI).toFixed(2)).toEqual('44.81');
		expect(player.getOpti(Position.STU).toFixed(2)).toEqual('61.56');

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

	it('should return calculated market value', () => {
		
		player.pos = Position.TOR;
		player.ageExact = 22.958333333;
		Object.keys(player.skills).forEach((skillname, s) => {
			player.skills[skillname] = [18,64,86,85,84,84,0,26,14,29,19,24,46,44,82,29,53][s];
		});

		expect(player.getMarketValue()).toEqual(12669161);

		expect(player.getMarketValue(player.pos, 0.9)).toEqual(11402245);
		expect(player.getMarketValue(player.pos, 1.1)).toEqual(13936077);

		expect(player.getMarketValue(Position.ABW)).toEqual(8693691);
		expect(player.getMarketValue(Position.DMI)).toEqual(4753841);
		expect(player.getMarketValue(Position.MIT)).toEqual(4789855);
		expect(player.getMarketValue(Position.OMI)).toEqual(4753841);
		expect(player.getMarketValue(Position.STU)).toEqual(8045682);
	
	});

});
