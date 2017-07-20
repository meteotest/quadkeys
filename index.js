'use strict';

/**
 * Quad keys (or quad tiles) are an indexing strategy for map tiles.
 * They have some useful properties:
 *
 * - at zoom level N, every tile is identified by a string of length N,
 *   consisting of the characters '0', '1', '2', and '3'.
 * - for some tile id at level N, by stripping the last character we
 *   get the "containing" tile of level N-1. For example: tile "032" at zoom
 *   level 3 is "contained" (geographically) in tile "03" at level 2.
 *
 * These are the indices for levels 1, 2, and 3:
 *
 *  zoom 1      zoom 2                  zoom 3
 *  ---------   ---------------------   -------------------------
 *  | 0 | 1 |   | 00 | 01 | 10 | 11 |   | 000 | 001 | 010 | 011 |
 *  =====----   ---------------------   -------------------------
 *  ‖ 2 ‖ 3 |   | 02 | 03 | 12 | 13 |   | 002 | 003 | 012 | 013 |
 *  =====----   ===========---------   --------------------------
 *              ‖ 20 | 21 ‖ 30 | 31 |   | 020 | 021 | 030 | 031 |
 *              ---------------------   -------------------------
 *              ‖ 22 | 23 ‖ 32 | 33 |   | 022 | 023 | 032 | 033 |
 *              ===========----------   =========================------
 *                                      ‖ 200 | 201 | 210 | 211 ‖ 300 | etc.
 *                                      -------------------------------
 *                                      ‖ 202 | 203 | 212 | 213 ‖
 *                                      -------------------------
 *                                      ‖ 220 | 221 | 230 | 231 ‖
 *                                      -------------------------
 *                                      ‖ 222 | 223 | 232 | 233 ‖
 *                                      =========================
 *
 * To compute, e.g., the quadkey for tile (x=3, y=5) at zoom 3, we proceed
 * as follows (cf. function tile2key()). First, we convert x and y to binary
 * numbers of length z=3 (zoom level):
 *
 * x = 3 = "011" (binary)   => note the leading zero
 * y = 5 = "101" (binary)
 *
 * Next, we compose a new binary string by "interleaving" the bits of x and y
 * (take one bit from y, then one from x, then one from y, etc.):
 *
 * quadkey = "100111" (binary)
 *
 * Now we convert quadkey into a base-4 string of length z=3 (maintaining
 * leading zeros, if any):
 *
 * quadkey = "100111" (binary) = "213" (base-4)
 *
 * Source: See https://msdn.microsoft.com/en-us/library/bb259689.aspx
 */

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
