
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

		let titleContainer = doc.querySelector('a[href="?changetosecond=true"]').parentElement;
		let matches = /Willkommen im Managerbüro von (.+)/gm.exec(titleContainer.childNodes[0].textContent);

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

		let nextZat = +matches[1];
		if (data.nextZat !== nextZat) {
			
			data.initNextZat(nextZat);

			matches = /images\/wappen\/((\d+)\.(png|gif))/gm.exec(doc.querySelector('img[src*=wappen]').src);
			
			data.team.id = +matches[2];
			data.team.emblem = matches[1];
			
			let titleContainer = doc.querySelector('a[href="?changetosecond=true"]').parentElement;

			matches = /Willkommen im Managerbüro von (.+)/gm.exec(titleContainer.childNodes[0].textContent);
				
			data.team.name = matches[1];

			matches = /(\d)\. Liga (.+)/gm.exec(titleContainer.childNodes[2].textContent);

			data.team.league.level = +matches[1];
			data.team.league.countryName = matches[2];

			// take over the trainings settings from previous zat
			data.team.squadPlayers.forEach(player => {
				if (!player.injured || player.injured <= (Options.usePhysio ? 2 : 1)) {
					if (player.nextTraining) {
						player.lastTraining = new SquadPlayer.Training();
						player.lastTraining.trainer = player.nextTraining.trainer;
						player.lastTraining.skill = player.nextTraining.skill;
					} else {
						player.lastTraining = undefined;
					}
				}
			});

			// define the pages needed to load for initialization
			let initPages = [];
			initPages.push(new Page.ShowteamOverview());
			initPages.push(new Page.ShowteamSkills());
			initPages.push(new Page.ShowteamContracts());
			initPages.push(new Page.ShowteamSeason());
			initPages.push(new Page.LeagueTable());
			initPages.push(new Page.Trainer());
			initPages.push(new Page.Training());
			initPages.push(new Page.LoanView());
			initPages.push(new Page.ContractExtension());
			initPages.push(new Page.YouthOverview());
			initPages.push(new Page.YouthSkills());
			initPages.push(new Page.YouthOptions());
			

			return initPages;
		}
	}

	/**
	 * @param {Document} _doc
	 * @param {ExtensionData} data
	 */
	extend (_doc, data) { 

		data.complete();

	}
}

