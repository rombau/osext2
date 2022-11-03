/**
 * Enum for column origins.
 * @readonly
 */
 const Origin = Object.freeze({
	OS: 'OS',
	Extension: 'Extension'
});

/**
 * Class for style properties.
 */
class StyleProperty {

	/**
	 * @param {String} propertyName
	 * @param {String} value
	 * @param {String} priority
	 */
	constructor (propertyName, value, priority) {

		/** @type {String} the property name */
		this.propertyName = propertyName;

		/** @type {String} the value */
		this.value = value;

		/** @type {String} the priority */
		this.priority = priority;
	}
}

/**
 * Class for columns in a managed table.
 */
class Column {

	/**
	 * @param {String} name the name
	 * @param {Origin} origin=Origin.OS the origin
	 */
	constructor (name, origin = Origin.OS) {

		/** @type {String} the column name */
		this.name = name;
		
		/** @type {Origin} the origin */
		this.origin = origin;

		/** @type {String} the column header; name as default */
		this.header = name;

		/** @type {String} the column reference name */
		this.ref = name;

		/** @type {String} the column title */
		this.title;

		/** @type {[String]} list with additional element style classes */
		this.stylesClasses = [];

		/** @type {[StyleProperty]} list with custom style properties */
		this.styles = [];

		/** @type {Number} the original index of the cell based on the header */
		this.originalIndex = null;
	}

	/**
	 * Sets a header and reference replacement. 
	 * 
	 * @param {String} ref the new header and reference
	 * @returns this column
	 */
	withRef (ref) {
		this.ref = ref;
		return this;
	}

	/**
	 * Sets a custom header.
	 * 
	 * @param {String} header the new header
	 * @returns this column
	 */
	withHeader (header, title) {
		this.header = header;
		this.title = title;
		return this;
	}

	/**
	 * Adds a style class for the column cells.
	 * 
	 * @param {String} styleClass the style class
	 * @returns this column
	 */
	withStyleClass (styleClass) {
		this.stylesClasses.push(styleClass);
		return this;
	}

	/**
	 * Adds a style property for the column cells.
	 * 
	 * @example
	 * withCustomStyle ('width', '3em', true);
	 * 
	 * @param {String} propertyName the property name
	 * @param {String} value the property value
	 * @param {String} priority the priority (optional)
	 * @returns this column
	 */
	withStyle (propertyName, value, priority) {
		this.styles.push(new StyleProperty(propertyName, value, priority ? 'important' : undefined));
		return this;
	}
}

/**
 * Class for managed tables with defined columns.
 */
class ManagedTable {

	/**
	 * @param {String} page name of the page containing the table
	 * @param {...Column} columns of the table
	 */
	constructor (page, ...columns) {
		
		/** @type {String} the page name containing the table */
		this.page = page;
	
		/** @type {[Column]} the columns of the table */
		this.columns = columns;
		
		/** @type {HTMLTableElement} the managed HTML table element */
		this.table;

		/** @type {[String]} the current ordered column names/headers of the table */
		this.columnNames = [];

		/** @type {[HTMLTableRowElement]} the current rows related to a column/header */
		this.columnRelatedRows = [];
	}

	/**
	 * @type {PageConfig} the tables page configuration
	 */
	get config () {
		Options.pageConfig[this.page] = Options.pageConfig[this.page] || new PageConfig();
		ensurePrototype(Options.pageConfig[this.page].hiddenColumns, Array);
		return Options.pageConfig[this.page];
	}

	/**
	 * Finds the first HTML table with the row headers matching the Origin.OS columns 
	 * (by name and indepentant of the order), and modifies the table based on all 
	 * defined columns considering the defined order and custom headers/styles.
	 * 
	 * Splitted columns related to either spaned header or data columns are joined,
	 * in order to make column positioning and sorting possible.
	 * 
	 * Named cell references are added to the resulting table rows, 
	 * so accessing a cell is possible by column name:
	 * @example 
	 * row.cells['Name'].textContent
	 * 
	 * @param {Document} doc the page document
	 * @param {Boolean} customizable
	 */
	initialize (doc, customizable = true) {

		if (this.table) return;

		// find table with OS headers
		let osColumns = this.columns.filter(column => column.origin === Origin.OS);
		this.table = Array.from(doc.getElementsByTagName('table')).find((table) => {
			return osColumns.every(column => {
				let cell = Array.from(table.rows[0].cells).find(cell => cell.textContent === column.name);
				if (cell) {
					cell.textContent = column.name = column.ref;
					return true;
				}
				return false;
			});
		});

		if (!this.table) {
			throw new Error(`Tabelle nicht gefunden! (${this.page})`);
		}

		// define header related rows
		let cellHeaders = Array.from(this.rows[0].cells).map(cell => cell.textContent);
		this.columnRelatedRows = this.rows.filter(row => !Array.from(row.cells).find(cell => {
			let spanAttr = cell.getAttributeNode('colspan');
			return spanAttr && +spanAttr.value > 3; // limit col span joining
		}));
		this.columnRelatedRows.forEach(row => row.isHeader = (row.textContent.replaceAll(/\s/g,'') === cellHeaders.join('').replaceAll(/\s/g,'')));

		// join spaned columns; headers could be changed
		cellHeaders = this._removeColSpans(osColumns);
	
		// find index of original columns
		osColumns.forEach(column => column.originalIndex = cellHeaders.indexOf(column.name));

		// reorder and add named cell references
		this.columnRelatedRows.forEach(row => {

			/** @type {[HTMLTableCellElement]} */ 
			let orderedCells = [];
			let namedCellMap = [];

			// known columns
			this.columns.forEach(column => {
				
				/** @type {[HTMLTableCellElement]} */ 
				let cell;
				
				if (column.origin === Origin.OS) {
					cell = row.cells[column.originalIndex];
				} else if (column.origin === Origin.Extension) {
					cell = doc.createElement('td');
					let classNameCell = Array.from(row.cells).find(cell => cell.className);
					if (classNameCell) cell.className = classNameCell.className;
				}
				if (row.isHeader) {
					if (column.title) {
						cell.title = column.title;
						let span = doc.createElement('span');
						span.innerHTML = column.header;
						span.className = 'abbr';
						cell.textContent = '';
						cell.appendChild(span);
					} else {
						cell.innerHTML = column.header;
					}
				}					
				orderedCells.push(cell);

				cell.columnName = column.name;
				
				column.stylesClasses.forEach(styleClass => cell.classList.add(styleClass));
				column.styles.forEach(style => cell.style.setProperty(style.propertyName, style.value, style.priority));

				namedCellMap[column.name] = cell;
			});

			// add unknown columns
			Array.from(row.cells).forEach(cell => {
				if (!orderedCells.includes(cell)) orderedCells.push(cell);
			});

			// reorder
			row.replaceChildren(...orderedCells);
			
			// customizing based on options
			if (row.isHeader) this.columnNames = orderedCells.map(cell => cell.columnName || cell.textContent);
			this._customizeCells(orderedCells);

			// add named references
			Object.entries(namedCellMap).forEach(([name, cell]) => {
				row.cells[name] = cell;
			});
		});

		this.columnNames = Array.from(this.columnRelatedRows[0].cells).map(cell => cell.columnName || cell.textContent)

		if (customizable) {

			// add configuration button/menu
			this._addColumnVisibilityConfiguration(doc);
	
			// add column move handling
			this._makeColumnsMovable();
		}
	}

	/**
	 * Splitted columns related to either spaned header or data columns are joined,
	 * in order to make column positioning and sorting possible.
	 * 
	 * @param {[Column]} osColumns column definitions
	 * @returns {[String]} the updated headers
	 */
	_removeColSpans (osColumns) {

		let headerSpan = [];
		let dataSpan = [];
		this.columnRelatedRows.forEach((row, r) => {
			Array.from(row.cells).forEach((cell, i) => {
				let spanAttr = cell.getAttributeNode('colspan');
				if (spanAttr) {
					if (row.isHeader) {
						if (r == 0) headerSpan[i] = +spanAttr.value;
					} else if (!dataSpan[i]) {
						dataSpan[i] = +spanAttr.value;
						if (i < headerSpan.length) headerSpan.splice(i, dataSpan[i] - 1);
					}
					cell.removeAttributeNode(spanAttr);
				}
			});
		});
		this.columnRelatedRows.forEach(row => {
			Array.from(row.cells).forEach((cell, i) => {
				let span = row.isHeader ? dataSpan[i] : headerSpan[i];
				if (span > 1) {
					[...Array(span - 1)].forEach(() => {
						if (row.isHeader) {
							let column = osColumns.find(c => c.header === cell.textContent);
							cell.textContent = (cell.textContent + ' ' + cell.nextElementSibling.textContent).trim();
							column.header = cell.textContent;
						} else {
							cell.innerHTML = (cell.innerHTML + ' ' + cell.nextElementSibling.innerHTML).trim();
						}
						cell.nextElementSibling.remove();
					});
				}
			});
		});
		return Array.from(this.rows[0].cells).map(cell => cell.textContent);
	}

	/**
	 * Change the visibility and the sort order based on the page configuration.
	 * 
	 * @param {[HTMLTableCellElement]} orderedCells ordered list of cells
	 */
	_customizeCells (orderedCells) {

		orderedCells.forEach(cell => {
			if (this.config.hiddenColumns.includes(this.columnNames[cell.cellIndex])) {
				cell.classList.add(STYLE_HIDDEN_COLUMN);
			} else {
				cell.classList.remove(STYLE_HIDDEN_COLUMN);
			}
		});
		orderedCells.sort((c1, c2) => {
			let index1 = this.config.sortedColumns.indexOf(this.columnNames[c1.cellIndex]);
			let index2 = this.config.sortedColumns.indexOf(this.columnNames[c2.cellIndex]);
			if (index1 < 0 && index2 < 0) return 0;
			else if (index1 < 0 && index2 >= 0) return 1;
			else if (index1 >= 0 && index2 < 0) return -1;
			else return index1 - index2;
		});
		orderedCells[0].parentElement.replaceChildren(...orderedCells);
	}

	/**
	 * Adds configuration options for the table.
	 * 
	 * @param {Document} doc 
	 */
	_addColumnVisibilityConfiguration (doc) {

		let menuArea = HtmlUtil.createDivElement('', STYLE_HIDDEN, doc);
		menuArea.addEventListener('click', (event) => {
			event.stopPropagation();
		});
		let configButton = HtmlUtil.createAwesomeButton(doc, 'fa-cogs', (event) => {
			menuArea.classList.toggle(STYLE_HIDDEN);
			event.stopPropagation();
		}, 'Spaltenkonfiguration');

		doc.body.addEventListener('click', () => {
			menuArea.classList.add(STYLE_HIDDEN);
		});

		this.columns
			.filter(column => column.origin === Origin.Extension)
			.map(({ name, header, title }) => ({ name: name, desc: title || header || name }))
			.concat(this.columnNames
				.filter(columnName => !this.columns.map(column => column.name).includes(columnName))
				.map(name => ({ name: name, script: true })))
			.forEach(column => {

				let hidden = this.config.hiddenColumns.includes(column.name);
				menuArea.appendChild(HtmlUtil.createAwesomeButton(doc, hidden ? STYLE_OFF : STYLE_ON, (event) => {
					event.target.classList.toggle(STYLE_OFF);
					event.target.classList.toggle(STYLE_ON);
					let on = event.target.classList.contains(STYLE_ON);
					let index = this.columnNames.indexOf(column.name);
					this.columnRelatedRows.forEach(row => {
						if (on) {
							row.cells[index].classList.remove(STYLE_HIDDEN_COLUMN);
						} else {
							row.cells[index].classList.add(STYLE_HIDDEN_COLUMN);
						}
					});
					if (on) {
						this.config.hiddenColumns = this.config.hiddenColumns.filter(c => c !== column.name);
					} else {
						this.config.hiddenColumns.push(column.name);
					}
					Options.save();
				}));

				let label = doc.createElement('span');
				label.textContent = (column.desc || column.name);
				menuArea.appendChild(label);
				if (column.script) {
					let script = doc.createElement('span');
					script.textContent = ' script';
					script.style.fontSize = 'xx-small';
					script.style.opacity = 0.6;
					label.style.opacity = 0.9;
					menuArea.appendChild(script);
				}
				menuArea.appendChild(doc.createElement('br'));
			});
		
		if (menuArea.children.length) menuArea.appendChild(doc.createElement('br'));
		menuArea.appendChild(this._createResetLink(doc));

		let container = HtmlUtil.createDivElement(configButton, STYLE_MANAGED, doc);
		container.appendChild(HtmlUtil.createDivElement(menuArea, null, doc));
		this.table.parentNode.insertBefore(container, this.table);
		container.appendChild(this.table);
	}

	/**
	 * Creates a reset link element.
	 * 
	 * @param {Document} doc 
	 * @returns {HTMLAnchorElement}
	 */
	_createResetLink(doc) {

		let reset = doc.createElement('a');
		reset.href = '#';
		reset.textContent = 'Alles zurücksetzen';
		reset.style.float = 'right';
		reset.style.fontSize = 'smaller';
		reset.style.opacity = 0.8;
		reset.addEventListener('click', (event) => {
			event.preventDefault();
			this.config.hiddenColumns = [];
			this.config.sortedColumns = [];
			Options.save().then(() => {
				window.location.reload();
			});
		});
		return reset;
	}

	/**
	 * Makes the columns of the table movable and stores the order.
	 */
	_makeColumnsMovable () {

		let srcCell;

		this.columnNames.map((_name, i) => this.columnRelatedRows[0].cells[i]).forEach(cell => {

			cell.setAttribute('draggable', true);

			cell.addEventListener('dragstart', (event) => {
				srcCell = event.currentTarget;
				srcCell.classList.add(STYLE_DRAG);
				event.dataTransfer.effectAllowed = 'move';
			});

			cell.addEventListener('dragenter', (event) => {
				this.columnNames.map((_name, i) => this.columnRelatedRows[0].cells[i]).forEach(c => c.classList.remove(STYLE_DRAGOVER));
				event.currentTarget.classList.add(STYLE_DRAGOVER);
				return;
			});

			cell.addEventListener('dragover', (event) => {
				event.preventDefault();
				event.dataTransfer.dropEffect = 'move';
				return;
			});

			cell.addEventListener('drop', (event) => {
				event.stopPropagation();
				if (srcCell !== event.currentTarget) {
					let fromIndex = srcCell.cellIndex;
					let toIndex = event.currentTarget.cellIndex;
					this.columnRelatedRows.forEach(row => {
						if (toIndex > fromIndex) {
							row.insertBefore(row.cells[fromIndex], row.cells[toIndex].nextSibling);
						} else if (toIndex < this.columnNames.length - 1) {
							row.insertBefore(row.cells[fromIndex], row.cells[toIndex]);
						}
					});
					let newColumnNames = Array.from(this.columnRelatedRows[0].cells).map(cell => cell.columnName || cell.textContent);
					if (this.columnNames !== newColumnNames) {
						this.columnNames = newColumnNames;
						this.config.sortedColumns = newColumnNames;
						Options.save();
					}
				}
				return;
			});

			cell.addEventListener('dragend', () => {
				this.columnNames.map((_name, i) => this.columnRelatedRows[0].cells[i]).forEach(c => c.classList.remove(STYLE_DRAGOVER));
				srcCell.classList.remove(STYLE_DRAG);
				return;
			});
		});
		
	}

	/**
	 * Sets the opacity of unknown/script columns. 
	 * These column values aren't changed related to a forecast.
	 * 
	 * @param {Boolean} forecast indicates a forecast view
	 */
	styleUnknownColumns (forecast) {
		
		this.columnNames.filter(columnName => !this.columns.map(column => column.name).includes(columnName)).forEach(columnName => {
			this.columnRelatedRows.forEach(row => {
				let cell = row.cells[this.columnNames.indexOf(columnName)];
				if (forecast) {
					cell.classList.add(STYLE_INACTIVE);
				} else {
					cell.classList.remove(STYLE_INACTIVE);
				}
			});
		});
	}

	/**
	 * @property {[HTMLTableRowElement]} array with the table rows
	 */
	get rows () {
		return Array.from(this.table.rows);
	}

	/**
	 * @property {Node} parentNode of the table (=container)
	 */
	get container () {
		return this.table.parentNode;
	}
	
	/**
	 * @property {Node} parentNode of the table container
	 */
	get parentNode () {
		return this.container.parentNode;
	}
}

