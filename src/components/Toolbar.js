import { h, Fragment, Component } from 'preact';
import { observer } from 'mobx-react';

import { withStore } from '../services/providers';
import { Profile } from './Profile';
import { Pagination } from './Pagination';

@withStore
@observer
export class Toolbar extends Component {
	render() {
		const store = this.props.store;
		const pagination = store.pagination;
		const sorting = store.sorting;

		return (
			<div class="actionBar" method="get">
				{pagination.totalPages > 1 && (
					<div class="ss-toolbar-col ss-pagination-container ss-pagination-top">
						<Pagination />
					</div>
				)}

				<div class="ss-toolbar-col ss-sort-by-container category__actionBar--right">
					<div class="category__compare">
						<a class="navUser-action navUser-item--compare" href="/compare" data-compare-nav>
							Compare
						</a>

						<span class="countPill countPill--positive countPill--alt"></span>
					</div>

					<fieldset class="form-fieldset actionBar-section">
						<div class="form-field">
							<label class="form-label">Sort by:</label>
							<select
								name="sort"
								id="sort"
								class="form-select form-select--small"
								onChange={(e) => {
									const selectedOption = sorting.options.filter((option) => option.value == e.target.value).pop();
									selectedOption && selectedOption.url.go();
								}}
							>
								{sorting.options.map((option) => (
									<option value={option.value} selected={option.value === sorting.current.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>
					</fieldset>
				</div>
			</div>
		);
	}
}
