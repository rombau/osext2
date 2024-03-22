
Page.Menu = class extends Page {

	constructor () {

		super('Menüframe', 'os_menu_haupt.html');
	}

	/**
	 * Processes the menu frame set page.
	 *
	 * @param {Document} doc the document that should be processed
	 * @param {Window} win the current window
	 */
	process (doc, win = window) {

		let isMenuVisibleMobile = false;

		let viewPortTag = doc.createElement('meta');
		viewPortTag.id = viewPortTag.name = 'viewport';
		viewPortTag.content = 'width=device-width, initial-scale=1.0';
		doc.getElementsByTagName('head')[0].appendChild(viewPortTag);

		let mainFrameSet = doc.querySelector('frameset[cols="*"]');
		let mobileMenuFrame = doc.createElement('frame');

		// mobileMenuFrame.contentDocument.body.appendChild(doc.createElement('div'));


		// mainFrameSet.rows = "0,*";
		// mainFrameSet.insertBefore(mobileMenuFrame, mainFrameSet.firstElementChild);


		// to be defined; e.g. tablets with a width of 1024px will show the menu
		let mql = win.matchMedia('(max-width: 1000px)');

		mql.addEventListener('change', () => {
			if (mql.matches) {
				// doc.querySelector('frameset[onload]').cols='0,*'
			} else {
				// doc.querySelector('frameset[onload]').cols='180,*'
			}
		});
		// mql.onchange();

	}

}

