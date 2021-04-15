
class TeamOverviewPage extends ShowteamOverviewPage {
	
	/**
	 * @param {Number} id the team id
	 * @param {String} id the team name
	 */
	constructor(id, name) {

		super();

		this.path = 'st.php';
		this.params.push(new Page.Param('c', id));

		if (name) this.name += ` (${name})`;
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

	}
	
	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

	}
	
}


