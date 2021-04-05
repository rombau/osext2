describe('Initialization', () => {
	
	let data = new ExtensionData();
	let queue = new RequestQueue();
	let frame;
	
	beforeEach(() => {
		data = new ExtensionData();
		data.initialized = false;
		queue = new RequestQueue();
		frame = document.getElementById(RequestQueue.FRAME_ID);
		spyOn(chrome.runtime, 'sendMessage').and.callFake((_message, callback) => {
			if (callback) callback(data);
		});
	});

    afterEach(() => {
    	frame.parentNode.removeChild(frame);
    });
    
	xit('should run after login', (done) => {

		let mainPage = new ShowteamOverviewPage()
		let overviewPage = new ShowteamOverviewPage()
		let skillsPage = new ShowteamSkillsPage()
		
		queue.addPage(overviewPage);
		queue.addPage(skillsPage);

		Fixture.getDocument('haupt.php', doc => {
			frame.onload = () => {
				frame.onload = () => {
					overviewPage.process(frame.contentDocument, queue, frame.contentWindow);
					expect(data.initialized).toBeTruthy();
					done();
				};				
				skillsPage.process(frame.contentDocument, queue, frame.contentWindow);
			};
			new WappenPage().process(doc, queue);
		});
	});

});

