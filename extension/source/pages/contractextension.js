
Page.ContractExtension = class extends Page {

	constructor() {

		super('Vertragsverlängerungen', 'vt.php');

	}

	static HEADERS = ['Name', 'Alter', 'Land', 'Gehalt', 'Laufzeit', 'Skillschnitt', 'Opt. Skill', '24', 'Monate', '36', 'Monate', '48', 'Monate', '60', 'Monate'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		HtmlUtil.getTableRowsByHeader(doc, ...Page.ContractExtension.HEADERS).forEach(row => {

			let id = HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href);
			let player = data.team.getSquadPlayer(id);

			player.followUpSalary['24'] = +row.cells[8].textContent.replaceAll('.', '');
			player.followUpSalary['36'] = +row.cells[10].textContent.replaceAll('.', '');
			player.followUpSalary['48'] = +row.cells[12].textContent.replaceAll('.', '');
			player.followUpSalary['60'] = +row.cells[14].textContent.replaceAll('.', '');

		});

		// initialize new players
		if (data.team.squadPlayerAdded) {
			data.requestSquadPlayerPages();
		}
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		Array.from(HtmlUtil.getTableByHeader(doc, ...Page.ContractExtension.HEADERS).rows).forEach((row, i) => {

			let player = (i === 0 ? null : data.team.getSquadPlayer(HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href)));

			row.cells['Geb.Tag'] = row.cells['Alter'].cloneNode(true);
			row.cells['Geb.Tag'].align = 'left';
			row.cells['Geb.Tag'].textContent = (i === 0 ? 'Geb.' : player.birthday);

			row.cells['AlterAblauf'] = row.cells['Alter'].cloneNode(true);
			if (i === 0) {

				row.cells['AlterAblauf'].textContent = '';
				row.cells['AlterAblauf'].appendChild(HtmlUtil.createAbbreviation('vor Vertragsablauf', 'Alter'));

			} else {

				let lastDay = new MatchDay(data.lastMatchDay.season, data.lastMatchDay.zat);
				lastDay.add((player.contractTerm * MONTH_MATCH_DAYS) - (lastDay.zat % MONTH_MATCH_DAYS) - 1);

				row.cells['AlterAblauf'].textContent = '';
				row.cells['AlterAblauf'].appendChild(HtmlUtil.createAbbreviation(`Saison ${lastDay.season} / Zat ${lastDay.zat}`, 
					(player.ageExact + lastDay.intervalTo(data.lastMatchDay) / SEASON_MATCH_DAYS).toFixed(2)));

				row.cells['AlterAblauf'].classList.add(STYLE_FORECAST);

				if (player.contractExtensionMatchDay && data.lastMatchDay.equals(player.contractExtensionMatchDay) && player.contractExtensionTerm) {
					let radio = row.cells[player.contractExtensionTerm / 6 + 3].firstChild;
					if (radio) radio.checked = true;
				}
			}

			row.insertBefore(row.cells['Geb.Tag'], row.cells['Land']);
			row.insertBefore(row.cells['AlterAblauf'], row.cells['Skillschnitt']);

			CONTRACT_LENGTHS.slice(0, -1).forEach((term, t) => {

				row.cells['Alter' + term] = row.cells['Alter'].cloneNode(true);
				
				if (i === 0) {
					
					let lastDay = new MatchDay(data.lastMatchDay.season, data.lastMatchDay.zat);
					lastDay.add((term * MONTH_MATCH_DAYS) - (lastDay.zat % MONTH_MATCH_DAYS) - 1);
					
					row.cells['Alter' + term].textContent = '';
					row.cells['Alter' + term].appendChild(HtmlUtil.createAbbreviation(`Saison ${lastDay.season} / Zat ${lastDay.zat} (vor Vertragsablauf)`, 'Alter'));

					row.insertBefore(row.cells['Alter' + term], row.cells[11 + t * 3]);

				} else {

					let id = HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href);
					let player = data.team.getSquadPlayer(id);
		
					let lastDay = new MatchDay(data.lastMatchDay.season, data.lastMatchDay.zat);
					lastDay.add((term * MONTH_MATCH_DAYS) - (lastDay.zat % MONTH_MATCH_DAYS) - 1);

					row.cells['Alter' + term].textContent = (player.ageExact + lastDay.intervalTo(data.lastMatchDay) / SEASON_MATCH_DAYS).toFixed(2);

					row.cells['Alter' + term].classList.add(STYLE_FORECAST);

					row.insertBefore(row.cells['Alter' + term], row.cells[11 + t * 3]);

					let sytle = row.cells['Alter' + term].previousElementSibling.firstChild.style;
					if (sytle) {
						row.cells['Alter' + term].style.color = sytle.color;
						row.cells['Alter' + term].style.setProperty('font-size', sytle.fontSize, 'important');
					}
				}
			});
		});
	}
}
