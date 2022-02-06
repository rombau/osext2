
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
	
		let toolbar = doc.createElement('div');
		toolbar.id = 'osext-toolbar-container';
		
		let toolTitle = doc.createElement('span');
		toolTitle.innerHTML = 'Prognose: ';
		toolbar.appendChild(toolTitle);
		
		let zatSlider = new ZatSlider(toolbar, data, data.viewSettings.squadPlayerMatchDay, (team, current, matchday) => {
			page.updateWithTeam(team, current, matchday);
		});
		toolbar.appendChild(zatSlider.create());

		return toolbar;
	}

	/**
	 * @param {Team} _team
	 * @param {Boolean} _current
	 * @param {MatchDay} _matchDay
	 */
	updateWithTeam (_team, _current, _matchDay) {}

}
