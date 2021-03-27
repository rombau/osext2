describe('Player', () => {
	
	/** @type {Player} */ let player;
	
	beforeEach(() => {
		player = new Player();
	});
	
	it('should return primary skills', () => {
		
		expect(player.getPrimarySkills('tor')).toEqual({ kob: 0, zwk: 0, dec: 0, ges: 0 });
		expect(player.getPrimarySkills('abw')).toEqual({ kob: 0, zwk: 0, dec: 0, zuv: 0 });
		expect(player.getPrimarySkills('dmi')).toEqual({ bak: 0, pas: 0, ueb: 0, dec: 0 });
		expect(player.getPrimarySkills('mit')).toEqual({ bak: 0, pas: 0, ueb: 0, zwk: 0 });
		expect(player.getPrimarySkills('omi')).toEqual({ bak: 0, pas: 0, ueb: 0, ges: 0 });
		expect(player.getPrimarySkills('stu')).toEqual({ sch: 0, kob: 0, zwk: 0, ges: 0 });
	
	});

	it('should return secondary skills', () => {
		
		expect(player.getSecondarySkills('tor')).toEqual({ sch: 0, bak: 0, fuq: 0, erf: 0, agg: 0, pas: 0, aus: 0, ueb: 0, zuv: 0 });
		expect(player.getSecondarySkills('abw')).toEqual({ sch: 0, bak: 0, ges: 0, fuq: 0, erf: 0, agg: 0, pas: 0, aus: 0, ueb: 0 });
		expect(player.getSecondarySkills('dmi')).toEqual({ sch: 0, kob: 0, zwk: 0, ges: 0, fuq: 0, erf: 0, agg: 0, aus: 0, zuv: 0 });
		expect(player.getSecondarySkills('mit')).toEqual({ sch: 0, kob: 0, dec: 0, ges: 0, fuq: 0, erf: 0, agg: 0, aus: 0, zuv: 0 });
		expect(player.getSecondarySkills('omi')).toEqual({ sch: 0, kob: 0, zwk: 0, dec: 0, fuq: 0, erf: 0, agg: 0, aus: 0, zuv: 0 });
		expect(player.getSecondarySkills('stu')).toEqual({ bak: 0, dec: 0, fuq: 0, erf: 0, agg: 0, pas: 0, aus: 0, ueb: 0, zuv: 0 });
	
	});

	it('should return unchangable skills', () => {
		
		expect(player.getUnchangeableSkills()).toEqual({ wid: 0, sel: 0, dis: 0, ein: 0 });
	
	});

	it('should return average from skills', () => {
		
		expect(player.getAverage()).toEqual(0);
		expect(player.getAverage(player.getPrimarySkills('tor'))).toEqual(0);
		expect(player.getAverage(player.getSecondarySkills('tor'))).toEqual(0);
		expect(player.getAverage(player.getUnchangeableSkills())).toEqual(0);
	
	});

	it('should return special skills', () => {

		expect(player.getSpecialSkills('tor')).toEqual([]);
		expect(player.getSpecialSkills('abw')).toEqual([]);
		expect(player.getSpecialSkills('dmi')).toEqual([]);
		expect(player.getSpecialSkills('mit')).toEqual([]);
		expect(player.getSpecialSkills('omi')).toEqual([]);
		expect(player.getSpecialSkills('stu')).toEqual([]);

		Object.keys(player.skills).forEach(s => player.skills[s] = 75);
		
		expect(player.getSpecialSkills('tor').map(s => s.abbr)).toEqual(['E','K']);
		expect(player.getSpecialSkills('abw').map(s => s.abbr)).toEqual(['L','S','F','T','G','K','P']);
		expect(player.getSpecialSkills('dmi').map(s => s.abbr)).toEqual(['L','S','F','T','G','K','P']);
		expect(player.getSpecialSkills('mit').map(s => s.abbr)).toEqual(['S','F','T','G','K','P']);
		expect(player.getSpecialSkills('omi').map(s => s.abbr)).toEqual(['S','F','T','G','K','P']);
		expect(player.getSpecialSkills('stu').map(s => s.abbr)).toEqual(['S','F','T','G','K','P']);

	});


});
