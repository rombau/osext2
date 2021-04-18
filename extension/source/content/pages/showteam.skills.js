
class ShowteamSkillsPage extends ShowteamPage {
	
	constructor() {

		super('Einzelskills', 'showteam.php', new Page.Param('s', 2));

		/** @type {HTMLTableElement} */
		this.table;
	}
	
	static HEADERS = ['#', 'Name', 'Land', 'U', 'SCH', 'BAK', 'KOB', 'ZWK', 'DEC', 'GES', 'FUQ', 'ERF', 'AGG', 'PAS', 'AUS', 'UEB', 'WID', 'SEL', 'DIS', 'ZUV', 'EIN'];
	
	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		data.currentTeam = Object.assign(new Team(), data.currentTeam);

		HtmlUtil.getTableRowsByHeaderAndFooter(doc, ...ShowteamSkillsPage.HEADERS).forEach(row => {
	
			let id = HtmlUtil.extractIdFromHref(row.cells[1].firstChild.href);
			let player = data.currentTeam.getSquadPlayer(id); 
			
			Object.keys(player.skills).forEach((skillname, s) => {
				player.skills[skillname] = +row.cells[4 + s].textContent;
			});
		});
	}
	
	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		data.currentTeam = Object.assign(new Team(), data.currentTeam);

		this.table = HtmlUtil.getTableByHeader(doc, ...ShowteamSkillsPage.HEADERS);

		Array.from(this.table.rows).forEach((row, i) => {
			
			row.cells['Alter'] = row.cells['#'].cloneNode(true);
			row.cells['Geb.'] = row.cells['Name'].cloneNode(true);
			row.cells['Flag'] = row.cells['#'].cloneNode(true);
			row.cells['Skillschn.'] = row.cells['#'].cloneNode(true);
			row.cells['Opt.Skill'] = row.cells['#'].cloneNode(true);

			row.cells['Skillschn.'].style.paddingLeft = '10px';
			
			if (i === 0 || i == (this.table.rows.length - 1)) {

				row.cells['Alter'].innerHTML = 'Alter';
				row.cells['Geb.'].innerHTML = 'Geb.';
				row.cells['Skillschn.'].innerHTML = 'Skillschn.';
				row.cells['Opt.Skill'].innerHTML = 'Opt.Skill';

				row.cells['Land'].colSpan = 2;
				
				let cellDummy = row.cells['#'].cloneNode(true);
				cellDummy.width = 0;
				cellDummy.textContent = '';
				row.insertBefore(cellDummy, row.cells['Land']);
				
			} else {

				row.cells['Opt.Skill'].classList.add(STYLE_PRIMARY);
				
				let id = HtmlUtil.extractIdFromHref(row.cells[1].firstChild.href);
				let player = data.currentTeam.getSquadPlayer(id);
					
				row.cells['Alter'].textContent = player.age;
				row.cells['Geb.'].textContent = player.birthday;
				row.cells['Flag'].innerHTML = "<img src=\"images/flaggen/" + player.countryCode + ".gif\"\/>";
				row.cells['Skillschn.'].textContent = player.getAverage().toFixed(2);
				row.cells['Opt.Skill'].textContent = player.getOpti().toFixed(2);

				row.cells['Geb.'].colSpan = 2;
				
				row.insertBefore(row.cells['Flag'], row.cells['Land']);
			}

			row.insertBefore(row.cells['Alter'], row.cells[2]);
			row.insertBefore(row.cells['Geb.'], row.cells[3]);
			row.appendChild(row.cells['Skillschn.']);			
			row.appendChild(row.cells['Opt.Skill']);			
			
		});
		
		HtmlUtil.appendScript(doc,'sortables_init();');
	};
}

