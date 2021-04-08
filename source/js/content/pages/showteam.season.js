
class ShowteamSeasonPage extends Page {
	
	constructor() {

		super('Teaminfo', 'showteam.php', new Page.Param('s', 6));
	}

}

Page.register(new ShowteamSeasonPage());