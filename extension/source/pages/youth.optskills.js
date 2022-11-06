
Page.YouthOptskills = class extends Page.Youth {

	constructor() {

		super('Jugend-Optis', 'ju.php', new Page.Param('page', 3));

	}

	static HEADERS = ['|Land', 'U', 'Alter', 'Skill', 'TOR', 'ABW', 'DMI', 'MIT', 'OMI', 'STU'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		this.table = this.table || new ManagedTable(this.name,
			new Column('Alter'),
			new Column('Geb.', Origin.Extension).withHeader('Geb.', 'Geburtstag').withStyle('text-align','left'),
			new Column('Pos', Origin.Extension),
			new Column('Land').withStyle('text-align','left'),
			new Column('U'),
			new Column('Skill').withHeader('Skillschn.'),
			new Column('TOR').withStyle('padding-left', '2em', true),
			new Column('PullTOR', Origin.Extension).withHeader('', 'als TOR ziehen').withStyle('text-align','left').withStyle('width','1.1em'),
			new Column('ABW'),
			new Column('PullABW', Origin.Extension).withHeader('', 'als ABW ziehen').withStyle('text-align','left').withStyle('width','1.1em'),
			new Column('DMI'),
			new Column('PullDMI', Origin.Extension).withHeader('', 'als DMI ziehen').withStyle('text-align','left').withStyle('width','1.1em'),
			new Column('MIT'),
			new Column('PullMIT', Origin.Extension).withHeader('', 'als MIT ziehen').withStyle('text-align','left').withStyle('width','1.1em'),
			new Column('OMI'),
			new Column('PullOMI', Origin.Extension).withHeader('', 'als OMI ziehen').withStyle('text-align','left').withStyle('width','1.1em'),
			new Column('STU'),
			new Column('PullSTU', Origin.Extension).withHeader('', 'als STU ziehen').withStyle('text-align','left').withStyle('width','1em'),
			new Column('Pull', Origin.Extension).withHeader('Aktion').withStyle('text-align','left').withStyle('width','6.5em').withStyle('padding-left','1em', true)
		);

		this.table.initialize(doc);

		this.table.classList.add(STYLE_YOUTH);

		this.table.rows.slice(1).filter(row => !this.handleYearHeader(row)).forEach((row, index) => {

			let player = data.team.youthPlayers[index];

			// pull columns by position
			Object.keys(Position).forEach(pos => {
				row.cells['Pull' + pos].textContent = '';
				if ((pos === Position.TOR) == (player.pos === Position.TOR)) {
					let setButton = HtmlUtil.createAwesomeButton(doc, 'fa-level-up-alt', (event) => {
						let viewMatchday = data.viewSettings.youthPlayerMatchDay;
						let daySpan = row.cells['Pull'].lastChild;
						daySpan.textContent = `${viewMatchday.season}/${viewMatchday.zat}`;
						player.pullMatchDay = new MatchDay(viewMatchday.season, viewMatchday.zat);
						player.pullPosition = pos;
						player.pullContractTerm = CONTRACT_LENGTHS[0];
						daySpan.previousSibling.textContent = player.pullContractTerm;
						Persistence.storeExtensionData(data);
						Object.keys(Position).forEach(pos => {
							row.cells['Pull' + pos].classList.remove(STYLE_ADD);
						});
						row.cells['Pull'].classList.add(STYLE_DELETE);
					}, `als ${pos} ziehen`);
					row.cells['Pull' + pos].classList.add(STYLE_SET_ZAT);
					row.cells['Pull' + pos].appendChild(setButton);
				}
			});

			row.cells['Geb.'].textContent = player.birthday;
			row.cells['Pos'].textContent = player.pos;
			row.cells['Pull'].textContent = '';

			let removeButton = HtmlUtil.createAwesomeButton(doc, 'fa-trash-alt', (event) => {
				let cell = event.target.parentNode;
				let viewMatchday = ensurePrototype(data.viewSettings.youthPlayerMatchDay, MatchDay);
				cell.classList.remove(STYLE_DELETE);
				if (!data.lastMatchDay.equals(viewMatchday)) {
					this._addPullClass(player, row, data.team.league.level);
				}
				player.pullMatchDay = null;
				player.pullPosition = null;
				player.pullContractTerm = null;
				Persistence.storeExtensionData(data);
				let matchDayTeam = data.team.getForecast(data.lastMatchDay, viewMatchday);
				this.updateWithTeam(matchDayTeam, false, viewMatchday);
			});

			let pullDaySpan = doc.createElement('span');
			if (player.pullMatchDay) {
				pullDaySpan.textContent = `${player.pullMatchDay.season}/${player.pullMatchDay.zat}`;
				row.cells['Pull'].classList.add(STYLE_DELETE);
			}

			let pullContractSpan = doc.createElement('span');
			pullContractSpan.addEventListener('click', () => {
				player.pullContractTerm = CONTRACT_LENGTHS.find(length => length > player.pullContractTerm);
				if (!player.pullContractTerm) player.pullContractTerm = CONTRACT_LENGTHS[0];
				Persistence.storeExtensionData(data);
				pullContractSpan.textContent = player.pullContractTerm;
			});
			pullContractSpan.title = 'Vetragslänge';
			pullContractSpan.style.float = 'right';
			pullContractSpan.classList.add(STYLE_SET_CONTRACT);
			if (player.pullContractTerm) {
				pullContractSpan.textContent = player.pullContractTerm;
			}

			row.cells['Pull'].classList.add(STYLE_SET_ZAT);

			row.cells['Pull'].appendChild(removeButton);
			row.cells['Pull'].appendChild(pullContractSpan);
			row.cells['Pull'].appendChild(pullDaySpan);
		});

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
				row.cells['Skill'].textContent = player.getSkillAverage().toFixed(2);

				this._handlePosition(player, pos => {
					row.cells[pos].textContent = player.getOpti(pos).toFixed(2);
				})

			} else {

				row.cells['Skill'].textContent = '';

				Object.keys(Position).forEach(pos => {
					row.cells[pos].textContent = '';
				});
			}

			// styling
			Array.from(row.cells).forEach((cell) => {
				Object.keys(Position).forEach(pos => cell.classList.remove(pos));
				if (player.pos === Position.TOR) cell.classList.add(player.pos);
				cell.classList.remove(STYLE_FORECAST);
				if (player.active) {
					cell.classList.remove(STYLE_INACTIVE);
				} else {
					cell.classList.add(STYLE_INACTIVE);
				}
			});
			
			row.cells['U'].className = 'STU';
			
			Object.keys(Position).forEach(pos => {
				row.cells[pos].classList.add(pos);
				row.cells['Pull' + pos].classList.add(pos);
				if (matchDay) {
					row.cells['Pull'].classList.remove(STYLE_HIDDEN);
					row.cells['Pull' + pos].classList.remove(STYLE_HIDDEN);
				} else if ((pos === Position.TOR) == (player.pos === Position.TOR)) {
					row.cells['Pull'].classList.add(STYLE_HIDDEN);
					row.cells['Pull' + pos].classList.add(STYLE_HIDDEN);
				}
				row.cells['Pull' + pos].classList.remove(STYLE_ADD);
			});

			if (player.pos) row.cells[player.pos].classList.add(STYLE_PRIMARY);

			if ((player.origin && player.origin.pullMatchDay) || player.pullMatchDay) {
				row.cells['Pull'].classList.add(STYLE_DELETE);
			} else {
				row.cells['Pull'].classList.remove(STYLE_DELETE);
			}

			if (player.active && !current) {
				row.cells['Alter'].classList.add(STYLE_FORECAST);
				row.cells['Skill'].classList.add(STYLE_FORECAST);
				Object.keys(Position).forEach(pos => {
					row.cells[pos].classList.add(STYLE_FORECAST);
				});
				this._addPullClass(player, row, team.origin.league.level);
			}

		});

		this.table.styleUnknownColumns(!current);

	}

	_addPullClass (player, row, leagueLevel) {
		let pullMatchDay = player.origin ? player.origin.pullMatchDay : player.pullMatchDay;
		if (!pullMatchDay && player.age >= (YOUTH_AGE_MAX - leagueLevel + 1)) {
			this._handlePosition(player, pos => {
				row.cells['Pull' + pos].classList.add(STYLE_ADD);
			});
		}
	}

	_handlePosition (player, callback) {
		Object.keys(Position).forEach(pos => {
			if ((pos === Position.TOR) == (player.pos === Position.TOR)) {
				callback(pos);
			}
		});
	}
}

