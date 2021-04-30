
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

		if (!data.options.squadPlayerViewMatchDay) data.options.squadPlayerViewMatchDay = data.lastMatchDay;

		let toolbar = doc.createElement('div');
		toolbar.id = 'osext-toolbar-container';

		let toolTitle = doc.createElement('span');
		toolTitle.innerHTML = 'Prognose: ';
		toolbar.appendChild(toolTitle);

		
		let viewInfo = doc.createElement('span');
		viewInfo.update = (season, zat) => {
			viewInfo.innerHTML = ` Saison ${season} / Zat ${zat}`;
		};
		viewInfo.update(data.options.squadPlayerViewMatchDay.season, data.options.squadPlayerViewMatchDay.zat);
		
		let newMatchDay = new MatchDay();

		let rangeSlider = doc.createElement('input');
		rangeSlider.type = 'range';
		rangeSlider.min = data.lastMatchDay.season * SEASON_MATCH_DAYS + data.lastMatchDay.zat;
		rangeSlider.max = (data.lastMatchDay.season + 2) * SEASON_MATCH_DAYS;
		rangeSlider.value = data.options.squadPlayerViewMatchDay.season * SEASON_MATCH_DAYS + data.options.squadPlayerViewMatchDay.zat;
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
				data.options.squadPlayerViewMatchDay = newMatchDay;
			}).then(data => {
				page.updateWithTeam(data.currentTeam.getForecast(data.lastMatchDay, data.options.squadPlayerViewMatchDay), 
					data.lastMatchDay.equals(data.options.squadPlayerViewMatchDay));
			});
		});
		toolbar.appendChild(rangeSlider);

		toolbar.appendChild(viewInfo);
		
		if (!data.lastMatchDay.equals(data.options.squadPlayerViewMatchDay)) {
			page.updateWithTeam(data.currentTeam.getForecast(data.lastMatchDay, data.options.squadPlayerViewMatchDay), 
				data.lastMatchDay.equals(data.options.squadPlayerViewMatchDay));
		}

		return toolbar;
	}

	/**
	 * @param {Team} _team
	 * @param {Boolean} _current
	 */
	updateWithTeam (_team, _current) {}

}
