
Page.ShowteamContracts = class extends Page.Showteam {

	constructor() {

		super('Verträge', 'showteam.php', new Page.Param('s', 1));

	}

	static HEADERS = ['#', 'Nr.', 'Name', 'Alter', 'Geb.Tag', 'Pos', '', 'Land', 'U', 'Skillschnitt', 'Opt.Skill', 'Vertrag', 'Monatsgehalt', 'Spielerwert', 'TS'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		HtmlUtil.getTableRowsByHeaderAndFooter(doc, ...Page.ShowteamContracts.HEADERS).forEach(row => {

			let id = HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href);
			let player = data.team.getSquadPlayer(id);

			player.birthday = +row.cells['Geb.Tag'].textContent;
			player.contractTerm = +row.cells['Vertrag'].textContent;
			player.salary = +row.cells['Monatsgehalt'].textContent.replaceAll('.', '');
			player.marketValue = +row.cells['Spielerwert'].textContent.replaceAll('.', '');

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

		this.table = HtmlUtil.getTableByHeader(doc, ...Page.ShowteamContracts.HEADERS);

		Array.from(this.table.rows).forEach((row, i) => {

			row.cells['Blitzerlös'] = row.cells['Spielerwert'].cloneNode(true);
			row.cells['Aktion'] = row.cells['Name'].cloneNode(true);
			row.cells['Aktion'].style.setProperty('padding-left', '0.5em', 'important');

			if (i === 0 || i == (this.table.rows.length - 1)) {

				row.cells['Geb.Tag'].textContent = 'Geb.';
				row.cells['Geb.Tag'].align = 'left';

				row.cells['Skillschnitt'].textContent = 'Skillschn.';
				row.cells['TS'].style.width = '1.9em';

				row.cells['Blitzerlös'].textContent = 'Blitzerlös';
				row.cells['Blitzerlös'].align = 'right';

				row.cells['Aktion'].textContent = '';

			} else {

				row.cells['Opt.Skill'].classList.add(STYLE_PRIMARY);

				let id = HtmlUtil.extractIdFromHref(row.cells[2].firstChild.href);
				let player = data.team.getSquadPlayer(id);

				if ((player.loan && player.loan.duration > 0) || player.transferLock) {
					row.cells['Blitzerlös'].classList.add(STYLE_INACTIVE);
				}

				row.cells['Blitzerlös'].textContent = player.getFastTransferValue().toLocaleString();
				row.cells['Aktion'].textContent = '';

				let setButton = HtmlUtil.createAwesomeButton(doc, 'fa-bolt', (event) => {
					let cell = event.target.parentNode;
					let viewMatchday = data.viewSettings.squadPlayerMatchDay;
					cell.lastChild.textContent = `${viewMatchday.season}/${viewMatchday.zat}`;
					cell.lastChild.previousSibling.textContent = '';
					cell.classList.remove(STYLE_ADD);
					cell.classList.add(STYLE_DELETE);
					data.team.getSquadPlayer(id).fastTransferMatchDay = new MatchDay(viewMatchday.season, viewMatchday.zat);
					Persistence.storeExtensionData(data);
				}, 'Schnelltransfer');

				let extendContractButton = HtmlUtil.createAwesomeButton(doc, 'fa-plus-circle', (event) => {
					let cell = event.target.parentNode;
					let viewMatchday = data.viewSettings.squadPlayerMatchDay;
					cell.lastChild.textContent = `${viewMatchday.season}/${viewMatchday.zat}`;
					cell.classList.remove(STYLE_ADD);
					cell.classList.add(STYLE_DELETE);

					let squadPlayer = data.team.getSquadPlayer(id);
					squadPlayer.contractExtensionMatchDay = new MatchDay(viewMatchday.season, viewMatchday.zat);
					squadPlayer.contractExtensionTerm = CONTRACT_LENGTHS[0];
					cell.lastChild.previousSibling.textContent = squadPlayer.contractExtensionTerm;
					Persistence.storeExtensionData(data);
				}, 'Vertragsverlängerung');

				let removeButton = HtmlUtil.createAwesomeButton(doc, 'fa-trash-alt', (event) => {
					let cell = event.target.parentNode;
					let viewMatchday = ensurePrototype(data.viewSettings.squadPlayerMatchDay, MatchDay);
					cell.classList.remove(STYLE_DELETE);
					if (!data.lastMatchDay.equals(viewMatchday) && !(player.loan && player.loan.duration > 0) && !player.transferLock) {
						cell.classList.add(STYLE_ADD);
					}
					let squadPlayer = data.team.getSquadPlayer(id);
					squadPlayer.fastTransferMatchDay = null;
					squadPlayer.contractExtensionMatchDay = null;
					squadPlayer.contractExtensionTerm = null;
					Persistence.storeExtensionData(data);

					let matchDayTeam = data.team.getForecast(data.lastMatchDay, viewMatchday);
					this.updateWithTeam(matchDayTeam, false, viewMatchday);
				});

				let extendContractSpan = doc.createElement('span');
				extendContractSpan.addEventListener('click', () => {
					player.contractExtensionTerm = CONTRACT_LENGTHS.slice(0, -1).find(length => length > player.contractExtensionTerm);
					if (!player.contractExtensionTerm) player.contractExtensionTerm = CONTRACT_LENGTHS[0];
					Persistence.storeExtensionData(data);
					extendContractSpan.textContent = player.contractExtensionTerm;
				});
				extendContractSpan.title = 'Vetragslänge';
				extendContractSpan.style.float = 'right';
				extendContractSpan.classList.add(STYLE_SET_CONTRACT);
				if (player.contractExtensionTerm) {
					extendContractSpan.textContent = player.contractExtensionTerm;
				}

				let fastTransferSpan = doc.createElement('span');
				if (player.fastTransferMatchDay || player.contractExtensionMatchDay) {
					let viewDay = player.fastTransferMatchDay || player.contractExtensionMatchDay;
					fastTransferSpan.textContent = `${viewDay.season}/${viewDay.zat}`;
					row.cells['Aktion'].classList.add(STYLE_DELETE);
				}

				row.cells['Aktion'].classList.add(STYLE_SET_ZAT);

				row.cells['Aktion'].appendChild(setButton);
				row.cells['Aktion'].appendChild(extendContractButton);
				row.cells['Aktion'].appendChild(removeButton);
				row.cells['Aktion'].appendChild(extendContractSpan);
				row.cells['Aktion'].appendChild(fastTransferSpan);

			}

			row.appendChild(row.cells['Blitzerlös']);
			row.appendChild(row.cells['Aktion']);

		});

		this.table.parentNode.insertBefore(this.createToolbar(doc, data), this.table);

		HtmlUtil.appendScript(doc, 'sortables_init();');

	}

	/**
	 * @param {Team} team
	 * @param {Boolean} current indicating the current team
	 * @param {MatchDay} matchDay
	 */
	updateWithTeam (team, current, matchDay) {

		Array.from(this.table.rows).slice(1, -1).forEach(row => {

			let id = HtmlUtil.extractIdFromHref(row.cells[2].firstChild.href);
			let player = team.getSquadPlayer(id);

			if (player.active) {

				row.cells['Alter'].textContent = player.age;
				row.cells['Geb.Tag'].textContent = player.birthday;
				row.cells['Pos'].textContent = player.pos;

				row.cells['Skillschnitt'].textContent = player.getSkillAverage().toFixed(2);
				row.cells['Opt.Skill'].textContent = player.getOpti().toFixed(2);

				if (player.loan && player.loan.duration > 0) {
					row.cells['TS'].textContent = '';
					row.cells['TS'].appendChild(HtmlUtil.createAbbreviation(`Leihgabe von ${player.loan.from} an ${player.loan.to} für ${player.loan.duration} ZATs`, `L${player.loan.duration}`));
					if (player.loan.fee > 0) row.cells['Pos'].textContent = 'LEI';
				} else {
					row.cells['TS'].textContent = player.transferLock || '';
				}

				row.cells['Vertrag'].textContent = player.contractTerm;
				row.cells['Monatsgehalt'].textContent = player.salary.toLocaleString();
				row.cells['Spielerwert'].textContent = player.getMarketValue().toLocaleString();

				row.cells['Blitzerlös'].textContent = player.getFastTransferValue().toLocaleString();

			} else {

				row.cells['Alter'].textContent = '';
				row.cells['Geb.Tag'].textContent = '';
				row.cells['Pos'].textContent = '';

				row.cells['Skillschnitt'].textContent = '';
				row.cells['Opt.Skill'].textContent = '';
				row.cells['TS'].textContent = '';

				row.cells['Vertrag'].textContent = '';
				row.cells['Monatsgehalt'].textContent = '';
				row.cells['Spielerwert'].textContent = '';

				row.cells['Blitzerlös'].textContent = '';
			}

			// styling
			Array.from(row.cells).forEach((cell, i) => {
				cell.classList.remove('BAK');
				cell.classList.remove('LEI');
				cell.classList.remove(STYLE_FORECAST);
				if (+cell.textContent === 0 && i === 14) {
					cell.classList.add('BAK');
				} else if (player.loan && player.loan.duration > 0 && player.loan.fee > 0) {
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

			row.cells['Aktion'].classList.add(STYLE_SET_ZAT);
			row.cells['Aktion'].classList.remove(STYLE_ADD);
			row.cells['Aktion'].classList.remove(STYLE_DELETE);

			if (player.active && !current) {
				row.cells['Alter'].classList.add(STYLE_FORECAST);
				row.cells['Skillschnitt'].classList.add(STYLE_FORECAST);
				row.cells['Opt.Skill'].classList.add(STYLE_FORECAST);
				row.cells['TS'].classList.add(STYLE_FORECAST);

				row.cells['Vertrag'].classList.add(STYLE_FORECAST);
				row.cells['Monatsgehalt'].classList.add(STYLE_FORECAST);
				row.cells['Spielerwert'].classList.add(STYLE_FORECAST);

				row.cells['Blitzerlös'].classList.add(STYLE_FORECAST);
				if ((player.loan && player.loan.duration > 0) || player.transferLock) {
					row.cells['Blitzerlös'].classList.add(STYLE_INACTIVE);
				} else {
					row.cells['Blitzerlös'].classList.remove(STYLE_INACTIVE);
					if (!player.origin.fastTransferMatchDay && !player.origin.contractExtensionMatchDay) {
						row.cells['Aktion'].classList.add(STYLE_ADD);
					}
				}
			}
			if ((player.origin && (player.origin.fastTransferMatchDay || player.origin.contractExtensionMatchDay))
				|| player.fastTransferMatchDay || player.contractExtensionMatchDay) {
				row.cells['Aktion'].classList.add(STYLE_DELETE);
			}
		});
	}
}
