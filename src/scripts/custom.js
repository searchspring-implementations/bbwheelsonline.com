import { h, Fragment } from 'preact';

import { log, colors, emoji } from '@searchspring/snap-toolbox/logger';

async function scrollToTop(search, next) {
	window.scroll({ top: 0, left: 0, behavior: 'smooth' });
	await next();
}

export const middleware = (controller) => {
	controller.on('init', async ({ controller }, next) => {
		const versionText = 'SNAPreact 0.2.1 - bbwheelsonline.com';

		log.imageText({
			url: 'https://searchspring.com/wp-content/themes/SearchSpring-Theme/dist/images/favicons/favicon.svg',
			text: `   ${versionText}`,
			style: `color: ${colors.indigo}; font-weight: bold;`,
		});

		await next();
	});

	// scroll to top
	controller.on('afterStore', scrollToTop);

	// facets mutation
	controller.on('afterStore', ({ controller }, next) => {
		const { facets } = controller.store;

		facets.forEach((facet) => {
			// set overflow limits
			if (facet.display == 'palette' || facet.display == 'grid') {
				facet.overflow?.setLimit(15);
			} else {
				facet.overflow?.setLimit(10);
			}

			// reverse finder field values
			if (['ss_vehicle', 'ss_tire', 'ss_accessory'].indexOf(facet.field) >= 0 && !facet.filtered) {
				facet.values.reverse();
			}

			// filter out '---' auto drill-down prevention value
			if (facet.display == 'hierarchy') {
				facet.values = facet.values.filter((value) => value.label != '---');
			}

			// rating facet
			if (facet.field == 'reviews_product_score') {
				facet.values.map((value) => {
					value.custom = {};

					if (value.low == 5) {
						value.custom.ratingComponent = (
							<Fragment>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ffd200"></i>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ffd200"></i>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ffd200"></i>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ffd200"></i>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ffd200"></i>
							</Fragment>
						);
					}
					if (value.low == 4) {
						value.custom.ratingComponent = (
							<Fragment>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ffd200"></i>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ffd200"></i>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ffd200"></i>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ffd200"></i>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ccc"></i>
							</Fragment>
						);
					}
					if (value.low == 3) {
						value.custom.ratingComponent = (
							<Fragment>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ffd200"></i>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ffd200"></i>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ffd200"></i>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ccc"></i>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ccc"></i>
							</Fragment>
						);
					}
					if (value.low == 2) {
						value.custom.ratingComponent = (
							<Fragment>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ffd200"></i>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ffd200"></i>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ccc"></i>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ccc"></i>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ccc"></i>
							</Fragment>
						);
					}
					if (value.low == 1) {
						value.custom.ratingComponent = (
							<Fragment>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ffd200"></i>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ccc"></i>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ccc"></i>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ccc"></i>
								<i class="fa fa-lg fa-fw fa-star" style="color:#ccc"></i>
							</Fragment>
						);
					}
				});
			}
		});

		next();
	});

	// results mutation
	controller.on('afterStore', ({ controller }, next) => {
		const { results } = controller.store;

		// ratings star classes
		const star = 'yotpo-icon-star';
		const half_star = 'yotpo-icon-half-star';
		const empty_star = 'yotpo-icon-empty-star';

		results.forEach((result) => {
			// create array of ratings stars
			var rating = result.attributes.reviews_product_score;

			if (rating) {
				result.custom.ratingArray = [];

				var full_stars = Math.floor(rating / 1);

				for (var i = 0; i < full_stars; i++) {
					result.custom.ratingArray.push(star);
				}

				if (rating - full_stars >= 0.75) {
					result.custom.ratingArray.push(star);
				} else if (rating - full_stars >= 0.3) {
					result.custom.ratingArray.push(half_star);
				}

				for (var i = result.custom.ratingArray.length; i < 5; i++) {
					result.custom.ratingArray.push(empty_star);
				}
			}

			if (result.attributes.categories && result.attributes.categories.indexOf('FREEROADHAZARD') > -1) {
				result.custom.freeroadhazard = 1;
			}
			if (result.attributes.categories && result.attributes.categories.indexOf('WHEELSDISCOUNTSMALL') > -1) {
				result.custom.incartdiscount = 1;
			}
			if (result.attributes.custom_deal_type && result.attributes.custom_deal_type.indexOf('FREE LUG NUTS!') > -1) {
				result.custom.freelugnuts = 1;
			}
			if (result.attributes.custom_deal_type && result.attributes.custom_deal_type.indexOf('FREE GIFT!') > -1) {
				result.custom.freeitem = 1;
			}
		});

		next();
	});

	// log the store
	controller.on('afterStore', ({ controller }, next) => {
		log.debug('Search store:', controller.store.toJSON());
		next();
	});
};

/*

var self = this; 

if (self.context.category) {
    self.context.backgroundFilters['categories_hierarchy'] = self.context.category.replace(/ >/g, ">").trim();
}
 
if (self.context.brand) {
    self.context.backgroundFilters['brand'] = self.context.brand;
}

// springboard generated variables
var modules = {};
modules.enabled = true;

// springboard generated variables for autocomplete/default
modules.autocomplete = {
    input: '#search_query',
	spellCorrection: true,
	language: 'en',
    action: '',
    autoPosition: false,
    limit: 6
};

this.importer.include('autocomplete2', modules.autocomplete);
this.importer.include('facet-slider');

// Array of all facets used to setup exclude facets for finders to not fetch
// facets we don't need
var allFacets = ["custom_accessory_type","custom_wheel_size","custom_color","custom_wheel_bolt_pattern","custom_wheel_width","custom_wheel_offset","custom_product_brand","custom_tire_load","custom_tire_size_1","custom_tire_size_2","ss_vehicle","ss_accessory","ss_tire"]

// We're add finder_type as a background filter so we know what finder we're
// on in beforeSearch. We're removing the filter in beforeSearch.
var finders = {

    'wheels_by_vehicle' : {
        identifier: 'wheels_by_vehicle',
        context :  { 'backgroundFilters': { 'finder_type' : 'wheels_by_vehicle' } },
        hierarchies: [{
            field: 'ss_vehicle',
            levels: ['Year', 'Make', 'Model']
        }],
        searchUrl: '/search?action=finder',
        finderPersist: false
    },

    'wheels_by_size' : {
        identifier: 'wheels_by_size',
        context :  { 'backgroundFilters': { 'finder_type' : 'wheels_by_size' } },
        searchUrl: '/search?action=finder',
        fields: ['custom_wheel_size', 'custom_wheel_width', 'custom_wheel_bolt_pattern', 'custom_color'],
        finderPersist: false
    },

    'tires_by_vehicle' : {
        identifier: 'tires_by_vehicle',
        context :  { 'backgroundFilters': { 'finder_type' : 'tires_by_vehicle' } },
        hierarchies: [{
            field: 'ss_tire',
            levels: ['Year', 'Make', 'Model', 'Wheel Size']
        }],
        searchUrl: '/search?action=finder',
        finderPersist: false
    },

    'tires_by_size' : {
        identifier: 'tires_by_size',
        context :  { 'backgroundFilters': { 'finder_type' : 'tires_by_size' } },
        searchUrl: '/search?action=finder',
        fields: ['custom_tire_size_1', 'custom_tire_size_2', 'custom_wheel_size'],
        finderPersist: false
    },

    'accessories_finder' : {
        identifier: 'accessories_finder',
        context :  { 'backgroundFilters': { 'finder_type' : 'accessories_finder' } },
        hierarchies: [{
            field: 'ss_accessory',
            levels: ['Type', 'Year', 'Make', 'Model']
        }],
        searchUrl: '/search?action=finder',
        finderPersist: false
    }

}

this.importer.include('finder', Object.values(finders));

self.on('beforeSearch', function(req, config) {
	if(config.moduleName == 'finder') {
		var finderType = req['bgfilter.finder_type'];
		if(finderType) {
			delete req['bgfilter.finder_type'];
			var currentFinder = finders[finderType];
			var excludedFacets = [];
			

		 	excludedFacets = allFacets.filter(function(v) {
				return currentFinder.fields.indexOf(v) === -1;
			});

			
			if(excludedFacets) {
				req.excludedFacets = excludedFacets;
			}
		}
	}	
});

self.on('afterFinderSearch', function($scope) {
	angular.forEach($scope.facets, function(facet) {
		if (['ss_vehicle', 'ss_tire', 'ss_accessory'].indexOf(facet.field) >= 0) {
			angular.forEach(facet.finder.levels, function(level) {
				if (level.label == 'Year') {
					level.values.sort(function(a, b) {
						return b.label - a.label
					});
				}
				
				var arr = [];
				angular.forEach(level.values, function(v) {
					if (v.label != "---") {
						arr.push(v);
					}
				});
				level.values = arr;
			});
		}
	});
});

self.on('afterFinderSearch', function($scope) {
    var selector = "#loading-" + $scope.options.identifier;
    angular.element(document.querySelectorAll('' + selector)).addClass('has-loaded');
    
    $scope.selectLoading = false;
    $scope.dropdownSelect = function(el) {
        $scope.selectLoading = true;
    }
});

// springboard generated variables for slideout/default
modules.slideout = {
    width: 800
};

this.importer.include('slideout', modules.slideout);

this.on('afterBootstrap', function($scope) {
    $scope.finderSubmit = function(finder) {
    	finder.findIt = function() {
    		// this is 'fixing' an issue that seems to have to do with the url history...
    		// the finder URLS are updating, but the API requests aren't loading on listing pages like the following:
    		// https://www.bbwheelsonline.com/search-truck-tires-by-size/
    		// this 'fix' will likely prevent the persistence from working in some instances. The line below would need to be incorparated into this function to preserve persistence (with additional modifications).
    		// leaving it out for now since they aren't using persistence in the finders EC 12/22/2020
    		// finder.find.save();
    		window.location = (window.location.origin + finder.location.remove('perpage').remove('q').url());
    	}
    	finder.findIt();
    }
});

// Disable Facet Scroll
// Keep the same position when a user clicks on a facet
var shallWeScroll;

this.on('afterSearch', function($scope) {
	if ($scope.pagination.currentPage == 1) {
		shallWeScroll = false;
	} else {
		shallWeScroll = true;
	}
});

this.on('_beforeAutoScroll', function() {
	return shallWeScroll;
});

*/
