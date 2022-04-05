
Page.ShowteamSeason = class extends Page {
	
	/**
	 * @param {Number} season
	 */
	constructor(season) {

		super('Saisonplan', 'showteam.php', new Page.Param('s', 6));

		if (season) {
			this.method = HttpMethod.POST;
			this.name += ` (Saison ${season})`;
			this.params.push(new Page.Param('saison', season, true));
		}
	}
	
	static HEADERS = ['ZAT', 'Spielart', 'Gegner', 'Ergebnis', 'Bericht'];

	static GAMEINFO_NOT_SET = ['Blind Friendly gesucht!', 'reserviert', 'spielfrei'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {
		
		let season = +doc.querySelector('select[name=saison]').value;
		this.params.push(new Page.Param('saison', season, true));

		HtmlUtil.getTableRowsByHeader(doc, ...Page.ShowteamSeason.HEADERS).forEach(row => {
			let gameInfo = row.cells['Spielart'].textContent;
			if (gameInfo && !Page.ShowteamSeason.GAMEINFO_NOT_SET.includes(gameInfo)) {
				let matchday = data.team.getMatchDay(season, +row.cells['ZAT'].textContent);
				matchday.competition = gameInfo.split(' : ')[0];
				matchday.location = gameInfo.split(' : ')[1];
				matchday.result = row.cells['Ergebnis'].textContent;
				if (matchday.competition === Competition.FRIENDLY && !matchday.result) {
					matchday.friendlyShare = +row.cells[5].textContent.split('/')[0];
				}
				let opponentCell = row.cells['Gegner'];
				if (opponentCell.textContent) {
					matchday.opponent = new Team(HtmlUtil.extractIdFromHref(opponentCell.firstChild.href), opponentCell.textContent);
				}
			}
		});

		if (!data.initNextSeason(season)) {
			this.logger.info(`Initiate loading of previous season (${season-1}) matchday schedule`);
			data.pagesToRequest.unshift(new Page.ShowteamSeason(season - 1));
		}
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		this.selectedSeason = +doc.querySelector('select[name=saison]').value;

		this.table = HtmlUtil.getTableByHeader(doc, ...Page.ShowteamSeason.HEADERS);

		Array.from(this.table.rows).forEach((row, i) => {
		
			row.cells['Info'] = row.cells[5];

			if (i === 0) {

				row.appendChild(doc.createElement('td'));
				row.appendChild(doc.createElement('td'));
	
			} else {

				if (row.cells['Info'].textContent.includes('FSS-Tunier:')) {
					row.cells['Gegner'].textContent = row.cells['Info'].textContent;
					row.cells['Info'].textContent = '';
				}
				row.cells[row.cells.length - 1].style.paddingLeft = '15px';

				if (i % MONTH_MATCH_DAYS === 0) {
					row.classList.add(STYLE_MONTH);
				}
			}
		});

		let form = doc.querySelector('form');
		form.style.paddingLeft = '4px';
		
		if (data.lastMatchDay.season <= this.selectedSeason) {

			if (data.lastMatchDay.zat > 3) {
				let scrollButton = HtmlUtil.createAwesomeButton(doc, 'fa-arrow-alt-circle-down', (event) => {
					this.table.rows[data.lastMatchDay.zat - 2].scrollIntoView();
				}, 'zum aktuellen Zat');
				scrollButton.style.marginLeft = '5px';
				form.appendChild(scrollButton);
			}

			this.table.parentNode.insertBefore(this.createToolbar(doc, data), this.table);

			this.balancedMatchDays = data.team.getMatchDaysWithBalance(this.selectedSeason, data.lastMatchDay, data.viewSettings);
			this.updateWithMatchDays(this.balancedMatchDays);
		}
	}

	/**
	 * Adds or updates the balance column(s).
	 * 
	 * @param {[MatchDay]} matchDays of match days sorted by season and zat
	 */
	updateWithMatchDays (matchDays) {

		Array.from(this.table.rows).forEach((row, i) => {

			for (let season = matchDays[0].season; season <= matchDays[matchDays.length - 1].season; season++) {

				let balanceCell = row.cells['Saldo' + season] || row.cells['ZAT'].cloneNode(true);
	
				if (i === 0) {
	
					balanceCell.textContent = 'Saldo Saison ' + season;
		
				} else {
	
					balanceCell.textContent = '...';
					
					let matchDay = matchDays.find(matchDay => matchDay.season === season && matchDay.zat === i)
					matchDay.accountBalancePromise.then((day => {
						
						if (day.youthSupport) {
							
							let tooltipHTML = `<div class="right">${day.accountBalanceBefore.toLocaleString()}</div>`;
							if (day.stadiumIncome) tooltipHTML += `<div><div class="left">Zuschauereinnahmen</div><div class="right positive">${day.stadiumIncome.toLocaleString()}</div></div>`;
							if (day.stadiumCosts) tooltipHTML += `<div><div class="left">Stadionkosten</div><div class="right negative">-${day.stadiumCosts.toLocaleString()}</div></div>`;
							if (day.fiendlyIncome) tooltipHTML += `<div><div class="left">Zuschauereinnahmen</div><div class="right positive">${day.fiendlyIncome.toLocaleString()}</div></div>`;
							if (day.youthSupport) tooltipHTML += `<div><div class="left">Jugendförderung</div><div class="right negative">-${day.youthSupport.toLocaleString()}</div></div>`;
							if (day.advertisingIncome) tooltipHTML += `<div><div class="left">Fernsehgelder</div><div class="right positive">${day.advertisingIncome.toLocaleString()}</div></div>`;
							if (day.merchandisingIncome) tooltipHTML += `<div><div class="left">Fanartikel</div><div class="right positive">${day.merchandisingIncome.toLocaleString()}</div></div>`;
							
							balanceCell.innerHTML = `<div class="osext-balance"><span class="osext-forecast">${day.accountBalance.toLocaleString()}</span><div class="osext-balance-tooltip">${tooltipHTML}</div></div>`;
							
						} else {
							
							balanceCell.textContent = day.accountBalance.toLocaleString();
						}
						
					}));

					if (matchDay.competition === Competition.FRIENDLY) {
						balanceCell.classList.remove('STU');
						balanceCell.classList.remove('TOR');
						balanceCell.classList.remove('DMI');
						balanceCell.classList.remove('MIT');
						balanceCell.classList.add('OMI');
					}
				}

				if (!row.cells['Saldo' + season]) {
					row.cells['Saldo' + season] = balanceCell;
					row.insertBefore(balanceCell, row.cells[row.cells.length - 1]);
				}
			}
		});
	}

	/**
	 * Creates the toolbar for the squad player (showteam) views.
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
		
		let rankingTitle = doc.createElement('span');
		rankingTitle.innerHTML = 'Platzierung: ';
		toolbar.appendChild(rankingTitle);
		toolbar.appendChild(HtmlUtil.createNumericSlider(toolbar, 150, 1, data.team.league.size, data.viewSettings.leagueRanking, 
			ranking => {
				data.viewSettings.leagueRanking = ranking;
				Persistence.storeExtensionData(data);
				page.updateWithMatchDays(data.team.getMatchDaysWithBalance(page.selectedSeason, data.lastMatchDay, data.viewSettings, this.balancedMatchDays));
			}
		));

		let loadTitle = doc.createElement('span');
		loadTitle.innerHTML = 'Stadionauslastung (%): ';
		toolbar.appendChild(loadTitle);
		toolbar.appendChild(HtmlUtil.createNumericSlider(toolbar, 150, 1, 100, data.viewSettings.stadiumLoad || 100, 
			load => {
				data.viewSettings.stadiumLoad = load;
				Persistence.storeExtensionData(data);
				page.updateWithMatchDays(data.team.getMatchDaysWithBalance(page.selectedSeason, data.lastMatchDay, data.viewSettings, this.balancedMatchDays));
			}
		));

		let leagueTitle = doc.createElement('span');
		leagueTitle.innerHTML = ' Eintritt Liga: ';
		toolbar.appendChild(leagueTitle);
		toolbar.appendChild(HtmlUtil.createNumericSlider(toolbar, 120, 1, 100, data.viewSettings.ticketPrice.league, 
			ticketPrice => {
				data.viewSettings.ticketPrice.league = ticketPrice;
				Persistence.storeExtensionData(data);
				page.updateWithMatchDays(data.team.getMatchDaysWithBalance(page.selectedSeason, data.lastMatchDay, data.viewSettings, this.balancedMatchDays));
			}
		));

		let cupTitle = doc.createElement('span');
		cupTitle.innerHTML = 'Pokal: ';
		toolbar.appendChild(cupTitle);
		toolbar.appendChild(HtmlUtil.createNumericSlider(toolbar, 120, 1, 100, data.viewSettings.ticketPrice.cup, 
			ticketPrice => {
				data.viewSettings.ticketPrice.cup = ticketPrice;
				Persistence.storeExtensionData(data);
				page.updateWithMatchDays(data.team.getMatchDaysWithBalance(page.selectedSeason, data.lastMatchDay, data.viewSettings, this.balancedMatchDays));
			}
		));

		if (data.team.matchDays.find(matchday => !matchday.result && (matchday.competition === Competition.OSC || matchday.competition === Competition.OSCQ || matchday.competition === Competition.OSE || matchday.competition === Competition.OSEQ))) {
		
			let intTitle = doc.createElement('span');
			intTitle.innerHTML = 'International: ';
			toolbar.appendChild(intTitle);
			toolbar.appendChild(HtmlUtil.createNumericSlider(toolbar, 120, 1, 100, data.viewSettings.ticketPrice.international, 
				ticketPrice => {
					data.viewSettings.ticketPrice.international = ticketPrice;
					Persistence.storeExtensionData(data);
					page.updateWithMatchDays(data.team.getMatchDaysWithBalance(page.selectedSeason, data.lastMatchDay, data.viewSettings, this.balancedMatchDays));
				}
			));
		}

		return toolbar;
	}
}
