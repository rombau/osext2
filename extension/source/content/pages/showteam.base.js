
class ShowteamPage extends Page {
	
	constructor(name, path, ...params) {

		super(name, path, ...params);

	}

	/**
	 * Creates the toolbar for the squad player (showteam) views.
	 * 
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 * 
	 * @returns {HTMLElement} the toolbar element
	 */
	createToolbar (doc, data) {
		
		let page = this;

		if (!data.viewSettings.squadPlayerMatchDay) data.viewSettings.squadPlayerMatchDay = data.lastMatchDay;

		let toolbar = doc.createElement('div');
		toolbar.id = 'osext-toolbar-container';

		let toolTitle = doc.createElement('span');
		toolTitle.innerHTML = 'Prognose: ';
		toolbar.appendChild(toolTitle);

		
		let viewInfo = doc.createElement('span');
		viewInfo.update = (season, zat) => {
			viewInfo.innerHTML = ` Saison ${season} / Zat ${zat}`;
		};
		viewInfo.update(data.viewSettings.squadPlayerMatchDay.season, data.viewSettings.squadPlayerMatchDay.zat);
		
		let newMatchDay = new MatchDay();

		let rangeSlider = doc.createElement('input');
		rangeSlider.type = 'range';
		rangeSlider.min = data.lastMatchDay.season * SEASON_MATCH_DAYS + data.lastMatchDay.zat;
		rangeSlider.max = (data.lastMatchDay.season + Options.forecastSeasons) * SEASON_MATCH_DAYS;
		rangeSlider.value = data.viewSettings.squadPlayerMatchDay.season * SEASON_MATCH_DAYS + data.viewSettings.squadPlayerMatchDay.zat;
		rangeSlider.addEventListener('input', (event) => {
			newMatchDay.season = Math.floor(event.target.value / SEASON_MATCH_DAYS);
			newMatchDay.zat = event.target.value % SEASON_MATCH_DAYS;
			if (newMatchDay.zat === 0) {
				newMatchDay.season--;
				newMatchDay.zat = SEASON_MATCH_DAYS;
			}
			viewInfo.update(newMatchDay.season, newMatchDay.zat);
		});
		rangeSlider.addEventListener('change', (event) => {
			Persistence.updateCachedData(data => {
				data.viewSettings.squadPlayerMatchDay = newMatchDay;
			}).then(data => {
				page.updateWithTeam(data.currentTeam.getForecast(data.lastMatchDay, data.viewSettings.squadPlayerMatchDay), 
					data.lastMatchDay.equals(data.viewSettings.squadPlayerMatchDay), data.viewSettings.squadPlayerMatchDay);
			});
		});
		toolbar.appendChild(rangeSlider);

		toolbar.appendChild(viewInfo);
		
		if (!data.lastMatchDay.equals(data.viewSettings.squadPlayerMatchDay)) {
			page.updateWithTeam(data.currentTeam.getForecast(data.lastMatchDay, data.viewSettings.squadPlayerMatchDay), 
				data.lastMatchDay.equals(data.viewSettings.squadPlayerMatchDay), data.viewSettings.squadPlayerMatchDay);
		}

		return toolbar;
	}

	/**
	 * @param {Team} _team
	 * @param {Boolean} _current
	 * @param {MatchDay} _matchDay
	 */
	updateWithTeam (_team, _current, _matchDay) {}

}
