describe('Team', () => {

	/** @type {Team} */
	let team;
	
	beforeEach(() => {
		team = new Team();
	});

	it('should be created', () => {
		
		expect(team.id).toBeUndefined();
		expect(team.league.level).toBeUndefined();

		expect(team.squadPlayers.length).toEqual(0);
		expect(team.youthPlayers.length).toEqual(0);

	});

	it('should return requested squad player', () => {
		
		expect(team.getSquadPlayer()).toBeUndefined();
		expect(team.getSquadPlayer(1)).toBeDefined();
		expect(team.getSquadPlayer(1).id).toEqual(1);
		expect(team.getSquadPlayer(2)).toBe(team.getSquadPlayer(2));
	});

	it('should return requested youth player', () => {
		
		expect(team.getYouthPlayer(0)).toBeDefined();

		let p1 = team.getYouthPlayer(0);
		p1.pullId = 33;
		let p2 = team.getYouthPlayer(1);
		p2.pullId = 44;
		let p3 = team.getYouthPlayer(2);
		p3.pullId = 55;
		let p4 = team.getYouthPlayer(3); // no pull
		let p5 = team.getYouthPlayer(4); // no pull
		
		expect(team.getYouthPlayer(0, 33)).toBe(p1);
		expect(team.getYouthPlayer(1, 44)).toBe(p2);
		expect(team.getYouthPlayer(2, 55)).toBe(p3);
		expect(team.getYouthPlayer(3)).toBe(p4);
		expect(team.getYouthPlayer(4)).toBe(p5);

		// p1 pulled
		expect(team.getYouthPlayer(0, 44)).toBe(p2);
		expect(team.getYouthPlayer(1, 55)).toBe(p3);
		expect(team.getYouthPlayer(2)).toBe(p4);
		expect(team.getYouthPlayer(3)).toBe(p5);

		// p3 pulled, no more players to pull
		expect(team.getYouthPlayer(0, 44)).toBe(p2);
		expect(team.getYouthPlayer(1)).toBe(p4);
		expect(team.getYouthPlayer(2)).toBe(p5);

		// p4 can now be pulled
		expect(team.getYouthPlayer(0, 44)).toBe(p2);
		expect(team.getYouthPlayer(1, 66)).toBe(p4);
		expect(team.getYouthPlayer(2)).toBe(p5);
	});

	it('should return requested match day', () => {
		
		expect(team.getMatchDay()).toBeUndefined();
		expect(team.getMatchDay(5,34)).toBeDefined();
		expect(team.getMatchDay(5,34).zat).toEqual(34);
		expect(team.getMatchDay(5,34).season).toEqual(5);
		expect(team.getMatchDay(7,11)).toBe(team.getMatchDay(7,11));
	});

	it('should return requested trainer', () => {
		
		expect(team.getTrainer()).toBeUndefined();
		expect(team.getTrainer(1)).toBeDefined();
		expect(team.getTrainer(1).nr).toEqual(1);
		expect(team.getTrainer(2)).toBe(team.getTrainer(2));
	});

	it('should return forecast', () => {

		team.squadPlayers.push(new SquadPlayer());

		let lastMatchDay = new MatchDay(15,50);

		expect(team.getForecast(lastMatchDay, new MatchDay(15,50))).toBe(team);
		expect(team.getForecast(lastMatchDay, new MatchDay(15,72))).not.toBe(team);
		expect(team.getForecast(lastMatchDay, new MatchDay(15,72)).squadPlayers.length).toEqual(team.squadPlayers.length);
	});

	it('should complete initialization', () => {

		let leagueMatchDay = new MatchDay(15,65);
		leagueMatchDay.competition = Competition.LEAGUE;
		leagueMatchDay.location = GameLocation.HOME;
		team.matchDays.push(leagueMatchDay);

		let friendlyMatchDay = new MatchDay(15,63);
		friendlyMatchDay.competition = Competition.FRIENDLY;
		friendlyMatchDay.location = GameLocation.HOME;
		team.matchDays.push(friendlyMatchDay);

		let intMatchDay = new MatchDay(15,61);
		intMatchDay.competition = Competition.OSC;
		intMatchDay.location = GameLocation.HOME;
		team.matchDays.push(intMatchDay);

		Options.forecastSeasons = 2;

		team.complete(new MatchDay(15,50));

		expect(team.getMatchDay(16,65).competition).toEqual(Competition.LEAGUE);
		expect(team.getMatchDay(16,63).competition).toBeUndefined();
		expect(team.getMatchDay(16,61).competition).toBeUndefined();

		expect(team.getMatchDay(17,65).competition).toBeUndefined();
		expect(team.getMatchDay(17,63).competition).toBeUndefined();
		expect(team.getMatchDay(17,61).competition).toBeUndefined();

	});
});
