import { h, render } from 'preact';
import { DomTargeter } from '@searchspring/snap-toolbox';
import { Finder } from '../components/Finder';

export const finderware = (controller) => {
	controller.on('init', async ({ controller }) => {
		new DomTargeter(
			[
				{
					selector: controller.config.selector,
					component: Finder,
				},
			],
			async (target, elem) => {
				// search after target element is found
				await controller.search();

				// remove loading sibling element
				elem.parentElement.querySelector('.search-loading')?.remove();

				const finderComponent = <target.component store={controller.store} />;
				render(finderComponent, elem);
			}
		);
	});

	// mutate responses
	controller.on('afterSearch', removeFillerEntries);

	// mutate stores
	controller.on('afterStore', sortYears);

	controller.init();
};

function removeFillerEntries({ controller, response }, next) {
	if (controller.config.type == 'ymm') {
		response.facets.forEach((facet) => {
			facet.values = facet.values.filter((value) => {
				return value.label != '---';
			});
		});
	}

	next();
}

function sortYears({ controller }, next) {
	if (controller.config.type == 'ymm') {
		const { selections } = controller.store;

		selections.forEach((selection) => {
			if (selection.level.label.toLowerCase() == 'year') {
				// selection.values = selection.values.reverse();
			}
		});
	}

	next();
}
