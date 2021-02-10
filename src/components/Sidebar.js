import { h, Fragment, Component } from 'preact';
import { observer } from 'mobx-react';

import { useMediaQuery } from '@searchspring/snap-preact-components';

import { StoreProvider, withStore } from '../services/providers';
import { Profile } from './Profile';
import { DesktopFacets } from './Facets';

@observer
export class Sidebar extends Component {
	render() {
		const store = this.props.store;
		const profiler = store.controller.profiler;
		const isDesktop = useMediaQuery('(min-width: 801px)');

		return (
			isDesktop && (
				<StoreProvider store={store}>
					<Profile name="Sidebar" profiler={profiler}>
						<div id="facetedSearch" class="ss-sidebar-container facetedSearch sidebarBlock">
							{/* TODO prevent render in mobile ? ng-if="!slideout.triggered" */}
							<FilterSummary />
							<DesktopFacets />
							<FilterMessages />
						</div>
					</Profile>
				</StoreProvider>
			)
		);
	}
}

@withStore
@observer
export class FilterSummary extends Component {
	render() {
		const { filters, controller } = this.props.store;
		const clearAll = controller.urlManager.remove('filter');

		return (
			filters.length > 0 && (
				<div class="ss-summary facetedSearch-refineFilters sidebarBlock">
					<div class="facetedSearch-refineFilters sidebarBlock">
						<h5 class="sidebarBlock-heading">Refine By:</h5>

						<ul class="inlineList inlineList--labels">
							{filters.map((filter) => (
								<li>
									<a {...filter.url.link} class="facetLabel">
										<span class="ss-summary-value">{filter.value.label}</span>
										<svg class="icon">
											<use xlinkHref="#icon-close" />
										</svg>
									</a>
								</li>
							))}
						</ul>

						<div class="ss-summary-reset">
							<a {...clearAll.link} class="listlink">
								Clear All
							</a>
						</div>
					</div>
				</div>
			)
		);
	}
}

@withStore
@observer
export class FilterMessages extends Component {
	render() {
		const { facets, filters, pagination } = this.props.store;

		let message = '';
		if (pagination.totalResults === 0 && filters.length === 0) {
			message = (
				<span>
					There are no results to refine. If you need additional help, please try our search "<strong>Suggestions</strong>".
				</span>
			);
		} else if (pagination.totalResults === 0 && filters.length) {
			message = 'If you are not seeing any results, try removing some of your selected filters.';
		} else if (pagination.totalResults && filters.length === 0) {
			message = 'There are no filters to refine by.';
		}

		return (
			facets.length === 0 && (
				<div class="ss-filter-messages">
					{message && (
						<p class="ss-filter-message-content" style="margin-top: 0;">
							{message}
						</p>
					)}
				</div>
			)
		);
	}
}
