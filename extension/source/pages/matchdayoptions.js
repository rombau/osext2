
Page.MatchDayOptions = class extends Page {

	constructor() {

		super('ZA-Einstellungen', 'zuzu.php');

	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract (doc, data) {

		data.viewSettings.ticketPrice.league = +doc.getElementsByName("liga")[0].value;
		data.viewSettings.ticketPrice.cup = +doc.getElementsByName("pokal")[0].value;
		data.viewSettings.ticketPrice.international = +doc.getElementsByName("int")[0].value;

		let nextMatchDay = data.nextMatchDay;
		if (nextMatchDay) {
			nextMatchDay.ticketPrice = null;
			if (nextMatchDay.location === GameLocation.HOME) {
				switch (nextMatchDay.competition) {
					case Competition.LEAGUE:
						nextMatchDay.ticketPrice = data.viewSettings.ticketPrice.league;
						break;
					case Competition.CUP:
						nextMatchDay.ticketPrice = data.viewSettings.ticketPrice.cup;
						break;
					case Competition.OSC:
					case Competition.OSCQ:
					case Competition.OSE:
					case Competition.OSEQ:
						nextMatchDay.ticketPrice = data.viewSettings.ticketPrice.international;
						break;
				}
			}
		}

		this.table = new ManagedTable(this.name,
			new Column('#'),
			new Column('Spieler'),
			new Column('FIT'),
			new Column('Physio'),
			new Column('Kosten')
		);

		this.table.initialize(doc, false);

		this.table.rows.slice(1, -1).forEach(row => {

			let player = data.team.getSquadPlayer(HtmlUtil.extractIdFromHref(row.cells['Spieler'].firstChild.href));
			if (row.cells['Physio'].firstChild.checked) {
				player.physioCosts = +row.cells['Kosten'].textContent.replaceAll('.', '');
			} else {
				player.physioCosts = null;
			}
		});
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend (doc, data) {

		let leagueInput = doc.getElementsByName("liga")[0];
		let cupInput = doc.getElementsByName("pokal")[0];
		let intInput = doc.getElementsByName("int")[0];

		let homeMatchdaysWith = data.team.matchDays
			.filter(matchday => matchday.location === GameLocation.HOME && matchday.ticketPrice && matchday.stadiumVisitors && matchday.stadiumCapacity)
			.slice().sort((day1, day2) => {
				if (day1.before(day2)) return 1;
				if (day1.after(day2)) return -1;
				return 0;
			});

		this.createPopupElement(leagueInput, 'Übersicht der gespeicherten Ligaspiele',
			homeMatchdaysWith.filter(matchday => matchday.competition === Competition.LEAGUE));

		this.createPopupElement(cupInput, 'Übersicht der gespeicherten Pokalspiele',
			homeMatchdaysWith.filter(matchday => matchday.competition === Competition.CUP));

		this.createPopupElement(intInput, 'Übersicht der gespeicherten internationalen Spiele',
			homeMatchdaysWith.filter(matchday => matchday.competition === Competition.OSC || matchday.competition === Competition.OSCQ || matchday.competition === Competition.OSE || matchday.competition === Competition.OSEQ));
	}

	/**
	 * @param {HTMLElement} baseElement
	 * @param {String} header
	 * @param {[MatchDay]} matchdays
	 */
	createPopupElement (baseElement, header, matchdays) {

		if (!matchdays || matchdays.length == 0) return;

		let lastSeason = 0;

		let tooltip = HtmlUtil.createDivElement('', [STYLE_POPUP, 'visitors', baseElement.name]);

		tooltip.appendChild(HtmlUtil.createDivElement(header, 'header'));

		tooltip.appendChild(HtmlUtil.createDivElement('Saison', STYLE_LEFT));
		tooltip.appendChild(HtmlUtil.createDivElement('Zat', STYLE_LEFT));
		tooltip.appendChild(HtmlUtil.createDivElement('Eintritt', STYLE_RIGHT));
		tooltip.appendChild(HtmlUtil.createDivElement('Zuschauer', STYLE_RIGHT));
		tooltip.appendChild(HtmlUtil.createDivElement('Auslastung', STYLE_RIGHT));
		tooltip.appendChild(HtmlUtil.createDivElement('Einnahmen', STYLE_RIGHT));

		matchdays.forEach(matchday => {

			let cellClasses = [matchday.competition];
			if (lastSeason !== matchday.season) cellClasses.unshift('season-seperator');

			tooltip.appendChild(HtmlUtil.createDivElement(matchday.season, cellClasses.concat(STYLE_LEFT)));
			tooltip.appendChild(HtmlUtil.createDivElement(matchday.zat, cellClasses.concat(STYLE_LEFT)));
			tooltip.appendChild(HtmlUtil.createDivElement(matchday.ticketPrice, cellClasses.concat(STYLE_RIGHT)));
			tooltip.appendChild(HtmlUtil.createDivElement(matchday.stadiumVisitors.toLocaleString(), cellClasses.concat(STYLE_RIGHT)));
			tooltip.appendChild(HtmlUtil.createDivElement((matchday.stadiumVisitors / matchday.stadiumCapacity * 100).toFixed(1) + '%', cellClasses.concat(STYLE_RIGHT)));
			tooltip.appendChild(HtmlUtil.createDivElement((matchday.stadiumIncome - matchday.stadiumCosts).toLocaleString(), cellClasses.concat(STYLE_RIGHT)));
			lastSeason = matchday.season;
		});

		baseElement.parentElement.classList.add(STYLE_POPUP_BASE);
		baseElement.parentElement.appendChild(tooltip);
	}
}
