
class MainPage extends Page {
	
	constructor() {

		super('Managerbüro', 'haupt.php');
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {
		
		let matches = /Der nächste ZAT ist ZAT (\d+) und liegt auf/gm.exec(doc.getElementsByTagName('b')[1].textContent);

		let nextZat = +matches[1];
		
		matches = /images\/wappen\/((\d+)\.(png|gif))/gm.exec(doc.querySelector('img[src*=wappen]').src);
		
		if (data.currentTeam.id !== +matches[2] || data.nextZat !== nextZat) {

			data.initNextZat(nextZat);
			
			data.clearCurrentTeam();

			data.currentTeam.id = +matches[2];
			data.currentTeam.emblem = matches[1];
			
			let titleContainer = doc.querySelector('a[href="?changetosecond=true"]').parentElement

			matches = /Willkommen im Managerbüro von (.+)/gm.exec(titleContainer.childNodes[0].textContent);
				
			data.currentTeam.name = matches[1];

			matches = /(\d)\. Liga (.+)/gm.exec(titleContainer.childNodes[2].textContent);

			data.currentTeam.league.level = +matches[1];
			data.currentTeam.league.countryName = matches[2];

			let initPages = [];
			initPages.push(new ShowteamOverviewPage());
			initPages.push(new ShowteamSkillsPage());
			initPages.push(new ShowteamContractsPage());
			initPages.push(new ShowteamSeasonPage());
			initPages.push(new LeagueTablePage());
			initPages.push(new TrainerPage());
			initPages.push(new TrainingPage());
			initPages.push(new LoanViewPage());
			initPages.push(new ContractExtensionPage());
			

			// TODO add all needed pages

			return initPages;
		}
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend (doc, _data) { 

		Persistence.updateCachedData(data => {
		
			Object.setPrototypeOf(data.currentTeam, Team.prototype);

			let zat = data.lastMatchDay.zat;

			data.currentTeam.squadPlayers.forEach(player => {

				Object.setPrototypeOf(player, SquadPlayer.prototype);

				// init exact age
				if (zat >= player.birthday) {
					player.ageExact = player.age + ((zat - player.birthday) / SEASON_MATCH_DAYS);
				} else {
					player.ageExact = player.age + ((SEASON_MATCH_DAYS - (player.birthday - zat)) / SEASON_MATCH_DAYS);
				}

				// init training factor
				player.trainingFactor = player.marketValue / player.getMarketValue(player.pos, 1);

			});
			
		}).then(data => console.log(data), console.error);

	}

}

