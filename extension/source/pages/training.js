
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
			let skill = Page.Training.getRegularSkill(row.cells['trainierter Skill'].firstChild.selectedOptions[0].text);
			
			if (!injured && trainerNr > 0 && Object.keys(Skill).includes(skill) && row.cells['Chance'].textContent.search(' %') != -1) {
				

				let id = HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href);
				let player = data.team.getSquadPlayer(id);

				if (!player.nextTraining) {
					player.nextTraining = new SquadPlayer.Training();
				}
				player.nextTraining.trainer = data.team.getTrainer(trainerNr);
				player.nextTraining.skill = skill.toLowerCase();
				player.nextTraining.chance = +row.cells['Chance'].textContent.split(' ')[0];

				// last training only undefined when initializing the first time
				// otherwise it's initialized from the stored next training (main page)
				if (!player.lastTraining) {
					player.lastTraining = new SquadPlayer.Training();
					player.lastTraining.trainer = player.nextTraining.trainer;
					player.lastTraining.skill = player.nextTraining.skill;
					player.lastTraining.chance = player.nextTraining.chance;
				}
			}
		});
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend(doc, data) {

		// TODO extend with last training, and skill select listener for chance and market value increase

		Array.from(HtmlUtil.getTableByHeader(doc, ...Page.Training.HEADERS).rows).forEach((row, index) => {

			row.cells['zuletzt'] = row.cells['Name'].cloneNode(true);
			row.cells['mögl. MW+'] = row.cells['Chance'].cloneNode(true);

			row.cells['zuletzt'].style.paddingLeft = '2em';

			if (index === 0) {

				row.cells['trainierter Skill'].textContent = 'Skill';
				row.cells['Skill'].textContent = 'Wert';
				row.cells['mögl. MW+'].textContent = 'mögl. MW+';
				row.cells['zuletzt'].textContent = 'zuletzt trainiert';
	
			} else {

				let id = HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href);
				let player = data.team.getSquadPlayer(id);
				
				let forecastMarketValue = () => {
					let skill = Page.Training.getRegularSkill(row.cells['trainierter Skill'].firstChild.selectedOptions[0].text);
					if (Object.keys(Skill).includes(skill)) {
						/** @type {SquadPlayer} */ 
						let forecastPlayer = Object.assign(new SquadPlayer(), JSON.parse(JSON.stringify(player)));
						forecastPlayer.skills[skill.toLocaleLowerCase()]++;
						row.cells['mögl. MW+'].textContent = (forecastPlayer.getMarketValue() - player.getMarketValue()).toLocaleString();
						row.cells['Skill'].textContent = player.skills[skill.toLocaleLowerCase()];
					} else {
						row.cells['mögl. MW+'].textContent = '';
						row.cells['Skill'].textContent = '';
					}
				};

				row.cells['Trainer'].firstChild.addEventListener('change', (event) => {
					row.cells['Chance'].textContent = '';
				});
				row.cells['trainierter Skill'].firstChild.addEventListener('change', (event) => {
					row.cells['Chance'].textContent = '';
					forecastMarketValue();
				});
				forecastMarketValue();

				if (player.lastTraining && player.lastTraining.skill) {
					let skill = player.lastTraining.skill.toUpperCase();
					if (row.cells['Name'].className === Position.TOR) {
						skill = Page.Training.getTorSkill(skill);
					}
					row.cells['zuletzt'].textContent = skill;
					if (player.lastTraining.trainer && player.lastTraining.trainer.legacySkill) {
						row.cells['zuletzt'].textContent += ` mit ${player.lastTraining.trainer.legacySkill}er`;
					}
					if (player.lastTraining.chance) {
						row.cells['zuletzt'].textContent += ` bei ${player.lastTraining.chance.toFixed(2)} %`;
					}
				} else {
					row.cells['zuletzt'].textContent = '';
				}
				row.cells['zuletzt'].classList.add(STYLE_FORECAST);
			}

			row.appendChild(row.cells['mögl. MW+']);
			row.appendChild(row.cells['zuletzt']);
		});
	}

	/**
	 * Returns the converted skill for position TOR.
	 * 
	 * @param {String} skill the skill to convert
	 * @returns {String}
	 */
	static getRegularSkill (skill) {
		if (skill === 'ABS') return 'SCH';
		if (skill === 'STS') return 'BAK';
		if (skill === 'FAN') return 'KOB';
		if (skill === 'STB') return 'ZWK';
		if (skill === 'SPL') return 'DEC';
		if (skill === 'REF') return 'GES';
		return skill;
	}
	

	/**
	 * Returns the converted skill for position TOR.
	 * 
	 * @param {String} skill the skill to convert
	 * @returns {String}
	 */
	static getTorSkill (skill) {
		if (skill === 'SCH') return 'ABS';
		if (skill === 'BAK') return 'STS';
		if (skill === 'KOB') return 'FAN';
		if (skill === 'ZWK') return 'STB';
		if (skill === 'DEC') return 'SPL';
		if (skill === 'GES') return 'REF';
		return skill;
	}
}
