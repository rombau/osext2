
Page.YouthSkills = class extends Page.Youth {

	constructor() {

		super('Jugendeinzelskills', 'ju.php', new Page.Param('page', 2));

		/** @type {HTMLTableElement} */
		this.table;
	}

	static HEADERS = ['|Land|', 'U', 'Alter', 'SCH', 'BAK', 'KOB', 'ZWK', 'DEC', 'GES', 'FUQ', 'ERF', 'AGG', 'PAS', 'AUS', 'UEB', 'WID', 'SEL', 'DIS', 'ZUV', 'EIN'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		HtmlUtil.getTableRowsByHeader(doc, ...Page.YouthSkills.HEADERS)
			.filter(row => this.isPlayerRow(row)).forEach((row, index) => {

			let player = data.team.youthPlayers[index];
			if (!player) {
				player = new YouthPlayer();
			}
			data.team.youthPlayers[index] = player;

			Object.keys(player.skills).forEach((skillname, s) => {
				player.skills[skillname] = +ScriptUtil.getOriginalCellContent(row.cells[skillname.toUpperCase()]);
			});
		});
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		this.table = HtmlUtil.getTableByHeader(doc, ...Page.YouthSkills.HEADERS);

		this.table.classList.add(STYLE_YOUTH);

		Array.from(this.table.rows)
			.filter(row => !this.handleYearHeader(row))
			.forEach((row, index) => {

			let oldAgeColumn = row.cells['Alter'];
			let newAgeColumn = oldAgeColumn.cloneNode(true);
			row.cells['Alter'] = newAgeColumn;

			row.cells['Geb.'] = row.cells['Alter'].cloneNode(true);
			row.cells['Pos'] = row.cells['Alter'].cloneNode(true);
			row.cells['Skillschn.'] = row.cells['Alter'].cloneNode(true);
			row.cells['Opt.Skill'] = row.cells['Alter'].cloneNode(true);

			row.cells['Skillschn.'].style.paddingLeft = '10px';

			if (index === 0) {

				row.cells['Geb.'].textContent = 'Geb.';
				row.cells['Pos'].textContent = 'Pos';
				row.cells['Skillschn.'].textContent = 'Skillschn.';
				row.cells['Opt.Skill'].textContent = 'Opt.Skill';

			} else {

				row.cells['Opt.Skill'].classList.add(STYLE_PRIMARY);

				let player = data.team.youthPlayers[index - 1];

				row.cells['Geb.'].textContent = player.birthday;
				row.cells['Pos'].textContent = (player.age >= YOUTH_AGE_MIN && player.getSkillAverage(player.getSecondarySkills()) > 0 ? player.pos : '');
				row.cells['Skillschn.'].textContent = player.getSkillAverage().toFixed(2);
				row.cells['Opt.Skill'].textContent = (row.cells['Pos'].textContent ? player.getOpti().toFixed(2) : '');
			}

			row.insertBefore(row.cells['Pos'], row.cells[0]);
			row.insertBefore(row.cells['Geb.'], row.cells[0]);
			row.insertBefore(newAgeColumn, row.cells[0]);

			row.appendChild(row.cells['Skillschn.']);
			row.appendChild(row.cells['Opt.Skill']);

			row.removeChild(oldAgeColumn);

		});

		this.table.parentNode.insertBefore(this.createToolbar(doc, data), this.table);
	}

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

			row.cells['Alter'].textContent = row.cells['Alter'].textContent.includes('.') ? player.ageExact.toFixed(2) : player.age;

			if (player.active) {

				row.cells['Geb.'].textContent = player.birthday;

				Object.keys(player.skills).forEach((skillname, s) => {
					row.cells[skillname.toUpperCase()].textContent = player.skills[skillname];
				});

				row.cells['Skillschn.'].textContent = player.getSkillAverage().toFixed(2);
				row.cells['Opt.Skill'].textContent = (row.cells['Pos'].textContent ? player.getOpti().toFixed(2) : '')

			} else {

				Object.keys(player.skills).forEach((skillname, s) => {
					row.cells[skillname.toUpperCase()].textContent = '';
				});

				row.cells['Skillschn.'].textContent = '';
				row.cells['Opt.Skill'].textContent = '';
			}

			// styling
			Array.from(row.cells).forEach((cell) => {
				let pos = row.cells['Pos'].textContent;
				if (!Object.keys(Position).includes(cell.className) && pos) {
					cell.classList.add(pos);
				}
				cell.classList.remove(STYLE_FORECAST);
				if (player.active) {
					cell.classList.remove(STYLE_INACTIVE);
				} else {
					cell.classList.add(STYLE_INACTIVE);
				}
			});

			row.cells['Opt.Skill'].classList.add(STYLE_PRIMARY);

			if (player.active && !current) {
				row.cells['Alter'].classList.add(STYLE_FORECAST);
				row.cells['Skillschn.'].classList.add(STYLE_FORECAST);
				row.cells['Opt.Skill'].classList.add(STYLE_FORECAST);
				Object.keys(player.skills).forEach((skillname, s) => {
					row.cells[skillname.toUpperCase()].classList.add(STYLE_FORECAST);
				});
			}
			Object.keys(player.getPrimarySkills()).forEach((skillname, s) => {
				row.cells[skillname.toUpperCase()].classList.add(STYLE_PRIMARY);
			});
		});
	}
}

