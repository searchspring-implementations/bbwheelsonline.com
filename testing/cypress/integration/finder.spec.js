const searchURL = '/search';
const config = {
	url: 'https://www.bbwheelsonline.com',
	selectors: {
		finder: {
			findButton: 'button.searchspring-finder_submit',
		},
	},
	finderConfigs: [
		{
			id: 'tiresByVehicle',
			url: searchURL,
			selector: '.searchspring-finder_tires_by_vehicle',
			wrapSelect: true,
			type: 'ymm',
			className: 'ss-vehicle-finder',
			fields: [
				{
					field: 'ss_tire',
					levels: ['Year', 'Make', 'Model', 'Wheel Size'],
				},
			],
		},
		{
			id: 'tiresBySize',
			url: searchURL,
			selector: '.searchspring-finder_tires_by_size',
			wrapSelect: false,
			fields: [{ field: 'custom_tire_size_1' }, { field: 'custom_tire_size_2' }, { field: 'custom_wheel_size' }],
		},
		{
			id: 'wheelsByVehicle',
			url: searchURL,
			selector: '.searchspring-finder_wheels_by_vehicle',
			wrapSelect: true,
			type: 'ymm',
			className: 'ss-vehicle-finder',
			fields: [
				{
					field: 'ss_vehicle',
					levels: ['Year', 'Make', 'Model'],
				},
			],
		},
		{
			id: 'wheelsBySize',
			url: searchURL,
			selector: '.searchspring-finder_wheels_by_size',
			wrapSelect: false,
			fields: [{ field: 'custom_wheel_size' }, { field: 'custom_wheel_width' }, { field: 'custom_wheel_bolt_pattern' }, { field: 'custom_color' }],
		},
		{
			id: 'accessoriesFinder',
			url: searchURL,
			selector: '.searchspring-finder_accessories',
			wrapSelect: true,
			type: 'ymm',
			className: 'ss-vehicle-finder',
			fields: [
				{
					field: 'ss_accessory',
					levels: ['Type', 'Year', 'Make', 'Model'],
				},
			],
		},
	],
};

config?.finderConfigs?.forEach((finder, _i) => {
	describe(`${finder.id || _i}`, () => {
		let isHierarchy = undefined;

		describe('Setup', () => {
			it('adds snap bundle to finder page', () => {
				cy.visit(config.url);
				cy.addLocalSnap(); // as @script

				cy.wait('@script').should((script) => {
					expect(script.state).to.equal('Complete');
				});

				cy.wait('@meta').should('exist');
				cy.wait('@search').should('exist');

				cy.snapStore(`finders.${finder?.id}`).then((store) => {
					expect(typeof store).to.equal('object');
				});
			});
			it('has data in the store', () => {
				cy.snapStore(`finders.${finder?.id}`).then((store) => {
					expect(store).to.haveOwnProperty('selections');
					expect(store).to.haveOwnProperty('storage');
				});
			});
			it('determines if Hierarchy or not', () => {
				cy.snapStore(`finders.${finder?.id}`).then((store) => {
					const facet = finder.fields.map((field) => {
						return store.meta.facets[field.field];
					})[0];
					if (facet?.display) {
						isHierarchy = facet.display === 'hierarchy';
					}
				});
			});
		});

		describe('Tests Hierarchy', () => {
			it('has correct number of dropdowns', function () {
				if (!isHierarchy) this.skip();
				cy.snapStore(`finders.${finder?.id}`).then((store) => {
					cy.get(finder.selector).find('select').should('exist').should('have.length', store.selections.length);
				});
			});
			it('only first select enabled', function () {
				if (!isHierarchy) this.skip();
				cy.snapStore(`finders.${finder?.id}`).then((store) => {
					cy.get(finder.selector)
						.find('select')
						.each((select, index) => {
							select = select[0];
							if (index === 0) {
								expect(select.disabled).to.equal(false);
							} else {
								expect(select.disabled).to.equal(true);
							}
						});
				});
			});
			it('other select have expected disable state', function () {
				if (!isHierarchy) this.skip();
				cy.snapStore(`finders.${finder?.id}`).then((store) => {
					cy.get(finder.selector)
						.find('select')
						.each((select, index) => {
							select = select[0];
							expect(select.disabled).to.equal(store.selections[index].disabled);
						});
				});
			});

			it('can make all selections in order', function () {
				if (!isHierarchy) this.skip();
				cy.snapStore(`finders.${finder?.id}`).then((store) => {
					store.selections.map((selection, index) => {
						cy.get(finder.selector)
							.find('select')
							.then((select) => {
								if (!select.length > index) this.skip();

								select = select[index];
								const valueToSelect = store.selections[index].data.filter((option) => option.count > 1).shift().value;
								cy.get(select).select(valueToSelect);
								cy.snapStore(`finders.${finder?.id}`).then((store) => {
									expect(select.value).to.equal(valueToSelect);
									expect(store.selections[index].selected).to.equal(valueToSelect);
									expect(store.storage.state[`ss-finder-${finder.id}`][finder.fields[0].field][`ss-${index}`].selected).to.equal(valueToSelect);
								});
							});
					});
				});
			});

			it('can remove a previous selection', function () {
				if (!isHierarchy) this.skip();
				cy.snapStore(`finders.${finder?.id}`).then((store) => {
					cy.get(finder.selector)
						.find('select')
						.then((select) => {
							const dropdownToClear = select[1] ? 1 : 0;
							select = select[dropdownToClear];
							const valueToSelect = store.selections[dropdownToClear].data.filter((option) => option.count > 1).pop().value;
							cy.get(select).select(valueToSelect);
							cy.snapStore(`finders.${finder?.id}`).then((store) => {
								expect(select.value).to.equal(valueToSelect);
								expect(store.selections[dropdownToClear].selected).to.equal(valueToSelect);
								expect(store.storage.state[`ss-finder-${finder.id}`][finder.fields[0].field][`ss-${dropdownToClear}`].selected).to.equal(
									valueToSelect
								);
							});
						});
				});
			});

			it('can click the find button', function () {
				if (!isHierarchy || !config.selectors?.finder?.findButton) this.skip();
				cy.snapStore(`finders.${finder?.id}`).then((store) => {
					if (!store.selections) this.skip();

					cy.get(finder.selector).find(config.selectors.finder.findButton).should('exist').click();
					cy.on('url:changed', (newUrl) => {
						const expectedUrl = store.selections.filter((selection) => selection.selected).pop().controller.urlManager.href;
						expect(newUrl).to.contain(expectedUrl);
					});
				});
			});
		});

		describe('Tests non-Hierarchy', () => {
			it('has correct number of dropdowns', function () {
				if (isHierarchy) this.skip();
				cy.snapStore(`finders.${finder?.id}`).then((store) => {
					cy.get(finder.selector).find('select').should('exist').should('have.length', store.selections.length);
				});
			});

			it('all select dropdowns are enabled', function () {
				if (isHierarchy) this.skip();
				cy.snapStore(`finders.${finder?.id}`).then((store) => {
					cy.get(finder.selector)
						.find('select')
						.each((select, index) => {
							select = select[0];
							expect(select.disabled).to.equal(false);
						});
				});
			});

			it('can make all selections', function () {
				if (isHierarchy) this.skip();
				cy.snapStore(`finders.${finder?.id}`).then((store) => {
					store.selections.forEach((_, index) => {
						cy.get(finder.selector)
							.find('select')
							.then((select) => {
								select = select[index];
								const valueToSelect = store.selections[index].data && store.selections[index].data.filter((option) => option.count > 1).shift().value;
								if (valueToSelect) {
									cy.get(select).select(valueToSelect);
									cy.snapStore(`finders.${finder?.id}`).then((store) => {
										expect(select.value).to.equal(valueToSelect);
										expect(store.selections[index].selected).to.equal(valueToSelect);
										expect(store.storage.state[`ss-finder-${finder.id}`][finder.fields[index].field].selected).to.equal(valueToSelect);
									});
								}
							});
					});
				});
			});

			it('can clear a selection', function () {
				if (isHierarchy) this.skip();
				cy.snapStore(`finders.${finder?.id}`).then((store) => {
					cy.get(finder.selector)
						.find('select')
						.then((select) => {
							const dropdownToClear = 0; // first dropdown
							select = select[dropdownToClear];
							const valueToSelect = ''; // clear selection
							cy.get(select).select(valueToSelect);
							cy.snapStore(`finders.${finder?.id}`).then((store) => {
								expect(select.value).to.equal(valueToSelect);
								expect(store.selections[dropdownToClear].selected).to.equal(valueToSelect);
								expect(store.storage.state[`ss-finder-${finder.id}`][finder.fields[dropdownToClear].field].selected).to.equal(valueToSelect);
							});
						});
				});
			});

			it('can make all selections again', function () {
				if (isHierarchy) this.skip();
				cy.snapStore(`finders.${finder?.id}`).then((store) => {
					store.selections.forEach((_, index) => {
						cy.get(finder.selector)
							.find('select')
							.then((select) => {
								select = select[index];
								const valueToSelect = store.selections[index].data && store.selections[index].data.filter((option) => option.count > 1).shift().value;
								if (valueToSelect) {
									cy.get(select).select(valueToSelect);
									cy.snapStore(`finders.${finder?.id}`).then((store) => {
										expect(select.value).to.equal(valueToSelect);
										expect(store.selections[index].selected).to.equal(valueToSelect);
										expect(store.storage.state[`ss-finder-${finder.id}`][finder.fields[index].field].selected).to.equal(valueToSelect);
									});
								}
							});
					});
				});
			});

			it('can click the find button', function () {
				if (isHierarchy || !config.selectors?.finder?.findButton) this.skip();
				cy.snapStore(`finders.${finder?.id}`).then((store) => {
					if (!store.selections) this.skip();

					cy.get(finder.selector).find(config.selectors.finder.findButton).should('exist').click();
					cy.on('url:changed', (newUrl) => {
						const expectedUrl = store.selections.filter((selection) => selection.selected).pop().controller.urlManager.href;
						expect(newUrl).to.contain(expectedUrl);
					});
				});
			});
		});
	});
});
