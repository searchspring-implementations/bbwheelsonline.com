import { h, Fragment, Component } from 'preact';
import { observer } from 'mobx-react';

import { filters } from '@searchspring/snap-toolbox';

import { Profile } from './Profile';

@observer
export class Result extends Component {
	render() {
		const result = this.props.result;
		const core = result.mappings.core;
		const attributes = result.attributes;
		const custom = result.custom;

		const onSale = core.msrp && core.msrp > core.price;
		const fallbackImageUrl = '//cdn.searchspring.net/ajax_search/img/default_image.png';
		const imageUrl = core.thumbnailImageUrl ? core.thumbnailImageUrl : fallbackImageUrl;

		return (
			<article class="card">
				<figure class="card-figure">
					<a href={result.url}>
						<div class="card-img-container">
							<img
								class="card-image lazyload"
								data-sizes="auto"
								src={imageUrl}
								onerror={`this.src='${fallbackImageUrl}'`}
								data-src={imageUrl}
								alt={core.name}
								title={core.name}
							/>
						</div>

						{Boolean(custom.freeroadhazard) && (
							<span class="freeroadhazard">
								<img
									alt="Free Road Hazard"
									src="//cdn1.bigcommerce.com/server3000/1gfd17pa/product_images/uploaded_images/tireroadhazardbanner-200x36.jpg"
								/>
							</span>
						)}

						{Boolean(custom.incartdiscount) && (
							<span class="incartdiscount">
								<img
									alt="In Cart Discount"
									src="//cdn11.bigcommerce.com/s-1gfd17pa/product_images/uploaded_images/in-cart-discount-banner-1-.jpg?t=1586457835&_ga=2.29748031.1040224083.1586184862-1496544752.1541531870"
								/>
							</span>
						)}

						{Boolean(custom.freelugnuts) && (
							<span class="freelugnuts">
								<img
									alt="Free Lug Nuts"
									src="//cdn11.bigcommerce.com/s-1gfd17pa/product_images/uploaded_images/free-lugs-banner-1-.jpg?t=1586457835&_ga=2.29748031.1040224083.1586184862-1496544752.1541531870"
								/>
							</span>
						)}

						{Boolean(custom.freeitem) && (
							<span ng-if="result.freeitem" class="freeitem">
								<img
									alt="Free Bonus Item"
									src="https://cdn11.bigcommerce.com/s-1gfd17pa/product_images/uploaded_images/bonus-item-banner-1-.jpg?t=1586457835&_ga=2.189712299.1040224083.1586184862-1496544752.1541531870"
								/>
							</span>
						)}
					</a>

					<figcaption class="card-figcaption">
						<div class="card-figcaption-body">
							<a class="button button--small card-figcaption-button quickview" data-product-id={result.id}>
								Quick view
							</a>

							<label class="button button--small card-figcaption-button" for={`compare-${result.id}`}>
								Compare
								<input type="checkbox" name="products[]" value={result.id} id={`compare-${result.id}`} data-compare-id={result.id} />
							</label>
						</div>
					</figcaption>
				</figure>

				<div class="card-body">
					<h4 class="card-title">
						<a href="{core.url}" class="card_name">
							{core.name}
						</a>
					</h4>

					<div class="card__price-rating-wrapper">
						<div class="card-text" data-test-info-type="price">
							{onSale && (
								<div class="price-section price-section--withoutTax non-sale-price--withoutTax">
									<span data-product-non-sale-price-without-tax class="price price--non-sale">
										{filters.currency(core.msrp)}
									</span>
								</div>
							)}

							<div class={`price-section price-section--withoutTax ${onSale ? 'ss-item-on-sale' : ''}`}>
								<span data-product-price-without-tax class="price price--withoutTax">
									{filters.currency(core.price)}
								</span>
							</div>

							{onSale && (
								<div class="price-section price-section--saving price ss-item-on-sale">
									<span class="price">You save </span>
									<span data-product-price-saved class="price price--saving">
										{filters.currency(core.msrp - core.price)}!
									</span>
								</div>
							)}
						</div>

						<div class="yotpo bottomLine card-text product-rating" data-appkey="lpDUrFWGgBnDmHAXNokbHWipyv7iTcl49m8lePFi" data-product-id={result.id}>
							<span class="yotpo-display-wrapper">
								<div class="standalone-bottomline">
									<div class="yotpo-bottomline pull-left star-clickable">
										<span class="yotpo-stars">
											{custom.ratingArray?.map((starClass) => (
												<span class={`yotpo-icon pull-left ${starClass}`}></span>
											))}
										</span>
										<span class="text-m">
											{attributes.reviews_total_reviews} Review{attributes.reviews_total_reviews > 1 ? 's' : ''}
											{attributes.reviews_total_reviews > 0 ? '' : ': None yet'}
										</span>
										<div class="yotpo-clr"></div>
									</div>
									<div class="yotpo-clr"></div>
								</div>
								<div class="yotpo-clr"></div>
							</span>
						</div>
					</div>
				</div>

				{attributes.option_set_id ? (
					<a href={core.url} class="button button--small card-figcaption-button card__add-to-cart--bottom" data-product-id={result.id}>
						Buy Now
					</a>
				) : (
					<a
						href={`//www.bbwheelsonline.com/cart.php?action=add&amp;product_id=${result.id}`}
						class="button button--small card-figcaption-button card__add-to-cart--bottom"
						data-product-id={result.id}
					>
						Buy Now
					</a>
				)}
			</article>
		);
	}
}
