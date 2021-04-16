
class ShowteamOverviewPage extends ShowteamPage {
	
	constructor() {

		super('Teamübersicht', 'showteam.php', new Page.Param('s', 0, true));

		/** @type {HTMLTableElement} */
		this.table;
	}

	static HEADERS = ['#', 'Nr.', 'Name', 'Alter', 'Pos', 'Auf', '', 'Land', 'U', 'MOR', 'FIT', 'Skillschnitt', 'Opt.Skill', 'S', 'Sperre', 'Verl.', 'T', 'TS'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		data.currentTeam = Object.assign(new Team(), data.currentTeam);
		
		HtmlUtil.getTableRowsByHeaderAndFooter(doc, ...ShowteamOverviewPage.HEADERS).forEach(row => {
	
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
			player.injured = +row.cells[15].textContent;
			player.transferState = row.cells[16].textContent;

			let transferLockCell = row.cells[17];
			if (transferLockCell.textContent.charAt(0) === 'L') {
				let matches = /Leihgabe von (.+) an (.+) für (\d+) ZATs/gm.exec(transferLockCell.firstChild.title);
				player.loan = new SquadPlayer.Loan(matches[1], matches[2], +matches[3]);
				player.transferLock = +transferLockCell.textContent.substring(1);
			} else {
				player.transferLock = +transferLockCell.textContent;
			}
			
			let banCell = row.cells[14];
			if (banCell.textContent.length > 1) {
				banCell.textContent.split(' ').forEach(shortForm => player.bans.push(new SquadPlayer.Ban(shortForm)));
			}
			
		});
	}
	
	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		data.currentTeam = Object.assign(new Team(), data.currentTeam);

		let table = HtmlUtil.getTableByHeader(doc, ...ShowteamOverviewPage.HEADERS);
	
		this.table = table.cloneNode(true);

		Array.from(this.table.rows).forEach((row, i) => {
							
			/** @type {HTMLTableCellElement} */ let cellBirthday = row.cells[0].cloneNode(true);
			/** @type {HTMLTableCellElement} */ let cellP = row.cells[0].cloneNode(true);
			/** @type {HTMLTableCellElement} */ let cellN = row.cells[0].cloneNode(true);
			/** @type {HTMLTableCellElement} */ let cellU = row.cells[0].cloneNode(true);
	
			cellBirthday.style.textAlign = 'left';
			
			cellP.style.width = '45px';
			
			cellP.style.textAlign = 'right';
			cellN.style.textAlign = 'right';
			cellU.style.textAlign = 'right';
			
			if (i === 0 || i == (this.table.rows.length - 1)) {
	
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
		
		table.parentNode.replaceChild(this.table, table);
		
		this.table.parentNode.insertBefore(this.createToolbar(doc, data), this.table);

		HtmlUtil.appendScript(doc, 'sortables_init();');
	}

	/**
	 * @param {Document} doc
	 * @param {Team} team
	 * @param {Boolean} current
	 */
	updateWithTeam (doc, team, current) {

		Array.from(this.table.rows).slice(1, -1).forEach(row => {

			let id = HtmlUtil.extractIdFromHref(row.cells[2].firstChild.href);
			let player = team.getSquadPlayer(id);
			
			row.cells[3].textContent = player.age;

			row.cells[10].textContent = (player.moral ? player.moral : '');
			row.cells[11].textContent = (player.fitness ? player.fitness : '');

			row.cells[16].textContent = player.injured;
			
			// TODO: combine transferLock with loan
			row.cells[18].textContent = player.transferLock;

			if (current) {
				row.cells[3].classList.remove(STYLE_FORECAST);
				row.cells[16].classList.remove(STYLE_FORECAST);
				row.cells[18].classList.remove(STYLE_FORECAST);
			} else {
				row.cells[3].classList.add(STYLE_FORECAST);
				row.cells[16].classList.add(STYLE_FORECAST);
				row.cells[18].classList.add(STYLE_FORECAST);
			}

			Array.from(row.cells).forEach(cell => {
				if (+cell.textContent === 0) {
					cell.classList.add(STYLE_ZERO);
				} else {
					cell.classList.remove(STYLE_ZERO);
				}
			});

		});
	}
}
