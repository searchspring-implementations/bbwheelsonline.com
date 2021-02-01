import { h, Fragment, render } from 'preact';

/* searchspring imports */
import { SearchController } from '@searchspring/snap-controller-search';
import { AutocompleteController } from '@searchspring/snap-controller-autocomplete';
import SnapClient from '@searchspring/snap-client-javascript';
import { SearchStore } from '@searchspring/snap-store-mobx-search';
import { AutocompleteStore } from '@searchspring/snap-store-mobx-autocomplete';
import { UrlManager, QueryStringTranslator, ReactLinker } from '@searchspring/snap-url-manager';
import { EventManager } from '@searchspring/snap-event-manager';
import { Profiler } from '@searchspring/snap-profiler';
import { DomTargeter } from '@searchspring/snap-toolbox';

/* local imports */
import config from '../package.json';
import { middleware } from './scripts/custom';
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
	apiHost: 'http://localhost:8080/api/v1',
};

let globals = {
	siteId: config.searchspring.siteId,
	filters: [],
};

// category bgFilter
const v3Context = getV3ScriptAttrs();
if (v3Context.category) {
	globals.filters.push({
		type: 'value',
		field: 'categories_hierarchy',
		value: v3Context.category,
		background: true,
	});
}

// brand bgFilter
if (v3Context.brand) {
	globals.filters.push({
		type: 'value',
		field: 'brand',
		value: v3Context.brand,
		background: true,
	});
}

const client = new SnapClient(globals, clientConfig);

/*
	search
 */

const cntrlrConfig = {
	id: 'search',
	settings: {
		redirects: {
			enabled: true,
		},
	},
};

const cntrlr = (window.cntrlr = new SearchController(cntrlrConfig, {
	client,
	store: new SearchStore(),
	urlManager: new UrlManager(new QueryStringTranslator({ queryParameter: 'search_query' }), ReactLinker),
	eventManager: new EventManager(),
	profiler: new Profiler(),
}));

// custom codez
cntrlr.use(middleware);

// render components into entry points
cntrlr.on('init', async ({ controller }) => {
	const sidebarTarget = new DomTargeter(
		[
			{
				selector: '#searchspring-sidebar',
				component: <Sidebar store={controller.store} />,
			},
		],
		(target, elem) => {
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

cntrlr.search();
cntrlr.init();
addStylesheets();

/*
	autocomplete
 */

const accntrlrConfig = {
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

const accntrlr = (window.accntrlr = new AutocompleteController(accntrlrConfig, {
	client,
	store: new AutocompleteStore(),
	urlManager: new UrlManager(new QueryStringTranslator({ queryParameter: 'search_query' }), ReactLinker),
	eventManager: new EventManager(),
	profiler: new Profiler(),
}));

accntrlr.on('focusChange', ({ controller }) => {
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

accntrlr.on('init', async ({ controller }) => {
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
			const acComponent = <target.component store={controller.store} input={inputElem} />;
			render(acComponent, injectedElem);
		}
	);
});

accntrlr.init();
accntrlr.bind();

// for testing purposes
window.sssnap = {
	controllers: {
		search: cntrlr,
		autocomplete: accntrlr,
	},
};
