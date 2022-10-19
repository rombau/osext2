describe('Managed table', () => {

	/** @type {ManagedTable} */ let table;

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

			table = new ManagedTable('Test', new Column('A').withHeader('X') );

			table.initialize(Fixture.createDocument('<table><tr><td>A</td></tr></table>'));

			expect(table.rows[0].cells[0].textContent).toEqual('X');
		});

		it('three columns and span before', () => {

			table = new ManagedTable('Test', new Column('A'), new Column('B').withDataColumnBefore(), new Column('C') );

			table.initialize(Fixture.createDocument('<table><tr><td>A</td><td colspan=2>B</td><td>C</td></tr><tr><td>1</td><td>2a</td><td>2b</td><td>3</td></tr></table>'));

			expect(table.rows[0].cells[0].textContent).toEqual('A');
			expect(table.rows[0].cells[1].textContent).toEqual('B');
			expect(table.rows[0].cells[2].textContent).toEqual('C');
			expect(table.rows[1].cells[0].textContent).toEqual('1');
			expect(table.rows[1].cells[1].textContent).toEqual('2a');
			expect(table.rows[1].cells[2].textContent).toEqual('2b');
			expect(table.rows[1].cells[3].textContent).toEqual('3');
			expect(table.rows[1].cells['A'].textContent).toEqual('1');
			expect(table.rows[1].cells['B'].textContent).toEqual('2b');
			expect(table.rows[1].cells['C'].textContent).toEqual('3');
		});

		it('three columns and span after', () => {

			table = new ManagedTable('Test', new Column('A'), new Column('B').withDataColumnAfter(), new Column('C'), new Column('X', Origin.Extension) );

			table.initialize(Fixture.createDocument('<table><tr><td>A</td><td colspan=2>B</td><td>C</td></tr><tr><td>1</td><td>2a</td><td>2b</td><td>3</td></tr></table>'));

			expect(table.rows[0].cells[0].textContent).toEqual('A');
			expect(table.rows[0].cells[1].textContent).toEqual('B');
			expect(table.rows[0].cells[2].textContent).toEqual('C');
			expect(table.rows[0].cells[3].textContent).toEqual('X');
			expect(table.rows[1].cells[0].textContent).toEqual('1');
			expect(table.rows[1].cells[1].textContent).toEqual('2a');
			expect(table.rows[1].cells[2].textContent).toEqual('2b');
			expect(table.rows[1].cells[3].textContent).toEqual('3');
			expect(table.rows[1].cells[4].textContent).toEqual('');
			expect(table.rows[1].cells['A'].textContent).toEqual('1');
			expect(table.rows[1].cells['B'].textContent).toEqual('2a');
			expect(table.rows[1].cells['C'].textContent).toEqual('3');
			expect(table.rows[1].cells['X'].textContent).toEqual('');
		});

		it('unmanaged columns', () => {

			table = new ManagedTable('Test', new Column('A').withDataColumnAfter(), new Column('X', Origin.Extension) );

			table.initialize(Fixture.createDocument('<table><tr><td colspan=2>A</td><td>B</td><td>C</td></tr><tr><td>1a</td><td>1b</td><td>2</td><td>3</td></tr></table>'));

			expect(table.rows[0].cells[0].textContent).toEqual('A');
			expect(table.rows[0].cells[1].textContent).toEqual('X');
			expect(table.rows[0].cells[2].textContent).toEqual('B');
			expect(table.rows[0].cells[3].textContent).toEqual('C');
			expect(table.rows[1].cells['A'].textContent).toEqual('1a');
			expect(table.rows[1].cells['X'].textContent).toEqual('');
			expect(table.rows[1].cells['B']).toBeUndefined();
			expect(table.rows[1].cells['C']).toBeUndefined();
			expect(table.rows[1].cells[3].textContent).toEqual('2');
			expect(table.rows[1].cells[4].textContent).toEqual('3');
		});

		it('youth overview', (done) => {

			Fixture.getDocument('ju.php', doc => {

				table = new ManagedTable('Jugendübersicht',
					new Column('Alter', Origin.OS),
					new Column('Pos', Origin.Extension),
					new Column('Geb.', Origin.OS),
					new Column('Land', Origin.OS).withDataColumnBefore(),
					new Column('U', Origin.OS),
					new Column('Skillschnitt', Origin.OS).withHeader('Skillschn.'),
					new Column('Opt.Skill', Origin.Extension),
					new Column('Talent', Origin.OS),
					new Column('Aktion', Origin.OS),
					new Column('Aufwertung', Origin.OS),
					new Column('&Oslash;/Zat', Origin.Extension),
					new Column('Marktwert', Origin.Extension),
					new Column('&Oslash;P', Origin.Extension),
					new Column('&Oslash;N', Origin.Extension),
					new Column('&Oslash;U', Origin.Extension)
				);
				
				table.initialize(doc);
				
				const getCellContentArray = (row) => Array.from(row.cells).map(cell => cell.textContent);

				expect(getCellContentArray(table.rows[0])).toEqual(['Alter','Pos','Geb.','Land','U','Skillschn.','Opt.Skill','Talent','Aktion','Aufwertung','Ø/Zat','Marktwert','ØP','ØN','ØU']);
				expect(getCellContentArray(table.rows[1])).toEqual(['Jahrgang Saison 11']);
				expect(getCellContentArray(table.rows[2])).toEqual(['18','','24','','CYP','','41.65','','normal','','','','','','','']);

				table.columns.forEach((column, i) => {
					expect(table.rows[0].cells[column.name]).toEqual(table.rows[0].cells[i]);
				});
				
				done();
			});
		});
	});

	it('should be customizable', () => {

		table = new ManagedTable('Test', new Column('A').withDataColumnAfter(), new Column('X', Origin.Extension) );

		table.initialize(Fixture.createDocument('<table><tr><td colspan=2>A</td><td>B</td><td>C</td></tr><tr><td>1a</td><td>1b</td><td>2</td><td>3</td></tr></table>'));



	});
});
