describe('Initialization', () => {
	
	let data, queue, frame;
	
	beforeEach(() => {
		data = { initialized: false };
		queue = new RequestQueue();
		frame = document.getElementById(RequestQueue.FRAME_ID);
		spyOn(chrome.runtime, 'sendMessage').and.callFake((message, callback) => {
			if (callback) callback(data);
		});
	});

    afterEach(() => {
    	frame.parentNode.removeChild(frame);
    });
    
	xit('should run after login', (done) => {

		queue.addPage(Page.ShowteamOverview);
		queue.addPage(Page.ShowteamSkills);

		Fixture.getDocument('haupt.php', doc => {
			frame.onload = () => {
				frame.onload = () => {
					Page.ShowteamSkills.process(frame.contentDocument, queue, frame.contentWindow);
					expect(data.initialized).toBeTruthy();
					done();
				};				
				Page.ShowteamOverview.process(frame.contentDocument, queue, frame.contentWindow);
			};
			Page.Haupt.process(doc, queue);
		});
	});

});

