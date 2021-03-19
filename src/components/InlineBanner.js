import { h, Component, Fragment } from 'preact';
import { observer } from 'mobx-react';

// TODO: move to component library

@observer
export class InlineBanner extends Component {
	render() {
		// current prop interface
		// <Banner content={merchandising.content} type="header" />

		// proposed change
		// <Banner content={merchandising.content.header} />
		
		// inline banner
		// <InlineBanner content={result} />
		const { value } = this.props.content;

		return (
			<div dangerouslySetInnerHTML={{
				__html: value
			}} class="ss-inline-banner" />
		);
	}
}