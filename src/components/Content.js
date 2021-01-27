import { h, Fragment, Component } from 'preact';
import { observer } from 'mobx-react';

import { withStore } from '../services/providers';

@withStore
@observer
export class Content extends Component {
	render() {
		const store = this.props.store;

		return <h1>results here</h1>;
	}
}
