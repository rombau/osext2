
Page.ShowteamInfo = class extends Page {
	
	constructor() {

		super('Teaminfo', 'showteam.php', new Page.Param('s', 5));
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {
	
		let table = Array.from(doc.getElementsByTagName('table')).find((table, t) => {
			return table.rows.length >= 5 && table.rows[2].cells.length >= 4
				&& table.rows[2].cells[0].textContent.includes('Sitzplätze') 
				&& table.rows[3].cells[0].textContent.includes('Stehplätze')
				&& table.rows[2].cells[2].textContent.includes('davon überdacht')
				&& table.rows[3].cells[2].textContent.includes('davon überdacht')
				&& table.rows[4].cells[2].textContent.includes('Rasenheizung');
		});

		if (!table) {
			let resource = doc.URL.substring(doc.URL.lastIndexOf('/') + 1);
			throw new Error(`Tabelle nicht gefunden (${resource})!`);
		}

		data.stadium.coveredSeats = +table.rows[2].cells[3].textContent.replace(/\./g, '');
		data.stadium.seats = +table.rows[2].cells[1].textContent.replace(/\./g, '') - data.stadium.coveredSeats;
		data.stadium.coveredPlaces = +table.rows[3].cells[3].textContent.replace(/\./g, '');
		data.stadium.places = +table.rows[3].cells[1].textContent.replace(/\./g, '') - data.stadium.coveredPlaces;
		data.stadium.pitchHeating = (table.rows[4].cells[3].textContent == 'Ja');

	}
}
