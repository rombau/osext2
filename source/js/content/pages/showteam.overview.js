
Page.ShowteamOverview = new Page('Teamübersicht', 'showteam.php', new Page.Param('s', 0, true));

Page.ShowteamOverview.HEADERS = ['#', 'Nr.', 'Name', 'Alter', 'Pos', 'Auf', '', 'Land', 'U', 'MOR', 'FIT', 'Skillschnitt', 'Opt.Skill', 'S', 'Sperre', 'Verl.', 'T', 'TS'];

Page.ShowteamOverview.extract = (doc, data) => {

	let matches = /images\/wappen\/((\d+)\.(png|gif))/gm.exec(doc.querySelector('img[src*=wappen]').src);

	data.team = Object.assign(new Team(), data.team);
	data.team.id = +matches[2];
	data.team.image = matches[1];
	
	matches = /([\w|\s]+)\s-\s(\d)\.\s\Liga\s(\w+)/.exec(doc.getElementsByTagName('b')[0].textContent);
	
	data.team.name = matches[1];
	
	data.team.league = data.team.league || new League();
	data.team.league.level = +matches[2];
	data.team.league.country = matches[3];
	
	let requiredPages = [];
	
	new HtmlUtil(doc).getTableRowsByHeaderAndFooter(...Page.ShowteamOverview.HEADERS).forEach(row => {

		let id = HtmlUtil.extractIdFromHref(row.cells[2].firstChild.href);
		let player = data.team.getSquadPlayer(id); 

		player.nr = +row.cells[0].textContent;
		player.name = row.cells[2].textContent;
		player.age = +row.cells[3].textContent;
		player.pos = row.cells[4].textContent;
		player.country = row.cells[7].textContent;
		player.uefa = row.cells[8].textContent ? false : true;
		player.moral = +row.cells[9].textContent;
		player.fitness = +row.cells[10].textContent;
		player.banned = row.cells[14].textContent !== '0' ? row.cells[14].textContent : undefined;
		player.injured = row.cells[15].textContent !== '0' ? +row.cells[14].textContent : undefined;
		player.state = row.cells[16].textContent !== '0' ? row.cells[16].textContent : undefined;
		player.locked = row.cells[17].textContent !== '0' ? row.cells[17].textContent : undefined;
		
		if (!player.birthday) {
			requiredPages.push({url: Page.ShowPlayer.createUrl({s: player.id}), name: player.name});
		}
	});
	
	return requiredPages;
};

Page.ShowteamOverview.extend = (doc, data) => {

	data.team = Object.assign(new Team(), data.team);

	let htmlUtil = new HtmlUtil(doc);
	let table = htmlUtil.getTableByHeader(...Page.ShowteamOverview.HEADERS);

	/** @type {HTMLTableElement} */
	let tableClone = table.cloneNode(true);

	Array.from(tableClone.rows).forEach((row, i) => {
						
		/** @type {HTMLTableCellElement} */ let cellBirthday = row.cells[0].cloneNode(true);
		/** @type {HTMLTableCellElement} */ let cellP = row.cells[0].cloneNode(true);
		/** @type {HTMLTableCellElement} */ let cellN = row.cells[0].cloneNode(true);
		/** @type {HTMLTableCellElement} */ let cellU = row.cells[0].cloneNode(true);

		cellBirthday.style.textAlign = 'left';
		
		cellP.style.width = '45px';
		
		cellP.style.textAlign = 'right';
		cellN.style.textAlign = 'right';
		cellU.style.textAlign = 'right';
		
		if (i === 0 || i == (tableClone.rows.length - 1)) {

			row.cells[5].textContent = 'Auf';
			row.cells[9].textContent = 'Mor';
			row.cells[10].textContent = 'Fit';
            row.cells[11].textContent = 'Skillschn.';
			row.cells[14].textContent = 'Sp.';

			cellBirthday.innerHTML = 'Geb.';
			
			cellP.innerHTML = '&Oslash;P';
			cellN.innerHTML = '&Oslash;N';
			cellU.innerHTML = '&Oslash;U';

		} else {

			row.cells[12].style.fontWeight = 'bold';
			
			let id = HtmlUtil.extractIdFromHref(row.cells[2].firstChild.href);
			let player = data.team.getSquadPlayer(id); 
				
			cellBirthday.textContent = player.birthday;
			
			cellP.textContent = player.getAverage(player.getPrimarySkills()).toFixed(2);
			cellN.textContent = player.getAverage(player.getSecondarySkills()).toFixed(2);
			cellU.textContent = player.getAverage(player.getUnchangeableSkills()).toFixed(2);
		}

		row.insertBefore(cellBirthday, row.cells[4]);
		row.appendChild(cellP);			
		row.appendChild(cellN);			
		row.appendChild(cellU);			
		
	});
	
	table.parentNode.replaceChild(tableClone, table);
	
	htmlUtil.appendScript('sortables_init();');
};
