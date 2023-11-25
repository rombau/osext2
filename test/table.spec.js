describe('Managed table', () => {

	/** @type {ManagedTable} */ let table;

	beforeEach(() => {

		Options.pageConfig = {};

		spyOn(Options, 'initialize').and.callFake(() => {});
		spyOn(Options, 'save').and.callFake(() => {
			return { then: () => {} };
		});
	});

	it('should be not found ', () => {

		table = new ManagedTable('Test', new Column('A', Origin.OS) );

		try {
			table.initialize(Fixture.createDocument());
			fail('table not exists');
		} catch (e) {
			expect(e.message).toEqual('Tabelle nicht gefunden! (Test)');
		}

		try {
			table.initialize(Fixture.createDocument('<table><tr><td>B</td></tr></table>'));
			fail('table with column A not exists');
		} catch (e) {
			expect(e.message).toEqual('Tabelle nicht gefunden! (Test)');
		}

	});

	describe('should be initialized with', () => {

		it('one appended column', () => {

			table = new ManagedTable('Test', new Column('A'), new Column('B', Origin.Extension) );

			table.initialize(Fixture.createDocument('<table><tr><td>A</td></tr></table>'));

			expect(table.rows[0].cells[0].textContent).toEqual('A');
			expect(table.rows[0].cells[1].textContent).toEqual('B');
		});

		it('one inserted column', () => {

			table = new ManagedTable('Test', new Column('B', Origin.Extension), new Column('A') );

			table.initialize(Fixture.createDocument('<table><tr><td>A</td></tr></table>'));

			expect(table.rows[0].cells[0].textContent).toEqual('B');
			expect(table.rows[0].cells[1].textContent).toEqual('A');
		});

		it('one appended styled column', () => {

			table = new ManagedTable('Test', new Column('A'), 
				new Column('B', Origin.Extension)
					.withStyle('width','1em')
					.withStyle('text-align','left','important')
					.withStyleClass('test1')
					.withStyleClass('test2') );

			table.initialize(Fixture.createDocument('<table><tr><td>A</td></tr></table>'));

			expect(table.rows[0].cells[1].style.width).toEqual('1em');
			expect(table.rows[0].cells[1].style.textAlign).toEqual('left');
			expect(table.rows[0].cells[1].classList.value).toEqual('test1 test2');
		});

		it('one column and different header', () => {

			table = new ManagedTable('Test', new Column('A').withHeader('X'), new Column('B', Origin.Extension).withHeader('Y','Ypsilon') );

			table.initialize(Fixture.createDocument('<table><tr><td>A</td></tr></table>'));

			expect(table.rows[0].cells[0].textContent).toEqual('X');
			expect(table.rows[0].cells[1].textContent).toEqual('Y');
			expect(table.rows[0].cells[1].title).toEqual('Ypsilon');
			expect(table.rows[0].cells[1].textContent).toEqual('Y');
			expect(table.rows[0].cells[1].title).toEqual('Ypsilon');
		});

		it('two same named columns', () => {

			table = new ManagedTable('Test', new Column('A').withRef('A1'), new Column('A').withRef('A2') );

			table.initialize(Fixture.createDocument('<table><tr><td>A</td><td>A</td></tr></table>'));

			expect(table.rows[0].cells['A1'].textContent).toEqual('A');
			expect(table.rows[0].cells['A2'].textContent).toEqual('A');
		});

		it('three columns with header span', () => {

			table = new ManagedTable('Test', new Column('A'), new Column('B'), new Column('C') );

			table.initialize(Fixture.createDocument('<table><tr><td>A</td><td colspan=2>B</td><td>C</td></tr><tr><td>1</td><td>2a</td><td>2b</td><td>3</td></tr></table>'));

			expect(table.rows[0].cells[0].textContent).toEqual('A');
			expect(table.rows[0].cells[1].textContent).toEqual('B');
			expect(table.rows[0].cells[2].textContent).toEqual('C');
			expect(table.rows[1].cells[0].textContent).toEqual('1');
			expect(table.rows[1].cells[1].textContent).toEqual('2a 2b');
			expect(table.rows[1].cells[2].textContent).toEqual('3');
			expect(table.rows[1].cells['A'].textContent).toEqual('1');
			expect(table.rows[1].cells['B'].textContent).toEqual('2a 2b');
			expect(table.rows[1].cells['C'].textContent).toEqual('3');
		});

		it('three columns with data span', () => {

			table = new ManagedTable('Test', new Column('A'), new Column('B'), new Column('C'), new Column('X', Origin.Extension) );

			table.initialize(Fixture.createDocument('<table><tr><td>A</td><td>B</td><td></td><td>C</td></tr><tr><td>1</td><td colspan=2>2a 2b</td><td>3</td></tr></table>'));

			expect(table.rows[0].cells[0].textContent).toEqual('A');
			expect(table.rows[0].cells[1].textContent).toEqual('B');
			expect(table.rows[0].cells[2].textContent).toEqual('C');
			expect(table.rows[0].cells[3].textContent).toEqual('X');
			expect(table.rows[1].cells[0].textContent).toEqual('1');
			expect(table.rows[1].cells[1].textContent).toEqual('2a 2b');
			expect(table.rows[1].cells[2].textContent).toEqual('3');
			expect(table.rows[1].cells[3].textContent).toEqual('');
			expect(table.rows[1].cells['A'].textContent).toEqual('1');
			expect(table.rows[1].cells['B'].textContent).toEqual('2a 2b');
			expect(table.rows[1].cells['C'].textContent).toEqual('3');
			expect(table.rows[1].cells['X'].textContent).toEqual('');
		});

		it('unmanaged columns', () => {

			table = new ManagedTable('Test', new Column('A'), new Column('X', Origin.Extension) );

			table.initialize(Fixture.createDocument('<table><tr><td colspan=2>A</td><td>B</td><td>C</td></tr><tr><td>1a</td><td>1b</td><td>2</td><td>3</td></tr></table>'));

			expect(table.rows[0].cells[0].textContent).toEqual('A');
			expect(table.rows[0].cells[1].textContent).toEqual('X');
			expect(table.rows[0].cells[2].textContent).toEqual('B');
			expect(table.rows[0].cells[3].textContent).toEqual('C');
			expect(table.rows[1].cells['A'].textContent).toEqual('1a 1b');
			expect(table.rows[1].cells['X'].textContent).toEqual('');
			expect(table.rows[1].cells['B']).toBeUndefined();
			expect(table.rows[1].cells['C']).toBeUndefined();
			expect(table.rows[1].cells[0].textContent).toEqual('1a 1b');
			expect(table.rows[1].cells[1].textContent).toEqual('');
			expect(table.rows[1].cells[2].textContent).toEqual('2');
			expect(table.rows[1].cells[3].textContent).toEqual('3');
		});

		it('columns and customize', () => {

			let config = new PageConfig();
			config.sortedColumns = ['X', 'A'];
			config.hiddenColumns = ['X', 'B'];
			Options.pageConfig['Test'] = config;

			table = new ManagedTable('Test', new Column('A'), new Column('X', Origin.Extension) );

			table.initialize(Fixture.createDocument('<table><tr><td>A</td><td>B</td><td>C</td></tr><tr><td>1</td><td>2</td><td>3</td></tr></table>'));

			expect(table.rows[0].cells[0].textContent).toEqual('X');
			expect(table.rows[0].cells[1].textContent).toEqual('A');
			expect(table.rows[0].cells[2].textContent).toEqual('B');
			expect(table.rows[0].cells[3].textContent).toEqual('C');
			expect(table.rows[1].cells[0].textContent).toEqual('');
			expect(table.rows[1].cells[1].textContent).toEqual('1');
			expect(table.rows[1].cells[2].textContent).toEqual('2');
			expect(table.rows[1].cells[3].textContent).toEqual('3');
			expect(table.rows[1].cells['X'].textContent).toEqual('');
			expect(table.rows[1].cells['A'].textContent).toEqual('1');

			expect(table.rows[0].cells[0].classList.contains(STYLE_HIDDEN_COLUMN)).toBeTrue();
			expect(table.rows[0].cells[1].classList.contains(STYLE_HIDDEN_COLUMN)).toBeFalse();
			expect(table.rows[0].cells[2].classList.contains(STYLE_HIDDEN_COLUMN)).toBeTrue();
			expect(table.rows[0].cells[3].classList.contains(STYLE_HIDDEN_COLUMN)).toBeFalse();
			expect(table.rows[1].cells[0].classList.contains(STYLE_HIDDEN_COLUMN)).toBeTrue();
			expect(table.rows[1].cells[1].classList.contains(STYLE_HIDDEN_COLUMN)).toBeFalse();
			expect(table.rows[1].cells[2].classList.contains(STYLE_HIDDEN_COLUMN)).toBeTrue();
			expect(table.rows[1].cells[3].classList.contains(STYLE_HIDDEN_COLUMN)).toBeFalse();
		});

		it('columns and sort with old order', () => {

			let config = new PageConfig();
			config.sortedColumns = ['D', 'X', 'A', 'E'];
			Options.pageConfig['Test'] = config;

			table = new ManagedTable('Test', new Column('A'), new Column('X', Origin.Extension) );

			table.initialize(Fixture.createDocument('<table><tr><td>A</td><td>B</td><td>C</td></tr><tr><td>1</td><td>2</td><td>3</td></tr></table>'));

			expect(table.rows[0].cells[0].textContent).toEqual('X');
			expect(table.rows[0].cells[1].textContent).toEqual('A');
			expect(table.rows[0].cells[2].textContent).toEqual('B');
			expect(table.rows[0].cells[3].textContent).toEqual('C');
		});

		it('youth overview', (done) => {

			Fixture.getDocument('ju.php', doc => {

				table = new ManagedTable('Jugendübersicht',
					new Column('Alter', Origin.OS),
					new Column('Pos', Origin.Extension),
					new Column('Geb.', Origin.OS),
					new Column('Land', Origin.OS),
					new Column('U', Origin.OS),
					new Column('Skillschnitt', Origin.OS).withHeader('Skillschn.'),
					new Column('Opt.Skill', Origin.Extension),
					new Column('Talent', Origin.OS),
					new Column('Aktion', Origin.OS),
					new Column('Aufwertung', Origin.OS),
					new Column('Ø/Zat', Origin.Extension),
					new Column('Marktwert', Origin.Extension),
					new Column('ØP', Origin.Extension),
					new Column('ØN', Origin.Extension),
					new Column('ØU', Origin.Extension)
				);
				
				table.initialize(doc);
				
				const getCellContentArray = (row) => Array.from(row.cells).map(cell => cell.textContent);

				expect(getCellContentArray(table.rows[0])).toEqual(['Alter','Pos','Geb.','Land','U','Skillschn.','Opt.Skill','Talent','Aktion','Aufwertung','Ø/Zat','Marktwert','ØP','ØN','ØU']);
				expect(getCellContentArray(table.rows[1])).toEqual(['Jahrgang Saison 11']);
				expect(getCellContentArray(table.rows[2])).toEqual(['18','','24',' CYP','','41.65','','normal','','','','','','','']);

				table.columns.forEach((column, i) => {
					expect(table.rows[0].cells[column.name]).toEqual(table.rows[0].cells[i]);
				});			
				
				done();
			});
		});
	});

	it('should be customizable', () => {

		table = new ManagedTable('Test', new Column('A'), new Column('X', Origin.Extension) );

		let doc = Fixture.createDocument('<table><tr><td>A</td><td>B</td></tr><tr><td>1</td><td>2</td></tr></table>');

		table.initialize(doc);

		let menu = doc.querySelector('.osext-managed .menu');
		expect(menu.className).toEqual('osext-popup menu osext-hidden');

		doc.querySelector('.osext-managed > .fa-cogs').dispatchEvent(new Event('click'));
		expect(menu.className).toEqual('osext-popup menu');

		let columnButtons = menu.querySelectorAll('i');
		let columnLabels = menu.querySelectorAll('div');
		expect(columnButtons[0].className).toEqual('fas fa-toggle-on');
		expect(columnButtons[1].className).toEqual('fas fa-toggle-on');
		expect(columnLabels[0].textContent).toEqual('X');
		expect(columnLabels[1].textContent).toEqual('B');

		columnButtons[1].dispatchEvent(new Event('click'));
		expect(columnButtons[1].className).toEqual('fas fa-toggle-off');
		expect(Options.save).toHaveBeenCalled();

		columnButtons[1].dispatchEvent(new Event('click'));
		expect(columnButtons[1].className).toEqual('fas fa-toggle-on');
		expect(Options.save).toHaveBeenCalled();

		menu.querySelector('a').dispatchEvent(new Event('click'));
		expect(Options.save).toHaveBeenCalled();

		menu.dispatchEvent(new Event('click'));
		expect(menu.className).toEqual('osext-popup menu');

		doc.body.dispatchEvent(new Event('click'));
		expect(menu.className).toEqual('osext-popup menu osext-hidden');

		let cellMoveFrom = table.rows[0].cells[0];
		let cellMoveTo = table.rows[0].cells[1];

		expect(table.rows[0].cells[0].textContent).toEqual('A');
		expect(table.rows[0].cells[1].textContent).toEqual('X');

		cellMoveFrom.dispatchEvent(new DragEvent('dragstart', { dataTransfer: new DataTransfer() }));
		cellMoveTo.dispatchEvent(new DragEvent('dragenter'));
		cellMoveTo.dispatchEvent(new DragEvent('dragover', { dataTransfer: new DataTransfer() }));
		cellMoveTo.dispatchEvent(new DragEvent('drop'));
		cellMoveTo.dispatchEvent(new DragEvent('dragend'));

		expect(table.rows[0].cells[0].textContent).toEqual('X');
		expect(table.rows[0].cells[1].textContent).toEqual('A');

		cellMoveFrom.dispatchEvent(new DragEvent('dragstart', { dataTransfer: new DataTransfer() }));
		cellMoveTo.dispatchEvent(new DragEvent('drop'));

		expect(table.rows[0].cells[0].textContent).toEqual('A');
		expect(table.rows[0].cells[1].textContent).toEqual('X');

	});
});
