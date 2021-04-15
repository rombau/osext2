describe('Background cache', () => {

	beforeEach(() => {
		DataCache.data = {};
		this.extendCallback = jasmine.createSpy('extendCallback');
	});

	it('should return cached data', () => {

		DataCache.data = 'any cached data'; 
		
		DataCache.handleMessage({}, 'sender', this.extendCallback);

		expect(DataCache.data).toEqual('any cached data');
		expect(this.extendCallback).toHaveBeenCalledWith('any cached data');
	});

	it('should put received data into cache and return cached data', () => {

		DataCache.handleMessage({data: 'any data'}, 'sender', this.extendCallback);

		expect(DataCache.data).toEqual('any data');
		expect(this.extendCallback).toHaveBeenCalledWith('any data');
	});
});
