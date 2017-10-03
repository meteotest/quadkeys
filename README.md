# quadkeys
Javascript quad keys implementation.

## About
Quad keys (or quad tiles) are an indexing strategy for map tiles.
They have some useful properties:

- at zoom level N, every tile is identified by a string of length N,
  consisting of the characters '0', '1', '2', and '3'.
- for some tile id at level N, by stripping the last character we
  get the "containing" tile of level N-1. For example: tile "032" at zoom
  level 3 is "contained" (geographically) in tile "03" at level 2.

These are the indices for levels 1, 2, and 3:

```
 zoom 1      zoom 2                  zoom 3
 ---------   ---------------------   -------------------------
 | 0 | 1 |   | 00 | 01 | 10 | 11 |   | 000 | 001 | 010 | 011 |
 =====----   ---------------------   -------------------------
 ‖ 2 ‖ 3 |   | 02 | 03 | 12 | 13 |   | 002 | 003 | 012 | 013 |
 =====----   ===========---------   --------------------------
             ‖ 20 | 21 ‖ 30 | 31 |   | 020 | 021 | 030 | 031 |
             ---------------------   -------------------------
             ‖ 22 | 23 ‖ 32 | 33 |   | 022 | 023 | 032 | 033 |
             ===========----------   =========================------
                                     ‖ 200 | 201 | 210 | 211 ‖ 300 | etc.
                                     -------------------------------
                                     ‖ 202 | 203 | 212 | 213 ‖
                                     -------------------------
                                     ‖ 220 | 221 | 230 | 231 ‖
                                     -------------------------
                                     ‖ 222 | 223 | 232 | 233 ‖
                                     =========================
```

To compute, e.g., the quadkey for tile (x=3, y=5) at zoom 3, we proceed
as follows (cf. function tile2key()). First, we convert x and y to binary
numbers of length z=3 (zoom level):

`x = 3 = "011" (binary)` (note the leading zero)  
`y = 5 = "101" (binary)`

Next, we compose a new binary string by "interleaving" the bits of x and y
(take one bit from y, then one from x, then one from y, etc.):

`quadkey = "100111" (binary)`

Now we convert quadkey into a base-4 string of length z=3 (maintaining
leading zeros, if any):

`quadkey = "100111" (binary) = "213" (base-4)`

## Source
[MSDN: Bing Maps Tile System](https://msdn.microsoft.com/en-us/library/bb259689.aspx)
