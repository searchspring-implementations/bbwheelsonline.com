import { h, Fragment, Component } from 'preact';
import { observer } from 'mobx-react';

import { Sidebar } from './Sidebar';
import { Content } from './Content';

@observer
export class SearchPage extends Component {
	render() {
		const store = this.props.store;

		return (
			<Fragment>
				<aside class="page-sidebar" id="faceted-search-container">
					<div id="searchspring-sidebar">
						<Sidebar store={store} />
					</div>
				</aside>

				<main class="page-content" id="product-listing-container">
					<div id="searchspring-content">
						<Content store={store} />
					</div>
				</main>
			</Fragment>
		);
	}
}

@observer
export class BreadCrumbs extends Component {
	render() {
		return (
			<Fragment>
				<li class="breadcrumb " itemprop="itemListElement" itemscope="" itemtype="http://schema.org/ListItem">
					<a href="/" class="breadcrumb-label" itemprop="item">
						<span itemprop="name">Home</span>
					</a>
					<meta itemprop="position" content="1" />
				</li>
				<li class="breadcrumb is-active" itemprop="itemListElement" itemscope="" itemtype="http://schema.org/ListItem">
					<meta itemprop="item" content="/search/" />
					<span class="breadcrumb-label" itemprop="name">
						Search Results
					</span>
					<meta itemprop="position" content="2" />
				</li>
			</Fragment>
		);
	}
}
