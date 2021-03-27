
Page.LeagueTable = new Page('Ligatabelle', 'lt.php');

Page.LeagueTable.extract = (doc, data) => {
	let queue = new RequestQueue(doc);
	queue.addPage(Page.StSkills, {c: 3});
	queue.addPage(Page.StSkills, {c: 4});
	queue.addPage(Page.StSkills, {c: 5});
	return queue.start((doc, data) => {
		this.extend(doc, data);
	});
};
	
Page.LeagueTable.extend = (doc, data) => {
		
};