import { h, Fragment } from 'preact';

import { log, colors, emoji } from '@searchspring/snap-toolbox/logger';

async function scrollToTop({ controller }, next) {
	// keep the same position when a user clicks on a facet
	if (controller.store.pagination.page != 1) {
		window.scroll({ top: 0, left: 0, behavior: 'smooth' });
	}

	await next();
}

export const middleware = (controller) => {
	controller.on('init', ({ controller }, next) => {
		const versionText = 'SNAPreact 0.2.3 - bbwheelsonline.com';

		log.imageText({
			url: 'https://searchspring.com/wp-content/themes/SearchSpring-Theme/dist/images/favicons/favicon.svg',
			text: `   ${versionText}`,
			style: `color: ${colors.indigo}; font-weight: bold;`,
		});

		next();
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
