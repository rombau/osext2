
class TeamOverviewPage extends ShowteamOverviewPage {
	
	constructor() {

		super();

		this.name = 'Teamdatenübersicht';
		this.path = 'st.php';
		this.params.push(new Page.Param('c'));
	}

}

Page.register(new TeamOverviewPage());

