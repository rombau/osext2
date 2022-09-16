
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

			let id = HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href);
			let player = data.team.getSquadPlayer(id);

			if (!injured && trainerNr > 0 && Object.keys(Skill).includes(skill) && row.cells['Chance'].textContent.search(' %') != -1) {

				if (!player.nextTraining) {
					player.nextTraining = new SquadPlayer.Training();
				}
				player.nextTraining.trainer = data.team.getTrainer(trainerNr);
				player.nextTraining.skill = skill.toLowerCase();
				player.nextTraining.chance = +row.cells['Chance'].textContent.split(' ', 2)[0];

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

		let matchdayConfirmed = data.team.squadPlayers.find(player => player.nextTraining && player.nextTraining.matchBonus !== 1);

		Array.from(HtmlUtil.getTableByHeader(doc, ...Page.Training.HEADERS).rows).forEach((row, index) => {

			row.cells['zuletzt'] = row.cells['Name'].cloneNode(true);
			row.cells['mögl. MW+'] = row.cells['Chance'].cloneNode(true);
			row.cells['EB'] = row.cells['Chance'].cloneNode(true);
			row.cells['ChanceEB'] = row.cells['Chance'].cloneNode(true);

			row.cells['mögl. MW+'].style.paddingLeft = '1em';
			row.cells['zuletzt'].style.paddingLeft = '2em';

			if (index === 0) {

				row.cells['trainierter Skill'].textContent = 'Skill';
				row.cells['Skill'].textContent = 'Wert';
				row.cells['mögl. MW+'].textContent = 'mögl. MW+';
				row.cells['EB'].textContent = 'EB';
				row.cells['EB'].innerHTML = '<abbr title="Einsatzbonus lt. Zugabgabe">EB</abbr>';
				row.cells['EB'].style.width = '3em';
				row.cells['EB'].style.textAlign = 'right';
				row.cells['ChanceEB'].textContent = '(Chance)';
				row.cells['zuletzt'].textContent = 'zuletzt trainiert';
				row.cells['zuletzt'].style.textAlign = 'left';

			} else {

				let id = HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href);
				let player = data.team.getSquadPlayer(id);

				if (player.nextTraining && player.nextTraining.matchBonus !== 1) {
					row.cells['EB'].textContent = player.nextTraining.matchBonus.toFixed(2);
					if (player.nextTraining.chance) {
						row.cells['ChanceEB'].textContent = player.nextTraining.getChanceWithBonus().toFixed(2) + ' %';
					} else {
						row.cells['ChanceEB'].textContent = '';
					}
				} else {
					row.cells['EB'].textContent = '';
					row.cells['ChanceEB'].textContent = '';
				}

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
					row.cells['ChanceEB'].textContent = '';
				});
				row.cells['trainierter Skill'].firstChild.addEventListener('change', (event) => {
					row.cells['Chance'].textContent = '';
					row.cells['ChanceEB'].textContent = '';
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
						row.cells['zuletzt'].textContent += ` mit T ${player.lastTraining.trainer.nr} ${player.lastTraining.trainer.upToSkill}`;
					}
					if (player.lastTraining.chance) {
						row.cells['zuletzt'].textContent += ` bei ${player.lastTraining.getChanceWithBonus().toFixed(2)} %`;
					}
					if (player.lastTraining.successful) {
						row.cells['zuletzt'].textContent += ' erfolgreich'
					}
				} else {
					row.cells['zuletzt'].textContent = '';
				}
				row.cells['mögl. MW+'].classList.add(STYLE_FORECAST);
				row.cells['zuletzt'].classList.add(STYLE_FORECAST);
			}

			if (matchdayConfirmed) {
				row.appendChild(row.cells['EB']);
				row.appendChild(row.cells['ChanceEB']);
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
