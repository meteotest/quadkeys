'use strict';

/**
 * convert base of a number.
 * example:
 * convertBase(111).from(2).to(10);  // 7
 */
function convertBase(value) {
	return {
		from: function(baseFrom) {
			return {
				to: function(baseTo) {
					return parseInt(value, baseFrom).toString(baseTo);
				}
			};
		}
	};
}

/**
 * fill value with leading zeros
 */
function zfill(value, length) {
	var s = value + "";

	while (s.length < length) {
		s = "0" + s;
	}

	return s;
}

/**
 * Compute quad key string for given x/y tile coordinates and zoom level
 *
 * @param  {integer} x tile x
 * @param  {integer} y tile y
 * @param  {integer} z zoom level
 * @return {string} quad key
 */
exports.tile2key = function tile2key(x, y, z) {
	var x_bin = convertBase(x).from(10).to(2);
	var y_bin = convertBase(y).from(10).to(2);
	x_bin = zfill(x_bin, z);
	y_bin = zfill(y_bin, z);
	// interleave bits
	var quadkey = [];
	for (var i = 0; i < z; i++) {
		// rows, i.e., y-axis, comes first
		quadkey.push(y_bin.charAt(i));
		quadkey.push(x_bin.charAt(i));
	}
	// convert quadkey to base-4 number, maintaining leading zeros (!)
	quadkey = quadkey.join("");
	quadkey = convertBase(quadkey).from(2).to(4);
	// add leading zeros if needed
	quadkey = zfill(quadkey, z);

	return quadkey
};

/**
 * Inverse of tile2key
 *
 * @param  {string} quadkey
 * @return {object} {x: x, y: y, z: z}
 */
exports.key2tile = function key2tile(quadkey) {
	var zoom = quadkey.length;
	// convert quadkey to binary
	var quadkey_bin = convertBase(quadkey).from(4).to(2);
	// it's crucial to maintain leading zeros
	quadkey_bin = zfill(quadkey_bin, zoom * 2);
	// de-interleave bits
	var x_bin = []; // "binary" (string) array
	var y_bin = [];
	var i = 0;
	while (i < quadkey_bin.length) {
		// recall that y-axis comes first
		y_bin.push(quadkey_bin.charAt(i));
		i++;
		x_bin.push(quadkey_bin.charAt(i));
		i++;
	}
	x_bin = x_bin.join("");
	y_bin = y_bin.join("");

	var x = convertBase(x_bin).from(2).to(10);
	var y = convertBase(y_bin).from(2).to(10);
	var coords = {
		x: x,
		y: y,
		z: zoom
	}

	return coords;
};
