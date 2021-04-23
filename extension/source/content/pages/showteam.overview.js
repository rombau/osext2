
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
	
			player.name = row.cells['Name'].textContent;
			player.age = +row.cells['Alter'].textContent;
			player.pos = player.pos || row.cells['Pos'].textContent;
			player.posLastMatch = row.cells['Auf'].textContent;
			player.countryCode = row.cells['Land'].textContent;
			player.countryName = row.cells['Land'].firstChild.title;
			player.uefa = row.cells['U'].textContent ? false : true;
			player.moral = +row.cells['MOR'].textContent;
			player.fitness = +row.cells['FIT'].textContent;
			player.injured = +row.cells['Verl.'].textContent;
			player.transferState = row.cells['T'].textContent;

			let transferLockCell = row.cells['TS'];
			if (transferLockCell.textContent.charAt(0) === 'L') {
				let matches = /Leihgabe von (.+) an (.+) für (\d+) ZATs/gm.exec(transferLockCell.firstChild.title);
				player.loan = player.loan || new SquadPlayer.Loan(matches[1], matches[2], +matches[3]);
				player.transferLock = +transferLockCell.textContent.substring(1);
			} else {
				player.transferLock = +transferLockCell.textContent;
			}
			
			let banCell = row.cells['Sperre'];
			if (banCell.textContent.length > 1) {
				player.bans = [];
				banCell.textContent.split(' ').forEach(shortForm => {
					let type = Object.values(BanType).find((banType) => banType.abbr === shortForm.slice(-1));
					let duration = +shortForm.slice(0, -1); 
					player.bans.push(new SquadPlayer.Ban(type, duration));
				});
			}
			
		});
	}
	
	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		data.currentTeam = Object.assign(new Team(), data.currentTeam);

		this.table = HtmlUtil.getTableByHeader(doc, ...ShowteamOverviewPage.HEADERS);

		Array.from(this.table.rows).forEach((row, i) => {
							
			row.cells['Geb.'] = row.cells['#'].cloneNode(true);
			row.cells['&Oslash;P'] = row.cells['Nr.'].cloneNode(true);
			row.cells['&Oslash;N'] = row.cells['Nr.'].cloneNode(true);
			row.cells['&Oslash;U'] = row.cells['Nr.'].cloneNode(true);
			
			row.cells['&Oslash;P'].style.width = '45px';
			
			if (i === 0 || i == (this.table.rows.length - 1)) {
	
				row.cells['MOR'].textContent = 'Mor';
				row.cells['FIT'].textContent = 'Fit';
				row.cells['Skillschnitt'].textContent = 'Skillschn.';
				row.cells['Sperre'].textContent = 'Sp.';
	
				row.cells['Geb.'].innerHTML = 'Geb.';
				row.cells['&Oslash;P'].innerHTML = '&Oslash;P';
				row.cells['&Oslash;N'].innerHTML = '&Oslash;N';
				row.cells['&Oslash;U'].innerHTML = '&Oslash;U';
	
			} else {
	
				row.cells['Opt.Skill'].classList.add(STYLE_PRIMARY);
				
				let id = HtmlUtil.extractIdFromHref(row.cells[2].firstChild.href);
				let player = data.currentTeam.getSquadPlayer(id); 
					
				row.cells['Geb.'].textContent = player.birthday;
				
				row.cells['&Oslash;P'].textContent = player.getAverage(player.getPrimarySkills()).toFixed(2);
				row.cells['&Oslash;N'].textContent = player.getAverage(player.getSecondarySkills()).toFixed(2);
				row.cells['&Oslash;U'].textContent = player.getAverage(player.getUnchangeableSkills()).toFixed(2);
			}

			row.insertBefore(row.cells['Geb.'], row.cells['Pos']);

			row.appendChild(row.cells['&Oslash;P']);			
			row.appendChild(row.cells['&Oslash;N']);			
			row.appendChild(row.cells['&Oslash;U']);			
			
		});
		
		this.table.parentNode.insertBefore(this.createToolbar(doc, data), this.table);

		HtmlUtil.appendScript(doc, 'sortables_init();');
	}

	/**
	 * @param {Team} team
	 * @param {Boolean} current indicating the current team
	 */
	updateWithTeam (team, current) {

		Array.from(this.table.rows).slice(1, -1).forEach(row => {

			let id = HtmlUtil.extractIdFromHref(row.cells[2].firstChild.href);
			let player = team.getSquadPlayer(id);
			
			if (player.active) {

				row.cells['Alter'].textContent = player.age;
				row.cells['Geb.'].textContent = player.birthday;
				row.cells['Pos'].textContent = player.pos;

				row.cells['Auf'].textContent = (player.posLastMatch != undefined ? player.posLastMatch : '');
				row.cells['MOR'].textContent = (player.moral != undefined ? player.moral : '');
				row.cells['FIT'].textContent = (player.fitness != undefined  ? player.fitness : '');

				row.cells['Opt.Skill'].textContent = player.getOpti().toFixed(2);

				if (player.bans) {
					let banText = '';
					player.bans.forEach(ban => {
						banText += ` <abbr title="${ban.duration.toString()} ${ban.duration === 1 ? ban.type.description : ban.type.descriptionPlural}">${ban.duration.toString()}${ban.type.abbr}</abbr>`;
					});
					row.cells['Sperre'].innerHTML = banText;
				}

				row.cells['Verl.'].textContent = player.injured;
				
				if (player.loan) {
					Object.setPrototypeOf(player.loan, SquadPlayer.Loan.prototype);
					row.cells['TS'].innerHTML = `<abbr title="Leihgabe von ${player.loan.from} an ${player.loan.to} für ${player.loan.duration} ZATs">L${player.loan.duration.toString()}</abbr>`;
					if (player.loan.fee > 0) row.cells['Pos'].textContent = 'LEI';
				} else {
					row.cells['TS'].textContent = player.transferLock;
				}

			} else {

				row.cells['Alter'].textContent = '';
				row.cells['Geb.'].textContent = '';
				row.cells['Pos'].textContent = '';
				row.cells['Auf'].textContent = '';
				row.cells['MOR'].textContent = '';
				row.cells['FIT'].textContent = '';
				row.cells['Sperre'].textContent = '';
				row.cells['Verl.'].textContent = '';
				row.cells['TS'].textContent = '';
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
				if (!player.active) {
					cell.classList.add(STYLE_INACTIVE);
				}
			});

			row.cells['Opt.Skill'].classList.add(STYLE_PRIMARY);

			if (player.active && !current) {
				row.cells['Alter'].classList.add(STYLE_FORECAST);
				row.cells['Sperre'].classList.add(STYLE_FORECAST);
				row.cells['Verl.'].classList.add(STYLE_FORECAST);
				row.cells['TS'].classList.add(STYLE_FORECAST);
			}
		});
	}
}
