import { h, Component, Fragment } from 'preact';
import { observer } from 'mobx-react';

import { Banner } from '@searchspring/snap-preact-components';
import { filters } from '@searchspring/snap-toolbox';

import { InlineBanner } from './InlineBanner';
import { Profile } from './Profile';

const { currency, truncate, handleize } = filters;
@observer
export class Autocomplete extends Component {
	render() {
		const { search, terms, results, merchandising, pagination, filters, facets, state, controller } = this.props.store;

		const inputFocused = this.props.input === state.focusedInput;
		const visible = inputFocused && terms.length > 0;

		let delayTimeout;
		const delayTime = 200;
		const mouseEvents = {
			onMouseEnter: (e) => {
				clearTimeout(delayTimeout);
				delayTimeout = setTimeout(() => {
					e.target.focus();
				}, delayTime);
			},
			onMouseLeave: () => {
				clearTimeout(delayTimeout);
			},
		};

		const emIfy = (term) => {
			const match = term.match(search.query);

			if (match) {
				const beforeMatch = <em>{term.slice(0, match.index)}</em>;
				const afterMatch = <em>{term.slice(match.index + search.query.length, term.length)}</em>;
				return (
					<Fragment>
						{beforeMatch}
						{search.query}
						{afterMatch}
					</Fragment>
				);
			}

			return (
				<Fragment>
					<em>{term}</em>
				</Fragment>
			);
		};

		return (
			visible && (
				<Profile name="Autocomplete" controller={controller}>
					<div ss-autocomplete>
						<div class="ss-ac-container">
							<div id="ss-ac-terms">
								<ul class="ss-list">
									{terms.map((term) => (
										<li className={`ss-list-option ${term.active ? 'ss-active' : ''}`}>
											<a
												href={term.url.href}
												class="ss-list-link"
												{...mouseEvents}
												onFocus={() => {
													term.preview();
												}}
											>
												{emIfy(term.value)}
											</a>
										</li>
									))}
								</ul>
							</div>

							<div id="ss-ac-content">
								{facets.length > 0 && (
									<div id="ss-ac-facets">
										{facets
											.filter((facet) => facet.display !== 'slider')
											.slice(0, 3)
											.map((facet) => (
												<div
													ng-switch="facet.type"
													id="ss-ac-{{ facet.field }}"
													className={`ss-ac-facet-container ss-ac-facet-container-${
														facet.display && (facet.display != 'hierarchy' || facet.display != 'slider') ? facet.display : 'list'
													}`}
												>
													<h4 class="ss-title">{facet.label}</h4>

													{/* facet switch on facet.display */}
													{
														{
															grid: <AutocompleteFacetGrid facet={facet} mouseEvents={mouseEvents} />,
															palette: <AutocompleteFacetPalette facet={facet} mouseEvents={mouseEvents} />,
														}[facet.display] || <AutocompleteFacetList facet={facet} mouseEvents={mouseEvents} />
													}

													{/* {(() => {
														switch (facet.display) {
															case 'grid':
																return <AutocompleteFacetGrid facet={facet} />;
															case 'palette':
																return <AutocompleteFacetPalette facet={facet} />;
															default:
																return <AutocompleteFacetList facet={facet} />;
														}
													})()} */}
												</div>
											))}
										<Banner content={merchandising.content} type="left" class="ss-ac-merchandising" />
									</div>
								)}

								<div id="ss-ac-results">
									<h4 class="ss-title">Product Suggestions</h4>

									<Banner content={merchandising.content} type="header" class="ss-ac-merchandising" />
									<Banner content={merchandising.content} type="banner" class="ss-ac-merchandising" />

									<ul class="ss-ac-item-container">
										{results.map((result, index) => (
											<li class="ss-ac-item" key={result.id}>
												{
													{
														banner: <InlineBanner content={result} />
													}[result.type] || <AutocompleteResult result={result} />
												}

												{/* {(() => {
													switch (result.type) {
														case 'banner':
															return (
																<InlineBanner content={result} />
															);
														default:
														case 'product':
															return (
																<AutocompleteResult result={result} />
															);
													}
												})()} */}
											</li>
										))}
									</ul>

									<Banner content={merchandising.content} type="footer" class="ss-ac-merchandising" />

									{results.length == 0 && (
										<div class="ss-ac-no-results">
											<p>No results found for "{search.query}". Please try another search.</p>
										</div>
									)}
								</div>

								{results.length > 0 && (
									<div id="ss-ac-see-more" className={`${facets.length ? 'ss-ac-see-more-padding' : ''}`}>
										<a href={state.url.href} class="ss-ac-see-more-link">
											See {pagination.totalResults} {filters.length > 0 ? 'filtered' : ''} result{pagination.totalResults > 1 ? 's' : ''} for "
											{search.query}"
										</a>
									</div>
								)}
							</div>
						</div>
					</div>
				</Profile>
			)
		);
	}
}

class AutocompleteFacetGrid extends Component {
	render() {
		const facet = this.props.facet;
		const mouseEvents = this.props.mouseEvents;

		return (
			<ul class="ss-grid">
				{facet.values.slice(0, 6).map((value) => (
					<li class="ss-grid-option">
						<a
							className={`ss-grid-link ${value.filtered ? 'ss-active' : ''}`}
							href={value.url.href}
							{...mouseEvents}
							onFocus={() => {
								value.preview();
							}}
						>
							<div class="ss-grid-block">
								<div class="ss-grid-value">
									<div class="ss-grid-label">{value.label}</div>
								</div>
							</div>
						</a>
					</li>
				))}
			</ul>
		);
	}
}

class AutocompleteFacetPalette extends Component {
	render() {
		const facet = this.props.facet;
		const mouseEvents = this.props.mouseEvents;

		return (
			<ul class="ss-palette">
				{facet.values.slice(0, 6).map((value) => (
					<li className="ss-palette-option">
						<a
							className={`ss-palette-link ${value.filtered ? 'ss-active' : ''}`}
							href={value.url.href}
							{...mouseEvents}
							onFocus={() => {
								value.preview();
							}}
							alt={value.label}
						>
							<div class="ss-palette-block">
								<div
									className={`ss-palette-color ss-palette-color-${handleize(value.value)}`}
									style={`background-color: ${handleize(value.value)};`}
								></div>
							</div>
							<div class="ss-palette-label">{value.label}</div>
						</a>
					</li>
				))}
			</ul>
		);
	}
}

class AutocompleteFacetList extends Component {
	render() {
		const facet = this.props.facet;
		const mouseEvents = this.props.mouseEvents;

		return (
			<ul class="ss-list">
				{facet.values.slice(0, 5).map((value) => (
					<li class="ss-list-option">
						<a
							className={`ss-list-link ${value.filtered ? 'ss-active' : ''}`}
							href={value.url.href}
							{...mouseEvents}
							onFocus={() => {
								value.preview();
							}}
						>
							{value.label}
						</a>
					</li>
				))}
			</ul>
		);
	}
}

class AutocompleteResult extends Component {
	render() {
		const fallbackImageUrl = '//cdn.searchspring.net/ajax_search/img/default_image.png';
		const result = this.props.result;

		return (
			<a href={result.mappings.core.url}>
				<div class="ss-ac-item-image">
					<div class="ss-image-wrapper">
						<img
							src={result.mappings.core.thumbnailImageUrl || fallbackImageUrl}
							onerror={`this.src='${fallbackImageUrl}';`}
							alt={result.mappings.core.name}
							title={result.mappings.core.name}
						/>
					</div>
				</div>

				<div class="ss-ac-item-details">
					<p class="ss-ac-item-name">{truncate(result.mappings.core.name, 40, '…')}</p>

					<p class="ss-ac-item-price">
						{result.mappings.core.msrp > result.mappings.core.price && (
							<span class="ss-ac-item-msrp">{currency(result.mappings.core.msrp)}</span>
						)}
						&nbsp;
						<span
							className={`ss-ac-item-regular ${result.mappings.core.msrp > result.mappings.core.price ? 'ss-ac-item-on-sale' : ''}`}
						>
							{currency(result.mappings.core.price)}
						</span>
					</p>
				</div>
			</a>
		)
	}
}