
Page.Stadium = class extends Page {

	constructor () {

		super('Stadionausbau', 'osneu/stadion');
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract (doc, data) {

		let table = Array.from(doc.getElementsByTagName('table')).find((table, t) => {
			return table.rows.length >= 6 && table.rows[1].cells.length >= 6
				&& table.rows[1].cells[0].textContent.includes('Sitzplätze')
				&& table.rows[2].cells[0].textContent.includes('Stehplätze')
				&& table.rows[1].cells[3].textContent.includes('davon überdacht')
				&& table.rows[2].cells[3].textContent.includes('davon überdacht')
				&& table.rows[3].cells[3].textContent.includes('Rasenheizung');
		});

		if (!table) {
			let resource = doc.URL.substring(doc.URL.lastIndexOf('/') + 1);
			throw new Error(`Tabelle nicht gefunden (${resource})!`);
		}

		data.team.stadium = Object.assign(new Stadium(), data.team.stadium);
		data.team.stadium.coveredSeats = +table.rows[1].cells[5].textContent.replaceAll('.', '');
		data.team.stadium.seats = +table.rows[1].cells[1].textContent.replaceAll('.', '') - data.team.stadium.coveredSeats;
		data.team.stadium.coveredPlaces = +table.rows[2].cells[4].textContent.replaceAll('.', '');
		data.team.stadium.places = +table.rows[2].cells[1].textContent.replaceAll('.', '') - data.team.stadium.coveredPlaces;
		data.team.stadium.pitchHeating = (table.rows[3].cells[4].textContent == 'installiert');

		let expansionElement = doc.querySelector('p.tor');
		if (expansionElement) {
			let matches = /f.hrt w.hrend der n.chsten (\d+) ZATs folgende Arbeiten durch/gm.exec(expansionElement.textContent);
			if (matches) {
				let expansionFinished = new MatchDay(data.lastMatchDay.season, data.lastMatchDay.zat).add(+matches[1] + 1);
				expansionFinished = data.team.getMatchDay(expansionFinished.season, expansionFinished.zat);
				expansionFinished.stadium = this.extractExpandedStadium(data.team.stadium, expansionElement);
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
	 * @param {HTMLElement} expansionElement
	 * @returns {Stadium}
	 */
	extractExpandedStadium (currentStadium, expansionElement) {
		let stadium = new Stadium();

		stadium.coveredSeats = currentStadium.coveredSeats
		stadium.seats = currentStadium.seats
		stadium.coveredPlaces = currentStadium.coveredPlaces
		stadium.places = currentStadium.places
		stadium.pitchHeating = currentStadium.pitchHeating;

		expansionElement = expansionElement.nextElementSibling.firstChild;
		do {
			let text = expansionElement.textContent;
			let value = +text.split(" ", 2)[0].replaceAll('.', '');
			if (text.search(/Eine Rasenheizung wird gebaut/) != -1) {
				stadium.pitchHeating = true;
			}
			else if (text.search(/[\d.]+ .berdachte Stehpl.tze werden zu Sitzpl.tzen umgebaut/) != -1) {
				stadium.coveredPlaces -= value;
				stadium.coveredSeats += value;
			}
			else if (text.search(/[\d.]+ Stehpl.tze werden zu Sitzpl.tzen umgebaut/) != -1) {
				stadium.places -= value;
				stadium.seats += value;
			}
			else if (text.search(/[\d.]+ .berdachte Sitzpl.tze werden( neu)? gebaut/) != -1) {
				stadium.coveredSeats += value;
			}
			else if (text.search(/[\d.]+ Sitzpl.tze werden( neu)? gebaut/) != -1) {
				stadium.seats += value;
			}
			else if (text.search(/[\d.]+ .berdachte Stehpl.tze werden( neu)? gebaut/) != -1) {
				stadium.coveredPlaces += value;
			}
			else if (text.search(/[\d.]+ Stehpl.tze werden( neu)? gebaut/) != -1) {
				stadium.places += value;
			}
			else if (text.search(/[\d.]+ Sitzpl.tze werden .berdacht/) != -1) {
				stadium.coveredSeats += value;
				stadium.seats -= value;
			}
			else if (text.search(/[\d.]+ Stehpl.tze werden .berdacht/) != -1) {
				stadium.coveredPlaces += value;
				stadium.places -= value;
			}
		} while ((expansionElement = expansionElement.nextSibling))
		return stadium;
	}
}