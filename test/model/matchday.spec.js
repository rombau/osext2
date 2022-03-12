describe('Matchday', () => {
	
	it('should be compared', () => {
		
		expect(new MatchDay(1, 1).equals(new MatchDay(1, 1))).toBeTruthy();
		expect(new MatchDay(1, 2).equals(new MatchDay(1, 1))).toBeFalsy();
		expect(new MatchDay(2, 1).equals(new MatchDay(1, 1))).toBeFalsy();	
	});

	it('should be after macthday', () => {
		
		expect(new MatchDay(1, 2).after(new MatchDay(1, 1))).toBeTruthy();
		expect(new MatchDay(2, 1).after(new MatchDay(1, 72))).toBeTruthy();
		expect(new MatchDay(1, 1).after(new MatchDay(1, 1))).toBeFalsy();
		expect(new MatchDay(1, 1).after(new MatchDay(1, 2))).toBeFalsy();	
	});

	it('should be before macthday', () => {
		
		expect(new MatchDay(1, 1).before(new MatchDay(1, 2))).toBeTruthy();
		expect(new MatchDay(1, 72).before(new MatchDay(2, 1))).toBeTruthy();
		expect(new MatchDay(1, 1).before(new MatchDay(1, 1))).toBeFalsy();
		expect(new MatchDay(1, 2).before(new MatchDay(1, 1))).toBeFalsy();	
	});

	it('should return interval in days', () => {
		
		expect(new MatchDay(1, 1).intervalTo(new MatchDay(1, 1))).toEqual(0);
		expect(new MatchDay(1, 72).intervalTo(new MatchDay(2, 1))).toEqual(1);
		expect(new MatchDay(2, 1).intervalTo(new MatchDay(1, 72))).toEqual(1);
		expect(new MatchDay(1, 2).intervalTo(new MatchDay(1, 1))).toEqual(1);
		expect(new MatchDay(2, 1).intervalTo(new MatchDay(1, 1))).toEqual(72);	
	});

	it('should be increased by days', () => {
		
		expect(new MatchDay(1, 1).add(1)).toEqual(new MatchDay(1, 2));
		expect(new MatchDay(1, 72).add(1)).toEqual(new MatchDay(2, 1));
	});

});
