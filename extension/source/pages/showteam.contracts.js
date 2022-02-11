
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
			player.salary = +row.cells['Monatsgehalt'].textContent.replace(/\./g, '');
			player.marketValue = +row.cells['Spielerwert'].textContent.replace(/\./g, '');

		});
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		this.table = HtmlUtil.getTableByHeader(doc, ...Page.ShowteamContracts.HEADERS);

		Array.from(this.table.rows).forEach((row, i) => {

			row.cells['Blitzerlös'] = row.cells['Spielerwert'].cloneNode(true);
			row.cells['Blitz'] = row.cells['Name'].cloneNode(true);
			
			if (i === 0 || i == (this.table.rows.length - 1)) {
	
				row.cells['Geb.Tag'].textContent = 'Geb.';
				row.cells['Geb.Tag'].align = 'left';

				row.cells['Skillschnitt'].textContent = 'Skillschn.';
	
				row.cells['Blitzerlös'].textContent = 'Blitzerlös';
				row.cells['Blitzerlös'].align = 'right';

				row.cells['Blitz'].textContent = 'Blitztermin';
	
			} else {
	
				row.cells['Opt.Skill'].classList.add(STYLE_PRIMARY);
				
				let id = HtmlUtil.extractIdFromHref(row.cells[2].firstChild.href);
				let player = data.team.getSquadPlayer(id); 

				if (player.loan || player.transferLock) {
					row.cells['Blitzerlös'].classList.add(STYLE_INACTIVE);
				}

				row.cells['Blitzerlös'].textContent = player.getFastTransferValue().toLocaleString();
				row.cells['Blitz'].textContent = '';

				let setButton = doc.createElement('i');
				setButton.classList.add('fas');
				setButton.classList.add('fa-bolt');
				setButton.addEventListener('click', (event) => {
					let cell = event.target.parentNode;
					let viewMatchday = ensurePrototype(data.viewSettings.squadPlayerMatchDay, MatchDay);
					cell.firstChild.textContent = `${viewMatchday.season}/${viewMatchday.zat}`;
					cell.classList.remove(STYLE_FAST_TRANSFER_ADD);
					cell.classList.add(STYLE_FAST_TRANSFER_DELETE);

					data.team.getSquadPlayer(id).fastTransfer = new MatchDay(viewMatchday.season, viewMatchday.zat);
				});
				
				let removeButton = doc.createElement('i');
				removeButton.title = 'Zat entfernen';
				removeButton.classList.add('fas');
				removeButton.classList.add('fa-trash-alt');
				removeButton.addEventListener('click', (event) => {
					let cell = event.target.parentNode;
					let viewMatchday = ensurePrototype(data.viewSettings.squadPlayerMatchDay, MatchDay);
					cell.classList.remove(STYLE_FAST_TRANSFER_DELETE);
					if (!data.lastMatchDay.equals(viewMatchday) && !player.loan && !player.transferLock) {
						cell.classList.add(STYLE_FAST_TRANSFER_ADD);
					}
					data.team.getSquadPlayer(id).fastTransfer = undefined;

					let matchDayTeam = data.team.getForecast(data.lastMatchDay, viewMatchday);
					this.updateWithTeam(matchDayTeam, false, viewMatchday);
				});

				let fastTransferSpan = doc.createElement('span');
				if (player.fastTransfer) {
					fastTransferSpan.textContent = `${player.fastTransfer.season}/${player.fastTransfer.zat}`;
					row.cells['Blitz'].classList.add(STYLE_FAST_TRANSFER_DELETE);
				}
				
				row.cells['Blitz'].classList.add(STYLE_FAST_TRANSFER);

				row.cells['Blitz'].appendChild(fastTransferSpan);
				row.cells['Blitz'].appendChild(setButton);
				row.cells['Blitz'].appendChild(removeButton);
				
			}

			row.appendChild(row.cells['Blitzerlös']);			
			row.appendChild(row.cells['Blitz']);				
			
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
			
			if (!current && !player.loan && !player.transferLock) {
				row.cells['Blitz'].querySelector('i.fa-bolt').title = `Saison ${matchDay.season} / Zat ${matchDay.zat}`;
			}

			if (player.active) {

				row.cells['Alter'].textContent = player.age;
				row.cells['Geb.Tag'].textContent = player.birthday;
				row.cells['Pos'].textContent = player.pos;

				row.cells['Skillschnitt'].textContent = player.getSkillAverage().toFixed(2);
				row.cells['Opt.Skill'].textContent = player.getOpti().toFixed(2);

				if (player.loan) {
					row.cells['TS'].innerHTML = `<abbr title="Leihgabe von ${player.loan.from} an ${player.loan.to} für ${player.loan.duration} ZATs">L${player.loan.duration}</abbr>`;
					if (player.loan.fee > 0) row.cells['Pos'].textContent = 'LEI';
				} else {
					row.cells['TS'].textContent = player.transferLock;
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
				if (+cell.textContent === 0 && i === 14) {
					cell.className = 'BAK';
				} else if (player.loan && player.loan.fee > 0) {
					cell.className = 'LEI';
				} else {
					cell.className = player.pos;
				}
				if (!player.active) {
					cell.classList.add(STYLE_INACTIVE);
				}
			});

			row.cells['Opt.Skill'].classList.add(STYLE_PRIMARY);

			row.cells['Blitz'].classList.add(STYLE_FAST_TRANSFER);
			
			if (player.active && !current) {
				row.cells['Alter'].classList.add(STYLE_FORECAST);
				row.cells['Skillschnitt'].classList.add(STYLE_FORECAST);
				row.cells['Opt.Skill'].classList.add(STYLE_FORECAST);
				row.cells['TS'].classList.add(STYLE_FORECAST);

				row.cells['Vertrag'].classList.add(STYLE_FORECAST);
				row.cells['Monatsgehalt'].classList.add(STYLE_FORECAST);
				row.cells['Spielerwert'].classList.add(STYLE_FORECAST);

				row.cells['Blitzerlös'].classList.add(STYLE_FORECAST);
				if (player.loan || player.transferLock) {
					row.cells['Blitzerlös'].classList.add(STYLE_INACTIVE);
				} else {
					row.cells['Blitzerlös'].classList.remove(STYLE_INACTIVE);
					if (!player.origin.fastTransfer) {
						row.cells['Blitz'].classList.add(STYLE_FAST_TRANSFER_ADD);
					}
				}
			}
			if ((player.origin && player.origin.fastTransfer) || player.fastTransfer) {
				row.cells['Blitz'].classList.add(STYLE_FAST_TRANSFER_DELETE);
			}

		});
	}
}
