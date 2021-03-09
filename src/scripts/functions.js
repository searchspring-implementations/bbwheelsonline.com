// TODO - move to toolbox
export async function until(thing, customOptions) {
	const options = {
		checkMax: 20,
		checkCount: 0,
		checkTime: 50,
		exponential: 1.2, // TODO
		defer: false,
		...customOptions,
	};

	return new Promise(async (resolve, reject) => {
		const thingCheck = await checkForThing(thing);
		if (thingCheck && !options.defer) {
			resolve(thingCheck);
		} else {
			waiting();
		}

		function waiting() {
			window.setTimeout(async () => {
				const thingCheck = await checkForThing(thing);
				if (thingCheck) {
					return resolve(thingCheck);
				}
				options.checkCount++;
				options.checkTime *= options.exponential;

				if (options.checkCount < options.checkMax) {
					return waiting();
				}

				// timeout reached
				return reject();
			}, options.checkTime);
		}

		async function checkForThing(thing) {
			switch (typeof thing) {
				case 'function': {
					return thing();
				}
				default:
					if (thing) {
						return thing;
					}
			}
		}
	});
}

export const matchHeights = async () => {
	// height match
	const jQuery = await until(() => window.jQuery);

	heightMatch('.ss-item-container .product h4.card-title', jQuery);
	heightMatch('.ss-item-container .card__price-rating-wrapper', jQuery);

	// wait until all images have loaded then re-match height
	// let deferreds = [];
	// jQuery('.ss-item-container .card-image').each(function () {
	// 	if (!this.complete) {
	// 		const deferred = jQuery.Deferred();
	// 		jQuery(this).one('load', deferred.resolve);
	// 		deferreds.push(deferred);
	// 	}
	// });

	// jQuery.when.apply(jQuery, deferreds).done(function () {
	// 	// after all promises resolve (all images have loaded or errored out)
	// 	heightMatch('.ss-item-container .card-img-container', jQuery);
	// });
};

export const heightMatch = async (selector, jQuery) => {
	let highestBox = 0;
	const elements = jQuery(selector);

	elements.each(function () {
		if (jQuery(this).height() > highestBox) {
			highestBox = jQuery(this).height();
		}
	});

	elements.height(highestBox);
};

export const getV3ScriptAttrs = () => {
	const scriptElement = document.querySelector('script[src*="searchspring.catalog.js"]');

	if (scriptElement) {
		const attributes = {};

		scriptElement.attributes.forEach((attribute) => {
			attributes[attribute.name] = attribute.value;
		});

		return attributes;
	}
};
