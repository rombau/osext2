
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
		
		HtmlUtil.allowStickyToolbar(doc);
		
		let page = this;
	
		let toolbar = doc.createElement('div');
		toolbar.id = 'osext-toolbar-container';
		
		let toolTitle = doc.createElement('span');
		toolTitle.textContent = 'Prognose: ';
		toolbar.appendChild(toolTitle);
		
		let matchdaySlider = HtmlUtil.createMatchDaySlider(toolbar, data.lastMatchDay, data.viewSettings.squadPlayerMatchDay, 
			matchday => {
				Persistence.storeExtensionData(data);
				page.updateWithTeam(data.team.getForecast(data.lastMatchDay, matchday), data.lastMatchDay.equals(matchday), matchday);
			});
		toolbar.appendChild(matchdaySlider);

		return toolbar;
	}

	/**
	 * @param {Team} _team
	 * @param {Boolean} _current
	 * @param {MatchDay} _matchDay
	 */
	updateWithTeam (_team, _current, _matchDay) {}

}
