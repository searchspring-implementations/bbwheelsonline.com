import { h, Fragment } from 'preact';

export const SearchPage = () => {
	return (
		<Fragment>
			<aside class="page-sidebar" id="faceted-search-container">
				<div id="searchspring-sidebar">{/* <!-- sidebar target --> */}</div>
			</aside>

			<main class="page-content" id="product-listing-container">
				<div id="searchspring-content">{/* <!-- content target --> */}</div>
			</main>
		</Fragment>
	);
};

export const BreadCrumbs = () => {
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
};
