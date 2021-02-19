import { h, render } from 'preact';
import { DomTargeter } from '@searchspring/snap-toolbox';
import { Finder } from '../components/Finder';

export const finderware = (controller) => {
	// inject component
	controller.on('init', targetAndRender);

	// mutate responses
	controller.on('afterSearch', removeFillerEntries);

	// mutate stores
	controller.on('afterStore', sortYears);

	controller.init();
};

async function targetAndRender({ controller }, next) {
	const finderTarget = new DomTargeter(
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

	window.addEventListener('DOMContentLoaded', () => {
		finderTarget.retarget();
	});

	await next();
}

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
			if (!selection.selected && selection.config.label.toLowerCase() == 'year') {
				selection.data = selection.data.reverse();
			}
		});
	}

	next();
}
