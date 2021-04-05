describe('Request queue', () => {
	
	let doc, queue, frame;
	
	beforeEach(() => {
		doc = Fixture.createDocument('');
		queue = new RequestQueue(doc);
		frame = doc.getElementById(RequestQueue.FRAME_ID);
	});

    afterEach(() => {
    	frame.parentNode.removeChild(frame);
    });
    
	it('should be created with hidden iframe', () => {
		
		expect(queue.doc).toEqual(doc);
		expect(queue.pages.length).toEqual(0);
		expect(queue.frame).not.toBeNull();
		expect(queue.frame.id).toEqual(RequestQueue.FRAME_ID);
		expect(queue.frame.src).toEqual('about:blank');
		expect(queue.frame.style.display).toEqual('none');
		expect(queue.frame.readyAfterLoad).toBeDefined();
	});

	it('should request pages', () => {
		
		queue.addPage(new WappenPage());
		queue.addPage(new ShowteamOverviewPage());
		queue.addPage(new ShowteamSkillsPage());
		
		expect(queue.pages.length).toEqual(3);
		expect(queue.status).toBeUndefined();
		
		queue.start(new ShowteamOverviewPage());
		
		expect(queue.status.style.display).toEqual('block');
		
		expect(queue.pages.length).toEqual(2);
		expect(queue.status.textContent).toEqual('Initialisiere Wappen ...');

		queue.frame.readyAfterLoad();

		expect(queue.pages.length).toEqual(0);
		expect(queue.status.textContent).toEqual('Initialisiere Einzelskills ...');

		queue.frame.readyAfterLoad([{url: new ShowPlayerPage().createUrl({s: 1}), name: 'Hugo'}]);

		expect(queue.pages.length).toEqual(0);
		expect(queue.status.textContent).toEqual('Initialisiere Hugo ...');

		queue.frame.readyAfterLoad();

		expect(queue.status.style.display).toEqual('none');
		
	});

});
