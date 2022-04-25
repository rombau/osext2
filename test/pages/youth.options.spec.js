describe('Page.YouthOptions', () => {

	/** @type {ExtensionData} */ let data;
	/** @type {Page.YouthOptions} */ let page;

	beforeEach(() => {
		data = new ExtensionData();
		page = new Page.YouthOptions();
	});

	it('should extract page data', (done) => {

		Fixture.getDocument('ju.php?page=4', doc => {

			page.extract(doc, data);

			expect(data.viewSettings.youthSupportPerDay).toEqual(10000);
			expect(data.viewSettings.youthSupportBarrierSeason).toEqual(14);
			expect(data.viewSettings.youthSupportBarrierType).toEqual(YouthSupportBarrierType.AND_YOUNGER);

			done();
		});
	});
});
