describe('Html fixture', () => {

	it('should be loaded from disc', (done) => {

		Fixture.getDocument('st.php?s=2', (doc) => {
			expect(doc).toBeDefined();
			expect(doc.getElementsByTagName('title')[0].textContent).toEqual('Online-Soccer 2.0');
			done();
		});

	});

	it('should be created', () => {

		let doc = Fixture.createDocument('<div id="xyz"/>');

		expect(doc).toBeDefined();
		expect(doc.getElementById('xyz')).toBeDefined();

	});
});
