/**
 * Zat slider component used for forecasts.
 */
class ZatSlider {

	/**
	 * @callback changeCallback
	 * @param {Team} team
	 * @param {Boolean} current
	 * @param {MatchDay} matchDay
	 */

	/**
	 * @param {HTMLElement} containerElement the container element where the slider should be created in
	 * @param {ExtensionData} data the extension data
	 * @param {MatchDay} matchday the match day reference adjusted by slider
	 * @param {changeCallback} callback the callback method called on slider change
	 */
	constructor (containerElement, data, matchday, callback = () => {}) {
		
		/** @type {HTMLElement} the container element where the slider should be created in */ 
		this.containerElement = containerElement;

		/** @type {ExtensionData} the extension data */ 
		this.data = data;

		/** @type {MatchDay} the match day reference adjusted by slider */ 
		this.matchday = ensurePrototype(matchday, MatchDay);

		/** @type {changeCallback} the callback method called on slider change */ 
		this.callback = callback;

		/** @type {HTMLElement} the slider element */ 
		this.slider;
	}

	/**
	 * Returns a element (div) containing the slider and the view (span)
	 * 
	 * @returns {HTMLElement} slider element (container)
	 */
	create () {
	
		let viewInfo = this.containerElement.ownerDocument.createElement('span');
		viewInfo.update = (season, zat) => {
			viewInfo.innerHTML = ` Saison ${season} / Zat ${zat}`;
		};
		viewInfo.update(this.matchday.season, this.matchday.zat);
		
		let rangeSlider = this.containerElement.ownerDocument.createElement('input');
		rangeSlider.type = 'range';
		rangeSlider.min = this.data.lastMatchDay.season * SEASON_MATCH_DAYS + this.data.lastMatchDay.zat;
		rangeSlider.max = (this.data.lastMatchDay.season + Options.forecastSeasons) * SEASON_MATCH_DAYS;
		rangeSlider.value = this.matchday.season * SEASON_MATCH_DAYS + this.matchday.zat;
		rangeSlider.addEventListener('input', (event) => {
			this.matchday.season = Math.floor(event.target.value / SEASON_MATCH_DAYS);
			this.matchday.zat = event.target.value % SEASON_MATCH_DAYS;
			if (this.matchday.zat === 0) {
				this.matchday.season--;
				this.matchday.zat = SEASON_MATCH_DAYS;
			}
			viewInfo.update(this.matchday.season, this.matchday.zat);
		});
		rangeSlider.addEventListener('change', (event) => {
			this.triggerCallback();
		});

		this.slider = this.containerElement.ownerDocument.createElement('div');
		this.slider.appendChild(rangeSlider);
		this.slider.appendChild(viewInfo);
		
		this.triggerCallback();
	
		return this.slider;
	}

	/**
	 * Sets the slider active or inactive.
	 */
	triggerCallback () {
		this.callback(this.data.team.getForecast(this.data.lastMatchDay, this.matchday), 
			this.data.lastMatchDay.equals(this.matchday), this.matchday);
	}

}
