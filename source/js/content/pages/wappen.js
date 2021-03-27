
Page.Wappen = new Page('Wappen', 'wappen.php');

Page.Wappen.extract = (doc, data) => {
		
	let teamNameSpan = doc.querySelector('div > span[style*=red]');

	if (data.currentTeamName !== teamNameSpan.textContent) {
		data.initialized = false;
		data.team = undefined;
		data.currentTeamName = teamNameSpan.textContent;
	}

};
