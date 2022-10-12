
Page.YouthOverview = class extends Page.Youth {

	constructor() {

		super('Jugendübersicht', 'ju.php', new Page.Param('page', 1, true));

		/** @type {HTMLTableElement} */
		this.table;
	}

	static HEADERS = ['Alter', 'Geb.', '|Land', 'U', 'Skillschnitt', 'Talent', 'Aktion', 'Aufwertung'];

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

			HtmlUtil.getTableRowsByHeader(doc, ...Page.YouthOverview.HEADERS).forEach((row) => {

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

					player.countryCode = row.cells['Land'].textContent;
					player.countryName = row.cells['Land'].firstChild.title;
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

			this.table = HtmlUtil.getTableByHeader(doc, ...Page.YouthOverview.HEADERS);

			this.table.classList.add(STYLE_YOUTH);

			Array.from(this.table.rows)
				.filter(row => !this.handleYearHeader(row))
				.slice(0, -1)
				.forEach((row, index) => {

				let baseCell = row.cells['Alter'].cloneNode(true);
				baseCell.style.color = null;
				baseCell.style.fontWeight = null;
				baseCell.style.opacity = null;

				row.cells['Pos'] = baseCell;
				row.cells['Opt.Skill'] = baseCell.cloneNode(true);
				row.cells['&Oslash;/Zat'] = baseCell.cloneNode(true);
				row.cells['Marktwert'] = baseCell.cloneNode(true);
				row.cells['&Oslash;P'] = baseCell.cloneNode(true);
				row.cells['&Oslash;N'] = baseCell.cloneNode(true);
				row.cells['&Oslash;U'] = baseCell.cloneNode(true);

				row.cells['&Oslash;P'].style.width = '45px';

				if (index === 0) {

					row.cells['Skillschnitt'].textContent = 'Skillschn.';
					row.cells['Talent'].style.width = '4.5em';
					row.cells['Aufwertung'].style.width = '9em';
					row.cells['Marktwert'].style.width = '6em';
					row.cells['Marktwert'].style.textAlign = 'right';
					row.cells['&Oslash;P'].style.width = '3.5em';
					row.cells['&Oslash;N'].style.width = '3.5em';
					row.cells['&Oslash;U'].style.width = '3.5em';
					row.cells['&Oslash;P'].style.textAlign = 'right';
					row.cells['&Oslash;N'].style.textAlign = 'right';
					row.cells['&Oslash;U'].style.textAlign = 'right';

					row.cells['Pos'].textContent = 'Pos';
					row.cells['Opt.Skill'].textContent = 'Opt.Skill';
					row.cells['&Oslash;/Zat'].innerHTML = '&Oslash;/Zat';
					row.cells['Marktwert'].textContent = 'Marktwert';
					row.cells['&Oslash;P'].innerHTML = '<abbr title="Durchschnitt Primärskills">&Oslash;P</abbr>';
					row.cells['&Oslash;N'].innerHTML = '<abbr title="Durchschnitt Nebenkills">&Oslash;N</abbr>';
					row.cells['&Oslash;U'].innerHTML = '<abbr title="Durchschnitt unveränderliche Skills">&Oslash;U</abbr>';

				} else {

					row.cells['Opt.Skill'].classList.add(STYLE_PRIMARY);

					let player = data.team.youthPlayers[index - 1];

					row.cells['Pos'].textContent = player.pos;
					row.cells['Opt.Skill'].textContent = player.getOpti().toFixed(2);
					if (player.pos) {
						row.cells['Marktwert'].textContent = player.getMarketValue().toLocaleString();
						row.cells['&Oslash;P'].textContent = player.getSkillAverage(player.getPrimarySkills()).toFixed(2);
					} else {
						row.cells['Marktwert'].textContent = '0';
						row.cells['&Oslash;P'].textContent = '0.00';
					}
					row.cells['&Oslash;N'].textContent = player.getSkillAverage(player.getSecondarySkills()).toFixed(2);
					row.cells['&Oslash;U'].textContent = player.getSkillAverage(player.getUnchangeableSkills()).toFixed(2);
				}

				row.insertBefore(row.cells['Pos'], row.cells['Geb.'].nextSibling);
				row.insertBefore(row.cells['Opt.Skill'], row.cells['Talent']);
				row.appendChild(row.cells['&Oslash;/Zat']);
				row.appendChild(row.cells['Marktwert']);
				row.appendChild(row.cells['&Oslash;P']);
				row.appendChild(row.cells['&Oslash;N']);
				row.appendChild(row.cells['&Oslash;U']);
			});

			let form = doc.querySelector('form');
			form.parentNode.insertBefore(this.createToolbar(doc, data), form);
		}
	}

	/**
	 * @param {Team} team
	 * @param {Boolean} current indicating the current team
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
				row.cells['Pos'].textContent = (player.age >= YOUTH_AGE_MIN && player.getSkillAverage(player.getSecondarySkills()) > 0 ? player.pos : '');
				row.cells['Talent'].textContent = player.talent;
				row.cells['Skillschnitt'].textContent = player.getSkillAverage().toFixed(2);
				if (row.cells['Pos'].textContent) {
					row.cells['Opt.Skill'].textContent = player.getOpti().toFixed(2);
					row.cells['Marktwert'].textContent = player.getMarketValue().toLocaleString();
					row.cells['&Oslash;P'].textContent = player.getSkillAverage(player.getPrimarySkills()).toFixed(2);
					row.cells['&Oslash;N'].textContent = player.getSkillAverage(player.getSecondarySkills()).toFixed(2);
					if (current) {
						row.cells['&Oslash;/Zat'].textContent = player.getAverageIncreasePerDay(player.getYouthDays(matchDay)).toFixed(2);
					} else {
						row.cells['&Oslash;/Zat'].textContent = player.averageIncreasePerDay.toFixed(2);
					}
				} else {
					row.cells['Opt.Skill'].textContent = '';
					row.cells['Marktwert'].textContent = '';
					row.cells['&Oslash;P'].textContent = '';
					row.cells['&Oslash;N'].textContent = '';
					row.cells['&Oslash;/Zat'].textContent = '';
				}
				row.cells['&Oslash;U'].textContent = player.getSkillAverage(player.getUnchangeableSkills()).toFixed(2);

			} else {

				row.cells['Talent'].textContent = '';
				row.cells['Skillschnitt'].textContent = '';
				row.cells['Opt.Skill'].textContent = '';
				row.cells['&Oslash;/Zat'].textContent = '';
				row.cells['Marktwert'].textContent = '';
				row.cells['&Oslash;P'].textContent = '';
				row.cells['&Oslash;N'].textContent = '';
				row.cells['&Oslash;U'].textContent = '';
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
				row.cells['Skillschnitt'].classList.add(STYLE_FORECAST);
				row.cells['Opt.Skill'].classList.add(STYLE_FORECAST);
				row.cells['&Oslash;/Zat'].classList.add(STYLE_FORECAST);
				row.cells['Marktwert'].classList.add(STYLE_FORECAST);
				row.cells['&Oslash;P'].classList.add(STYLE_FORECAST);
				row.cells['&Oslash;N'].classList.add(STYLE_FORECAST);
				row.cells['&Oslash;U'].classList.add(STYLE_FORECAST);
			}
		});
	}
}
