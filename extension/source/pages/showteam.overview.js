
Page.ShowteamOverview = class extends Page.Showteam {

	constructor() {

		super('Teamübersicht', 'showteam.php', new Page.Param('s', 0, true));

		/** @type {HTMLTableElement} */
		this.table;

		this.showExactAge = false;
	}

	static HEADERS = ['#', 'Nr.', 'Name', 'Alter', 'Pos', 'Auf', '', 'Land', 'U', 'MOR', 'FIT', 'Skillschnitt', 'Opt.Skill', 'S', 'Sperre', 'Verl.', 'T', 'TS'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		let currentPlayerIds = [];

		HtmlUtil.getTableRowsByHeaderAndFooter(doc, ...Page.ShowteamOverview.HEADERS).forEach(row => {

			let id = HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href);
			currentPlayerIds.push(id);

			let player = data.team.getSquadPlayer(id);

			this.showExactAge = row.cells['Alter'].textContent.includes('.');

			player.name = row.cells['Name'].textContent;
			player.age = Math.floor(+row.cells['Alter'].textContent);
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
				player.loan.duration = +matches[3];
				player.transferLock = +transferLockCell.textContent.substring(1);
			} else {
				player.loan = null;
				player.transferLock = +transferLockCell.textContent;
			}

			player.bans = [];
			let banCell = row.cells['Sperre'];
			if (banCell.textContent.length > 1) {
				banCell.textContent.split(' ').forEach(shortForm => {
					let type = Object.values(BanType).find((banType) => banType.abbr === shortForm.slice(-1));
					let duration = +shortForm.slice(0, -1);
					player.bans.push(new SquadPlayer.Ban(type, duration));
				});
			}
		});

		// remove all no longer existing players
		data.team.squadPlayers = data.team.squadPlayers.filter(player => currentPlayerIds.includes(player.id));

		// initialize new players
		if (data.team.squadPlayerAdded) {
			data.requestSquadPlayerPages();
		}
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		this.table = HtmlUtil.getTableByHeader(doc, ...Page.ShowteamOverview.HEADERS);

		Array.from(this.table.rows).forEach((row, i) => {

			if (!this.showExactAge) row.cells['Geb.'] = row.cells['Name'].cloneNode(true);

			row.cells['&Oslash;P'] = row.cells['Alter'].cloneNode(true);
			row.cells['&Oslash;N'] = row.cells['Alter'].cloneNode(true);
			row.cells['&Oslash;U'] = row.cells['Alter'].cloneNode(true);


			if (i === 0 || i == (this.table.rows.length - 1)) {

				row.cells['Auf'].style.width = '2em';
				row.cells['TS'].style.width = '1.9em';
				row.cells['&Oslash;P'].style.width = '3.5em';
				row.cells['&Oslash;N'].style.width = '3.5em';
				row.cells['&Oslash;U'].style.width = '3.5em';

				row.cells['MOR'].textContent = 'Mor';
				row.cells['FIT'].textContent = 'Fit';
				row.cells['Skillschnitt'].textContent = 'Skillschn.';
				row.cells['Sperre'].textContent = 'Sp.';

				if (!this.showExactAge) row.cells['Geb.'].textContent = 'Geb.';
				row.cells['&Oslash;P'].innerHTML = '&Oslash;P'; row.cells['&Oslash;P'].title = 'Durchschnitt Primärskills';
				row.cells['&Oslash;N'].innerHTML = '&Oslash;N'; row.cells['&Oslash;N'].title = 'Durchschnitt Nebenkills';
				row.cells['&Oslash;U'].innerHTML = '&Oslash;U'; row.cells['&Oslash;U'].title = 'Durchschnitt unveränderliche Skills';

			} else {

				let id = HtmlUtil.extractIdFromHref(row.cells[2].firstChild.href);
				let player = data.team.getSquadPlayer(id);

				if (!this.showExactAge) row.cells['Geb.'].textContent = player.birthday;

				row.cells['&Oslash;P'].textContent = player.getSkillAverage(player.getPrimarySkills()).toFixed(2);
				row.cells['&Oslash;N'].textContent = player.getSkillAverage(player.getSecondarySkills()).toFixed(2);
				row.cells['&Oslash;U'].textContent = player.getSkillAverage(player.getUnchangeableSkills()).toFixed(2);
			}

			if (!this.showExactAge) row.insertBefore(row.cells['Geb.'], row.cells['Pos']);

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

				if (this.showExactAge) {
					row.cells['Alter'].textContent = '';
					row.cells['Alter'].appendChild(
						HtmlUtil.createAbbreviation(`ZAT ${player.birthday}`, player.ageExact.toFixed(2)));
				} else {
					row.cells['Alter'].textContent = player.age;
					row.cells['Geb.'].textContent = player.birthday;
				}
				row.cells['Pos'].textContent = player.pos;

				row.cells['Auf'].textContent = player.posLastMatch || '';
				row.cells['MOR'].textContent = player.moral || (current ? '0' : '');
				row.cells['FIT'].textContent = player.fitness || (current ? '0' : '');

				row.cells['Skillschnitt'].textContent = player.getSkillAverage().toFixed(2);
				row.cells['Opt.Skill'].textContent = player.getOpti().toFixed(2);

				row.cells['S'].textContent = '';
				player.getSpecialSkills().forEach(special => {
					row.cells['S'].appendChild(
						HtmlUtil.createAbbreviation(special.description, special.abbr));
				});

				row.cells['&Oslash;P'].textContent = player.getSkillAverage(player.getPrimarySkills()).toFixed(2);
				row.cells['&Oslash;N'].textContent = player.getSkillAverage(player.getSecondarySkills()).toFixed(2);
				row.cells['&Oslash;U'].textContent = player.getSkillAverage(player.getUnchangeableSkills()).toFixed(2);

				if (player.bans) {
					row.cells['Sperre'].textContent = '';
					player.bans.forEach(ban => {
						let banAbbr = HtmlUtil.createAbbreviation(
							`${ban.duration.toString()} ${ban.duration === 1 ? ban.type.description : ban.type.descriptionPlural}`,
							`${ban.duration.toString()}${ban.type.abbr}`);
						row.cells['Sperre'].appendChild(banAbbr);
					});
				}

				row.cells['Verl.'].textContent = player.injured;

				if (player.loan && player.loan.duration > 0) {
					row.cells['TS'].textContent = '';
					row.cells['TS'].appendChild(HtmlUtil.createAbbreviation(`Leihgabe von ${player.loan.from} an ${player.loan.to} für ${player.loan.duration} ZATs`, `L${player.loan.duration}`));
					if (player.loan.fee > 0) row.cells['Pos'].textContent = 'LEI';
				} else {
					row.cells['TS'].textContent = player.transferLock;
				}

			} else {

				row.cells['Alter'].textContent = '';
				if (!this.showExactAge) row.cells['Geb.'].textContent = '';
				row.cells['Pos'].textContent = '';
				row.cells['Auf'].textContent = '';
				row.cells['MOR'].textContent = '';
				row.cells['FIT'].textContent = '';
				row.cells['Sperre'].textContent = '';
				row.cells['Verl.'].textContent = '';
				row.cells['TS'].textContent = '';

				row.cells['Skillschnitt'].textContent = '';
				row.cells['Opt.Skill'].textContent = '';

				row.cells['S'].textContent = '';

				row.cells['&Oslash;P'].textContent = '';
				row.cells['&Oslash;N'].textContent = '';
				row.cells['&Oslash;U'].textContent = '';
			}

			// styling
			Array.from(row.cells).forEach((cell, i) => {
				cell.classList.remove('BAK');
				cell.classList.remove('LEI');
				cell.classList.remove(STYLE_FORECAST);
				if ((+cell.textContent === 0 || cell.textContent === TransferState.NORMAL) && i > 11) {
					cell.classList.add('BAK');
				} else if (player.loan && player.loan.duration > 0 && player.loan.fee > 0) {
					cell.classList.add('LEI');
				} else {
					cell.classList.add(player.pos);
				}
				if (player.active) {
					cell.classList.remove(STYLE_INACTIVE);
				} else {
					cell.classList.add(STYLE_INACTIVE);
				}
			});

			row.cells['Opt.Skill'].classList.add(STYLE_PRIMARY);

			if (player.active && !current) {
				row.cells['Alter'].classList.add(STYLE_FORECAST);
				row.cells['Sperre'].classList.add(STYLE_FORECAST);
				row.cells['Verl.'].classList.add(STYLE_FORECAST);
				row.cells['TS'].classList.add(STYLE_FORECAST);
				row.cells['Skillschnitt'].classList.add(STYLE_FORECAST);
				row.cells['Opt.Skill'].classList.add(STYLE_FORECAST);
				row.cells['S'].classList.add(STYLE_FORECAST);
				row.cells['&Oslash;P'].classList.add(STYLE_FORECAST);
				row.cells['&Oslash;N'].classList.add(STYLE_FORECAST);
				row.cells['&Oslash;U'].classList.add(STYLE_FORECAST);
			}
		});
	}
}
