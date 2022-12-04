
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

	static GAMEINFO_NOT_SET = ['Blind Friendly gesucht!', 'reserviert', 'spielfrei'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		let season = +doc.querySelector('select[name=saison]').value;
		this.params.push(new Page.Param('saison', season, true));

		let nextRound = {};

		this.table = new ManagedTable(this.name,
			new Column('ZAT'),
			new Column('Spielart').withStyle('padding-right', '0.5em', true),
			new Column('Gegner'),
			new Column('Ergebnis'),
			new Column('Bericht')
		);

		this.table.initialize(doc, false);
		
		this.table.rows.slice(1).forEach(row => {

			row.cells['Info'] = row.cells[5];

			let matchday = data.team.getMatchDay(season, +row.cells['ZAT'].textContent);
			let gameInfo = ScriptUtil.getCellContent(row.cells['Spielart'], true);
			if (!Page.ShowteamSeason.GAMEINFO_NOT_SET.includes(gameInfo)) {
				[matchday.competition, matchday.location] = gameInfo.split(' : ', 2);
				matchday.result = row.cells['Ergebnis'].textContent;
				if (!matchday.result) {
					if (matchday.competition === Competition.FRIENDLY) {
						matchday.friendlyShare = +row.cells['Info'].textContent.split('/', 2)[0];
					} else if (matchday.competition !== Competition.LEAGUE && !nextRound[matchday.competition]) {
						matchday.nextRound = true;
						nextRound[matchday.competition] = true;
					}
				}
				let opponentCell = row.cells['Gegner'];
				if (opponentCell.textContent) {
					matchday.opponent = new Team(HtmlUtil.extractIdFromHref(opponentCell.firstChild.href), opponentCell.textContent);
				}
			} else {
				data.team.matchDays.splice(data.team.matchDays.findIndex(m => m === matchday), 1);
			}
		});

		data.initNextSeason(season);

		if (data.lastMatchDay 
			&& data.lastMatchDay.opponent 
			&& data.lastMatchDay.competition !== Competition.FRIENDLY 
			&& data.lastMatchDay.location === GameLocation.HOME 
			&& !data.lastMatchDay.stadiumVisitors) {
				data.pagesToRequest.push(new Page.GameReport(
					data.lastMatchDay.season, data.lastMatchDay.zat, 
					data.lastMatchDay.location === GameLocation.HOME ? data.team.id : data.lastMatchDay.opponent.id, 
					data.lastMatchDay.location === GameLocation.AWAY ? data.team.id : data.lastMatchDay.opponent.id));
		}
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		this.selectedSeason = +doc.querySelector('select[name=saison]').value;

		let leagueRound = 1;

		this.table.rows.forEach((row, i) => {

			row.cells['Info'] = row.cells[5];

			if (i === 0) {

				row.appendChild(doc.createElement('td'));
				row.appendChild(doc.createElement('td'));

			} else {

				if (row.cells['Info'].textContent.match('FSS-Tur?nier:')) {
					row.cells['Gegner'].textContent = row.cells['Info'].textContent;
					row.cells['Info'].textContent = '';
				}
				row.cells[row.cells.length - 1].style.paddingLeft = '15px';

				if (i % MONTH_MATCH_DAYS === 0) {
					row.classList.add(STYLE_MONTH);
				}

				let matchDay = data.team.getMatchDay(this.selectedSeason, i);
				if (matchDay && matchDay.competition !== Competition.FRIENDLY && !row.cells['Info'].textContent) {
					let gameInfo = ScriptUtil.getCellContent(row.cells['Spielart'], true);
					if (matchDay.competition === Competition.LEAGUE) {
						gameInfo = i < 70 ? `${gameInfo.slice(0, 4)} (${leagueRound++}. Spieltag) ${gameInfo.slice(4)}` : 'Relegation';
					}
					else if (matchDay.competition === Competition.CUP) {
						gameInfo = `${gameInfo.slice(0, 2)} (${Object.entries(CUP_FIXTURES).find(fixture => fixture[0] == i)[1]}) ${gameInfo.slice(2)}`
					}
					else if (matchDay.competition === Competition.OSE || matchDay.competition === Competition.OSEQ) {
						gameInfo = `${gameInfo.slice(0, 4)} (${Object.entries(OSE_FIXTURES).find(fixture => fixture[0] == i)[1]}) ${gameInfo.slice(4)}`
					}
					else if (matchDay.competition === Competition.OSC || matchDay.competition === Competition.OSCQ) {
						gameInfo = `${gameInfo.slice(0, 4)} (${Object.entries(OSC_FIXTURES).find(fixture => fixture[0] == i)[1]}) ${gameInfo.slice(4)}`
					}
					row.cells['Spielart'].textContent = gameInfo.replace(/\s+/g, ' ');
				}
			}
		});

		let form = doc.querySelector('form');
		form.style.paddingLeft = '4px';

		if (data.lastMatchDay.season <= this.selectedSeason) {

			if (data.lastMatchDay.zat > 3) {
				let scrollButton = HtmlUtil.createAwesomeButton(doc, 'fa-arrow-alt-circle-down', () => {
					this.table.rows[data.lastMatchDay.zat - 2].scrollIntoView();
				}, 'zum aktuellen Zat');
				scrollButton.style.marginLeft = '5px';
				form.appendChild(scrollButton);
			}

			this.table.container.insertBefore(this.createToolbar(doc, data), this.table.element);

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

		this.table.rows.forEach((row, i) => {

			for (let season = matchDays[0].season; season <= matchDays[matchDays.length - 1].season; season++) {

				let balanceCell = row.cells['Saldo' + season] || row.cells['ZAT'].cloneNode(true);

				if (i === 0) {

					balanceCell.textContent = 'Saldo Saison ' + season;

				} else {

					balanceCell.textContent = '...';

					let matchDay = matchDays.find(matchDay => matchDay.season === season && matchDay.zat === i)
					matchDay.accountBalancePromise.then(day => {

						if (day.youthSupport) {

							let balanceTooltip = HtmlUtil.createDivElement('', 'osext-balance-tooltip');
							balanceTooltip.appendChild(HtmlUtil.createDivElement(day.accountBalanceBefore.toLocaleString(), 'right'));
							if (day.stadiumIncome) balanceTooltip.appendChild(HtmlUtil.createLabelValueElement('Zuschauereinnahmen', day.stadiumIncome.toLocaleString(), 'positive'));
							if (day.stadiumCosts) balanceTooltip.appendChild(HtmlUtil.createLabelValueElement('Stadionkosten', day.stadiumCosts.toLocaleString(), 'negative'));
							if (day.friendlyIncome) balanceTooltip.appendChild(HtmlUtil.createLabelValueElement('Zuschauereinnahmen', day.friendlyIncome.toLocaleString(), 'positive'));
							if (day.squadSalary) balanceTooltip.appendChild(HtmlUtil.createLabelValueElement('Gehälter', day.squadSalary.toLocaleString(), 'negative'));
							if (day.trainerSalary) balanceTooltip.appendChild(HtmlUtil.createLabelValueElement('Trainer', day.trainerSalary.toLocaleString(), 'negative'));
							if (day.loanIncome) balanceTooltip.appendChild(HtmlUtil.createLabelValueElement('Leiheinnahmen', day.loanIncome.toLocaleString(), 'positive'));
							if (day.loanCosts) balanceTooltip.appendChild(HtmlUtil.createLabelValueElement('Leihausgaben', day.loanCosts.toLocaleString(), 'negative'));
							if (day.youthSupport) balanceTooltip.appendChild(HtmlUtil.createLabelValueElement('Jugendförderung', day.youthSupport.toLocaleString(), 'negative'));
							if (day.intPremium) balanceTooltip.appendChild(HtmlUtil.createLabelValueElement('Aufstiegsprämie', day.intPremium.toLocaleString(), 'positive'));
							if (day.cupPremium) balanceTooltip.appendChild(HtmlUtil.createLabelValueElement('Pokalprämie', day.cupPremium.toLocaleString(), 'positive'));
							if (day.winBonus) balanceTooltip.appendChild(HtmlUtil.createLabelValueElement('Siegprämie', day.winBonus.toLocaleString(), 'positive'));
							if (day.advertisingIncome) balanceTooltip.appendChild(HtmlUtil.createLabelValueElement('Fernsehgelder', day.advertisingIncome.toLocaleString(), 'positive'));
							if (day.merchandisingIncome) balanceTooltip.appendChild(HtmlUtil.createLabelValueElement('Fanartikel', day.merchandisingIncome.toLocaleString(), 'positive'));
							if (day.physio) balanceTooltip.appendChild(HtmlUtil.createLabelValueElement('Physio', day.physio.toLocaleString(), 'negative'));
							if (day.fastTransferIncome) balanceTooltip.appendChild(HtmlUtil.createLabelValueElement('Schnelltransfer', day.fastTransferIncome.toLocaleString(), 'positive'));
							if (day.otherBookings) Object.entries(day.otherBookings).forEach(([label, value]) => {
								balanceTooltip.appendChild(HtmlUtil.createLabelValueElement(label, value.toLocaleString(), value >= 0 ? 'positive' : 'negative'));
							});

							let balanceElement = HtmlUtil.createDivElement('', 'osext-balance');
							balanceElement.appendChild(HtmlUtil.createDivElement(day.accountBalance.toLocaleString(), day.result ? null : 'osext-forecast'));
							balanceElement.appendChild(balanceTooltip);

							balanceCell.textContent = '';
							balanceCell.appendChild(balanceElement);

						} else {

							balanceCell.textContent = day.accountBalance.toLocaleString();
						}

					}).catch(this.logger.error);

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

		let winBonus = doc.createElement('i');
		winBonus.update = () => {
			if (data.viewSettings.winBonus) {
				winBonus.classList.add(STYLE_ON);
				winBonus.classList.remove(STYLE_OFF);
			} else {
				winBonus.classList.add(STYLE_OFF);
				winBonus.classList.remove(STYLE_ON);
			}
		};
		winBonus.classList.add('fas');
		winBonus.addEventListener('click', (event) => {
			data.viewSettings.winBonus = !data.viewSettings.winBonus;
			Persistence.storeExtensionData(data);
			winBonus.update();
			page.updateWithMatchDays(data.team.getMatchDaysWithBalance(page.selectedSeason, data.lastMatchDay, data.viewSettings, this.balancedMatchDays));
		});
		winBonus.update();
		toolbar.appendChild(winBonus);

		let winBonusTitle = doc.createElement('span');
		winBonusTitle.textContent = ' Siegprämien berücksichtigen';
		toolbar.appendChild(winBonusTitle);

		toolbar.appendChild(doc.createElement('br'));
		toolbar.appendChild(doc.createElement('br'));

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
		toolbar.appendChild(HtmlUtil.createNumericSlider(toolbar, 100, 1, 100, data.viewSettings.ticketPrice.league,
			ticketPrice => {
				data.viewSettings.ticketPrice.league = ticketPrice;
				Persistence.storeExtensionData(data);
				page.updateWithMatchDays(data.team.getMatchDaysWithBalance(page.selectedSeason, data.lastMatchDay, data.viewSettings, this.balancedMatchDays));
			}
		));

		let cupTitle = doc.createElement('span');
		cupTitle.innerHTML = 'Pokal: ';
		toolbar.appendChild(cupTitle);
		toolbar.appendChild(HtmlUtil.createNumericSlider(toolbar, 100, 1, 100, data.viewSettings.ticketPrice.cup,
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
			toolbar.appendChild(HtmlUtil.createNumericSlider(toolbar, 100, 1, 100, data.viewSettings.ticketPrice.international,
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
