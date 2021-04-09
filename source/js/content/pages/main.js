
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

		// initial value (ZAT) for the next matchday; see ShowteamSeasonPage.handleNextMatchDay()
		data.nextMatchDay.zat = +matches[1];

		matches = /images\/wappen\/((\d+)\.(png|gif))/gm.exec(doc.querySelector('img[src*=wappen]').src);

		if (data.currentTeam.id !== +matches[2]) {
		
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
			initPages.push(new ShowteamOverviewPage());
			initPages.push(new ShowteamSkillsPage());
			initPages.push(new ShowteamContractsPage());
			initPages.push(new ShowteamSeasonPage());

			// TODO ...

			return initPages;
		}
	};
}

Page.register(new MainPage());
