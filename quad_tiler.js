quad_tiler = function(order) {

    var qt = {};
    // The number of bits per coordinate
    // s.t. 0 < x < (2^16)-1 and 0 < y < (2^16)-1
    var _order = order
    var _range_max = Math.pow(2, _order)-1;


    // quantize coordinate space into 2^_order {0..(2^_order)-1} units
    qt.lon2x = function(lon) {
        return Math.round(((lon + 180)/360) * _range_max);
    }

    qt.lat2y = function(lat) {
        return Math.round(((lat + 90)/180) * _range_max);
    }

    qt.x2lon = function(x) { 
        return ((x / _range_max) * 360) - 180;
    }

    qt.y2lat = function(y) { 
        return ((y / _range_max) * 180) - 90;
    }

    qt.tile = function(x, y) {
        var tile = 0;
        // walk the bits of x and y, shifting them
        // into proper interleaved position of the tile
        for(var i = (_order - 1); i >= 0; i--) {
            tile = (tile << 1) | ((x >> i) & 1);
            tile = (tile << 1) | ((y >> i) & 1);
        }
        return tile;
    }
       

    qt.x_y = function(tile) {
        // walk the 2*_order bits of the tile, shifting them
        // into proper position of x and y 
        var x = 0;
        var y = 0;
        for(var i = (2*_order)-1; i >= 0; i--) {
            x = (x << 1) | ((tile >> i) & 1);
            i--;
            y = (y << 1) | ((tile >> i) & 1);
        }
        return [x, y];
    }
     
    qt.bounds2tiles = function(minx, miny, maxx, maxy) {
        var numx = (maxx - minx) + 1;
        var numy = (maxy - miny) + 1;

        var tiles = new Array(numx * numy);
        for(var x = 0; x < numx; x++) {
            for(var y = 0; y < numy; y++) {
                //row-order from left->right, bottom->top
                tiles[x + (numx*y)] = qt.tile(minx + x, miny + y);
            }
        }
        return tiles;
    }

    qt.bounds2tiles_ll = function(minlon, minlat, maxlon, maxlat) {
        minx = qt.lon2x(minlon);
        miny = qt.lat2y(minlat);
        maxx = qt.lon2x(maxlon);
        maxy = qt.lat2y(maxlat);

        return qt.bounds2tiles(minx, miny, maxx, maxy);
    }

    qt.num_tiles = function(minlon, minlat, maxlon, maxlat) {
        minx = qt.lon2x(minlon);
        miny = qt.lat2y(minlat);
        maxx = qt.lon2x(maxlon);
        maxy = qt.lat2y(maxlat);

        var numx = (maxx - minx) + 1;
        var numy = (maxy - miny) + 1;
        return numx * numy;
    }

    qt.tile2 = function(x, y) {
        var tile = 0;
        var mask = Math.pow(2, (_order - 1));
        // keep track of the shift we need to apply to
        // x and y to interleave in tile
        var shift_left = _order;
        while(mask > 0) {
            tile = ((mask & x) << shift_left) | tile;
            shift_left--;
            tile = ((mask & y) << shift_left) | tile;
            mask >>= 1;
        }
        return tile;
    }

    qt.x_y2 = function(tile) {
        var x = 0,
            y = 0;

        var mask = Math.pow(2, (2*_order)-1);
        var shift_right = _order;
        // note that we use `>>>` to shift in 0's from the left
        // as these are treated as signed numbers without that
        while(mask > 0) {
            x = ((mask & tile) >>> shift_right) | x;
            shift_right--;
            mask >>>= 1;
            y = ((mask & tile) >>> shift_right) | y;
            mask >>>= 1;
        }
        return [x, y];
    }
     
    // convert quantized lon, lat into interleaved tile key
    qt.lat_lon2tile = function(lon, lat) {
        var x = lon2x(lon);
        var y = lat2y(lat);
        return tile(x, y);
    }

    qt.tile2lat_lon = function(tile) {
        var xy_arr = x_y(tile);
        return [x2lon(xy_arr[0]), y2lat(xy_arr[1])];
    }
       
    qt.toBinString = function(tile) {
        var out = "";
        for(var i = (2*_order) - 1;  i >= 0; i--) {
            if (((tile >> i) & 1)) {
                out += "1";
            }
            else { 
                out += "0";
            }
        }
        return out;
    }

    return qt;
};
