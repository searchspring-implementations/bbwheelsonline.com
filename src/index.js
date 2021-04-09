import { h, Fragment, render } from 'preact';
import { configure as configureMobx } from 'mobx';

/* searchspring imports */
import SnapClient from '@searchspring/snap-client-javascript';

import { UrlManager, HybridTranslator, reactLinker } from '@searchspring/snap-url-manager';
import { EventManager } from '@searchspring/snap-event-manager';
import { Profiler } from '@searchspring/snap-profiler';
import { Logger } from '@searchspring/snap-logger';
import { DomTargeter } from '@searchspring/snap-toolbox';

import { SearchController, AutocompleteController, FinderController } from '@searchspring/snap-controller';
import { SearchStore, AutocompleteStore, FinderStore } from '@searchspring/snap-store-mobx';

/* local imports */
import { searchspring } from '../package.json';
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

configureMobx({
	useProxies: 'never',
});

const clientConfig = {
	// apiHost: 'http://localhost:8080/api/v1',
};

let globals = {
	siteId: searchspring.siteId,
};

const client = new SnapClient(globals, clientConfig);

/*
	search
 */

// TODO: figure out how to start with a pre-applied filter

const searchConfig = {
	id: 'search',
	globals: {
		filters: [],
		// merchanding: {
		// 	disabled: true
		// }
	},
	settings: {
		redirects: {
			enabled: true,
		},
		// facets: {
		// 	trim: false,
		// }
	},
};

// window.history.pushState(null, null, '?filter.custom_deal_type=FREE GIFT!');

// category bgFilter
const v3Context = getV3ScriptAttrs();
if (v3Context?.category) {
	searchConfig.globals.filters.push({
		type: 'value',
		field: 'categories_hierarchy',
		value: v3Context.category,
		background: true,
	});
}

// brand bgFilter
if (v3Context?.brand) {
	searchConfig.globals.filters.push({
		type: 'value',
		field: 'brand',
		value: v3Context.brand,
		background: true,
	});
}

/*

TODO:
remove controller/store link
pass any shared dependencies/services to both
figure out how to handle 'global' config
build helper package


const urlManager = new UrlManager(new HybridTranslator({ queryParameter: 'search_query' }), reactLinker);
const store = new SearchStore(searchConfig, { urlManager });

const search = new SearchController(searchConfig, {
	client,
	store,
	urlManager,
	eventManager: new EventManager(),
	profiler: new Profiler(),
	logger: new Logger()
});

*/

const search = new SearchController(searchConfig, {
	client,
	store: new SearchStore(),
	urlManager: new UrlManager(new HybridTranslator({ queryParameter: 'search_query' }), reactLinker),
	eventManager: new EventManager(),
	profiler: new Profiler(),
	logger: new Logger()
});

// custom codez
search.use(middleware);

// render components into entry points
search.on('init', async ({ controller }, next) => {
	const searchPageTarget = new DomTargeter(
		[
			{
				selector: '.searchspring-container',
				component: <SearchPage />,
			},
		],
		(target, elem) => {
			render(target.component, elem);

			const breadcrumbTarget = document.querySelector('.page--searchresults ul.breadcrumbs');
			breadcrumbTarget && render(<BreadCrumbs />, breadcrumbTarget);
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
			// run search after finding target
			controller.search();

			// empty element
			while (elem.firstChild) elem.removeChild(elem.firstChild);
			render(target.component, elem);
		}
	);

	const sidebarTarget = new DomTargeter(
		[
			{
				selector: '#searchspring-sidebar',
				component: <Sidebar store={controller.store} />,
			},
		],
		(target, elem) => {
			// empty element
			while (elem.firstChild) elem.removeChild(elem.firstChild);
			render(target.component, elem);
		}
	);

	window.addEventListener('DOMContentLoaded', () => {
		searchPageTarget.retarget();
		contentTarget.retarget();
		sidebarTarget.retarget();
	});

	await next();
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
	urlManager: new UrlManager(new HybridTranslator({ queryParameter: 'search_query' }), reactLinker),
	eventManager: new EventManager(),
	profiler: new Profiler(),
	logger: new Logger()
});

acsearch.on('focusChange', async({ controller }, next) => {
	if (controller.store.state.focusedInput) {
		document.querySelectorAll('html, body').forEach((elem) => {
			elem.classList.add('ss-ac-open');
		});
	} else {
		document.querySelectorAll('html, body').forEach((elem) => {
			elem.classList.remove('ss-ac-open');
		});
	}

	await next();
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

addStylesheets();
acsearch.init();

window.addEventListener('DOMContentLoaded', () => {
	addStylesheets();
	acsearch.init();
});

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
];

finderConfigs.forEach((finderConfig) => {
	const finderInstance = new FinderController(finderConfig, {
		client,
		store: new FinderStore(),
		urlManager: new UrlManager(new HybridTranslator(), reactLinker),
		eventManager: new EventManager(),
		profiler: new Profiler(),
		logger: new Logger()
	});

	finderInstance.use(finderware);
	finderInstances[finderConfig.id] = finderInstance;
});

// for testing purposes
window.sssnap = {
	search: search,
	autocomplete: acsearch,
	finders: finderInstances,
};
