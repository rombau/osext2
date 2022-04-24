
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

		data.team.stadium = Object.assign(new Stadium(), data.team.stadium);
		data.team.stadium.coveredSeats = +table.rows[2].cells[3].textContent.replace(/\./g, '');
		data.team.stadium.seats = +table.rows[2].cells[1].textContent.replace(/\./g, '') - data.team.stadium.coveredSeats;
		data.team.stadium.coveredPlaces = +table.rows[3].cells[3].textContent.replace(/\./g, '');
		data.team.stadium.places = +table.rows[3].cells[1].textContent.replace(/\./g, '') - data.team.stadium.coveredPlaces;
		data.team.stadium.pitchHeating = (table.rows[4].cells[3].textContent == 'Ja');

		let expansionElement = doc.querySelector('td[class="TOR"] > b');
		if (expansionElement) {
			let matches = /Das Stadion wird noch (\d+) ZAT\(s\) ausgebaut./gm.exec(expansionElement.textContent);
			if (matches) {
				let expansionFinished = new MatchDay(data.lastMatchDay.season, data.lastMatchDay.zat).add(+matches[1]+1);
				expansionFinished = data.team.getMatchDay(expansionFinished.season, expansionFinished.zat);
				expansionFinished.stadium = this.extractExpandedStadium(data.team.stadium, Array.from(doc.getElementsByTagName('table')).find((table, t) => {
					return table.rows.length >= 3 && table.rows[0].cells[0].textContent === expansionElement.textContent;
				}));
				data.team.getMatchDay(expansionFinished.season, expansionFinished.zat - 1).stadium = undefined; // bugfix
				if (data.team.stadium.getPlaces() !== expansionFinished.stadium.getPlaces()) {
					data.team.stadium.coveredSeats = Math.round(data.team.stadium.coveredSeats * STADIUM_EXPANSION_CAPACITY / 100);
					data.team.stadium.seats = Math.round(data.team.stadium.seats * STADIUM_EXPANSION_CAPACITY / 100);
					data.team.stadium.coveredPlaces = Math.round(data.team.stadium.coveredPlaces * STADIUM_EXPANSION_CAPACITY / 100);
					data.team.stadium.places = Math.round(data.team.stadium.places * STADIUM_EXPANSION_CAPACITY / 100);
				}
			}
		}
	}

	/**
	 * Returns the new stadium after expansion.
	 * 
	 * @param {Stadium} currentStadium 
	 * @param {String} expansionText 
	 * @returns {Stadium}
	 */
	extractExpandedStadium(currentStadium, expansionTable) {
		let stadium = new Stadium();

		stadium.coveredSeats = currentStadium.coveredSeats
		stadium.seats = currentStadium.seats
		stadium.coveredPlaces = currentStadium.coveredPlaces
		stadium.places = currentStadium.places
		stadium.pitchHeating = currentStadium.pitchHeating;
		
		if (expansionTable) {
			Array.from(expansionTable.rows).filter(row => row.textContent.trim().length > 0).slice(1).forEach(row => {
				let text = row.textContent; 					
				let value = +text.split(" ")[0].replace(/\./g, '');
				if (text.search(/Eine Rasenheizung wird gebaut/) != -1) {
					stadium.pitchHeating = true;
				}
				else if (text.search(/[\d.]+ .+berdachte Stehpl.+tze werden zu Sitzpl.+tzen umgebaut/) != -1) {
					stadium.coveredPlaces -= value;
					stadium.coveredSeats += value;
				}
				else if (text.search(/[\d.]+ Stehpl.+tze werden zu Sitzpl.+tzen umgebaut/) != -1) {
					stadium.places -= value;
					stadium.seats += value;
				}
				else if (text.search(/[\d.]+ .+berdachte Sitzpl.+tze werden gebaut/) != -1) {
					stadium.coveredSeats += value;
				}
				else if (text.search(/[\d.]+ Sitzpl.+tze werden gebaut/) != -1) {
					stadium.seats += value;
				}
				else if (text.search(/[\d.]+ .+berdachte Stehpl.+tze werden gebaut/) != -1) {
					stadium.coveredPlaces += value;
				}
				else if (text.search(/[\d.]+ Stehpl.+tze werden gebaut/) != -1) {
					stadium.places += value;
				}
				else if (text.search(/[\d.]+ Sitzpl.+tze werden .+berdacht/) != -1) {
					stadium.coveredSeats += value;
					stadium.seats -= value;
				}
				else if (text.search(/[\d.]+ Stehpl.+tze werden .+berdacht/) != -1) {
					stadium.coveredPlaces += value;
					stadium.places -= value;
				}
			});
		}
		return stadium;
	}
}
