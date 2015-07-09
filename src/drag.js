// Place to store the dragging object
var dragObj;

// Set up mouse position tracking
document.onmousemove = mouseMove;
document.addEventListener('mouseup', mouseUp);

function mouseMove (event) {
    event = event || window.event;
    window.mousePos = mouseCoords(event);
    if (dragObj !== undefined) {
        // Move it
        var newPos = Math.min(dragObj.right, window.mousePos.x - dragObj.offsetX - dragObj.margin);
        newPos = Math.max(newPos, dragObj.left);
        d3.select(dragObj.obj)
            .attr({ x1 : newPos,
                    x2 : newPos });
        dragObj.callback();
    }
}

function mouseCoords (event) {
    if (event.pageX || event.pageY) {
        return {x : event.pageX, y : event.pageY};
    }
    return {
        x : event.clientX + document.body.scrollLeft - document.body.clientLeft,
        y : event.clientY + document.body.scrollTop  - document.body.clientTop
    };
}

function mouseUp (event) {
    dragObj = undefined;
}



// Create event function
exports.dragLR = function (leftLimit, rightLimit, plot, callback, margin) {
    return function() {
        var offsetX = plot.getBoundingClientRect().left;
        pauseEvent(d3.event);
        dragObj = { obj : this,
                    left : leftLimit,
                    right : rightLimit,
                    offsetX : offsetX,
                    callback : callback,
                    margin : margin
                  };
    };
};

function pauseEvent(e){
        if(e.stopPropagation) e.stopPropagation();
        if(e.preventDefault) e.preventDefault();
        e.cancelBubble=true;
        e.returnValue=false;
        return false;
    }
