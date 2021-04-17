
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
			player.pos = player.pos || row.cells[4].textContent;
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
				player.loan = player.loan || new SquadPlayer.Loan(matches[1], matches[2], +matches[3]);
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
			
			if (player.active) {

				row.cells[3].textContent = player.age;
				row.cells[4].textContent = player.birthday;
				row.cells[5].textContent = player.pos;

				row.cells[6].textContent = (player.posLastMatch != undefined ? player.posLastMatch : '');
				row.cells[10].textContent = (player.moral != undefined ? player.moral : '');
				row.cells[11].textContent = (player.fitness != undefined  ? player.fitness : '');

				row.cells[16].textContent = player.injured;
				
				if (player.loan) {
					Object.setPrototypeOf(player.loan, SquadPlayer.Loan.prototype);
					row.cells[18].innerHTML = `<abbr title="${player.loan.getText(true)}">${player.loan.getText()}</abbr>`;
					if (player.loan.fee > 0) row.cells[5].textContent = 'LEI';
				} else {
					row.cells[18].textContent = player.transferLock;
				}

			} else {

				row.cells[3].textContent = '';
				row.cells[4].textContent = '';
				row.cells[5].textContent = '';
				row.cells[6].textContent = '';
				row.cells[10].textContent = '';
				row.cells[11].textContent = '';
				row.cells[16].textContent = '';
				row.cells[18].textContent = '';
			}

			// styling
			Array.from(row.cells).forEach((cell, i) => {
				if ((+cell.textContent === 0 || cell.textContent === TransferState.NORMAL) && i > 11) {
					cell.className = 'BAK';
				} else if (player.loan && player.loan.fee > 0) {
					cell.className = 'LEI';
				} else {
					cell.className = player.pos;
				}
				if (player.active) {
					if (!current && (i === 3 || i === 16 || i === 18)) {
						cell.classList.add(STYLE_FORECAST);
					}
				} else {
					cell.classList.add(STYLE_INACTIVE);
				}
			});

		});
	}
}
