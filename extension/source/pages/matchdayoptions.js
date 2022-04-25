
Page.MatchDayOptions = class extends Page {

	constructor() {

		super('ZA-Einstellungen', 'zuzu.php');

	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		data.viewSettings.ticketPrice.league = +doc.getElementsByName("liga")[0].value;
		data.viewSettings.ticketPrice.cup = +doc.getElementsByName("pokal")[0].value;
		data.viewSettings.ticketPrice.international = +doc.getElementsByName("int")[0].value;

	}
}
