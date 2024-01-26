
Page.YouthSkills = class extends Page.Youth {

	constructor() {

		super('Jugendeinzelskills', 'ju.php', new Page.Param('page', 2));

	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		let index = 0;

		let oldYouthTeamFingerprint = data.team.pageYouthPlayers.map(p => p.getFingerPrint()).join();

		this.table = this.table || new ManagedTable(this.name,
			new Column('Alter'),
			new Column('Geb.', Origin.Extension).withHeader('Geb.', 'Geburtstag').withStyle('text-align','left'),
			new Column('Pos', Origin.Extension),
			new Column('Land').withStyle('text-align','left'),
			new Column('U'),
			new Column('SCH'),
			new Column('BAK'),
			new Column('KOB'),
			new Column('ZWK'),
			new Column('DEC'),
			new Column('GES'),
			new Column('FUQ'),
			new Column('ERF'),
			new Column('AGG'),
			new Column('PAS'),
			new Column('AUS'),
			new Column('UEB'),
			new Column('WID'),
			new Column('SEL'),
			new Column('DIS'),
			new Column('ZUV'),
			new Column('EIN'),
			new Column('Skillschn.', Origin.Extension).withStyle('padding-left','0.6em', true),
			new Column('Opt.Skill', Origin.Extension).withStyle('padding-right','0.6em', true)
		);

		this.table.initialize(doc);

		this.table.rows.slice(1).filter(row => this.isPlayerRow(row)).forEach(row => {

			let player = data.team.pageYouthPlayers[index] || new YouthPlayer();
			
			Object.keys(player.skills).forEach((skillname, s) => {
				player.skills[skillname] = +ScriptUtil.getCellContent(row.cells[skillname.toUpperCase()], true);
			});

			data.team.pageYouthPlayers[index] = player;
			index++;
		});

		data.team.pageYouthPlayers.splice(index);

		let newYouthTeamFingerprint = data.team.pageYouthPlayers.map(p => p.getFingerPrint()).join();

		if (newYouthTeamFingerprint != oldYouthTeamFingerprint) {
			data.pagesToRequest.push(new Page.YouthOverview());
		} else if (!data.pagesToRequest.find(pageToRequest => new Page.YouthOverview().equals(pageToRequest))) {
			data.team.syncYouthPlayers();
		}
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		this.table.classList.add(STYLE_YOUTH);

		this.table.rows.slice(1).forEach(row => this.handleYearHeader(row));

		this.table.parentNode.insertBefore(this.createToolbar(doc, data), this.table.container);
	}

	/**
	 * @param {Team} team
	 * @param {Boolean} current indicating the current team
	 * @param {MatchDay} matchDay
	 */
	updateWithTeam (team, current, matchDay) {

		this.table.rows.slice(1).filter(row => this.isPlayerRow(row)).forEach((row, index) => {

			let player = team.youthPlayers[index];

			row.cells['Alter'].textContent = row.cells['Alter'].textContent.includes('.') ? player.ageExact.toFixed(2) : player.age;

			if (player.active) {

				row.cells['Geb.'].textContent = player.birthday;
				row.cells['Pos'].textContent = ((player.age >= YOUTH_AGE_MIN && player.getAverageIncreasePerDay(1) > 0) || player.pos === Position.TOR) ? player.pos : '';

				Object.keys(player.skills).forEach(skillname => {
					row.cells[skillname.toUpperCase()].textContent = player.skills[skillname];
				});

				row.cells['Skillschn.'].textContent = player.getSkillAverage().toFixed(2);
				row.cells['Opt.Skill'].textContent = (player.age >= YOUTH_AGE_MIN) ? player.getOpti().toFixed(2) : '';

			} else {

				Object.keys(player.skills).forEach(skillname => {
					row.cells[skillname.toUpperCase()].textContent = '';
				});

				row.cells['Skillschn.'].textContent = '';
				row.cells['Opt.Skill'].textContent = '';
			}

			// styling
			Array.from(row.cells).forEach(cell => {
				Object.keys(Position).forEach(pos => cell.classList.remove(pos));
				let pos = row.cells['Pos'].textContent;
				if (pos && !cell.style.color) {
					cell.classList.add(pos);
				}
				cell.classList.remove(STYLE_FORECAST);
				if (player.active) {
					cell.classList.remove(STYLE_INACTIVE);
				} else {
					cell.classList.add(STYLE_INACTIVE);
				}
			});

			row.cells['U'].className = 'STU';
			row.cells['Opt.Skill'].classList.add(STYLE_PRIMARY);

			if (player.active && !current) {
				row.cells['Alter'].classList.add(STYLE_FORECAST);
				row.cells['Skillschn.'].classList.add(STYLE_FORECAST);
				row.cells['Opt.Skill'].classList.add(STYLE_FORECAST);
				Object.keys(player.skills).forEach((skillname, s) => {
					row.cells[skillname.toUpperCase()].classList.add(STYLE_FORECAST);
				});
			}
			Object.keys(player.getPrimarySkills()).forEach(skillname => {
				row.cells[skillname.toUpperCase()].classList.add(STYLE_PRIMARY);
			});
		});

		this.table.styleUnknownColumns(!current);
	}
}

