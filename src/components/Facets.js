import { h, Fragment, Component } from 'preact';
import { observer } from 'mobx-react';

import { Profile } from './Profile';
import { withStore } from '../services/providers';

import { Slider, Banner } from '@searchspring/snap-preact-components';

const sliderProps = {
	trackColor: '#d01f27',
	railColor: '#ccc',
	handleColor: '#d01f27',
	handleDraggingColor: '#d01f27',
};

@withStore
@observer
export class DesktopFacets extends Component {
	render() {
		const { facets } = this.props.store;
		const profiler = this.props.store.controller.profiler;

		return (
			facets.length !== 0 && (
				<Profile name="Facets" profiler={profiler}>
					<div id="facetedSearch-navList" class="ss-facets facetedSearch-navList blocker-container">
						<Facets />
					</div>
				</Profile>
			)
		);
	}
}

@withStore
@observer
export class Facets extends Component {
	render() {
		const { facets, merchandising } = this.props.store;
		const profiler = this.props.store.controller.profiler;

		return (
			facets.length !== 0 && (
				<Fragment>
					<div class="accordion accordion--navList">
						{facets.map((facet) => (
							<Facet facet={facet} />
						))}
					</div>

					<Banner content={merchandising.content} type="left" />
				</Fragment>
			)
		);
	}
}

@withStore
@observer
export class Facet extends Component {
	render() {
		const facet = this.props.facet;
		const profiler = this.props.store.controller.profiler;

		return (
			facet && (
				<Profile name={`Facet-${facet.field}`} profiler={profiler}>
					<div class="accordion-block">
						<div
							id={`ss-${facet.field}`}
							class={`ss-facet-container ss-facet-container-${facet.display} accordion-navigation toggleLink ${facet.collapse ? '' : 'is-open'}`}
						>
							<h5
								onClick={() => {
									facet.toggleCollapse();
								}}
								class="accordion-title"
							>
								{facet.label}
							</h5>
							<div
								onClick={() => {
									facet.toggleCollapse();
								}}
								class="accordion-navigation-actions"
							>
								{facet.filtered == true && (
									<a
										ng-if="facet.facet_active"
										onClick={(e) => {
											e.stopPropagation();
											facet.clear.url.go();
										}}
										class="facetedSearch-clearLink"
									>
										Clear
									</a>
								)}
								&nbsp;
								<svg class="icon accordion-indicator toggleLink-text toggleLink-text--off">
									<use xlinkHref="#icon-add" />
								</svg>
								<svg class="icon accordion-indicator toggleLink-text toggleLink-text--on">
									<use xlinkHref="#icon-remove" />
								</svg>
							</div>

							<div id="facetedSearch-content--{{ facet.label }}" class={`accordion-content ${facet.collapse ? '' : 'is-open'}`}>
								{facet?.values?.length > 10 && (
									<div class="ss-search-options">
										<input
											value={facet.search.input}
											onInput={(evt) => {
												facet.search.input = evt.target.value;
											}}
											class="ss-search-options-field"
											type="text"
											placeholder={`Search ${facet.label}`}
										/>
									</div>
								)}

								{!facet.collapse &&
									(() => {
										switch (facet.display) {
											case 'hierarchy':
												return <FacetOptionsHierarchy facet={facet} />;
											case 'slider':
												return <Slider facet={facet} {...sliderProps} />;
											case 'list':
											default:
												return <FacetOptionsList facet={facet} />;
										}
									})()}

								{facet.overflow && facet.overflow.enabled && (
									<div class={`ss-show-more ${facet.overflow.remaining ? 'ss-expanded' : 'ss-collapsed'}`}>
										<a
											onClick={() => {
												facet.overflow.toggle();
											}}
											class="ss-show-more-link"
										>
											Show {facet.overflow.remaining ? 'More' : 'Less'}
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

@observer
class FacetOptionsHierarchy extends Component {
	render() {
		const facet = this.props.facet;
		const values = facet.refinedValues;

		return (
			<ul class={`ss-hierarchy navList ${facet.overflow.remaining && !facet.search.input ? '' : 'ss-show-overflow'}`}>
				{values.map((value) => (
					<li
						class={`ss-hierarchy-option navList-item ${value.filtered && 'ss-hierarchy-current'} ${
							value.history && !value.active && 'ss-hierarchy-return'
						}`}
					>
						{value.filtered ? (
							<span>{value.label}</span>
						) : (
							<a {...value.url.link} class="ss-hierarchy-link navList-action">
								{' ' + value.label}
								{!value.history && <span class="ss-facet-count">({value.count})</span>}
							</a>
						)}
					</li>
				))}
			</ul>
		);
	}
}

@observer
class FacetOptionsList extends Component {
	render() {
		const facet = this.props.facet;
		const values = facet.refinedValues;
		const ratingFacet = facet.field == 'reviews_product_score';

		return (
			<ul
				id={`facetedSearch-navList--${facet.field}`}
				data-facet={facet.field}
				class={`navList ${facet.overflow.remaining && !facet.search.input ? '' : 'ss-show-overflow'}`}
			>
				{values.map((value) => (
					<li class="navList-item">
						{ratingFacet ? (
							<a {...value.url.link} class={`${value.filtered ? 'highlight' : ''}`}>
								<span class="star-rating">{value.custom?.ratingComponent}</span>
								{value.low != 5 && <span class="and-up">&amp; Up</span>}
								<span class="facet-count">({value.count})</span>
							</a>
						) : (
							<a
								{...value.url.link}
								class={`navList-action navList-action--checkbox ${value.filtered ? 'is-selected' : ''} ${
									facet.multiple == 'single' ? 'ss-checkbox-round' : ''
								}`}
							>
								{value.label} <span>({value.count})</span>
								<span class="navList-action-close" aria-hidden="true">
									<svg class="icon">
										<use xlinkHref="#icon-close" />
									</svg>
								</span>
							</a>
						)}
					</li>
				))}
			</ul>
		);
	}
}
