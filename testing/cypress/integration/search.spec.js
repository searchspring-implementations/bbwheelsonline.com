describe('Search Page', () => {
	describe('Bootstrap', () => {
		it('adds snap bundle to search page', () => {
			cy.visit('https://www.bbwheelsonline.com/search?search_query=red');
			cy.addLocalSnap(); // as @script

			cy.wait('@script').should((script) => {
				expect(script.state).to.equal('Complete');
			});

			cy.wait('@meta').should('exist');
			cy.wait('@search').should('exist');

			cy.snapStore().then((store) => {
				expect(typeof store).to.equal('object');
			});
		});
	});

	describe('Load', () => {
		it('injects into main containers', () => {
			cy.get('.searchspring-container').should('exist');
			cy.get('#searchspring-sidebar').should('exist');
			cy.get('#searchspring-content').should('exist');
		});

		it('has data in the store', () => {
			cy.snapStore().then((store) => {
				expect(store).to.haveOwnProperty('pagination');
				expect(store.pagination.totalResults).to.be.greaterThan(0);
				expect(store.pagination.page).to.equal(1);
			});
		});
	});

	describe('Pagination', () => {
		it('can navigate to the second page', () => {
			cy.get('[data-snap-page="prev"]:first').should('not.exist');
			cy.get('[data-snap-page="next"]:first').should('exist').click();

			cy.snapStore().then((store) => {
				expect(store.pagination.page).to.equal(2);
			});
		});

		it('can go back to the first page', () => {
			cy.get('[data-snap-page="prev"]:first').should('exist').click();

			cy.snapStore().then((store) => {
				expect(store.pagination.page).to.equal(1);
			});
		});

		it('can go to the third page', () => {
			cy.get('[data-snap-page="3"]:first').should('exist').click();

			cy.snapStore().then((store) => {
				expect(store.pagination.page).to.equal(3);
			});
		});
	});
});
