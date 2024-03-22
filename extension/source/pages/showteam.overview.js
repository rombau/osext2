
Page.ShowteamOverview = class extends Page.Showteam {

	constructor () {

		super('Teamübersicht', 'showteam.php', new Page.Param('s', 0, true));

		this.showExactAge = false;
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract (doc, data) {

		this.table = new ManagedTable(this.name,
			new Column('#').withStyle('text-align', 'left'),
			new Column('Nr.'),
			new Column('Name'),
			new Column('Alter'),
			new Column('Geb.', Origin.Extension).withHeader('Geb.', 'Geburtstag').withStyle('text-align', 'left'),
			new Column('Pos'),
			new Column('Auf').withStyle('width', '2.5em').withStyle('text-align', 'left'),
			new Column('Land').withStyle('text-align', 'left'),
			new Column('U'),
			new Column('MOR').withHeader('Mor'),
			new Column('FIT').withHeader('Fit'),
			new Column('Skillschnitt').withHeader('Skillschn.'),
			new Column('Opt.Skill'),
			new Column('S'),
			new Column('Sperre').withHeader('Sp.', 'Sperre'),
			new Column('Verl.'),
			new Column('T'),
			new Column('TS').withStyle('width', '1.9em'),
			new Column('ØP', Origin.Extension).withHeader('ØP', 'Durchschnitt Primärskills').withStyle('width', '3.5em'),
			new Column('ØN', Origin.Extension).withHeader('ØN', 'Durchschnitt Nebenskills').withStyle('width', '3.5em'),
			new Column('ØU', Origin.Extension).withHeader('ØU', 'Durchschnitt unveränderliche Skills').withStyle('width', '3.5em'),
			new Column('EQ19', Origin.Extension).withHeader('EQ19', 'Qualität / Potential / Talent').withStyle('width', '3.5em')
		);

		this.table.initialize(doc);

		let currentPlayerIds = [];
		let newLoanedPlayer = false;

		this.table.rows.slice(1, -1).forEach(row => {

			let id = HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href);
			currentPlayerIds.push(id);

			let player = data.team.getSquadPlayer(id);

			this.showExactAge = row.cells['Alter'].textContent.includes('.');

			player.name = row.cells['Name'].textContent;
			player.age = Math.floor(+row.cells['Alter'].textContent);
			player.pos = player.pos || row.cells['Pos'].textContent;
			player.posLastMatch = row.cells['Auf'].textContent;
			player.countryCode = row.cells['Land'].textContent.trim();
			player.countryName = row.cells['Land'].lastChild.title;
			player.uefa = row.cells['U'].textContent ? false : true;
			player.moral = +row.cells['MOR'].textContent;
			player.fitness = +row.cells['FIT'].textContent;
			player.injured = +row.cells['Verl.'].textContent;
			player.transferState = row.cells['T'].textContent;

			let transferLockCell = row.cells['TS'];
			if (transferLockCell.textContent.charAt(0) === 'L') {
				let matches = /Leihgabe von (.+) an (.+) für (\d+) ZATs/gm.exec(transferLockCell.firstChild.title);
				if (!player.loan) {
					player.loan = new SquadPlayer.Loan(matches[1], matches[2], +matches[3]);
					newLoanedPlayer = true;
				}
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
		if (data.team.squadPlayerAdded || newLoanedPlayer) {
			data.requestSquadPlayerPages();
		}
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend (doc, data) {

		doc.getElementsByTagName('div')[0].classList.add(STYLE_TEAM);

		this.table.parentNode.insertBefore(this.createToolbar(doc, data), this.table.container);
	}

	/**
	 * @param {Team} team
	 * @param {Boolean} current indicating the current team
	 */
	updateWithTeam (team, current) {

		this.table.rows.slice(1, -1).forEach(row => {

			let id = HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href);
			let player = team.getSquadPlayer(id);

			if (player.active) {

				if (this.showExactAge) {
					row.cells['Alter'].textContent = player.ageExact.toFixed(2);
				} else {
					row.cells['Alter'].textContent = player.age;
				}
				row.cells['Geb.'].textContent = player.birthday;
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

				row.cells['ØP'].textContent = player.getSkillAverage(player.getPrimarySkills()).toFixed(2);
				row.cells['ØN'].textContent = player.getSkillAverage(player.getSecondarySkills()).toFixed(2);
				row.cells['ØU'].textContent = player.getSkillAverage(player.getUnchangeableSkills()).toFixed(2);

				row.cells['EQ19'].textContent = player.getPotential().toFixed(0);

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
				row.cells['Geb.'].textContent = '';
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

				row.cells['ØP'].textContent = '';
				row.cells['ØN'].textContent = '';
				row.cells['ØU'].textContent = '';

				row.cells['EQ19'].textContent = '';
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
				row.cells['ØP'].classList.add(STYLE_FORECAST);
				row.cells['ØN'].classList.add(STYLE_FORECAST);
				row.cells['ØU'].classList.add(STYLE_FORECAST);
				row.cells['EQ19'].classList.add(STYLE_FORECAST);
			}
		});

		this.table.styleUnknownColumns(!current);
	}
}
