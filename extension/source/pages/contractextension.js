
Page.ContractExtension = class extends Page {

	constructor () {

		super('Vertragsverlängerungen', 'vt.php');

	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract (doc, data) {

		this.form = doc.getElementsByTagName('form')[0];
		this.submit = doc.querySelector('input[type="submit"]');

		this.table = new ManagedTable(this.name,
			new Column('Name'),
			new Column('Alter'),
			new Column('Geb.Tag', Origin.Extension).withHeader('Geb.', 'Geburtstag').withStyle('text-align', 'left'),
			new Column('Land'),
			new Column('Gehalt'),
			new Column('Laufzeit'),
			new Column('AlterAblauf', Origin.Extension).withHeader('Alter', 'Alter vor Ablauf des aktuellen Vertrags'),
			new Column('Skillschnitt'),
			new Column('Opt. Skill'),
			new Column('24').withRef('24M').withHeader('24M'),
			new Column('Monate').withRef('Gehalt24').withHeader('Gehalt', 'für 24 Monate'),
			new Column('Alter24', Origin.Extension).withHeader('Alter', 'Alter vor Ablauf 24 Monate'),
			new Column('36').withRef('36M').withHeader('36M'),
			new Column('Monate').withRef('Gehalt36').withHeader('Gehalt', 'für 36 Monate'),
			new Column('Alter36', Origin.Extension).withHeader('Alter', 'Alter vor Ablauf 36 Monate'),
			new Column('48').withRef('48M').withHeader('48M'),
			new Column('Monate').withRef('Gehalt48').withHeader('Gehalt', 'für 48 Monate'),
			new Column('Alter48', Origin.Extension).withHeader('Alter', 'Alter vor Ablauf 48 Monate'),
			new Column('60').withRef('60M').withHeader('60M'),
			new Column('Monate').withRef('Gehalt60').withHeader('Gehalt', 'für 60 Monate'),
			new Column('Alter60', Origin.Extension).withHeader('Alter', 'Alter vor Ablauf 60 Monate'),
			new Column('Aktion', Origin.Extension).withStyle('text-align', 'left').withStyle('width', '6em').withStyle('padding-left', '1em', true)
		);

		this.table.initialize(doc);

		this.table.container.classList.add(STYLE_CONTRACT_EXTENSION);

		this.table.rows.slice(1).forEach(row => {

			let id = HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href);
			let player = data.team.getSquadPlayer(id);

			player.age = +row.cells['Alter'].textContent;
			player.salary = +row.cells['Gehalt'].textContent.replaceAll('.', '');
			player.contractTerm = +row.cells['Laufzeit'].textContent;

			CONTRACT_LENGTHS.slice(0, -1).forEach(term => {
				player.followUpSalary['' + term] = +row.cells['Gehalt' + term].textContent.replaceAll('.', '');
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
	extend (doc, data) {

		let page = this;

		this.table.rows.slice(1).forEach(row => {

			let player = data.team.getSquadPlayer(HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href));

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

			CONTRACT_LENGTHS.slice(0, -1).forEach((term, t) => {

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

				row.cells['Gehalt' + term].textContent = row.cells['Gehalt' + term].getAttribute(ATTR_ORIGINAL);

			});
		});

		this.table.parentNode.parentNode.insertBefore(this.createToolbar(doc, data), this.table.parentNode);

		this.form.addEventListener('submit', event => {
			let radios = doc.querySelectorAll('input[type="radio"]:checked');
			if (radios && radios.length) {
				Array.from(radios).forEach(radio => {
					let id = +(/gehalt\[(\d+)\]/.exec(radio.name))[1];
					let player = data.team.getSquadPlayer(id);
					player.contractExtensionMatchDay = null;
					player.contractExtensionTerm = null;
				});
				Persistence.storeExtensionData(data);
			}
		});
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
		HtmlUtil.styleExtensionElement(toolbar);

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

		this.table.rows.slice(1).forEach(row => {

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
					let radio = row.cells[player.contractExtensionTerm + 'M'].firstChild;
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
					player.getSalary(term);
					let possible = player.salary < player.getSalary(term) || player.contractTerm < (SEASON_MATCH_DAYS / MONTH_MATCH_DAYS);
					if (!possible) {
						row.cells['Gehalt' + term].classList.add(STYLE_IMPOSSIBLE);
						row.cells['Alter' + term].classList.add(STYLE_IMPOSSIBLE);
					} else {
						row.cells['Gehalt' + term].classList.remove(STYLE_IMPOSSIBLE);
						row.cells['Alter' + term].classList.remove(STYLE_IMPOSSIBLE);
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

			this.table.container.nextElementSibling.disabled = !current;
			this.table.container.nextElementSibling.nextElementSibling.disabled = !current;

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

		if (!current) {
			this.submit.disabled = true;
		}
	}
}
