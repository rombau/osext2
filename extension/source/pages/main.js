const ZAT_INDICATING_REFRESH = -1;

Page.Main = class extends Page {

	constructor() {

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

		let teamChangeLink = doc.querySelector('a[href="?changetosecond=true"]');
		let matches = /Willkommen im Managerb.ro von (.+)/gm.exec(teamChangeLink.parentElement.childNodes[0].textContent);

		let page = this;
		let superProcess = super.process;

		Persistence.updateCurrentTeam(matches[1]).then(() => {
			superProcess.call(page, doc, win);
		});
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract (doc, data) {

		let matches = /Der nächste ZAT ist ZAT (\d+) und liegt auf/gm.exec(doc.getElementsByTagName('b')[1].textContent);

		let nextZat = (+matches[1] <= 1 || +matches[1] > SEASON_MATCH_DAYS) ? 1 : +matches[1];
		if (data.nextZat !== nextZat) {

			// reset view setting to avoid old matchday
			data.viewSettings.squadPlayerMatchDay = null;
			data.viewSettings.youthPlayerMatchDay = null;

			// take over the trainings settings from previous zat, except during refresh
			if (data.nextZat !== ZAT_INDICATING_REFRESH) {
				data.team.squadPlayers.forEach(player => {
					if (!player.injured || player.injured <= (Options.usePhysio ? 2 : 1)) {
						if (player.nextTraining) {
							player.lastTraining = new SquadPlayer.Training();
							player.lastTraining.trainer = player.nextTraining.trainer;
							player.lastTraining.skill = player.nextTraining.skill;
							player.lastTraining.chance = player.nextTraining.chance;
						} else {
							player.lastTraining = null;
						}
					}
				});
			}

			data.initNextZat(nextZat);

			data.pagesToRequest = [];
			data.requestAllPages();
		}

		matches = /images\/wappen\/((\d+)\.[a-z]+)/gm.exec(doc.querySelector('img[src*=wappen]').src);

		data.team.id = +matches[2];
		data.team.emblem = matches[1];

		let titleContainer = doc.querySelector('a[href="?changetosecond=true"]').parentElement;

		matches = /Willkommen im Managerb.ro von (.+)/gm.exec(titleContainer.childNodes[0].textContent);

		data.team.name = matches[1];

		matches = /(\d)\. Liga ?[A-D]? (.+)/gm.exec(titleContainer.childNodes[2].textContent);

		data.team.league.level = +matches[1];
		data.team.league.countryName = matches[2];

		let accountBalanceElement = doc.querySelector('a[href="ka.php"]');
		if (accountBalanceElement && accountBalanceElement.textContent.includes('Euro')) {
			data.team.accountBalance = +accountBalanceElement.textContent.replaceAll('.', '').replace(' Euro', '');
		}

	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend (doc, data) {

		// doc.body.appendChild(HtmlUtil.createAwesomeButton(doc,'fa-redo-alt',() => {
		// 	Persistence.updateExtensionData(dataToReset => {
		// 		data.nextZat = ZAT_INDICATING_REFRESH;
		// 		dataToReset.nextZat = ZAT_INDICATING_REFRESH;
		// 	}).then(data => {
		// 		window.location.reload();
		// 	});
		// 	return false;
		// }));

	}
}

