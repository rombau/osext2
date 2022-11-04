
Page.ShowteamSkills = class extends Page.Showteam {

	constructor() {

		super('Einzelskills', 'showteam.php', new Page.Param('s', 2));

		/** @type {HTMLTableElement} */
		this.table;
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		this.table = new ManagedTable(this.name,
			new Column('#').withStyle('text-align','left'),
			new Column('Name'),
			new Column('Alter', Origin.Extension),
			new Column('Geb.', Origin.Extension).withHeader('Geb.', 'Geburtstag').withStyle('text-align','left'),
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

		this.table.rows.slice(1, -1).forEach(row => {

			let id = HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href);
			let player = data.team.getSquadPlayer(id);

			Object.keys(player.skills).forEach(skillname => {
				player.skills[skillname] = +row.cells[skillname.toUpperCase()].textContent;
			});
		});

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

		this.table.rows.slice(1, -1).forEach(row => {

			row.cells['Opt.Skill'].classList.add(STYLE_PRIMARY);

			let id = HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href);
			let player = data.team.getSquadPlayer(id);

			let flagImage = doc.createElement('img');
			flagImage.src = `images/flaggen/${player.countryCode}.gif`;

			row.cells['Land'].replaceChildren(flagImage, ' ', row.cells['Land'].firstChild);
		});

		this.table.parentNode.insertBefore(this.createToolbar(doc, data), this.table.container);

		HtmlUtil.appendScript(doc, 'sortables_init();');
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

				row.cells['Alter'].textContent = player.age;
				row.cells['Geb.'].textContent = player.birthday;

				Object.keys(player.skills).forEach(skillname => {
					row.cells[skillname.toUpperCase()].textContent = player.skills[skillname];
				});

				row.cells['Skillschn.'].textContent = player.getSkillAverage().toFixed(2);
				row.cells['Opt.Skill'].textContent = player.getOpti().toFixed(2);

			} else {

				row.cells['Alter'].textContent = '';
				row.cells['Geb.'].textContent = '';

				Object.keys(player.skills).forEach((skillname) => {
					row.cells[skillname.toUpperCase()].textContent = '';
				});

				row.cells['Skillschn.'].textContent = '';
				row.cells['Opt.Skill'].textContent = '';
			}

			// styling
			Array.from(row.cells).forEach(cell => {
				cell.classList.remove('BAK');
				cell.classList.remove('LEI');
				cell.classList.remove(STYLE_FORECAST);
				if (player.loan && player.loan.duration > 0 && player.loan.fee > 0) {
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
				row.cells['Skillschn.'].classList.add(STYLE_FORECAST);
				row.cells['Opt.Skill'].classList.add(STYLE_FORECAST);

				Object.keys(player.skills).forEach(skillname => {
					row.cells[skillname.toUpperCase()].classList.add(STYLE_FORECAST);
				});
			}
		});

		this.table.styleUnknownColumns(!current);
	}
}

