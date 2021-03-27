
Page.ShowteamSkills = new Page('Einzelskills', 'showteam.php', new Page.Param('s', 2));

Page.ShowteamSkills.HEADERS = ['#', 'Name', 'Land', 'U', 'SCH', 'BAK', 'KOB', 'ZWK', 'DEC', 'GES', 'FUQ', 'ERF', 'AGG', 'PAS', 'AUS', 'UEB', 'WID', 'SEL', 'DIS', 'ZUV', 'EIN'];

Page.ShowteamSkills.extract = (doc, data) => {

	data.team = Object.assign(new Team(), data.team);

	new HtmlUtil(doc).getTableRowsByHeaderAndFooter(...Page.ShowteamSkills.HEADERS).forEach(row => {

		let id = HtmlUtil.extractIdFromHref(row.cells[1].firstChild.href);
		let player = data.team.getSquadPlayer(id); 

		player.pos = row.cells[0].className;
		
		Object.keys(player.skills).forEach((skillname, s) => {
			player.skills[skillname] = +row.cells[4 + s].textContent;
		});
	});
};

Page.ShowteamSkills.extend = (doc, data) => {

	data.team = Object.assign(new Team(), data.team);

	let util = new HtmlUtil(doc);
	let table = util.getTableByHeader(...Page.ShowteamSkills.HEADERS);
	let tableClone = table.cloneNode(true);

	Array.from(tableClone.rows).forEach((row, i) => {
				
		let cellAge = row.cells[0].cloneNode(true);
		let cellBirthday = row.cells[0].cloneNode(true);
		let cellFlag = row.cells[0].cloneNode(true);
		let cellAverage = row.cells[0].cloneNode(true);
		let cellOpti = row.cells[0].cloneNode(true);

		cellBirthday.style.textAlign = 'left';
		cellAverage.style.paddingLeft = '10px';
		
		if (i === 0 || i == (tableClone.rows.length - 1)) {

			cellAge.innerHTML = 'Alter';
			cellBirthday.innerHTML = 'Geb.';
			cellAverage.innerHTML = 'Skillschn.';
			cellOpti.innerHTML = 'Opt.Skill';

			row.cells[2].colSpan = 2;
			
			let cellDummy = row.cells[0].cloneNode(true);
			cellDummy.width = 0;
			cellDummy.textContent = '';
			row.insertBefore(cellDummy, row.cells[2]);
			
		} else {

			cellOpti.style.fontWeight = 'bold';
			
			let id = HtmlUtil.extractIdFromHref(row.cells[1].firstChild.href);
			let player = data.team.getSquadPlayer(id);
				
			cellAge.textContent = player.age;
			cellBirthday.textContent = player.birthday;
			cellFlag.innerHTML = "<img src=\"images/flaggen/" + player.country + ".gif\"\/>";
			cellAverage.textContent = player.getAverage().toFixed(2);
			cellOpti.textContent = player.getOpti().toFixed(2);

			cellBirthday.colSpan = 2;
			
			row.insertBefore(cellFlag, row.cells[2]);
		}

		row.insertBefore(cellAge, row.cells[2]);
		row.insertBefore(cellBirthday, row.cells[3]);
		row.appendChild(cellAverage);			
		row.appendChild(cellOpti);			
		
	});
	
	table.parentNode.replaceChild(tableClone, table);
	
	util.appendScript('sortables_init();');
};
