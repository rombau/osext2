
Page.Training = class extends Page {
	
	constructor() {

		super('Training', 'training.php');
	}

	static HEADERS = ['', 'Name', 'Alter', 'Opti', 'Trainer', 'trainierter Skill', 'Skill', 'Chance'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {
		
		HtmlUtil.getTableRowsByHeader(doc, ...Page.Training.HEADERS).forEach(row => {

			let injured = row.cells[''].textContent;
			let trainerNr = +row.cells['Trainer'].firstChild.value;
			let skill = row.cells['trainierter Skill'].firstChild.selectedOptions[0].text;

			if (skill === 'ABS') skill = 'SCH';
			else if (skill === 'STS') skill = 'BAK';
			else if (skill === 'FAN') skill = 'KOB';
			else if (skill === 'STB') skill = 'ZWK';
			else if (skill === 'SPL') skill = 'DEC';
			else if (skill === 'REF') skill = 'GES';

			if (!injured && trainerNr > 0 && Object.keys(Skill).includes(skill) && 
				row.cells['Chance'].textContent.search(' %') != -1) {
			
				let id = HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href);
				let player = data.team.getSquadPlayer(id); 

				if (!player.nextTraining) {
					player.nextTraining = new SquadPlayer.Training();
				}
				player.nextTraining.trainer = data.team.getTrainer(trainerNr);
				player.nextTraining.skill = skill.toLowerCase();

				// last training only undefined when initializing the first time
				// otherwise it's initialized from the stored next training (main page)
				if (!player.lastTraining) {
					player.lastTraining = new SquadPlayer.Training();
					player.lastTraining.trainer = player.nextTraining.trainer;
					player.lastTraining.skill = player.nextTraining.skill;
				}
			}
		});
	}
}
