
Page.ShowteamSkills = class extends Page.Showteam {
	
	constructor() {

		super('Einzelskills', 'showteam.php', new Page.Param('s', 2));

		/** @type {HTMLTableElement} */
		this.table;
	}
	
	static HEADERS = ['#', 'Name', 'Land', 'U', 'SCH', 'BAK', 'KOB', 'ZWK', 'DEC', 'GES', 'FUQ', 'ERF', 'AGG', 'PAS', 'AUS', 'UEB', 'WID', 'SEL', 'DIS', 'ZUV', 'EIN'];
	
	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		HtmlUtil.getTableRowsByHeaderAndFooter(doc, ...Page.ShowteamSkills.HEADERS).forEach(row => {
	
			let id = HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href);
			let player = data.team.getSquadPlayer(id); 
			
			Object.keys(player.skills).forEach((skillname, s) => {
				player.skills[skillname] = +row.cells[skillname.toUpperCase()].textContent;
			});
		});
	}
	
	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		this.table = HtmlUtil.getTableByHeader(doc, ...Page.ShowteamSkills.HEADERS);

		Array.from(this.table.rows).forEach((row, i) => {
			
			row.cells['Alter'] = row.cells['#'].cloneNode(true);
			row.cells['Geb.'] = row.cells['Name'].cloneNode(true);
			row.cells['Flag'] = row.cells['#'].cloneNode(true);
			row.cells['Skillschn.'] = row.cells['#'].cloneNode(true);
			row.cells['Opt.Skill'] = row.cells['#'].cloneNode(true);

			row.cells['Skillschn.'].style.paddingLeft = '10px';
			
			if (i === 0 || i == (this.table.rows.length - 1)) {

				row.cells['Alter'].innerHTML = 'Alter';
				row.cells['Geb.'].innerHTML = 'Geb.';
				row.cells['Skillschn.'].innerHTML = 'Skillschn.';
				row.cells['Opt.Skill'].innerHTML = 'Opt.Skill';

				row.cells['Land'].colSpan = 2;
				
				let cellDummy = row.cells['#'].cloneNode(true);
				cellDummy.width = 0;
				cellDummy.textContent = '';
				row.insertBefore(cellDummy, row.cells['Land']);
				
			} else {

				row.cells['Opt.Skill'].classList.add(STYLE_PRIMARY);
				
				let id = HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href);
				let player = data.team.getSquadPlayer(id);
					
				row.cells['Alter'].textContent = player.age;
				row.cells['Geb.'].textContent = player.birthday;
				row.cells['Flag'].innerHTML = `<img src="images/flaggen/${player.countryCode}.gif"\/>`;
				row.cells['Skillschn.'].textContent = player.getSkillAverage().toFixed(2);
				row.cells['Opt.Skill'].textContent = player.getOpti().toFixed(2);

				row.cells['Geb.'].colSpan = 2;
				
				row.insertBefore(row.cells['Flag'], row.cells['Land']);
			}

			row.insertBefore(row.cells['Alter'], row.cells[2]);
			row.insertBefore(row.cells['Geb.'], row.cells[3]);
			row.appendChild(row.cells['Skillschn.']);			
			row.appendChild(row.cells['Opt.Skill']);			
		});
		
		this.table.parentNode.insertBefore(this.createToolbar(doc, data), this.table);

		HtmlUtil.appendScript(doc, 'sortables_init();');
	};

	/**
	 * @param {Team} team
	 * @param {Boolean} current indicating the current team
	 */
	updateWithTeam (team, current) {

		Array.from(this.table.rows).slice(1, -1).forEach(row => {

			let id = HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href);
			let player = team.getSquadPlayer(id);
			
			if (player.active) {

				row.cells['Alter'].textContent = player.age;
				row.cells['Geb.'].textContent = player.birthday;

				Object.keys(player.skills).forEach((skillname, s) => {
					row.cells[skillname.toUpperCase()].textContent = player.skills[skillname];
				});

				row.cells['Skillschn.'].textContent = player.getSkillAverage().toFixed(2);
				row.cells['Opt.Skill'].textContent = player.getOpti().toFixed(2);
				
			} else {

				row.cells['Alter'].textContent = '';
				row.cells['Geb.'].textContent = '';

				Object.keys(player.skills).forEach((skillname, s) => {
					row.cells[skillname.toUpperCase()].textContent = '';
				});

				row.cells['Skillschn.'].textContent = '';
				row.cells['Opt.Skill'].textContent = '';
			}

			// styling
			Array.from(row.cells).forEach((cell, i) => {
				if (player.loan && player.loan.fee > 0) {
					cell.classList.add('LEI');
				} else {
					cell.classList.add(player.pos);
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
		});
	}
}

