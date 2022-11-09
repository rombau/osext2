
Page.YouthOverview = class extends Page.Youth {

	constructor() {

		super('Jugendübersicht', 'ju.php', new Page.Param('page', 1, true));

	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		this.params[0].value = 1; // to ensure the correct value for this param

		if (!this.getPullId(doc)) {

			let index = 0;
			let season = 0;

			let oldYouthTeamFingerprint = data.team.pageYouthPlayers.map(p => p.getFingerPrint()).join();

			this.table = this.table || new ManagedTable(this.name,
				new Column('Alter'),
				new Column('Geb.').withStyle('text-align','left'),
				new Column('Pos', Origin.Extension),
				new Column('Land').withStyle('text-align','left').withStyle('padding-left','0.5em', true),
				new Column('U'),
				new Column('Skillschnitt').withHeader('Skillschn.'),
				new Column('Opt.Skill', Origin.Extension).withStyle('padding-right','0.5em', true),
				new Column('Talent').withStyle('width','4.5em'),
				new Column('Aktion'),
				new Column('Aufwertung').withStyle('width','9em'),
				new Column('Ø/Zat', Origin.Extension).withHeader('Ø/Zat', 'Durchschnittliche Aufwertungen pro Zat'),
				new Column('Marktwert', Origin.Extension).withStyle('width','6em').withStyle('text-align','right'),
				new Column('ØP', Origin.Extension).withHeader('ØP', 'Durchschnitt Primärskills').withStyle('width','3.5em').withStyle('text-align','right'),
				new Column('ØN', Origin.Extension).withHeader('ØN', 'Durchschnitt Nebenskills').withStyle('width','3.5em').withStyle('text-align','right'),
				new Column('ØU', Origin.Extension).withHeader('ØU', 'Durchschnitt unveränderliche Skills').withStyle('width','3.5em').withStyle('text-align','right')
			);

			this.table.initialize(doc);

			this.table.rows.slice(1).forEach(row => {

				if (this.isYearHeaderRow(row)) {

					let matches = /Jahrgang Saison (\d+)/gm.exec(row.textContent);
					if (matches) {
						season = +matches[1];
					}

				} else if (this.isPlayerRow(row)) {

					let player = data.team.pageYouthPlayers[index] || new YouthPlayer();

					player.season = season;

					let pullInput = row.cells['Aktion'].lastChild;
					player.pullId = pullInput ? +pullInput.value : undefined;

					player.age = Math.floor(+row.cells['Alter'].textContent);
					player.birthday = +row.cells['Geb.'].textContent;

					if (row.cells['Alter'].className == Position.TOR) {
						player.pos = Position.TOR;
					} else {
						player.pos = undefined;
					}

					player.countryCode = row.cells['Land'].textContent.trim();
					player.countryName = row.cells['Land'].lastChild.title;
					player.uefa = row.cells['U'].textContent ? false : true;

					player.talent = row.cells['Talent'].textContent;
					player.increase = row.cells['Aufwertung'].textContent;

					data.team.pageYouthPlayers[index] = player;
					index++;
				}
			});

			data.team.pageYouthPlayers.splice(index);

			let newYouthTeamFingerprint = data.team.pageYouthPlayers.map(p => p.getFingerPrint()).join();

			if (newYouthTeamFingerprint != oldYouthTeamFingerprint) {
				data.pagesToRequest.push(new Page.YouthSkills());
			} else if (!data.pagesToRequest.find(pageToRequest => new Page.YouthSkills().equals(pageToRequest))) {
				data.team.syncYouthPlayers();
			}
		}
	}

	/**
	 * Returns the internal id of the player taken from the hidden pull input value,
	 * or null if the input is not present (overview page).
	 *
	 * @param {Document} doc
	 * @returns {Number}
	 */
	getPullId(doc) {

		let pullInput = doc.querySelector('input[name="ziehmich"][type="hidden"]');
		return pullInput ? +pullInput.value : null;
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		if (!this.getPullId(doc)) {

			doc.getElementsByTagName('div')[0].classList.add(STYLE_YOUTH);

			// remove the remark
			let element = doc.getElementsByTagName('table')[0].nextSibling;
			while (element.nodeName.toLowerCase() != 'form' && element.nodeName.toLowerCase() != 'div') {
				let next = element.nextSibling;
				element.parentNode.removeChild(element);
				element = next;
			}

			this.table.classList.add(STYLE_YOUTH);

			this.table.rows.forEach(row => this.handleYearHeader(row));

			let form = doc.querySelector('form');
			form.parentNode.insertBefore(this.createToolbar(doc, data), form);
		}
	}

	/**
	 * @param {Team} team
	 * @param {Boolean} current indicating the current team
	 */
	updateWithTeam (team, current, matchDay) {

		this.table.rows.filter(row => this.isPlayerRow(row)).slice(1).forEach((row, index) => {

			let player = team.youthPlayers[index];

			row.cells['Alter'].textContent = row.cells['Alter'].textContent.includes('.') ? player.ageExact.toFixed(2) : player.age;

			if (player.active) {
				row.cells['Geb.'].textContent = player.birthday;
				row.cells['Pos'].textContent = (player.age >= YOUTH_AGE_MIN 
					&& (player.getSkillAverage(player.getPrimarySkills()) + player.getSkillAverage(player.getSecondarySkills())) > 0 ? player.pos : '');
				row.cells['Talent'].textContent = player.talent;
				row.cells['Skillschnitt'].textContent = player.getSkillAverage().toFixed(2);
				if (row.cells['Pos'].textContent) {
					row.cells['Opt.Skill'].textContent = player.getOpti().toFixed(2);
					row.cells['Marktwert'].textContent = player.getMarketValue().toLocaleString();
					row.cells['ØP'].textContent = player.getSkillAverage(player.getPrimarySkills()).toFixed(2);
					row.cells['ØN'].textContent = player.getSkillAverage(player.getSecondarySkills()).toFixed(2);
					if (current) {
						row.cells['Ø/Zat'].textContent = player.getAverageIncreasePerDay(player.getYouthDays(matchDay)).toFixed(2);
					} else {
						row.cells['Ø/Zat'].textContent = player.averageIncreasePerDay.toFixed(2);
					}
				} else {
					row.cells['Opt.Skill'].textContent = '';
					row.cells['Marktwert'].textContent = '';
					row.cells['ØP'].textContent = '';
					row.cells['ØN'].textContent = '';
					row.cells['Ø/Zat'].textContent = '';
				}
				row.cells['ØU'].textContent = player.getSkillAverage(player.getUnchangeableSkills()).toFixed(2);

			} else {

				row.cells['Talent'].textContent = '';
				row.cells['Skillschnitt'].textContent = '';
				row.cells['Opt.Skill'].textContent = '';
				row.cells['Ø/Zat'].textContent = '';
				row.cells['Marktwert'].textContent = '';
				row.cells['ØP'].textContent = '';
				row.cells['ØN'].textContent = '';
				row.cells['ØU'].textContent = '';
			}

			row.cells['Aktion'].textContent = '';
			if (current) {
				if (player.pullMatchDay && ensurePrototype(player.pullMatchDay, MatchDay).equals(matchDay)) {
					row.cells['Aktion'].appendChild(HtmlUtil.createAwesomeButton(document, 'fa-calendar-check', () => {}, 'Geplante Aktion'));
				}
				if (player.pullId) {
					let pullRadio = document.createElement('input');
					pullRadio.type = 'radio';
					pullRadio.name = 'ziehmich';
					pullRadio.value = player.pullId;
					row.cells['Aktion'].appendChild(pullRadio);
				}
				row.cells['Aufwertung'].textContent = player.increase;
			}
			else {
				row.cells['Aufwertung'].textContent = '';
			}

			// styling
			Array.from(row.cells).forEach((cell) => {
				Object.keys(Position).forEach(pos => cell.classList.remove(pos));
				let pos = row.cells['Pos'].textContent;
				if (pos) {
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
				row.cells['Skillschnitt'].classList.add(STYLE_FORECAST);
				row.cells['Opt.Skill'].classList.add(STYLE_FORECAST);
				row.cells['Ø/Zat'].classList.add(STYLE_FORECAST);
				row.cells['Marktwert'].classList.add(STYLE_FORECAST);
				row.cells['ØP'].classList.add(STYLE_FORECAST);
				row.cells['ØN'].classList.add(STYLE_FORECAST);
				row.cells['ØU'].classList.add(STYLE_FORECAST);
			}
		});

		this.table.styleUnknownColumns(!current);
	}
}
