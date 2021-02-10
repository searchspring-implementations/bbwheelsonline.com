import { h, Fragment, Component } from 'preact';
import { observer } from 'mobx-react';

import { withStore } from '../services/providers';
import { Profile } from './Profile';

@withStore
@observer
export class Pagination extends Component {
	render() {
		const store = this.props.store;
		const pagination = store.pagination;
		const pages = pagination.getPages(5);
		const profiler = this.props.store.controller.profiler;

		return (
			<Profile name="Pagination" profiler={profiler}>
				<div class="pagination">
					<ul class="pagination-list">
						{pagination.previous && (
							<li class="pagination-item pagination-item--previous">
								<a {...pagination.previous.url.link} class="pagination-link">
									<i class="icon" aria-hidden="true">
										<svg>
											<use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#icon-chevron-left"></use>
										</svg>
									</i>
								</a>
							</li>
						)}

						{pages.map((page) => (
							<li key={page.key} class={`pagination-item ${page.active ? 'pagination-item--current' : ''}`}>
								<a {...page.url.link} class="pagination-link">
									{page.number}
								</a>
							</li>
						))}

						{pagination.next && (
							<li class="ss-next pagination-item pagination-item--next">
								<a {...pagination.next.url.link} class="pagination-link">
									<i class="icon" aria-hidden="true">
										<svg>
											<use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#icon-chevron-right"></use>
										</svg>
									</i>
								</a>
							</li>
						)}
					</ul>
				</div>
			</Profile>
		);
	}
}
