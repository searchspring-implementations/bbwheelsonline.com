import { h, Fragment, Component } from 'preact';
import { observer } from 'mobx-react';

import { withStore } from '../services/providers';

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
										<span class="ss-summary-value">{filter.value.label}</span>{' '}
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
