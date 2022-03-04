
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

			if (index === 0) {

				row.cells['Geb.'].textContent = 'Geb.';
				row.cells['Pos'].textContent = 'Pos';
				row.cells['Skill'].textContent = 'Skillschn.';

				Object.keys(Position).forEach(pos => {
					row.cells[pos].style.width = '3.5em';
				});
				
			} else {
				
				let player = data.team.youthPlayers[index - 1];
					
				row.cells['Geb.'].textContent = player.birthday;
				row.cells['Pos'].textContent = player.pos;
			}

			row.insertBefore(row.cells['Pos'], row.cells[0]);
			row.insertBefore(row.cells['Geb.'], row.cells[0]);
			row.insertBefore(newAgeColumn, row.cells[0]);

			row.removeChild(oldAgeColumn);
		
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
				row.cells[row.cells['Pos'].textContent].classList.add(STYLE_PRIMARY);
				cell.classList.remove(STYLE_FORECAST);
				if (player.active) {
					cell.classList.remove(STYLE_INACTIVE);
				} else {
					cell.classList.add(STYLE_INACTIVE);
				}
			});

			if (player.active && !current) {
				row.cells['Alter'].classList.add(STYLE_FORECAST);
				row.cells['Skill'].classList.add(STYLE_FORECAST);
				Object.keys(Position).forEach(pos => {
					row.cells[pos].classList.add(STYLE_FORECAST);
				});
			}

		});
	}
}

