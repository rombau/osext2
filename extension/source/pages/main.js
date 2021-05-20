
Page.Main = class extends Page {
	
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
			
			data.clear();

			data.currentTeam.id = +matches[2];
			data.currentTeam.emblem = matches[1];
			
			let titleContainer = doc.querySelector('a[href="?changetosecond=true"]').parentElement

			matches = /Willkommen im Managerbüro von (.+)/gm.exec(titleContainer.childNodes[0].textContent);
				
			data.currentTeam.name = matches[1];

			matches = /(\d)\. Liga (.+)/gm.exec(titleContainer.childNodes[2].textContent);

			data.currentTeam.league.level = +matches[1];
			data.currentTeam.league.countryName = matches[2];

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
			

			// TODO add all needed pages

			return initPages;
		}
	}

	/**
	 * @param {Document} _doc
	 * @param {ExtensionData} data
	 */
	extend (_doc, data) { 

		Object.setPrototypeOf(data.currentTeam, Team.prototype); // needed for lastMatchDay

		data.currentTeam.squadPlayers.forEach(player => {

			Object.setPrototypeOf(player, SquadPlayer.prototype);

			// init exact age
			if (data.lastMatchDay.zat >= player.birthday) {
				player.ageExact = player.age + ((data.lastMatchDay.zat - player.birthday) / SEASON_MATCH_DAYS);
			} else {
				player.ageExact = player.age + ((SEASON_MATCH_DAYS - (player.birthday - data.lastMatchDay.zat)) / SEASON_MATCH_DAYS);
			}

			// init training factor
			player.trainingFactor = player.marketValue / player.getMarketValue(player.pos, 1);

		});

	}
}

