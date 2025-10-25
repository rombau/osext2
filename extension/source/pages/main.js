Page.Main = class extends Page {

	constructor () {

		super('Managerbüro', 'haupt.php');
	}

	/**
	 * Processes the main page and sets the current team. Then the default processing is triggered.
	 *
	 * @param {Document} doc the document that should be processed
	 * @param {Window} win the current window
	 */
	process (doc, win = window) {

		super.check(doc);

		this.titleContainer = doc.querySelector('div#a a[href="?changetosecond=true"]').parentElement;
		this.teamName = /Willkommen im Managerb.ro von (.+)/gm.exec(this.titleContainer.childNodes[0].textContent)[1];

		let page = this;
		let superProcess = super.process;

		Persistence.updateCurrentTeam(this.teamName).then(() => {
			superProcess.call(page, doc, win);
		});
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extract (doc, data) {

		let matches = /Der nächste ZAT ist ZAT (\d+) und liegt auf/gm.exec(doc.querySelectorAll('div#a b')[1].textContent);

		let nextZat = (+matches[1] <= 1 || +matches[1] > SEASON_MATCH_DAYS) ? 1 : +matches[1];
		if (data.nextZat !== nextZat) {

			// reset view setting to avoid old matchday
			data.viewSettings.squadPlayerMatchDay = null;
			data.viewSettings.youthPlayerMatchDay = null;

			// take over the trainings settings from previous zat
			data.team.squadPlayers.forEach(player => {
				if (player.nextTraining) {
					player.nextTraining.matchBonus = 1;
				}
				if (player.injured || !player.nextTraining || !player.nextTraining.trainer || !player.nextTraining.skill || !player.nextTraining.chance) {
					player.lastTraining = null;
				} else if (player.nextTraining) {
					player.lastTraining = new SquadPlayer.Training();
					player.lastTraining.trainer = player.nextTraining.trainer;
					player.lastTraining.skill = player.nextTraining.skill;
					player.lastTraining.chance = player.nextTraining.chance;
				}
			});

			data.initNextZat(nextZat);

			data.pagesToRequest = [];
			data.requestAllPages();
		}

		matches = /images\/wappen\/((\d+)\.[a-z]+)/gm.exec(doc.querySelector('div#a img[src*=wappen]').src);

		data.team.id = +matches[2];
		data.team.emblem = matches[1];

		data.team.name = this.teamName;

		matches = /(\d)\. Liga ?[A-D]? (.+)/gm.exec(this.titleContainer.childNodes[2].textContent);

		data.team.league.level = +matches[1];
		data.team.league.countryName = matches[2];

		let accountBalanceElement = doc.querySelector('div#a a[href="ka.php"]');
		if (accountBalanceElement && accountBalanceElement.textContent.includes('Euro')) {
			data.team.accountBalance = +accountBalanceElement.textContent.replaceAll('.', '').replace(' Euro', '');
			let balancedMatchdays = data.team.sortedMatchDays.filter(matchday => matchday.accountBalance && matchday.result);
			if (balancedMatchdays.length && balancedMatchdays[0].accountBalance !== data.team.accountBalance && data.pagesToRequest.length === 0) {
				data.pagesToRequest.push(new Page.AccountStatement());
			}
		}
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extend (doc, data) {

		let contractExtensionPlayers = data.team.squadPlayers.filter(player => data.lastMatchDay && player.contractExtensionMatchDay
			&& data.lastMatchDay.equals(player.contractExtensionMatchDay));
		let fastTransferPlayers = data.team.squadPlayers.filter(player => data.lastMatchDay && player.fastTransferMatchDay
			&& data.lastMatchDay.equals(player.fastTransferMatchDay));
		let pullYouthPlayers = data.team.youthPlayers.filter(player => data.lastMatchDay && player.pullMatchDay
			&& data.lastMatchDay.equals(player.pullMatchDay));

		if (contractExtensionPlayers.length || fastTransferPlayers.length || pullYouthPlayers.length) {

			let table = doc.querySelector('div#a > table');
			let warnCell = table.querySelector('td[class=STU] > b').parentElement;

			if (warnCell) {

				let tipRow = warnCell.parentElement.nextElementSibling;
				let infoRow = tipRow.cloneNode(true);
				let infoCell = infoRow.cells[0];

				infoCell.childNodes[1].textContent = 'Geplante Aktionen (vor dem nächsten Zat):';
				infoCell.replaceChildren(infoCell.childNodes[1]);
				infoCell.style.padding = '7px 0px';

				if (contractExtensionPlayers.length) {
					let link = doc.createElement('a');
					link.href = 'vt.php';
					link.textContent = 'Vertragsverlängerung von ';
					contractExtensionPlayers.forEach((player, i) => {
						link.textContent += `${i > 0 ? ', ' : ''}${player.name} (${player.contractExtensionTerm} Monate)`;
					});
					infoCell.appendChild(HtmlUtil.createDivElement(link, STYLE_ACTION_INFO, doc));
				}

				if (fastTransferPlayers.length) {
					let link = doc.createElement('a');
					link.href = 'blitz.php';
					link.textContent = 'Schnelltranfer von ';
					fastTransferPlayers.forEach((player, i) => {
						link.textContent += `${i > 0 ? ', ' : ''}${player.name}`;
					});
					infoCell.appendChild(HtmlUtil.createDivElement(link, STYLE_ACTION_INFO, doc));
				}

				if (pullYouthPlayers.length) {
					let link = doc.createElement('a');
					link.href = 'ju.php';
					link.textContent = `Jugendspieler (${pullYouthPlayers.length}) ins A-Team übernehmen`;
					infoCell.appendChild(HtmlUtil.createDivElement(link, STYLE_ACTION_INFO, doc));
				}

				table.tBodies[0].insertBefore(infoRow, tipRow);
			}
		}

		this.extendObservedPlayers(doc, data);

		// observe AJAX changes
		new MutationObserver(() => {
			this.extendObservedPlayers(doc, data);
		}).observe(doc.querySelector('div#vps'), {childList: true});
	}

	/**
	 * @param {Document} doc
	 * @param {ExtensionData} data
	 */
	extendObservedPlayers (doc, data) {

		this.table = new ManagedTable(this.name,
			new Column('Spieler').withStyle('text-align', 'left'),
			new Column('Team').withStyle('text-align', 'left'),
			new Column('Alter').withStyle('text-align', 'right'),
			new Column('Skill').withStyle('width', '40px').withStyle('text-align', 'right'),
			new Column('Opti').withStyle('width', '40px').withStyle('text-align', 'right'),
			new Column('Marktwert').withStyle('width', '70px').withStyle('text-align', 'right'),
			new Column('Gehalt', Origin.Extension).withStyle('width', '60px').withStyle('text-align', 'right'),
			new Column('Art', Origin.Extension).withStyle('padding-left', '10px'),
			new Column('Notiz').withHeader(''),
			new Column('Transferdetails', Origin.Extension).withHeader(''),
			new Column('Aktion').withHeader('')
		);

		this.table.initialize(doc, false);

		this.table.table.classList.add(STYLE_MANAGED);

		let currentobservedPlayerIds = [];

		this.table.rows.slice(1).forEach(row => {

			let id = HtmlUtil.extractIdFromHref(row.cells['Spieler'].firstChild.href);
			let newTeamId = HtmlUtil.extractIdFromHref(row.cells['Team'].firstChild.href);

			currentobservedPlayerIds.push(id);

			let player = data.team.getObservedPlayer(id);

			if (player.teamId !== newTeamId || (player.matchDay && ensurePrototype(player.matchDay, MatchDay).before(data.nextMatchDay))) {
				player.type = ObservationType.NOTE;
			}

			player.teamId = newTeamId;
			player.teamName = row.cells['Team'].textContent;
			player.name = row.cells['Spieler'].textContent;
			player.marketValue = +row.cells['Marktwert'].textContent.replaceAll('.', '');

			if (data.team.id === player.teamId) {
				player.salary = data.team.getSquadPlayer(id).salary;
			} else if (!player.salary) {
				data.pagesToRequest.push(new Page.ShowPlayer(player.id, player.name));
			}
			row.cells['Gehalt'].textContent = player.salary?.toLocaleString();

			let typeSelect = HtmlUtil.createSelect(doc, Object.values(ObservationType).filter(type => type === ObservationType.NOTE || player.teamId !== 0).map(type => ({
				label: type === ObservationType.TRANSFER ? (data.team.id === player.teamId ? 'Verkauf' : 'Kauf') : type,
				value: type
			})), player.type, (newValue) => {
				player.type = newValue;
				if (player.type === ObservationType.NOTE) {
					player.matchDay = null;
					player.transferPriceType = null;
					player.transferPrice = null;
					player.loan = null;
					row.cells['Notiz'].classList.remove(STYLE_HIDDEN_COLUMN);
					row.cells['Transferdetails'].classList.add(STYLE_HIDDEN_COLUMN);
				} else {
					player.matchDay = player.matchDay || new MatchDay(data.nextMatchDay.season, data.nextMatchDay.zat);
					seasonSelect.changeTo(player.matchDay.season);
					zatSelect.changeTo(player.matchDay.zat);
					row.cells['Notiz'].classList.add(STYLE_HIDDEN_COLUMN);
					row.cells['Transferdetails'].classList.remove(STYLE_HIDDEN_COLUMN);
					if (player.type === ObservationType.LOAN) {
						player.loan = player.loan || new SquadPlayer.Loan();
						player.transferPriceType = null;
						player.transferPrice = null;
						priceSelect.classList.add(STYLE_HIDDEN);
						priceInput.classList.add(STYLE_HIDDEN);
						durationSelect.classList.remove(STYLE_HIDDEN);
						feeSelect.classList.remove(STYLE_HIDDEN);
						feeInput.classList.remove(STYLE_HIDDEN);
						durationSelect.changeTo(player.loan.duration || 36);
						feeSelect.changeTo(player.loan.feePercent || 1);
					} else {
						player.loan = null;
						priceSelect.classList.remove(STYLE_HIDDEN);
						priceInput.classList.remove(STYLE_HIDDEN);
						durationSelect.classList.add(STYLE_HIDDEN);
						feeSelect.classList.add(STYLE_HIDDEN);
						feeInput.classList.add(STYLE_HIDDEN);
						priceSelect.changeTo(player.transferPriceType || TransferPrice.MARKETVALUE);
					}
				}
			});
			typeSelect.style.width = '70px';

			let currentSeason = data.lastMatchDay.season === data.nextMatchDay.season;
			let minZat = currentSeason ? data.nextMatchDay.zat : 1;
			let seasonSelect = HtmlUtil.createSelect(doc, Array.from({length: Options.forecastSeasons - (currentSeason ? 0 : 1)}, (_, i) => ({
				label: 'Saison ' + (data.nextMatchDay.season + i),
				value: data.nextMatchDay.season + i
			})), player.matchDay ? player.matchDay.season : data.nextMatchDay.season, (newValue) => {
				player.matchDay.season = +newValue;
				Array.from(zatSelect.options).forEach(zatOption => {
					zatOption.disabled = false;
					if (player.matchDay.season === data.nextMatchDay.season && +zatOption.value < minZat) zatOption.disabled = true;
				});
				if (player.matchDay.season === data.nextMatchDay.season && +zatSelect.value < minZat) {
					zatSelect.changeTo(minZat);
				}
			});
			let zatSelect = HtmlUtil.createSelect(doc, Array.from({length: SEASON_MATCH_DAYS}, (_, i) => ({
				label: 'Zat ' + (i + 1),
				value: (i + 1)
			})), player.matchDay ? player.matchDay.zat : data.nextMatchDay.zat, (newValue) => {
				player.matchDay.zat = +newValue;
			});

			let priceSelect = HtmlUtil.createSelect(doc, Object.values(TransferPrice), player.transferPriceType, (newValue) => {
				player.transferPriceType = newValue;
				priceInput.disabled = true;
				switch (player.transferPriceType) {
					case TransferPrice.MAX:
						player.transferPrice = Math.round(player.marketValue * 100 / 75);
						break;
					case TransferPrice.MIN:
						player.transferPrice = Math.round(player.marketValue * 75 / 100);
						break;
					case TransferPrice.MARKETVALUE:
						player.transferPrice = player.marketValue;
						break;
					default:
						player.transferPrice = player.transferPrice || player.marketValue;
						priceInput.disabled = false;
						break;
				}
				priceInput.value = player.transferPrice.toLocaleString();
			});

			let priceInput = doc.createElement('input');
			priceInput.type = 'text';
			priceInput.classList.add(STYLE_ELEMENT);
			priceInput.addEventListener('keypress', (event) => {
				let key = (event.type === 'paste') ? event.clipboardData.getData('text/plain') : event.key;
				if (!/[0-9]/.test(key)) event.preventDefault();
			});
			priceInput.addEventListener('change', (event) => {
				let transferPrice = +event.target.value.replaceAll('.', '');
				event.target.value = transferPrice.toLocaleString();
				player.transferPrice = transferPrice;
			});

			let durationSelect = HtmlUtil.createSelect(doc, Array.from({length: 11}, (_, i) => ({
				label: (36 + i * 6) + ' Zats',
				value: (36 + i * 6)
			})), player.loan ? player.loan.duration : 36, (newValue) => {
				player.loan.duration = +newValue;
			});

			let feeSelect = HtmlUtil.createSelect(doc, Array.from({length: 9}, (_, i) => ({
				label: (1 + i * 0.25).toFixed(2) + ' %',
				value: (1 + i * 0.25)
			})), player.loan ? player.loan.feePercent : 1, (newValue) => {
				player.loan.feePercent = +newValue;
				let fee = Math.round(player.marketValue * player.loan.feePercent / 100);
				player.loan.fee = fee * (data.team.id === player.teamId ? 1 : -1);
				feeInput.value = fee.toLocaleString();
			});

			let feeInput = doc.createElement('input');
			feeInput.type = 'text';
			feeInput.disabled = true;
			feeInput.classList.add(STYLE_ELEMENT);

			row.cells['Art'].appendChild(typeSelect);

			row.cells['Transferdetails'].appendChild(seasonSelect);
			row.cells['Transferdetails'].appendChild(zatSelect);
			row.cells['Transferdetails'].appendChild(priceSelect);
			row.cells['Transferdetails'].appendChild(priceInput);
			row.cells['Transferdetails'].appendChild(durationSelect);
			row.cells['Transferdetails'].appendChild(feeSelect);
			row.cells['Transferdetails'].appendChild(feeInput);

			typeSelect.dispatchEvent(new Event('change')); // trigger init

			let saveButton = row.querySelector('input[type="button"][value="speichern"]');
			saveButton.addEventListener('click', () => {
				data.team.observedPlayers.splice(data.team.observedPlayers.findIndex(p => p.id === player.id), 1);
				data.team.observedPlayers.push(player);
				Persistence.storeExtensionData(data);
			});

			let deleteButton = row.querySelector('input[type="button"][value="löschen"]');
			deleteButton.addEventListener('click', () => {
				data.team.observedPlayers.splice(data.team.observedPlayers.findIndex(p => p.id === player.id), 1);
				Persistence.storeExtensionData(data);
			});
		});

		// remove all no longer observed players
		data.team.observedPlayers = data.team.observedPlayers.filter(player => currentobservedPlayerIds.includes(player.id));

		// fetch salary for non squad players
		Persistence.storeExtensionData(data);
		if (data.pagesToRequest.length) {
			let page = this;
			Requestor.create(doc, () => {
				Persistence.getExtensionData().then(updatedData => {
					data = updatedData;
					page.table.rows.slice(1).forEach(row => {
						let id = HtmlUtil.extractIdFromHref(row.cells['Spieler'].firstChild.href);
						let player = ensurePrototype(updatedData, ExtensionData).team.getObservedPlayer(id);
						row.cells['Gehalt'].textContent = player.salary.toLocaleString();
					});
				});
			}).fetchPage(data.pagesToRequest[0]);
		}
	}
}

