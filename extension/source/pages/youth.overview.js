
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
	
		if (!this.getPullId(doc)) {

			let playerCount = 0;
			HtmlUtil.getTableRowsByHeader(doc, ...Page.YouthOverview.HEADERS)
				.filter(row => this.isPlayerRow(row)).forEach((row, index) => {
		
				// player with pull id?
				let pullInput = row.cells['Aktion'].firstChild;

				let player = data.team.getYouthPlayer(index, pullInput ? +pullInput.value : undefined);
				
				player.age = +row.cells['Alter'].textContent;
				player.birthday = +row.cells['Geb.'].textContent;
				
				if (row.cells['Alter'].className == Position.TOR) {
					player.pos = Position.TOR;
				}
				
				player.countryCode = row.cells['Land'].textContent;
				player.countryName = row.cells['Land'].firstChild.title;
				player.uefa = row.cells['U'].textContent ? false : true;
				
				player.talent = row.cells['Talent'].textContent;
				player.increase = row.cells['Aufwertung'].textContent;
								
				playerCount++;
			});
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

		if (this.getPullId(doc)) {
		
			// TODO add pull listener and refresh at least all youth players data

			/*
			let requestor = Requestor.create(doc);
			requestor.addPage(new Page.YouthOverview());
			requestor.addPage(new Page.YouthSkills());
			requestor.start();
			*/

		} else {

			doc.getElementsByTagName('div')[0].classList.add(STYLE_YOUTH);

			// remove the remark
			let element = doc.getElementsByTagName('table')[0].nextSibling;
			while (element.nodeName.toLowerCase() != 'form') {
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
								
				row.cells['Pos'] = row.cells['Alter'].cloneNode(true);
				row.cells['Opt.Skill'] = row.cells['Alter'].cloneNode(true);
				row.cells['&Oslash;/Zat'] = row.cells['Alter'].cloneNode(true);
				row.cells['Marktwert'] = row.cells['Alter'].cloneNode(true);
				row.cells['&Oslash;P'] = row.cells['Alter'].cloneNode(true);
				row.cells['&Oslash;N'] = row.cells['Alter'].cloneNode(true);
				row.cells['&Oslash;U'] = row.cells['Alter'].cloneNode(true);

				row.cells['&Oslash;P'].style.width = '45px';

				if (index === 0) {

					row.cells['Skillschnitt'].textContent = 'Skillschn.';
					row.cells['Talent'].style.width = '4.5em';
					row.cells['Aufwertung'].style.width = '9em';
					row.cells['Marktwert'].style.width = '6em';
					row.cells['&Oslash;P'].style.width = '3.5em';
					row.cells['&Oslash;N'].style.width = '3.5em';
					row.cells['&Oslash;U'].style.width = '3.5em';
		
					row.cells['Pos'].textContent = 'Pos';
					row.cells['Opt.Skill'].textContent = 'Opt.Skill';
					row.cells['&Oslash;/Zat'].innerHTML = '&Oslash;/Zat';
					row.cells['Marktwert'].textContent = 'Marktwert';
					row.cells['&Oslash;P'].innerHTML = '&Oslash;P';
					row.cells['&Oslash;N'].innerHTML = '&Oslash;N';
					row.cells['&Oslash;U'].innerHTML = '&Oslash;U';
		
				} else {
		
					row.cells['Opt.Skill'].classList.add(STYLE_PRIMARY);
					
					let player = data.team.youthPlayers[index - 1];
						
					row.cells['Pos'].textContent = player.pos;
					row.cells['Opt.Skill'].textContent = player.getOpti().toFixed(2);
					row.cells['Marktwert'].textContent = player.getMarketValue().toLocaleString();
					row.cells['&Oslash;P'].textContent = player.getSkillAverage(player.getPrimarySkills()).toFixed(2);
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
			
			this.table.parentNode.insertBefore(this.createToolbar(doc, data), this.table);
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

			row.cells['Alter'].textContent = player.age;

			if (player.active) {

				row.cells['Geb.'].textContent = player.birthday;
				row.cells['Pos'].textContent = player.pos;
				row.cells['Skillschnitt'].textContent = player.getSkillAverage().toFixed(2);
				row.cells['Opt.Skill'].textContent = player.getOpti().toFixed(2);
				row.cells['Marktwert'].textContent = player.getMarketValue().toLocaleString();
				row.cells['&Oslash;P'].textContent = player.getSkillAverage(player.getPrimarySkills()).toFixed(2);
				row.cells['&Oslash;N'].textContent = player.getSkillAverage(player.getSecondarySkills()).toFixed(2);
				row.cells['&Oslash;U'].textContent = player.getSkillAverage(player.getUnchangeableSkills()).toFixed(2);
				
				if (current) {
					row.cells['&Oslash;/Zat'].textContent = player.getAverageIncreasePerDay(player.getYouthDays(matchDay)).toFixed(2);
				} else {
					row.cells['&Oslash;/Zat'].textContent = player.averageIncreasePerDay.toFixed(2);
				}
				
			} else {

				row.cells['Skillschnitt'].textContent = '';
				row.cells['Opt.Skill'].textContent = '';
				row.cells['&Oslash;/Zat'].textContent = '';
				row.cells['Marktwert'].textContent = '';
				row.cells['&Oslash;P'].textContent = '';
				row.cells['&Oslash;N'].textContent = '';
				row.cells['&Oslash;U'].textContent = '';
			}

			if (current) {
				if (player.pullId) {
					row.cells['Aktion'].innerHTML = `<input name="ziehmich" value="${player.pullId}" type="radio">`;
				}
				row.cells['Aufwertung'].textContent = player.increase;
			}
			else {
				row.cells['Aktion'].textContent = '';
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
