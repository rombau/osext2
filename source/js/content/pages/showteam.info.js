
class ShowteamInfoPage extends Page {
	
	constructor() {

		super('Teaminfo', 'showteam.php', new Page.Param('s', 5));
	}

}

Page.register(new ShowteamInfoPage());