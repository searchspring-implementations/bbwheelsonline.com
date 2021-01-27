import { h, Fragment, Component } from 'preact';
import { observer } from 'mobx-react';

import { StoreProvider } from '../services/providers';
import { Sidebar } from './Sidebar';
import { Content } from './Content';
import { Profile } from './Profile';

@observer
export class Main extends Component {
	render() {
		const store = this.props.store;
		const profiler = store.controller.profiler;

		return (
			<StoreProvider store={store}>
				<aside class="page-sidebar" id="faceted-search-container">
					<div id="searchspring-sidebar">
						<Profile name="Sidebar" profiler={profiler}>
							<Sidebar />
						</Profile>
					</div>
				</aside>

				<main class="page-content" id="product-listing-container">
					<div id="searchspring-content">
						<Profile name="Content" profiler={profiler}>
							<Content />
						</Profile>
					</div>
				</main>
			</StoreProvider>
		);
	}
}
