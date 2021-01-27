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
import './styles/custom.scss';

import { Main } from './components/Main';

/*
	configuration and instantiation
 */

let globals = {
	siteId: config.searchspring.siteId,
};

const client = new SnapClient(globals);

/*
	search
 */

const cntrlrConfig = {
	id: 'search',
	settings: {
		redirects: {
			enabled: false,
		},
	},
};

const cntrlr = (window.cntrlr = new SearchController(cntrlrConfig, {
	client,
	store: new SearchStore(),
	urlManager: new UrlManager(new QueryStringTranslator(), ReactLinker),
	eventManager: new EventManager(),
	profiler: new Profiler(),
}));

// custom codez
cntrlr.use(middleware);

// render <Content/> component into #searchspring-content
cntrlr.on('init', async () => {
	new DomTargeter(
		[
			{
				selector: '.searchspring-container',
				component: <Main store={cntrlr.store} />,
			},
		],
		(target, elem) => {
			render(target.component, elem);
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

addStylesheets();
cntrlr.init();
cntrlr.search();

// for testing purposes
window.sssnap = {
	controllers: {
		search: cntrlr,
	},
};
