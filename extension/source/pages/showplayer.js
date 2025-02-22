
Page.ShowPlayer = class extends Page {

	/**
	 * @param {Number} id the player id
	 * @param {String} name the player name shown when loading
	 */
	constructor (id, name = '') {

		super(`Spieler ${name}`, 'sp.php', new Page.Param('s', id));

		this.dataIndependent = true;
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract (doc, data) {

		let id = HtmlUtil.extractIdFromHref(doc.querySelector('img[src^=face]').src);

		// add salary to observed player
		let observedPlayer = data.team.observedPlayers.find(player => player.id === id);
		if (observedPlayer) {
			let cell = doc.evaluate('.//td[contains(., "Monatsgehalt :")]', doc.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
			observedPlayer.salary = +cell.singleNodeValue.nextSibling.textContent.replaceAll(/[^\d]/g, '');
		}

	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend (doc, data) {

		if (!window.navigator.userAgent.toLowerCase().includes('firefox')) {
			window.resizeTo(window.outerWidth * window.devicePixelRatio, window.outerHeight * window.devicePixelRatio);
		}

	}
}
