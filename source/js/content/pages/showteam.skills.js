
class ShowteamSkillsPage extends Page {
	
	constructor() {

		super('Einzelskills', 'showteam.php', new Page.Param('s', 2));

		this.headers = ['#', 'Name', 'Land', 'U', 'SCH', 'BAK', 'KOB', 'ZWK', 'DEC', 'GES', 'FUQ', 'ERF', 'AGG', 'PAS', 'AUS', 'UEB', 'WID', 'SEL', 'DIS', 'ZUV', 'EIN'];
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		data.currentTeam = Object.assign(new Team(), data.currentTeam);

		HtmlUtil.getTableRowsByHeaderAndFooter(doc, ...this.headers).forEach(row => {
	
			let id = HtmlUtil.extractIdFromHref(row.cells[1].firstChild.href);
			let player = data.currentTeam.getSquadPlayer(id); 
	
			player.pos = row.cells[0].className;
			
			Object.keys(player.skills).forEach((skillname, s) => {
				player.skills[skillname] = +row.cells[4 + s].textContent;
			});
		});
	
	}
	
	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		data.currentTeam = Object.assign(new Team(), data.currentTeam);

		let table = HtmlUtil.getTableByHeader(doc, ...this.headers);
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
				let player = data.currentTeam.getSquadPlayer(id);
					
				cellAge.textContent = player.age;
				cellBirthday.textContent = player.birthday;
				cellFlag.innerHTML = "<img src=\"images/flaggen/" + player.countryCode + ".gif\"\/>";
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
		
		HtmlUtil.appendScript(doc,'sortables_init();');
	};
}

Page.register(new ShowteamSkillsPage());
