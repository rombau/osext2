
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

		let toolbar = doc.createElement('div');

		let span = doc.createElement('span');
		span.innerHTML = 'Prognose: ';
		toolbar.appendChild(span);

		let select = doc.createElement('select');
		Object.values(SquadPlayerView).forEach(view => {
			let option = doc.createElement("option");
			option.text = view;
			option.value = view;
			select.appendChild(option);
		})
		select.value = data.options.squadPlayerView;
		select.addEventListener('change', (event) => {
			Persistence.updateCachedData(data => {
				data.options.squadPlayerView = event.target.value;
			}).then(data => {
				switch (data.options.squadPlayerView) {
					case SquadPlayerView.CURRENT:
						page.updateWithTeam(doc, data.currentTeam);
						break;
					case SquadPlayerView.THIS_SEASON_END:
						page.updateWithTeam(doc, data.currentTeam.getForecast(data.lastMatchDay,
							data.currentTeam.getMatchDay(data.lastMatchDay.season, SAISON_MATCH_DAYS)));
						break;
					case SquadPlayerView.NEXT_SEASON_END:
						page.updateWithTeam(doc, data.currentTeam.getForecast(data.lastMatchDay,
							data.currentTeam.getMatchDay(data.lastMatchDay.season + 1, SAISON_MATCH_DAYS)));
						break;
					default:				
						break;
				}
			});
		});
		toolbar.appendChild(select);

		return toolbar;
	}

	/**
	 * @param {Document} _doc
	 * @param {Team} _team
	 */
	updateWithTeam (_doc, _team) {}

}
