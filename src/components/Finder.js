import { h, Component, Fragment } from 'preact';
import { observer } from 'mobx-react';

@observer
export class Finder extends Component {
	render() {
		const { selections, controller, loading } = this.props.store;

		return (
			<div class={`finder-container ${loading ? 'disabled-loadingx' : ''}`}>
				{selections.map((selection) => (
					<select
						class="form-input form-select form-input-short searchspring-finder_field"
						onChange={(e) => {
							selection.select(e.target.value);
						}}
						disabled={loading || selection.disabled}
					>
						{selection?.values?.map((value) => (
							<option value={value.value} selected={selection.selected === value.value}>
								{value.label}
							</option>
						))}
					</select>
				))}

				<div class="finder-column finder-button ss-shop">
					<button
						onClick={() => {
							controller.find();
						}}
						disabled={loading}
						class="button button--primary searchspring-finder_submit"
					>
						Shop Now
					</button>
				</div>
			</div>
		);
	}
}
