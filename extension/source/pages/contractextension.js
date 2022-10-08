
Page.ContractExtension = class extends Page {

	constructor() {

		super('Vertragsverlängerungen', 'vt.php');

	}

	static HEADERS = ['Name', 'Alter', 'Land', 'Gehalt', 'Laufzeit', 'Skillschnitt', 'Opt. Skill', '24', 'Monate', '36', 'Monate', '48', 'Monate', '60', 'Monate'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		this.table = HtmlUtil.getTableByHeader(doc, ...Page.ContractExtension.HEADERS);

		this.table.classList.add(STYLE_CONTRACT_EXTENSION);

		Array.from(this.table.rows).forEach((row, i) => {

			row.cells['24M'] = row.cells[7];
			row.cells['36M'] = row.cells[9];
			row.cells['48M'] = row.cells[11];
			row.cells['60M'] = row.cells[13];

			if (i > 0) {

				let id = HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href);
				let player = data.team.getSquadPlayer(id);

				player.age = +row.cells['Alter'].textContent;
				player.salary = +row.cells['Gehalt'].textContent.replaceAll('.', '');
				player.contractTerm = +row.cells['Laufzeit'].textContent;

				CONTRACT_LENGTHS.slice(0, -1).forEach(term => {
					player.followUpSalary['' + term] = +row.cells[term + 'M'].nextElementSibling.textContent.replaceAll('.', '');
				});
			}
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

		let page = this;

		Array.from(this.table.rows).forEach((row, i) => {

			let player = (i === 0 ? null : data.team.getSquadPlayer(HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href)));

			row.cells['AlterAblauf'] = row.cells['Alter'].cloneNode(true);

			row.cells['Geb.Tag'] = row.cells['Alter'].cloneNode(true);
			row.cells['Geb.Tag'].align = 'left';

			row.cells['Aktion'] = row.cells['Alter'].cloneNode(true);
			row.cells['Aktion'].style.textAlign = 'left';
			row.cells['Aktion'].style.width = '6.0em';
			row.cells['Aktion'].style.setProperty('padding-left', '1em', 'important');
			row.cells['Aktion'].textContent = '';
			
			if (i === 0) {
				
				row.cells['Geb.Tag'].textContent = 'Geb.';

				row.cells['AlterAblauf'].textContent = '';
				row.cells['AlterAblauf'].appendChild(HtmlUtil.createAbbreviation('vor Vertragsablauf', 'Alter'));
				

			} else {

				let lastDay = new MatchDay(data.lastMatchDay.season, data.lastMatchDay.zat);
				lastDay.add((player.contractTerm * MONTH_MATCH_DAYS) - (lastDay.zat % MONTH_MATCH_DAYS) - 1);

				row.cells['Geb.Tag'].textContent = player.birthday;

				row.cells['AlterAblauf'].textContent = '';
				row.cells['AlterAblauf'].appendChild(HtmlUtil.createAbbreviation(`Saison ${lastDay.season} / Zat ${lastDay.zat}`, 
					(player.ageExact + lastDay.intervalTo(data.lastMatchDay) / SEASON_MATCH_DAYS).toFixed(2)));

				row.cells['AlterAblauf'].classList.add(STYLE_FORECAST);

				if (player.contractExtensionMatchDay && data.lastMatchDay.equals(player.contractExtensionMatchDay) && player.contractExtensionTerm) {
					let radio = row.cells[player.contractExtensionTerm / 6 + 3].firstChild;
					if (radio) radio.checked = true;
				}

				let removeButton = HtmlUtil.createAwesomeButton(doc, 'fa-trash-alt', (event) => {
					let cell = event.target.parentNode;
					cell.classList.remove(STYLE_DELETE);

					player.contractExtensionMatchDay = null;
					player.contractExtensionTerm = null;
					Persistence.storeExtensionData(data);

					let matchDayTeam = data.team.getForecast(data.lastMatchDay, page.viewMatchday);
					page.updateWithTeam(matchDayTeam, data.lastMatchDay.equals(page.viewMatchday), page.viewMatchday);
				});

				let extendContractTermSpan = doc.createElement('span');
				extendContractTermSpan.title = 'Vetragslänge';
				extendContractTermSpan.style.float = 'right';
				extendContractTermSpan.classList.add(STYLE_SET_CONTRACT);
				if (player.contractExtensionTerm) {
					extendContractTermSpan.textContent = player.contractExtensionTerm;
				}

				let extendContractDaySpan = doc.createElement('span');
				if (player.contractExtensionMatchDay) {
					extendContractDaySpan.textContent = `${player.contractExtensionMatchDay.season}/${player.contractExtensionMatchDay.zat}`;
					row.cells['Aktion'].classList.add(STYLE_DELETE);
				}

				row.cells['Aktion'].classList.add(STYLE_SET_ZAT);

				row.cells['Aktion'].appendChild(removeButton);
				row.cells['Aktion'].appendChild(extendContractTermSpan);
				row.cells['Aktion'].appendChild(extendContractDaySpan);
			}

			row.insertBefore(row.cells['Geb.Tag'], row.cells['Land']);
			row.insertBefore(row.cells['AlterAblauf'], row.cells['Skillschnitt']);

			CONTRACT_LENGTHS.slice(0, -1).forEach((term, t) => {

				row.cells['Alter' + term] = row.cells['Alter'].cloneNode(true);
				
				if (i === 0) {				

					row.cells[term + 'M'].textContent = term + 'M';
					row.cells[term + 'M'].nextElementSibling.textContent = 'Gehalt';

					row.cells['Alter' + term].textContent = '';
					row.cells['Alter' + term].appendChild(HtmlUtil.createAbbreviation('vor Vertragsablauf', 'Alter'));

					row.insertBefore(row.cells['Alter' + term], row.cells[11 + t * 3]);

				} else {
		
					let extendContractButton = HtmlUtil.createAwesomeButton(doc, 'fa-plus-circle', (event) => {
						row.cells['Aktion'].classList.add(STYLE_DELETE);
						row.cells['Aktion'].lastChild.textContent = `${page.viewMatchday.season}/${page.viewMatchday.zat}`;
						player.contractExtensionMatchDay = new MatchDay(page.viewMatchday.season, page.viewMatchday.zat);
						player.contractExtensionTerm = term;
						row.cells['Aktion'].lastChild.previousSibling.textContent = player.contractExtensionTerm;
						Persistence.storeExtensionData(data);
						let matchDayTeam = data.team.getForecast(data.lastMatchDay, page.viewMatchday);
						page.updateWithTeam(matchDayTeam, data.lastMatchDay.equals(page.viewMatchday), page.viewMatchday);
					}, 'Vertragsverlängerung');

					let span = doc.createElement('span');
					span.appendChild(extendContractButton);
					span.classList.add(STYLE_SET_ZAT);
					row.cells[term + 'M'].appendChild(span);

					row.insertBefore(row.cells['Alter' + term], row.cells[11 + t * 3]);

					row.cells['Alter' + term].previousElementSibling.textContent = row.cells['Alter' + term].previousElementSibling.getAttribute(ATTR_ORIGINAL);
				}
			});

			row.appendChild(row.cells['Aktion']);
		});

		this.table.parentNode.parentNode.insertBefore(this.createToolbar(doc, data), this.table.parentNode);
	}

	/**
	 * Creates the toolbar for this view.
	 *
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 *
	 * @returns {HTMLElement} the toolbar element
	 */
	createToolbar (doc, data) {

		HtmlUtil.allowStickyToolbar(doc);

		let page = this;

		let toolbar = doc.createElement('div');
		toolbar.id = 'osext-toolbar-container';

		let toolTitle = doc.createElement('span');
		toolTitle.textContent = 'Aktion: ';
		toolbar.appendChild(toolTitle);

		page.viewMatchday = new MatchDay(data.lastMatchDay.season, data.lastMatchDay.zat);
		let matchdaySlider = HtmlUtil.createMatchDaySlider(toolbar, data.lastMatchDay, page.viewMatchday,
			matchday => {
				page.updateWithTeam(data.team.getForecast(data.lastMatchDay, matchday), data.lastMatchDay.equals(matchday), matchday);
			});
		toolbar.appendChild(matchdaySlider);

		return toolbar;
	}

	/**
	 * @param {Team} team
	 * @param {Boolean} current indicating the current team
	 * @param {MatchDay} matchDay
	 */
	updateWithTeam (team, current, matchDay) {

		Array.from(this.table.rows).slice(1).forEach(row => {

			let id = HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href);
			let player = team.getSquadPlayer(id);

			row.cells['Alter'].textContent = player.age;
			row.cells['Gehalt'].textContent = player.salary.toLocaleString();
			row.cells['Laufzeit'].textContent = player.contractTerm;
			row.cells['Skillschnitt'].textContent = player.getSkillAverage().toFixed(2);
			row.cells['Opt. Skill'].textContent = player.getOpti().toFixed(2);

			if (player.active) {

				let lastDay = new MatchDay(matchDay.season, matchDay.zat);
				lastDay.add((player.contractTerm * MONTH_MATCH_DAYS) - (lastDay.zat % MONTH_MATCH_DAYS) - 1);

				row.cells['AlterAblauf'].textContent = '';
				row.cells['AlterAblauf'].appendChild(HtmlUtil.createAbbreviation(`Saison ${lastDay.season} / Zat ${lastDay.zat}`, 
					(player.ageExact + lastDay.intervalTo(matchDay) / SEASON_MATCH_DAYS).toFixed(2)));

				if (current && player.contractExtensionMatchDay && matchDay.equals(player.contractExtensionMatchDay) && player.contractExtensionTerm) {
					let radio = row.cells[player.contractExtensionTerm / 6 + 3].firstChild;
					if (radio) radio.checked = true;
				}
	
				CONTRACT_LENGTHS.slice(0, -1).forEach((term, t) => {
					
					let lastDay = new MatchDay(matchDay.season, matchDay.zat);
					lastDay.add((term * MONTH_MATCH_DAYS) - (lastDay.zat % MONTH_MATCH_DAYS) - 1);
			
					row.cells['Alter' + term].textContent = (player.ageExact + lastDay.intervalTo(matchDay) / SEASON_MATCH_DAYS).toFixed(2);
					row.cells['Alter' + term].classList.add(STYLE_FORECAST);
				});

			}

			// styling
			Array.from(row.cells).forEach((cell, i) => {
				cell.classList.add(player.pos);
				if (player.active) {
					cell.classList.remove(STYLE_INACTIVE);
				} else {
					cell.classList.add(STYLE_INACTIVE);
				}
			});

			CONTRACT_LENGTHS.slice(0, -1).forEach((term, t) => {
				let span = row.cells[term + 'M'].querySelector('.' + STYLE_SET_ZAT);
				if (span) {
					let radio = span.previousElementSibling;
					let newSalary = +row.cells[term + 'M'].nextElementSibling.textContent.replaceAll('.', '');
					let possible = player.salary < newSalary || player.contractTerm < (SEASON_MATCH_DAYS / MONTH_MATCH_DAYS);
					if (!possible) {
						row.cells[term + 'M'].nextElementSibling.classList.add(STYLE_IMPOSSIBLE);
						row.cells[term + 'M'].nextElementSibling.nextElementSibling.classList.add(STYLE_IMPOSSIBLE);
					} else {
						row.cells[term + 'M'].nextElementSibling.classList.remove(STYLE_IMPOSSIBLE);
						row.cells[term + 'M'].nextElementSibling.nextElementSibling.classList.remove(STYLE_IMPOSSIBLE);
					}

					if (current) {
						radio && radio.classList.remove(STYLE_HIDDEN);
						span.classList.add(STYLE_HIDDEN);
						span.classList.remove(STYLE_ADD);
					} else {
						radio && radio.classList.add(STYLE_HIDDEN);
						span.classList.remove(STYLE_HIDDEN);
						if (player.active && possible) {
							span.classList.add(STYLE_ADD);
						} else {
							span.classList.remove(STYLE_ADD);
						}
					}
				}
			});

			this.table.nextElementSibling.disabled = !current;
			this.table.nextElementSibling.nextElementSibling.disabled = !current;

			if (current) {
				row.cells['Alter'].classList.remove(STYLE_FORECAST);
				row.cells['Gehalt'].classList.remove(STYLE_FORECAST);
				row.cells['Laufzeit'].classList.remove(STYLE_FORECAST);
				row.cells['Skillschnitt'].classList.remove(STYLE_FORECAST);
				row.cells['Opt. Skill'].classList.remove(STYLE_FORECAST);
			}
			else {
				row.cells['Alter'].classList.add(STYLE_FORECAST);
				row.cells['Gehalt'].classList.add(STYLE_FORECAST);
				row.cells['Laufzeit'].classList.add(STYLE_FORECAST);
				row.cells['Skillschnitt'].classList.add(STYLE_FORECAST);
				row.cells['Opt. Skill'].classList.add(STYLE_FORECAST);
			} 
		});
	}
}
