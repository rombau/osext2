
Page.Training = class extends Page {

	constructor() {

		super('Training', 'training.php');

	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract(doc, data) {

		this.table = new ManagedTable(this.name,
			new Column(''),
			new Column('Name'),
			new Column('Alter'),
			new Column('Opti'),
			new Column('Trainer'),
			new Column('trainierter Skill').withHeader('Skill'),
			new Column('Skill').withHeader('Wert'),
			new Column('Chance'),
			new Column('EB', Origin.Extension).withHeader('EB', 'Einsatzbonus lt. Zugabgabe').withStyle('width','3em').withStyle('text-align','right'),
			new Column('ChanceEB', Origin.Extension).withHeader('Chance', 'Chance mit Einsatzbonus'),
			new Column('mögl. MW+', Origin.Extension).withStyleClass(STYLE_FORECAST).withStyle('padding-left','1em'),
			new Column('zuletzt', Origin.Extension).withHeader('zuletzt trainiert').withStyleClass(STYLE_FORECAST).withStyle('padding-left','2em').withStyle('text-align','left')
		);

		this.table.initialize(doc);

		this.table.rows.slice(1).forEach(row => {

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

		this.table.rows.forEach((row, i) => {

			if (i > 0) {

				let id = HtmlUtil.extractIdFromHref(row.cells['Name'].firstChild.href);
				let player = data.team.getSquadPlayer(id);

				if (player.nextTraining && player.nextTraining.matchBonus !== 1) {
					row.cells['EB'].textContent = player.nextTraining.matchBonus.toFixed(2);
					if (player.nextTraining.chance) {
						row.cells['ChanceEB'].textContent = player.nextTraining.getChanceWithBonus().toFixed(2) + ' %';
					}
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
				}
			}
			
			if (!matchdayConfirmed) {
				row.cells['EB'].classList.add(STYLE_HIDDEN);
				row.cells['ChanceEB'].classList.add(STYLE_HIDDEN);
			}
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
