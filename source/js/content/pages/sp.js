
Page.ShowPlayer = new Page('Spieler', 'sp.php', new Page.Param('s'));

Page.ShowPlayer.extract = (doc, data) => {

	data.team = Object.assign(new Team(), data.team);

	let id = HtmlUtil.extractIdFromHref(doc.querySelector('img[src^=face]').src);
	let player = data.team.getSquadPlayer(id); 

	let tabA = doc.getElementById("a").textContent;
	let matches = tabA.match(/.+Geburtstag\s+:ZAT\s+(\d+)\s+Vertragslaufzeit/);

	player.birthday = +matches[1];
	
};
