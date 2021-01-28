import { h, Fragment, Component } from 'preact';
import { observer } from 'mobx-react';

import { withStore } from '../services/providers';
import { Profile } from './Profile';
import { Toolbar } from './Toolbar';
import { Pagination } from './Pagination';
import { Result } from './Result';
import { matchHeights, until } from '../scripts/functions';

@withStore
@observer
export class Results extends Component {
	componentDidMount() {
		matchHeights();
	}

	componentDidUpdate() {
		matchHeights();
	}

	render() {
		const store = this.props.store;
		const results = store.results;
		const pagination = store.pagination;
		const profiler = store.controller.profiler;

		return (
			<div class="ss-results">
				<div class="ss-toolbar ss-toolbar-top">
					<Toolbar />
				</div>

				{/* TODO Header Banner */}
				{/* <div ng-if="merchandising.content.banner.length > 0" id="ss-merch-banner" class="ss-merchandising" ss-merchandising="banner"></div> */}

				<div action="/compare" method="POST" data-product-compare>
					<ul class="ss-item-container ss-item-container-grid productGrid">
						{results.map((result) => (
							<li class="product">
								<Result result={result} />
							</li>
						))}
					</ul>
				</div>

				{/* TODO Footer Banner */}
				{/* <div ng-if="merchandising.content.footer.length > 0" id="ss-merch-footer" class="ss-merchandising" ss-merchandising="footer"></div> */}

				{pagination.totalPages > 1 && (
					<div ng-if="pagination.totalPages > 1" class="ss-toolbar ss-toolbar-bottom">
						<div class="ss-pagination-container ss-pagination-bottom">
							<Pagination />
						</div>
					</div>
				)}

				<div class={`ss-results-loading ${store.loading ? 'ss-results-loading-show' : ''}`}>
					<div class="ss-results-loading-icon"></div>
					<div class="ss-results-loading-text">Loading</div>
				</div>
			</div>
		);
	}
}

@observer
export class NoResults extends Component {
	render() {
		return (
			<div class="ss-no-results">
				<div class="ss-no-results-container">
					{/* TODO: DYM */}
					{/* <p ng-if="didYouMean.query.length" class="ss-did-you-mean">
						Did you mean <a href="{{ location().remove(context.search).add(context.search, didYouMean.query).url() }}">
							{ didYouMean.query }
						</a>?
					</p> */}
				</div>

				<div class="ss-no-results-container">
					<h4 class="ss-title" style="margin-bottom: 5px;">
						Suggestions
					</h4>
					<ul class="ss-suggestion-list">
						<li>Check for misspellings.</li>
						<li>Remove possible redundant keywords (ie. "products").</li>
						<li>Use other words to describe what you are searching for.</li>
					</ul>
					<p>
						Still can't find what you're looking for?{' '}
						<a href="/contact-us/" style="font-size: 14px;">
							Contact us
						</a>
						.
					</p>
					<hr />

					<div class="ss-contact ss-phone">
						<h4 class="ss-title" style="margin-bottom: 5px;">
							Call Us
						</h4>
						<p>320-333-2155</p>
					</div>

					<div class="ss-contact ss-email">
						<h4 class="ss-title" style="margin-bottom: 5px;">
							Email Us
						</h4>
						<p>
							Sales:{' '}
							<a href="mailto:sales@bbwheels.com" style="font-size: 14px;">
								sales@bbwheels.com
							</a>
							<br />
							Customer Service <i>(Existing Orders Only)</i>:{' '}
							<a href="mailto:help@bbwheels.com" style="font-size: 14px;">
								help@bbwheels.com
							</a>
						</p>
					</div>

					<div class="ss-contact ss-location col-sm-4">
						<h4 class="ss-title" style="margin-bottom: 5px;">
							Physical Address
						</h4>
						<p>
							420 Huskie Drive
							<br />
							Albany, MN, 56307
						</p>
					</div>

					<div class="ss-contact ss-location col-sm-4">
						<h4 class="ss-title" style="margin-bottom: 5px;">
							Mailing Address
						</h4>
						<p>
							PO Box 129
							<br />
							Albany, MN, 56307
						</p>
					</div>

					<div class="ss-contact ss-hours col-sm-4">
						<h4 class="ss-title" style="margin-bottom: 5px;">
							Hours
						</h4>
						<p>
							<u>Sales</u>
							<br />
							Monday - Thursday: 8AM-6PM CST
							<br />
							Friday: 9AM-5PM CST
						</p>
						<p>
							<u>Customer Service</u>
							<br />
							Monday - Friday: 8AM-4:30PM CST
						</p>
					</div>
				</div>
			</div>
		);
	}
}
