Page.Main = class extends Page {

	constructor () {

		super('Managerbüro', 'haupt.php');
	}

	/**
	 * Processes the main page and sets the current team. Then the default processing is triggered.
	 *
	 * @param {Document} doc the document that should be processed
	 * @param {Window} win the current window
	 */
	process (doc, win = window) {

		super.check(doc);

		this.titleContainer = doc.querySelector('div#a a[href="?changetosecond=true"]').parentElement;
		this.teamName = /Willkommen im Managerb.ro von (.+)/gm.exec(this.titleContainer.childNodes[0].textContent)[1];

		let page = this;
		let superProcess = super.process;

		Persistence.updateCurrentTeam(this.teamName).then(() => {
			superProcess.call(page, doc, win);
		});
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract (doc, data) {

		// --- office ---

		let matches = /Der nächste ZAT ist ZAT (\d+) und liegt auf/gm.exec(doc.querySelectorAll('div#a b')[1].textContent);

		let nextZat = (+matches[1] <= 1 || +matches[1] > SEASON_MATCH_DAYS) ? 1 : +matches[1];
		if (data.nextZat !== nextZat) {

			// reset view setting to avoid old matchday
			data.viewSettings.squadPlayerMatchDay = null;
			data.viewSettings.youthPlayerMatchDay = null;

			// take over the trainings settings from previous zat
			data.team.squadPlayers.forEach(player => {
				if (player.nextTraining) {
					player.nextTraining.matchBonus = 1;
				}
				if (player.injured || !player.nextTraining || !player.nextTraining.trainer || !player.nextTraining.skill || !player.nextTraining.chance) {
					player.lastTraining = null;
				} else if (player.nextTraining) {
					player.lastTraining = new SquadPlayer.Training();
					player.lastTraining.trainer = player.nextTraining.trainer;
					player.lastTraining.skill = player.nextTraining.skill;
					player.lastTraining.chance = player.nextTraining.chance;
				}
			});

			data.initNextZat(nextZat);

			data.pagesToRequest = [];
			data.requestAllPages();
		}

		matches = /images\/wappen\/((\d+)\.[a-z]+)/gm.exec(doc.querySelector('div#a img[src*=wappen]').src);

		data.team.id = +matches[2];
		data.team.emblem = matches[1];

		data.team.name = this.teamName;

		matches = /(\d)\. Liga ?[A-D]? (.+)/gm.exec(this.titleContainer.childNodes[2].textContent);

		data.team.league.level = +matches[1];
		data.team.league.countryName = matches[2];

		let accountBalanceElement = doc.querySelector('div#a a[href="ka.php"]');
		if (accountBalanceElement && accountBalanceElement.textContent.includes('Euro')) {
			data.team.accountBalance = +accountBalanceElement.textContent.replaceAll('.', '').replace(' Euro', '');
		}

		// --- observed players ---

		this.table = new ManagedTable(this.name,
			new Column('Spieler'),
			new Column('Team'),
			new Column('Alter'),
			new Column('Skill'),
			new Column('Opti'),
			new Column('Marktwert'),
			new Column('Notiz'),
			new Column('Aktion')
		);

		this.table.initialize(doc, false);
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend (doc, data) {

		let contractExtensionPlayers = data.team.squadPlayers.filter(player => data.lastMatchDay && player.contractExtensionMatchDay
			&& data.lastMatchDay.equals(player.contractExtensionMatchDay));
		let fastTransferPlayers = data.team.squadPlayers.filter(player => data.lastMatchDay && player.fastTransferMatchDay
			&& data.lastMatchDay.equals(player.fastTransferMatchDay));
		let pullYouthPlayers = data.team.youthPlayers.filter(player => data.lastMatchDay && player.pullMatchDay
			&& data.lastMatchDay.equals(player.pullMatchDay));

		if (contractExtensionPlayers.length || fastTransferPlayers.length || pullYouthPlayers.length) {

			let table = doc.querySelector('div#a > table');
			let warnCell = table.querySelector('td[class=STU] > b').parentElement;

			if (warnCell) {

				let tipRow = warnCell.parentElement.nextElementSibling;
				let infoRow = tipRow.cloneNode(true);
				let infoCell = infoRow.cells[0];

				infoCell.childNodes[1].textContent = 'Geplante Aktionen (vor dem nächsten Zat):';
				infoCell.replaceChildren(infoCell.childNodes[1]);
				infoCell.style.padding = '7px 0px';

				if (contractExtensionPlayers.length) {
					let link = doc.createElement('a');
					link.href = 'vt.php';
					link.textContent = 'Vertragsverlängerung von ';
					contractExtensionPlayers.forEach((player, i) => {
						link.textContent += `${i > 0 ? ', ' : ''}${player.name} (${player.contractExtensionTerm} Monate)`;
					});
					infoCell.appendChild(HtmlUtil.createDivElement(link, STYLE_ACTION_INFO, doc));
				}

				if (fastTransferPlayers.length) {
					let link = doc.createElement('a');
					link.href = 'blitz.php';
					link.textContent = 'Schnelltranfer von ';
					fastTransferPlayers.forEach((player, i) => {
						link.textContent += `${i > 0 ? ', ' : ''}${player.name}`;
					});
					infoCell.appendChild(HtmlUtil.createDivElement(link, STYLE_ACTION_INFO, doc));
				}

				if (pullYouthPlayers.length) {
					let link = doc.createElement('a');
					link.href = 'ju.php';
					link.textContent = `Jugendspieler (${pullYouthPlayers.length}) ins A-Team übernehmen`;
					infoCell.appendChild(HtmlUtil.createDivElement(link, STYLE_ACTION_INFO, doc));
				}

				table.tBodies[0].insertBefore(infoRow, tipRow);
			}
		}
	}
}

