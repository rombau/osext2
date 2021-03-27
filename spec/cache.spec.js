describe('Background cache', () => {

	beforeEach(() => {
		Cache.data = {};
		this.extendCallback = jasmine.createSpy('extendCallback');
	});

	it('should return cached data', () => {

		Cache.data = 'any cached data'; 
		
		Cache.handleMessage({}, 'sender', this.extendCallback);

		expect(Cache.data).toEqual('any cached data');
		expect(this.extendCallback).toHaveBeenCalledWith('any cached data');
	});

	it('should put received data into cache and return cached data', () => {

		Cache.handleMessage({data: 'any data'}, 'sender', this.extendCallback);

		expect(Cache.data).toEqual('any data');
		expect(this.extendCallback).toHaveBeenCalledWith('any data');
	});
});
