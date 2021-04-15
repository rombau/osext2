
class TrainingPage extends Page {
	
	constructor() {

		super('Training', 'training.php');
	}

	static HEADERS = ['', 'Name', 'Alter', 'Opti', 'Trainer', 'trainierter Skill', 'Skill', 'Chance'];

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		data.currentTeam = Object.assign(new Team(), data.currentTeam);
		
		HtmlUtil.getTableRowsByHeader(doc, ...TrainingPage.HEADERS).forEach(row => {

			let injured = row.cells[0].textContent;
			let trainerNr = +row.cells[4].firstChild.value;
			let skill = row.cells[5].firstChild.selectedOptions[0].text;

			if (!injured && trainerNr > 0 && Object.keys(Skill).includes(skill)) {
			
				let id = HtmlUtil.extractIdFromHref(row.cells[1].firstChild.href);
				let player = data.currentTeam.getSquadPlayer(id); 

				player.nextTraining = new SquadPlayer.Training();
				player.nextTraining.trainer = data.currentTeam.getTrainer(trainerNr);
				player.nextTraining.skill = skill.toLowerCase();

				let chanceCellText = row.cells[7].textContent;
				if (chanceCellText.includes('%')) {
					player.nextTraining.chance = parseFloat(chanceCellText);
				}

				if (!player.lastTraining) {
					player.lastTraining = new SquadPlayer.Training();
					player.lastTraining.trainer = player.nextTraining.trainer;
					player.lastTraining.skill = player.nextTraining.skill;
					player.lastTraining.chance = player.nextTraining.chance;
				}
			}
		});
	}
}
