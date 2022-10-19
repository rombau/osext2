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

		/** @type {String} the column title */
		this.title;

		/** @type {Number} number of additional data column before this column (header col span) */
		this.dataColumnBefore = 0;

		/** @type {Number} number of additional data column after this column (header col span) */
		this.dataColumnAfter = 0;

		/** @type {[String]} list with additional element style classes */
		this.stylesClasses = [];

		/** @type {[StyleProperty]} list with custom style properties */
		this.styles = [];

		/** @type {Number} the original header index of the cell */
		this.headerIndex = null;

		/** @type {Number} the original data index of the cell */
		this.dataIndex = null;
	}

	/**
	 * Adds an additional data column before this column (header col span).
	 * 
	 * @returns this column
	 */
	withDataColumnBefore () {
		this.dataColumnBefore++;
		return this;
	}

	/**
	 * Adds an additional data column after this column (header col span).
	 * 
	 * @returns this column
	 */
	withDataColumnAfter () {
		this.dataColumnAfter++;
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
	}

	/**
	 * Finds the first HTML table with the row headers matching the Origin.OS columns 
	 * (by name and indepentant of the order), and modifies the table based on all 
	 * defined columns considering the defined order and custom headers/styles.
	 * 
	 * Named cell references are added to the resulting table rows, 
	 * so accessing a cell is possible by column name:
	 * @example 
	 * row.cells['Name'].textContent
	 * 
	 * @param {Document} doc the page document
	 */
	initialize (doc) {

		if (this.table) return;

		// find table with OS headers
		let osColumns = this.columns.filter(column => column.origin === Origin.OS);
		let osHeaders = osColumns.map(column => column.name);
		this.table = Array.from(doc.getElementsByTagName('table')).find((table) => {
			return osHeaders.every((header, i) => {
				return Array.from(table.rows[0].cells).some(cell => cell.textContent === header);
			});
		});

		if (!this.table) {
			throw new Error(`Tabelle nicht gefunden! (${this.page})`);
		}
	
		// find header and data index of original columns
		let cellHeaders = Array.from(this.rows[0].cells).map(cell => cell.textContent);
		osColumns.forEach(column => {
			column.headerIndex = cellHeaders.indexOf(column.name);
			column.dataIndex = osColumns.reduce((index, column) => (index + (column.dataIndex != null ? (1 + column.dataColumnBefore + column.dataColumnAfter) : 0)), 0)
		});

		// reorder and add named cell references
		this.rows.forEach(row => {
			if (row.cells.length >= cellHeaders.length) {

				let header = row.textContent.replaceAll(/\s/g,'') === cellHeaders.join('').replaceAll(/\s/g,'');

				/** @type {[HTMLTableCellElement]} */ 
				let orderedCells = [];
				let namedCellMap = [];

				this.columns.forEach(column => {
					/** @type {[HTMLTableCellElement]} */ 
					let cell;
					if (column.origin === Origin.OS) {
						if (header) {
							cell = row.cells[column.headerIndex];
							cell.innerHTML = column.header;
							orderedCells.push(cell);
						} else {
							let dataIndex = column.dataIndex;
							[...Array(column.dataColumnBefore)].forEach(() => orderedCells.push(row.cells[dataIndex++]));
							cell = row.cells[dataIndex];
							orderedCells.push(cell);
							[...Array(column.dataColumnAfter)].forEach(() => orderedCells.push(row.cells[++dataIndex]));
						}
					} else if (column.origin === Origin.Extension) {
						cell = doc.createElement('td');
						let classNameCell = Array.from(row.cells).find(cell => cell.className);
						if (classNameCell) cell.className = classNameCell.className;
						if (header) {
							if (column.title) cell.title = column.title;
							cell.innerHTML = column.header;
						}
						orderedCells.push(cell);
					}

					column.stylesClasses.forEach(styleClass => cell.classList.add(styleClass));
					column.styles.forEach(style => cell.style.setProperty(style.propertyName, style.value, style.priority));

					namedCellMap[column.name] = cell;
				});

				Array.from(row.cells).forEach(cell => {
					if (!orderedCells.includes(cell)) orderedCells.push(cell);
				});

				row.replaceChildren(...orderedCells);

				Object.entries(namedCellMap).forEach(([name, cell]) => {
					row.cells[name] = cell;
				});
			}
		});

		let container = HtmlUtil.createDivElement('', STYLE_MANAGED, doc);
		this.table.parentNode.insertBefore(container, this.table);
		container.appendChild(this.table);
		container.appendChild(HtmlUtil.createAwesomeButton(doc, 'fa-cogs', () => {

			


		}, 'Spaltenkonfiguration'));

	}

	/**
	 * @property {[HTMLTableRowElement]} array with the table rows
	 */
	get rows () {
		return Array.from(this.table.rows);
	}

	/**
	 * @property {HTMLTableElement} the managed HTML table; use with care!
	 */
	get instance () {
		return this.table;
	}

}

