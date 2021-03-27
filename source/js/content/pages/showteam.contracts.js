
Page.ShowteamContracts = new Page('Verträge', 'showteam.php', new Page.Param('s', 1));

Page.ShowteamContracts.HEADERS = ['#', 'Nr.', 'Name', 'Alter', 'Pos', '', 'Land', 'U', 'Skillschnitt', 'Opt.Skill', 'Vertrag', 'Monatsgehalt', 'Spielerwert', 'TS'];  

Page.ShowteamContracts.extract = (doc, data) => {

	data.team = Object.assign(new Team(), data.team);
	
	new HtmlUtil(doc).getTableRowsByHeaderAndFooter(...Page.ShowteamContracts.HEADERS).forEach(row => {

		let id = HtmlUtil.extractIdFromHref(row.cells[2].firstChild.href);
		let player = data.team.getSquadPlayer(id); 
		
		player.contract = +row.cells[10].textContent;
		player.salary = +row.cells[11].textContent.replace(/\./g, '');
		player.value = +row.cells[12].textContent.replace(/\./g, '');

	});

};

Page.ShowteamContracts.extend = (doc, data) => {

};
