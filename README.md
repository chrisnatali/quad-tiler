# Quad Tiler

Functions to demo [quad tiles](http://wiki.openstreetmap.org/wiki/QuadTiles) as they are implemented in OpenStreetMap.  

## Usage

```
// create quad_tiler with 2^2 units in each dimension
> require('./quad_tiler.js');
> var qt2 = quad_tiler(2);

// compute the tile for a lon, lat on the globe
// (this forces the lon/lat into one of the 2^4 quadrants
> qt2.tile(qt2.lon2x(-72), qt2.lat2y(41));
6

// compute the tiles within a quantized bounds 
// (i.e. minx=1, miny=1, maxx=2, maxy=2)
> qt2.bounds2tiles(1, 1, 2, 2)
[ 3, 9, 6, 12 ]
