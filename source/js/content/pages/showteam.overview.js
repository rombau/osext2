
class ShowteamOverviewPage extends Page {
	
	constructor() {

		super('Teamübersicht', 'showteam.php', new Page.Param('s', 0, true));

		this.headers = ['#', 'Nr.', 'Name', 'Alter', 'Pos', 'Auf', '', 'Land', 'U', 'MOR', 'FIT', 'Skillschnitt', 'Opt.Skill', 'S', 'Sperre', 'Verl.', 'T', 'TS'];
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		data.currentTeam = Object.assign(new Team(), data.currentTeam);
		
		HtmlUtil.getTableRowsByHeaderAndFooter(doc, ...this.headers).forEach(row => {
	
			let id = HtmlUtil.extractIdFromHref(row.cells[2].firstChild.href);
			let player = data.currentTeam.getSquadPlayer(id); 
	
			player.nr = +row.cells[0].textContent;
			player.name = row.cells[2].textContent;
			player.age = +row.cells[3].textContent;
			player.pos = row.cells[4].textContent;
			player.countryCode = row.cells[7].textContent;
			player.countryName = row.cells[7].firstChild.title;
			player.uefa = row.cells[8].textContent ? false : true;
			player.moral = +row.cells[9].textContent;
			player.fitness = +row.cells[10].textContent;
			player.injured = row.cells[15].textContent !== '0' ? +row.cells[14].textContent : undefined;
			player.transferState = row.cells[16].textContent;
			player.transferLock = row.cells[17].textContent !== '0' ? row.cells[17].textContent : undefined;
			
			// TODO: extract bans and loans ...
			
		});
	}
	
	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		data.currentTeam = Object.assign(new Team(), data.currentTeam);

		let table = HtmlUtil.getTableByHeader(doc, ...this.headers);
	
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
				let player = data.currentTeam.getSquadPlayer(id); 
					
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
		
		HtmlUtil.appendScript(doc, 'sortables_init();');
	
	};
}

Page.register(new ShowteamOverviewPage());
