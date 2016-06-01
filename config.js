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

    topLeftNoMargin: function (frame, window) {

        return {

            x: Position.left(frame, window).x,
            y: Position.top(frame, window).y
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
    },

    topMiddle: function (frame, window) {

        return {

            x: Position.left(frame, window).x + frame.width / 2,
            y: Position.top(frame, window).y

        };
    },

    leftMiddle: function (frame, window) {

        return {

            x: Position.left(frame, window).x,
            y: Position.top(frame, window).y + frame.height / 2

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

Window.prototype.toCol = function (position) {

    this.to(position);
    this.setSize(
       {
           width: this.screen().visibleFrameInRectangle().width / 2,
           height: this.screen().visibleFrameInRectangle().height
      });
}


Window.prototype.toRow = function (position) {

    this.to(position);
    this.setSize(
        {
            width: this.screen().visibleFrameInRectangle().width,
            height: this.screen().visibleFrameInRectangle().height / 2
        });
}

/* Position Bindings for four corners or middle */

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

/* Move active window to left column position or right column position or top half or bottom half of screen */
keys.push(Phoenix.bind('left', controlShift, function () {

    Window.focusedWindow() && Window.focusedWindow().toCol(Position.topLeftNoMargin);
}));

keys.push(Phoenix.bind('right', controlShift, function () {

    Window.focusedWindow() && Window.focusedWindow().toCol(Position.topMiddle);
}));

keys.push(Phoenix.bind('t', controlShift, function () {

    Window.focusedWindow() && Window.focusedWindow().toRow(Position.topLeftNoMargin);
}));

keys.push(Phoenix.bind('b', controlShift, function () {

    Window.focusedWindow() && Window.focusedWindow().toRow(Position.leftMiddle);
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



/* Window fill visible screen */
keys.push(Phoenix.bind('M', controlShift, function () {
    Window.focusedWindow && Window.focusedWindow().maximize();
}));



