
Page.LoanView = class extends Page {

	constructor() {

		super('Leihübersicht', 'viewleih.php');
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		let columns = [
			new Column('Name'),
			new Column('Alter'),
			new Column('Land'),
			new Column('U'),
			new Column('Skillschnitt').withHeader('Skillschn.'),
			new Column('Opt. Skill'),
			new Column('Leihdauer'),
			new Column('Gehalt'),
			new Column('Leihgebühr'),
			new Column('Leihclub')
		];

		this.tableTo = new ManagedTable(this.name, ...columns);
		this.tableTo.initialize(doc, false);

		this.tableTo.rows.slice(1).forEach(row => {

			let player = data.team.getSquadPlayer(HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href));
			player.loan.fee = +row.cells['Leihgebühr'].textContent.replaceAll('.', '');
			player.pos = row.cells['Name'].className;

		});

		// by changing the column headers of tableTo, the next table can be found with the same columns

		this.tableFrom = new ManagedTable(this.name, ...columns);
		this.tableFrom.initialize(doc, false);

		this.tableFrom.rows.slice(1).forEach(row => {

			let player = data.team.getSquadPlayer(HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href));
			player.loan.fee = -row.cells['Leihgebühr'].textContent.replaceAll('.', '');
			player.pos = row.cells['Name'].className;
			
		});

		// initialize new players
		if (data.team.squadPlayerAdded) {
			data.requestSquadPlayerPages();
		}

	}

}
