import { h, Fragment, render } from 'preact';

/* searchspring imports */
import SnapClient from '@searchspring/snap-client-javascript';

import { UrlManager, QueryStringTranslator, ReactLinker } from '@searchspring/snap-url-manager';
import { EventManager } from '@searchspring/snap-event-manager';
import { Profiler } from '@searchspring/snap-profiler';
import { DomTargeter } from '@searchspring/snap-toolbox';

import { SearchController } from '@searchspring/snap-controller-search';
import { AutocompleteController } from '@searchspring/snap-controller-autocomplete';
import { FinderController } from '@searchspring/snap-controller-finder';

import { SearchStore } from '@searchspring/snap-store-mobx-search';
import { AutocompleteStore } from '@searchspring/snap-store-mobx-autocomplete';
import { FinderStore } from '@searchspring/snap-store-mobx-finder';

/* local imports */
import config from '../package.json';
import { middleware } from './scripts/custom';
import { finderware } from './scripts/finders';
import { getV3ScriptAttrs } from './scripts/functions';
import './styles/custom.scss';

import { SearchPage, BreadCrumbs } from './components/SearchPage';
import { Sidebar } from './components/Sidebar';
import { Content } from './components/Content';
import { Autocomplete } from './components/Autocomplete';

/*
	configuration and instantiation
 */

const clientConfig = {
	// apiHost: 'http://localhost:8080/api/v1',
};

let globals = {
	siteId: config.searchspring.siteId,
};

const client = new SnapClient(globals, clientConfig);

/*
	search
 */

const searchConfig = {
	id: 'search',
	globals: {
		filters: [],
	},
	settings: {
		redirects: {
			enabled: true,
		},
	},
};

// category bgFilter
const v3Context = getV3ScriptAttrs();
if (v3Context.category) {
	searchConfig.globals.filters.push({
		type: 'value',
		field: 'categories_hierarchy',
		value: v3Context.category,
		background: true,
	});
}

// brand bgFilter
if (v3Context.brand) {
	searchConfig.globals.filters.push({
		type: 'value',
		field: 'brand',
		value: v3Context.brand,
		background: true,
	});
}

const search = new SearchController(searchConfig, {
	client,
	store: new SearchStore(),
	urlManager: new UrlManager(new QueryStringTranslator({ queryParameter: 'search_query' }), ReactLinker),
	eventManager: new EventManager(),
	profiler: new Profiler(),
});

// custom codez
search.use(middleware);

// render components into entry points
search.on('init', async ({ controller }) => {
	const sidebarTarget = new DomTargeter(
		[
			{
				selector: '#searchspring-sidebar',
				component: <Sidebar store={controller.store} />,
			},
		],
		(target, elem) => {
			// run search after finding target
			controller.search();

			// empty element
			while (elem.firstChild) elem.removeChild(elem.firstChild);
			render(target.component, elem);
		}
	);

	const contentTarget = new DomTargeter(
		[
			{
				selector: '#searchspring-content',
				component: <Content store={controller.store} />,
			},
		],
		(target, elem) => {
			// empty element
			while (elem.firstChild) elem.removeChild(elem.firstChild);
			render(target.component, elem);
		}
	);

	const searchPageTarget = new DomTargeter(
		[
			{
				selector: '.searchspring-container',
				component: <SearchPage store={controller.store} />,
			},
		],
		(target, elem) => {
			// run search after finding target
			controller.search();

			render(target.component, elem);

			const breadcrumbTarget = document.querySelector('.page--searchresults ul.breadcrumbs');
			breadcrumbTarget && render(<BreadCrumbs />, breadcrumbTarget);
		}
	);
});

const addStylesheets = () => {
	new DomTargeter(
		[
			{
				selector: 'body',
				inject: {
					action: 'prepend',
					element: () => {
						const stylesheets = document.createElement('div');
						stylesheets.className = 'ss-stylesheets';
						return stylesheets;
					},
				},
				component: (
					<Fragment>
						<link
							rel="stylesheet"
							type="text/css"
							href="https://staticw2.yotpo.com/lpDUrFWGgBnDmHAXNokbHWipyv7iTcl49m8lePFi/widget.css?widget_version=2020-02-23_10-03-23"
						/>
						<link rel="stylesheet" type="text/css" href="https://netdna.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css" />
						<link rel="stylesheet" type="text/css" href="https://cdn.searchspring.net/ajax_search/sites/ga9kq2/css/ga9kq2.css" />
					</Fragment>
				),
			},
		],
		(target, elem) => {
			render(target.component, elem);
		}
	);
};

search.init();
addStylesheets();

/*
	autocomplete
 */

const acsearchConfig = {
	id: 'autocomplete',
	selector: '#search_query',
	globals: {
		suggestions: {
			count: 4,
		},
		search: {
			query: {
				spellCorrection: true,
			},
		},
		pagination: {
			pageSize: 6,
		},
	},
};

const acsearch = new AutocompleteController(acsearchConfig, {
	client,
	store: new AutocompleteStore(),
	urlManager: new UrlManager(new QueryStringTranslator({ queryParameter: 'search_query' }), ReactLinker),
	eventManager: new EventManager(),
	profiler: new Profiler(),
});

acsearch.on('focusChange', ({ controller }) => {
	if (controller.store.state.focusedInput) {
		document.querySelectorAll('html, body').forEach((elem) => {
			elem.classList.add('ss-ac-open');
		});
	} else {
		document.querySelectorAll('html, body').forEach((elem) => {
			elem.classList.remove('ss-ac-open');
		});
	}
});

acsearch.on('init', async ({ controller }) => {
	new DomTargeter(
		[
			{
				selector: controller.config.selector,
				component: Autocomplete,
				inject: {
					action: 'after', // before, after, append, prepend
					element: (target, origElement) => {
						const acContainer = document.createElement('div');
						acContainer.id = 'ss-ac-target';
						acContainer.addEventListener('click', (e) => {
							e.stopPropagation();
						});
						return acContainer;
					},
				},
			},
		],
		(target, injectedElem, inputElem) => {
			// bind to config selector
			controller.bind();

			const acComponent = <target.component store={controller.store} input={inputElem} />;
			render(acComponent, injectedElem);
		}
	);
});

acsearch.init();

/*
	finder
 */

// TODO url: '/search?action=finder',
const searchURL = '/search';
const finderInstances = {};
const finderConfigs = [
	{
		id: 'tiresByVehicle',
		url: searchURL,
		selector: '.searchspring-finder_tires_by_vehicle',
		type: 'ymm',
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
		fields: [{ field: 'custom_tire_size_1' }, { field: 'custom_tire_size_2' }, { field: 'custom_wheel_size' }],
	},
	{
		id: 'wheelsByVehicle',
		url: searchURL,
		selector: '.searchspring-finder_wheels_by_vehicle',
		type: 'ymm',
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
		fields: [{ field: 'custom_wheel_size' }, { field: 'custom_wheel_width' }, { field: 'custom_wheel_bolt_pattern' }, { field: 'custom_color' }],
	},
	{
		id: 'accessoriesFinder',
		url: searchURL,
		selector: '.searchspring-finder_accessories',
		type: 'ymm',
		fields: [
			{
				field: 'ss_accessory',
				levels: ['Type', 'Year', 'Make', 'Model'],
			},
		],
	},
];

finderConfigs.forEach((finderConfig) => {
	const finderInstance = new FinderController(finderConfig, {
		client,
		store: new FinderStore(),
		urlManager: new UrlManager(new QueryStringTranslator(), ReactLinker),
		eventManager: new EventManager(),
		profiler: new Profiler(),
	});

	finderInstance.use(finderware);
	finderInstances[finderConfig.id] = finderInstance;
});

// for testing purposes
window.sssnap = {
	controllers: {
		search: search,
		autocomplete: acsearch,
		finders: finderInstances,
	},
};
