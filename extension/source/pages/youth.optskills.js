
Page.YouthOptskills = class extends Page.Youth {
	
	constructor() {

		super('Jugend-Optis', 'ju.php', new Page.Param('page', 3));

		/** @type {HTMLTableElement} */
		this.table;
	}
	
	static HEADERS = ['|Land', 'U', 'Alter', 'Skill', 'TOR', 'ABW', 'DMI', 'MIT', 'OMI', 'STU'];
		
	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		this.table = HtmlUtil.getTableByHeader(doc, ...Page.YouthOptskills.HEADERS);
		
		this.table.classList.add(STYLE_YOUTH);

		Array.from(this.table.rows)
			.filter(row => !this.handleYearHeader(row))
			.forEach((row, index) => {

			let oldAgeColumn = row.cells['Alter'];
			let newAgeColumn = oldAgeColumn.cloneNode(true);
			row.cells['Alter'] = newAgeColumn;

			row.cells['Geb.'] = row.cells['Alter'].cloneNode(true);
			row.cells['Pos'] = row.cells['Alter'].cloneNode(true);

			row.cells['TOR'].style.setProperty('padding-left', '2em', 'important');

			// pull information
			row.cells['Pull'] = row.cells['Alter'].cloneNode(true);
			row.cells['Pull'].style.textAlign = 'left';
			row.cells['Pull'].style.width = '6.5em';
			row.cells['Pull'].style.setProperty('padding-left', '1em', 'important');

			let player = index > 0 ? data.team.youthPlayers[index - 1] : null;

			// pull columns by position
			Object.keys(Position).forEach(pos => {
				row.cells['Pull' + pos] = row.cells[pos].cloneNode(true);
				row.cells['Pull' + pos].style.textAlign = 'left';
				row.cells['Pull' + pos].style.width = '1em';
				row.cells['Pull' + pos].textContent = '';
				
				if (index === 0) {
					row.cells['Pull' + pos].textContent = '';
				} else if ((pos === Position.TOR) == (player.pos === Position.TOR)) {
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
					});
					row.cells['Pull' + pos].classList.add(STYLE_SET_ZAT);
					row.cells['Pull' + pos].appendChild(setButton);
				}
				row.insertBefore(row.cells['Pull' + pos], row.cells[pos].nextElementSibling);	
			});

			if (index === 0) {
				row.cells['Geb.'].textContent = 'Geb.';
				row.cells['Pos'].textContent = 'Pos';
				row.cells['Skill'].textContent = 'Skillschn.';
				row.cells['Pull'].textContent = 'Zieh-Info';
			} else {			
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
					player.pullMatchDay = undefined;
					player.pullPosition = undefined;
					player.pullContractTerm = undefined;
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
				pullContractSpan.style.float = 'right';
				pullContractSpan.classList.add(STYLE_SET_CONTRACT);
				if (player.pullContractTerm) {
					pullContractSpan.textContent = player.pullContractTerm;
				}

				row.cells['Pull'].classList.add(STYLE_SET_ZAT);

				row.cells['Pull'].appendChild(removeButton);
				row.cells['Pull'].appendChild(pullContractSpan);
				row.cells['Pull'].appendChild(pullDaySpan);
			}

			row.insertBefore(row.cells['Pos'], row.cells[0]);
			row.insertBefore(row.cells['Geb.'], row.cells[0]);
			row.insertBefore(newAgeColumn, row.cells[0]);

			row.removeChild(oldAgeColumn);

			row.appendChild(row.cells['Pull']);		
		});
		
		this.table.parentNode.insertBefore(this.createToolbar(doc, data), this.table);
	};

	/**
	 * @param {Team} team
	 * @param {Boolean} current indicating the current team
	 * @param {MatchDay} matchDay
	 */
	updateWithTeam (team, current, matchDay) {

		Array.from(this.table.rows)
			.filter(row => this.isPlayerRow(row))
			.slice(1)
			.forEach((row, index) => {
			
			let player = team.youthPlayers[index];
		
			row.cells['Alter'].textContent = player.age;
			
			if (player.active) {
				
				row.cells['Alter'].textContent = player.age;
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
				if (player.pos) row.cells[player.pos].classList.add(STYLE_PRIMARY);
				cell.classList.remove(STYLE_FORECAST);
				if (player.active) {
					cell.classList.remove(STYLE_INACTIVE);
				} else {
					cell.classList.add(STYLE_INACTIVE);
				}
			});
			
			Object.keys(Position).forEach(pos => {
				if (matchDay) {
					row.cells['Pull'].classList.remove(STYLE_HIDDEN);
					row.cells['Pull' + pos].classList.remove(STYLE_HIDDEN);
				} else {
					row.cells['Pull'].classList.add(STYLE_HIDDEN);
					row.cells['Pull' + pos].classList.add(STYLE_HIDDEN);
				}
				row.cells['Pull' + pos].classList.remove(STYLE_ADD);
			});
			
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

	};

	_addPullClass (player, row, leagueLevel) {
		let pullMatchDay = player.origin ? player.origin.pullMatchDay : player.pullMatchDay;
		if (!pullMatchDay && player.age >= (YOUTH_AGE_MAX - leagueLevel + 1)) {
			this._handlePosition(player, pos => {
				row.cells['Pull' + pos].classList.add(STYLE_ADD);
			});
		}
	};

	_handlePosition (player, callback) {
		Object.keys(Position).forEach(pos => {
			if ((pos === Position.TOR) == (player.pos === Position.TOR)) {
				callback(pos);
			}
		});
	}
}

