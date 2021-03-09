import { h, Component, Fragment } from 'preact';
import { observer } from 'mobx-react';

import { currency, truncate, handleize } from '@searchspring/snap-toolbox/filters';

import { Profile } from './Profile';
@observer
export class Autocomplete extends Component {
	render() {
		const fallbackImageUrl = '//cdn.searchspring.net/ajax_search/img/default_image.png';
		const { search, terms, results, pagination, filters, facets, state, controller } = this.props.store;

		const inputFocused = this.props.input === state.focusedInput;
		const visible = inputFocused && terms.length > 0;

		let delayTimeout;
		const delayTime = 200;

		const emIfy = (term) => {
			// TODO use search.query once it is part of the response
			const match = term.match(state.input);

			if (match) {
				const beforeMatch = <em>{term.slice(0, match.index)}</em>;
				const afterMatch = <em>{term.slice(match.index + state.input.length, term.length)}</em>;
				return (
					<Fragment>
						{beforeMatch}
						{state.input}
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
													{(() => {
														switch (facet.display) {
															case 'grid':
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
															case 'palette':
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
															default:
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
													})()}
												</div>
											))}
										{/* TODO: left merch */}
									</div>
								)}

								<div id="ss-ac-results">
									<h4 class="ss-title">Product Suggestions</h4>

									{/* TODO: header merch */}
									{/* TODO: banner merch */}

									<ul class="ss-ac-item-container">
										{results.map((result) => (
											<li class="ss-ac-item">
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
											</li>
										))}
									</ul>

									{/* TODO: footer merch */}

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
