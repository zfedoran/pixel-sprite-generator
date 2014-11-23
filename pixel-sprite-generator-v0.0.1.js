/**
 * Pixel Sprite Generator v0.0.1
 *
 * This is a JavaScript version of David Bollinger's pixelrobots and
 * pixelspaceships algorithm.
 *
 * More info:
 * http://www.davebollinger.com/works/pixelrobots/
 * http://www.davebollinger.com/works/pixelspaceships/
 *
 * Archived website (links above are down):
 * http://web.archive.org/web/20080228054405/http://www.davebollinger.com/works/pixelrobots/
 * http://web.archive.org/web/20080228054410/http://www.davebollinger.com/works/pixelspaceships/
 *
 */

/**
 *   The Mask class defines a 2D template form which sprites can be generated.
 *
 *   @class Mask
 *   @constructor
 *   @param {data} Integer array describing which parts of the sprite should be
 *   empty, body, and border. The mask only defines a semi-ridgid stucture
 *   which might not strictly be followed based on randomly generated numbers.
 *
 *      -1 = Always border (black)
 *       0 = Empty
 *       1 = Randomly chosen Empty/Body
 *       2 = Randomly chosen Border/Body
 *
 *   @param {width} Width of the mask data array
 *   @param {height} Height of the mask data array
 *   @param {mirrorX} A boolean describing whether the mask should be mirrored on the x axis
 *   @param {mirrorY} A boolean describing whether the mask should be mirrored on the y axis
 */
function Mask(data, width, height, mirrorX, mirrorY) {
    this.width   = width;
    this.height  = height;
    this.data    = data;
    this.mirrorX = typeof mirrorX !== 'undefined' ? mirrorX : true;
    this.mirrorY = typeof mirrorY !== 'undefined' ? mirrorY : true;
}


/**
*   The Sprite class makes use of a Mask instance to generate a 2D sprite on a
*   HTML canvas.
*
*   @class Sprite
*   @param {mask}
*   @constructor
*/
function Sprite(mask) {
    this.width  = mask.width * (mask.mirrorX ? 2 : 1);
    this.height = mask.height * (mask.mirrorY ? 2 : 1);
    this.mask   = mask;
    this.data   = new Array(this.width * this.height);

    this.init();
}


/**
*   The init method calls all functions required to generate the sprite.
*
*   @method init
*   @returns {undefined}
*/
Sprite.prototype.init = function() {
    this.initCanvas();
    this.initContext();
    this.initData();

    this.applyMask();
    this.generateRandomSample();

    if (this.mask.mirrorX) {
        this.mirrorX();
    }

    if (this.mask.mirrorY) {
        this.mirrorX();
    }

    this.generateEdges();
    this.renderPixelData();
};

/**
*   The initCanvas method creates a HTML canvas element for internal use.
*
*   (note: the canvas element is not added to the DOM)
*
*   @method initCanvas
*   @returns {undefined}
*/
Sprite.prototype.initCanvas = function() {
  this.canvas = document.createElement('canvas');
   
  this.canvas.width  = this.width;
  this.canvas.height = this.height;
};

/**
*   The initContext method requests a CanvasRenderingContext2D from the
*   internal canvas object.
*
*   @method 
*   @returns {undefined}
*/
Sprite.prototype.initContext = function() {
  this.ctx    = this.canvas.getContext('2d');
  this.pixels = this.ctx.createImageData(this.width, this.height);
};

/**
*   The getData method returns the sprite template data at location (x, y)
*
*      -1 = Always border (black)
*       0 = Empty
*       1 = Randomly chosen Empty/Body
*       2 = Randomly chosen Border/Body
*
*   @method getData
*   @param {x}
*   @param {y}
*   @returns {undefined}
*/
Sprite.prototype.getData = function(x, y) {
    return this.data[y * this.width + x];
};

/**
*   The setData method sets the sprite template data at location (x, y)
*
*      -1 = Always border (black)
*       0 = Empty
*       1 = Randomly chosen Empty/Body
*       2 = Randomly chosen Border/Body
*
*   @method setData
*   @param {x}
*   @param {y}
*   @param {value}
*   @returns {undefined}
*/
Sprite.prototype.setData = function(x, y, value) {
    this.data[y * this.width + x] = value;
};

/**
*   The initData method initializes the sprite data to completely solid.
*
*   @method initData
*   @returns {undefined}
*/
Sprite.prototype.initData = function() {
    var h = this.height;
    var w = this.width;
    var x, y;
    for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
            this.setData(x, y, -1);
        }
    }
};

/**
*   The mirrorX method mirrors the template data horizontally.
*
*   @method mirrorX
*   @returns {undefined}
*/
Sprite.prototype.mirrorX = function() {
    var h = this.height;
    var w = Math.floor(this.width/2);
    var x, y;
    for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
            this.setData(this.width - x - 1, y, this.getData(x, y));
        }
    }
};

/**
*   The mirrorY method mirrors the template data vertically.
*
*   @method 
*   @returns {undefined}
*/
Sprite.prototype.mirrorY = function() {
    var h = Math.floor(this.height/2);
    var w = this.width;
    var x, y;
    for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
            this.setData(x, this.height - y - 1, this.getData(x, y));
        }
    }
};

/**
*   The applyMask method copies the mask data into the template data array at
*   location (0, 0).
*
*   (note: the mask may be smaller than the template data array)
*
*   @method applyMask
*   @returns {undefined}
*/
Sprite.prototype.applyMask = function() {
    var h = this.mask.height;
    var w = this.mask.width;

    var x, y;
    for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
            this.setData(x, y, this.mask.data[y * w + x]);
        }
    }
};

/**
*   Apply a random sample to the sprite template.
*
*   If the template contains a 1 (internal body part) at location (x, y), then
*   there is a 50% chance it will be turned empty. If there is a 2, then there
*   is a 50% chance it will be turned into a body or border.
*
*   (feel free to play with this logic for interesting results)
*
*   @method generateRandomSample
*   @returns {undefined}
*/
Sprite.prototype.generateRandomSample = function() {
    var h = this.height;
    var w = this.width;

    var x, y;
    for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
            var val = this.getData(x, y);

            if (val === 1) {
                val = val * Math.round(Math.random());
            } else if (val === 2) {
                if (Math.random() > 0.5) {
                    val = 1;
                } else {
                    val = -1;
                }
            } 

            this.setData(x, y, val);
        }
    }
};

/**
*   This method applies edges to any template location that is positive in
*   value and is surrounded by empty (0) pixels.
*
*   @method generateEdges
*   @returns {undefined}
*/
Sprite.prototype.generateEdges = function() {
    var h = this.height;
    var w = this.width;

    var x, y;
    for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
            if (this.getData(x, y) > 0) {
                if (y - 1 >= 0 && this.getData(x, y-1) === 0) {
                    this.setData(x, y-1, -1);
                }
                if (y + 1 < this.height && this.getData(x, y+1) === 0) {
                    this.setData(x, y+1, -1);
                }
                if (x - 1 >= 0 && this.getData(x-1, y) === 0) {
                    this.setData(x-1, y, -1);
                }
                if (x + 1 < this.width && this.getData(x+1, y) === 0) {
                    this.setData(x+1, y, -1);
                }
            }
        }
    }
};

/**
*   This method renders out the template data to a HTML canvas to finally
*   create the sprite.
*
*   (note: only template locations with the values of -1 (border) are rendered)
*
*   @method renderPixelData
*   @returns {undefined}
*/
Sprite.prototype.renderPixelData = function() {
    var x, y;
    for (y = 0; y < this.height; y++) {
        for (x = 0; x < this.width; x++) {
            var val = this.getData(x, y);

            var a = 1;
            var r = val === -1 ? 0 : 1;
            var g = val === -1 ? 0 : 1;
            var b = val === -1 ? 0 : 1;

            var index = (y * this.width + x) * 4;

            this.pixels.data[index+0] = r * 255;
            this.pixels.data[index+1] = g * 255;
            this.pixels.data[index+2] = b * 255;
            this.pixels.data[index+3] = a * 255;
        }
    }

    this.ctx.putImageData(this.pixels, 0, 0);
};

/**
*   This method converts the template data to a string value for debugging
*   purposes.
*
*   @method toString
*   @returns {undefined}
*/
Sprite.prototype.toString = function() {
    var h = this.height;
    var w = this.width;
    var x, y, output = '';
    for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
            var val = this.getData(x, y);
            output += val >= 0 ? ' ' + val : '' + val;
        }
        output += '\n';
    }
    return output;
};

