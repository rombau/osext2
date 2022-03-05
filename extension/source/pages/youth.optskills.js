
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

			// pull information
			row.cells['Pull'] = row.cells['Alter'].cloneNode(true);
			row.cells['Pull'].style.textAlign = 'left';
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
				} else if ((pos === Position.TOR && player.pos === Position.TOR) || (pos !== Position.TOR && player.pos !== Position.TOR)) {
					let setButton = doc.createElement('i');
					setButton.classList.add('fas');
					setButton.classList.add('fa-level-up-alt');
					setButton.addEventListener('click', (event) => {
						let viewMatchday = data.viewSettings.youthPlayerMatchDay;
						row.cells['Pull'].lastChild.textContent = `${viewMatchday.season}/${viewMatchday.zat}`;
						player.pullMatchDay = new MatchDay(viewMatchday.season, viewMatchday.zat);
						player.pullPosition = pos;
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
				row.cells['Pull'].textContent = 'Ziehtermin';
			} else {			
				row.cells['Geb.'].textContent = player.birthday;
				row.cells['Pos'].textContent = player.pos;
				row.cells['Pull'].textContent = '';

				let removeButton = doc.createElement('i');
				removeButton.title = 'Termin entfernen';
				removeButton.classList.add('fas');
				removeButton.classList.add('fa-trash-alt');
				removeButton.addEventListener('click', (event) => {
					let cell = event.target.parentNode;
					let viewMatchday = ensurePrototype(data.viewSettings.youthPlayerMatchDay, MatchDay);
					cell.classList.remove(STYLE_DELETE);
					if (!data.lastMatchDay.equals(viewMatchday) && player.age >= (YOUTH_AGE_MAX - data.team.league.level + 1)) { // is adding possible?
						Object.keys(Position).forEach(pos => {
							if ((pos === Position.TOR && player.pos === Position.TOR) || (pos !== Position.TOR && player.pos !== Position.TOR)) {
								row.cells['Pull' + pos].classList.add(STYLE_ADD);
							}
						});
					}
					player.pullMatchDay = undefined;
					player.pullPosition = undefined;

					let matchDayTeam = data.team.getForecast(data.lastMatchDay, viewMatchday);
					this.updateWithTeam(matchDayTeam, false, viewMatchday);
				});

				let pullSpan = doc.createElement('span');
				if (player.pullMatchDay) {
					pullSpan.textContent = `${player.pullMatchDay.season}/${player.pullMatchDay.zat}`;
					row.cells['Pull'].classList.add(STYLE_DELETE);
				}

				row.cells['Pull'].classList.add(STYLE_SET_ZAT);

				row.cells['Pull'].appendChild(removeButton);
				row.cells['Pull'].appendChild(pullSpan);
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

				if (player.pos === Position.TOR) {
					row.cells['TOR'].textContent = player.getOpti().toFixed(2);
				} else {
					Object.keys(Position).filter(pos => pos !== Position.TOR).forEach(pos => {
						row.cells[pos].textContent = player.getOpti(pos).toFixed(2);
					})
				}
				
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
			row.cells['Pull'].classList.remove(STYLE_DELETE);

			if (player.active && !current) {
				row.cells['Alter'].classList.add(STYLE_FORECAST);
				row.cells['Skill'].classList.add(STYLE_FORECAST);
				Object.keys(Position).forEach(pos => {
					row.cells[pos].classList.add(STYLE_FORECAST);
				});
				if (!player.origin.pullMatchDay && player.age >= (YOUTH_AGE_MAX - team.origin.league.level + 1)) {
					Object.keys(Position).forEach(pos => {
						if ((pos === Position.TOR && player.pos === Position.TOR) || (pos !== Position.TOR && player.pos !== Position.TOR)) {
							row.cells['Pull' + pos].classList.add(STYLE_ADD);
						}
					});
				}
			}
			if ((player.origin && player.origin.pullMatchDay) || player.pullMatchDay) {
				row.cells['Pull'].classList.add(STYLE_DELETE);
			}

		});
	}
}

