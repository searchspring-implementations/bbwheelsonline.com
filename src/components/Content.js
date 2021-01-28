import { h, Fragment, Component } from 'preact';
import { observer } from 'mobx-react';

import { StoreProvider, withStore } from '../services/providers';
import { Profile } from './Profile';
import { Results, NoResults } from './Results';

@observer
export class Content extends Component {
	render() {
		const store = this.props.store;
		const profiler = store.controller.profiler;
		const pagination = store.pagination;
		const search = store.search;

		return (
			<StoreProvider store={store}>
				<Profile name="Content" profiler={profiler}>
					<div class="ss-header-container">
						<h2 class="ss-title ss-results-title">
							<span>Showing </span>
							{pagination.multiplePages === true && (
								<span class="ss-results-count-range">
									{pagination.begin} - {pagination.end}
								</span>
							)}
							{pagination.multiplePages ? ' of ' : ''}
							<span class="ss-results-count-total">{pagination.totalResults}</span>
							<span>
								{' '}
								result{pagination.totalResults == 1 ? '' : 's'} {search.query ? 'for \u0022' + search.query + '\u0022' : ''}
							</span>
						</h2>

						{/* <div ng-if="originalQuery" class="ss-oq">
							Search instead for "<a class="ss-oq-link" href="{{ originalQuery.url }}">{{ originalQuery.value }}</a>"
						</div> */}

						{/* TODO Header Banner */}
						{/* <div ng-if="merchandising.content.header.length > 0" id="ss-merch-header" class="ss-merchandising" ss-merchandising="header"></div> */}
					</div>

					<div class="ss-filter-container">
						{/* TODO Slideout */}
						{/* <div ng-if="slideout.triggered" class="ss-slideout-toolbar"></div> */}
					</div>

					{pagination.totalResults ? <Results /> : pagination.totalResults === 0 && <NoResults />}
				</Profile>
			</StoreProvider>
		);
	}
}

@withStore
@observer
export class Pagination extends Component {
	render() {
		const store = this.props.store;

		return <span>pages</span>;
	}
}
