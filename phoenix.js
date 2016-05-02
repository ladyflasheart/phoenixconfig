'use strict';

var keys = [];
var controlShift = [ 'ctrl', 'shift' ];
var controlAltShift = [ 'ctrl', 'alt', 'shift' ];
var margin = 10;
var increment = 0.1;
var moveAmount = 100;

/*Utils*/
function alert(message) {
    var modal = new Modal();
    modal.message = message;
    modal.duration = 2;
    modal.show();
}
/* Position */

var Position = {

    central: function (frame, window) {

        return {

            x: frame.x + ((frame.width - window.width) / 2),
            y: frame.y + ((frame.height - window.height) / 2)

        };
    },

    top: function (frame, window) {

        return {

            x: window.x,
            y: frame.y

        };
    },

    bottom: function (frame, window) {

        return {

            x: window.x,
            y: (frame.y + frame.height) - window.height

        };
    },

    left: function (frame, window) {

        return {

            x: frame.x,
            y: window.y

        };
    },

    right: function (frame, window) {

        return {

            x: (frame.x + frame.width) - window.width,
            y: window.y

        };
    },

    topLeft: function (frame, window, margin) {

        return {

            x: Position.left(frame, window).x + margin,
            y: Position.top(frame, window).y + margin

        };
    },

    topRight: function (frame, window, margin) {

        return {

            x: Position.right(frame, window).x - margin,
            y: Position.top(frame, window).y + margin

        };
    },

    bottomLeft: function (frame, window, margin) {

        return {

            x: Position.left(frame, window).x + margin,
            y: Position.bottom(frame, window).y - margin

        };
    },

    bottomRight: function (frame, window, margin) {

        return {

            x: Position.right(frame, window).x - margin,
            y: Position.bottom(frame, window).y - margin

        };
    }
};


/* Window Functions */

Window.prototype.to = function (position) {

    this.setTopLeft(position(this.screen().visibleFrameInRectangle(), this.frame(), margin));
}


Window.prototype.move = function (point) {

    var leftCorner = this.topLeft();
    var newPoint = {};
    if (point.x) {
        newPoint = {
            x: leftCorner.x + point.x,
            y: leftCorner.y
        }
    }

    if (point.y) {
        newPoint = {
            x: leftCorner.x,
            y: leftCorner.y + point.y
        }
    }

    this.setTopLeft(newPoint);
}

Window.prototype.moveLeft = function (amount) {

    this.move({x: -amount});
}

Window.prototype.moveRight= function (amount) {

    this.move({x: amount});
}

Window.prototype.moveUp = function (amount) {

    this.move({y:-amount});
}

Window.prototype.moveDown = function (amount) {

    this.move({y: amount});
}


Window.prototype.resize = function (multiplier) {

    var frame = this.screen().visibleFrameInRectangle();
    var newSize = this.size();

    if (multiplier.x) {
        newSize.width += frame.width * multiplier.x;
    }

    if (multiplier.y) {
        newSize.height += frame.height * multiplier.y;
    }

    this.setSize(newSize);
}

Window.prototype.increaseWidth = function () {

    this.resize({ x: increment });
}

Window.prototype.decreaseWidth = function () {

    this.resize({ x: -increment });
}

Window.prototype.increaseHeight = function () {

    this.resize({ y: increment });
}

Window.prototype.decreaseHeight = function () {

    this.resize({ y: -increment });
}

Window.prototype.increaseSize = function () {

    this.resize({ x: increment, y: increment });
}

Window.prototype.decreaseSize = function () {

    this.resize({ x: -increment, y: -increment });
}

/*Trying the tiling*/
Space.prototype.tile = function() {
    var visWindows = this.visibleWindows();
    var numTiles = visWindows.length;
    var frame = this.screen().visibleFrameInRectangle();

    if (numTiles > 4) { //more than 4 visible windows then cascade instead of tile
        this.cascade(visWindows, frame);
    } else {
        for (var i = 0; i < numTiles; i++) {
            var adjustment = this.tileCalculate(i, numTiles, frame);
            this.adjustWindow(visWindows[i], adjustment);
        }
    }
}

Space.prototype.adjustWindow = function(window, rectangle) {

    window.setTopLeft({ x: rectangle.x, y: rectangle.y});
    window.setSize({ width: rectangle.width, height: rectangle.height});
}

Space.prototype.tileCalculate = function(windowIndex, totalTiles, screenFrame) {

    var halfFrameWidth = screenFrame.width / 2;
    var halfFrameHeight = screenFrame.height / 2;
    var halfFrameX = screenFrame.x + halfFrameWidth;
    var halfFrameY = screenFrame.y + halfFrameHeight;

    //start by defaulting to same as screen
    var newX = screenFrame.x;
    var newY = screenFrame.y;
    var newWidth = screenFrame.width;
    var newHeight = screenFrame.height;

    switch(totalTiles) {
        case 1: //fill screen
            break;
        case 2: // two vertical windows side by side
            if (windowIndex === 1) {
                newX = halfFrameX;
            }
            newWidth = halfFrameWidth;
            break;
        case 3: // two windows top two quarters and third full width underneath
            newHeight = halfFrameHeight;
            newWidth = halfFrameWidth;
            if (windowIndex === 1) {
                newX = halfFrameX;
            }
            if (windowIndex === 2) {
                newY = halfFrameY;
                newWidth = screenFrame.width;
            }
            break;
        case 4: // four equal quarters
            newHeight = halfFrameHeight;
            newWidth = halfFrameWidth;
            if (windowIndex === 1 || windowIndex === 3) {
                newX = halfFrameX;
            }
            if (windowIndex === 2 || windowIndex === 3) {
                newY = halfFrameY;
            }
            break;
    }

    return { x : newX, y : newY , width : newWidth, height : newHeight};
}

Space.prototype.cascade = function(windows, frame) {
    var numWindows = windows.length;
    var halfFrameWidth = frame.width / 2;
    var halfFrameHeight = frame.height / 2;
    var xShift = halfFrameWidth / numWindows;
    var yShift = halfFrameHeight / numWindows;
    for (var i = 0; i < numWindows; i++) {
        windows[i].setSize({ width: halfFrameWidth, height: halfFrameHeight });
        windows[i].setTopLeft( { x: frame.x + xShift * i, y: frame.y + yShift * i})
    }
}


/* Position Bindings */

keys.push(Phoenix.bind('q', controlShift, function () {

    Window.focusedWindow() && Window.focusedWindow().to(Position.topLeft);
}));

keys.push(Phoenix.bind('w', controlShift, function () {

    Window.focusedWindow() && Window.focusedWindow().to(Position.topRight);
}));

keys.push(Phoenix.bind('a', controlShift, function () {

    Window.focusedWindow() && Window.focusedWindow().to(Position.bottomLeft);
}));

keys.push(Phoenix.bind('s', controlShift, function () {

    Window.focusedWindow() && Window.focusedWindow().to(Position.bottomRight);
}));

keys.push(Phoenix.bind('z', controlShift, function () {

    Window.focusedWindow() && Window.focusedWindow().to(Position.central);
}));


/* Resize Bindings */

keys.push(Phoenix.bind(',', controlShift, function () {

    Window.focusedWindow() && Window.focusedWindow().increaseWidth();
}));

keys.push(Phoenix.bind('.', controlShift, function () {

    Window.focusedWindow() && Window.focusedWindow().increaseHeight();
}));

keys.push(Phoenix.bind(',', controlAltShift, function () {

    Window.focusedWindow() && Window.focusedWindow().decreaseWidth();
}));

keys.push(Phoenix.bind('.', controlAltShift, function () {

    Window.focusedWindow() && Window.focusedWindow().decreaseHeight();
}));

keys.push(Phoenix.bind(';', controlShift, function () {

    Window.focusedWindow() && Window.focusedWindow().increaseSize();
}));

keys.push(Phoenix.bind(';', controlAltShift, function () {

    Window.focusedWindow() && Window.focusedWindow().decreaseSize();
}));


/* Move Windows by Increments*/
keys.push(Phoenix.bind('L', controlShift, function () {

    Window.focusedWindow() && Window.focusedWindow().moveLeft(moveAmount);
}));

keys.push(Phoenix.bind('L', controlAltShift, function () {

    Window.focusedWindow() && Window.focusedWindow().moveRight(moveAmount);
}));

keys.push(Phoenix.bind('U', controlShift, function () {

    Window.focusedWindow() && Window.focusedWindow().moveUp(moveAmount);
}));

keys.push(Phoenix.bind('U', controlAltShift, function () {

    Window.focusedWindow() && Window.focusedWindow().moveDown(moveAmount);
}));

/* Make active Window fill visible screen WITHOUT maximising */
keys.push(Phoenix.bind('M', controlShift, function () {
    Space.activeSpace() && Space.activeSpace().adjustWindow(Window.focusedWindow(), Space.activeSpace().screen().visibleFrameInRectangle());

}));

/*Tile*/
keys.push(Phoenix.bind('T', controlShift, function () {
    Space.activeSpace() && Space.activeSpace().tile();
}));

/*Cascade*/
keys.push(Phoenix.bind('C', controlShift, function () {
    Space.activeSpace() && Space.activeSpace().cascade(Space.activeSpace().visibleWindows(), Space.activeSpace().screen().visibleFrameInRectangle());;
}));
