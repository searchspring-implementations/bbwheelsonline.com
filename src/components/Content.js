import { h, Fragment, Component } from 'preact';
import { observer } from 'mobx-react';

import { Slideout, useMediaQuery } from '@searchspring/snap-preact-components';
import { Banner } from '@searchspring/snap-preact-components';

import { StoreProvider, withStore } from '../services/providers';
import { Profile } from './Profile';
import { Results, NoResults } from './Results';
import { FilterSummary } from './FilterSummary';
import { Facets } from '../components/Facets';

@observer
export class Content extends Component {
	render() {
		const store = this.props.store;
		const controller = store.controller;
		const pagination = store.pagination;
		const search = store.search;
		const isMobile = useMediaQuery('(max-width: 800px)');

		return (
			<StoreProvider store={store}>
				<Profile name="Content" controller={controller}>
					<div class="ss-header-container">
						{store.loaded && ( 
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
						)}

						{/* TODO original query (oq) */}
						{/* <div ng-if="originalQuery" class="ss-oq">
							Search instead for "<a class="ss-oq-link" href="{{ originalQuery.url }}">{{ originalQuery.value }}</a>"
						</div> */}
						<Banner content={store.merchandising.content} type="header" />
					</div>

					<div class="ss-filter-container">
						{isMobile && (
							<div class="ss-slideout-toolbar">
								<FilterSummary />

								<Slideout buttonContent={store.facets.length && store.pagination.totalResults && <SlideoutButton />}>
									<SlideoutContent />
								</Slideout>
							</div>
						)}
					</div>

					{pagination.totalResults ? <Results /> : pagination.totalResults === 0 && <NoResults />}
				</Profile>
			</StoreProvider>
		);
	}
}

const SlideoutButton = () => {
	return (
		<div class="ss-slideout-button">
			<span class="ss-slideout-button-icon"></span>
			<span class="ss-slideout-button-label">Filter Options</span>
		</div>
	);
};

const SlideoutContent = (props) => {
	const { toggleActive, active } = props;

	return (
		active && (
			<Fragment>
				<div ng-if="facets.length > 0" class="ss-slideout-header">
					<h4 class="ss-title">Filter Options</h4>
					<a
						onClick={() => {
							toggleActive();
						}}
						class="ss-close"
					></a>
				</div>

				<div class="ss-slideout-facets">
					<div class="ss-facets">
						<Facets></Facets>
					</div>
				</div>
			</Fragment>
		)
	);
};
@withStore
@observer
export class Pagination extends Component {
	render() {
		const store = this.props.store;

		return <span>pages</span>;
	}
}
