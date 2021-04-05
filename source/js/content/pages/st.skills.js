
class StSkillsPage extends ShowteamSkillsPage {
	
	constructor() {

		super();

		this.name = 'Teamdateneinzelskills';
		this.path = 'st.php';
		this.params.push(new Page.Param('c'));
	}

}

Page.register(new StSkillsPage());