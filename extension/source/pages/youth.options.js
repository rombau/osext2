
Page.YouthOptions = class extends Page {
	
	constructor() {

		super('Jugendoptionen', 'ju.php', new Page.Param('page', 4));
	}
		
	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		data.viewSettings.youthSupportPerDay = +doc.getElementsByName("foerderung")[0].value;	

		let matches = /Du hast die Jugendschranke derzeit gesetzt. Dein Jahrgang (\d+) und\s(.+)\swerden nur minimal gef.rdert/gm.exec(doc.body.textContent);
		
		if (matches) {
			data.viewSettings.youthSupportBarrierSeason = +matches[1];
			if (matches[2].includes('nger')) {
				data.viewSettings.youthSupportBarrierType = YouthSupportBarrierType.AND_YOUNGER;
			}
			else if (matches[2].includes('lter')) {
				data.viewSettings.youthSupportBarrierType = YouthSupportBarrierType.AND_OLDER;
			}
		}		
	}

}

