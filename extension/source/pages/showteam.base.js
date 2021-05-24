
Page.Showteam = class extends Page {
	
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
	
		let squadPlayerMatchDay = data.viewSettings.squadPlayerMatchDay;	

		let toolbar = doc.createElement('div');
		toolbar.id = 'osext-toolbar-container';

		let toolTitle = doc.createElement('span');
		toolTitle.innerHTML = 'Prognose: ';
		toolbar.appendChild(toolTitle);
		
		let viewInfo = doc.createElement('span');
		viewInfo.update = (season, zat) => {
			viewInfo.innerHTML = ` Saison ${season} / Zat ${zat}`;
		};
		viewInfo.update(squadPlayerMatchDay.season, squadPlayerMatchDay.zat);
		
		let rangeSlider = doc.createElement('input');
		rangeSlider.type = 'range';
		rangeSlider.min = data.lastMatchDay.season * SEASON_MATCH_DAYS + data.lastMatchDay.zat;
		rangeSlider.max = (data.lastMatchDay.season + Options.forecastSeasons) * SEASON_MATCH_DAYS;
		rangeSlider.value = data.viewSettings.squadPlayerMatchDay.season * SEASON_MATCH_DAYS + data.viewSettings.squadPlayerMatchDay.zat;
		rangeSlider.addEventListener('input', (event) => {
			squadPlayerMatchDay.season = Math.floor(event.target.value / SEASON_MATCH_DAYS);
			squadPlayerMatchDay.zat = event.target.value % SEASON_MATCH_DAYS;
			if (squadPlayerMatchDay.zat === 0) {
				squadPlayerMatchDay.season--;
				squadPlayerMatchDay.zat = SEASON_MATCH_DAYS;
			}
			viewInfo.update(squadPlayerMatchDay.season, squadPlayerMatchDay.zat);
		});
		rangeSlider.addEventListener('change', (event) => {
			page.updateWithTeam(data.team.getForecast(data.lastMatchDay, squadPlayerMatchDay), 
				data.lastMatchDay.equals(squadPlayerMatchDay), squadPlayerMatchDay);
		});
		toolbar.appendChild(rangeSlider);

		toolbar.appendChild(viewInfo);
		
		if (!data.lastMatchDay.equals(squadPlayerMatchDay)) {
			page.updateWithTeam(data.team.getForecast(data.lastMatchDay, squadPlayerMatchDay), 
				data.lastMatchDay.equals(squadPlayerMatchDay), squadPlayerMatchDay);
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
