import { h, Fragment, render } from 'preact';

/* searchspring imports */
import { SearchController } from '@searchspring/snap-controller-search';
import SnapClient from '@searchspring/snap-client-javascript';
import { SearchStore } from '@searchspring/snap-store-mobx-search';
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

/*
	configuration and instantiation
 */

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

const client = new SnapClient(globals);

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

// for testing purposes
window.sssnap = {
	controllers: {
		search: cntrlr,
	},
};
