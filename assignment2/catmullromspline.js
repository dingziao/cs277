var CatmullRomSpline = function(canvasId)
{
	// Set up all the data related to drawing the curve
	this.cId = canvasId;
	this.dCanvas = document.getElementById(this.cId);
	this.ctx = this.dCanvas.getContext('2d');
	this.dCanvas.addEventListener('resize', this.computeCanvasSize());
	this.computeCanvasSize();

	// Setup all the data related to the actual curve.
	this.nodes = new Array();
	this.showControlPolygon = true;
	this.showTangents = true;

	// Assumes a equal parametric split strategy
	this.numSegments = 16;

	// Global tension parameter
	this.tension = 0.5;

	// Setup event listeners
	this.cvState = CVSTATE.Idle;
	this.activeNode = null;

	// closure
	var that = this;

	// Event listeners
	this.dCanvas.addEventListener('mousedown', function(event) {
        that.mousePress(event);
    });

	this.dCanvas.addEventListener('mousemove', function(event) {
		that.mouseMove(event);
	});

	this.dCanvas.addEventListener('mouseup', function(event) {
		that.mouseRelease(event);
	});

	this.dCanvas.addEventListener('mouseleave', function(event) {
		that.mouseRelease(event);
	});
}

CatmullRomSpline.prototype.setShowControlPolygon = function(bShow)
{
	this.showControlPolygon = bShow;
}

CatmullRomSpline.prototype.setShowTangents = function(bShow)
{
	this.showTangents = bShow;
}

CatmullRomSpline.prototype.setTension = function(val)
{
	this.tension = val;
}

CatmullRomSpline.prototype.setNumSegments = function(val)
{
	this.numSegments = val;
}

CatmullRomSpline.prototype.mousePress = function(event)
{
	if (event.button == 0) {
		this.activeNode = null;
		var pos = getMousePos(event);

		// Try to find a node below the mouse
		for (var i = 0; i < this.nodes.length; i++) {
			if (this.nodes[i].isInside(pos.x,pos.y)) {
				this.activeNode = this.nodes[i];
				break;
			}
		}
	}

	// No node selected: add a new node
	if (this.activeNode == null) {
		this.addNode(pos.x,pos.y);
		this.activeNode = this.nodes[this.nodes.length-1];
	}

	this.cvState = CVSTATE.SelectPoint;
	event.preventDefault();
}

CatmullRomSpline.prototype.mouseMove = function(event) {
	if (this.cvState == CVSTATE.SelectPoint || this.cvState == CVSTATE.MovePoint) {
		var pos = getMousePos(event);
		this.activeNode.setPos(pos.x,pos.y);
	} else {
		// No button pressed. Ignore movement.
	}
}

CatmullRomSpline.prototype.mouseRelease = function(event)
{
	this.cvState = CVSTATE.Idle; this.activeNode = null;
}

CatmullRomSpline.prototype.computeCanvasSize = function()
{
	var renderWidth = Math.min(this.dCanvas.parentNode.clientWidth - 20, 820);
    var renderHeight = Math.floor(renderWidth*9.0/16.0);
    this.dCanvas.width = renderWidth;
    this.dCanvas.height = renderHeight;
}

CatmullRomSpline.prototype.drawControlPolygon = function()
{
	for (var i = 0; i < this.nodes.length-1; i++)
		drawLine(this.ctx, this.nodes[i].x, this.nodes[i].y,
					  this.nodes[i+1].x, this.nodes[i+1].y);
}

CatmullRomSpline.prototype.drawControlPoints = function()
{
	for (var i = 0; i < this.nodes.length; i++)
		this.nodes[i].draw(this.ctx);
}

CatmullRomSpline.prototype.drawTangents = function()
{

// ################ Edit your code below
	// TODO: Task 4
    // Compute tangents at the nodes and draw them using drawLine(this.ctx, x0, y0, x1, y1);
	// Note: Tangents are available only for 2,..,n-1 nodes. The tangent is not defined for 1st and nth node.
    // The tangent of the i-th node can be computed from the (i-1)th and (i+1)th node
    // Normalize the tangent and compute a line with a length of 50 pixels from the current control point.
	for(var i=1; i<this.nodes.length-1; i++) {
		var {x: x0, y: y0} = this.nodes[i];
		var dy = this.nodes[i+1].y - this.nodes[i-1].y;
		var dx = this.nodes[i+1].x - this.nodes[i-1].x;
		var dy_norm = dy / Math.sqrt(dx**2 + dy**2);
		var dx_norm = dx / Math.sqrt(dx**2 + dy**2);
		setColors(this.ctx, 'red');
		drawLine(this.ctx, x0, y0, x0 + 50*dx_norm, y0 + 50*dy_norm);
	}
// ################

}

CatmullRomSpline.prototype.draw = function()
{

// ################ Edit your code below
	// TODO: Task 5: Draw the Catmull-Rom curve (see the assignment for more details)
    // Hint: You should use drawLine to draw lines, i.e.
	// setColors(this.ctx,'black');
	// .....
	// drawLine(this.ctx, x0, y0, x1, y1);
	// ....
	var para_increment = 1/this.numSegments;
	var s = (1-this.tension) / 2;

	for(var i=1; i<this.nodes.length-2; i++) {
		var {x: x0, y: y0} = this.nodes[i-1];
		var {x: x1, y: y1} = this.nodes[i];
		var {x: x2, y: y2} = this.nodes[i+1];
		var {x: x3, y: y3} = this.nodes[i+2];
		var dx0 = s*(x2-x0);
		var dy0 = s*(y2-y0);
		var dx1 = s*(x3-x1);
		var dy1 = s*(y3-y1);

		setColors(this.ctx, 'black');
		for(var t=0; t<this.numSegments; t++) {
			drawLine(this.ctx, 
				(t*para_increment)**3*(2*x1-2*x2+dx0+dx1) + (t*para_increment)**2*(-3*x1+3*x2-2*dx0-dx1) + (t*para_increment)*dx0 + x1, 
				(t*para_increment)**3*(2*y1-2*y2+dy0+dy1) + (t*para_increment)**2*(-3*y1+3*y2-2*dy0-dy1) + (t*para_increment)*dy0 + y1,
				((t+1)*para_increment)**3*(2*x1-2*x2+dx0+dx1) + ((t+1)*para_increment)**2*(-3*x1+3*x2-2*dx0-dx1) + ((t+1)*para_increment)*dx0 + x1,
				((t+1)*para_increment)**3*(2*y1-2*y2+dy0+dy1) + ((t+1)*para_increment)**2*(-3*y1+3*y2-2*dy0-dy1) + ((t+1)*para_increment)*dy0 + y1
			);

		}
	}

// ################
}

// NOTE: Task 4 code.
CatmullRomSpline.prototype.drawTask4 = function()
{
	// clear the rect
	this.ctx.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);

    if (this.showControlPolygon) {
		// Connect nodes with a line
        setColors(this.ctx,'rgb(10,70,160)');
        for (var i = 1; i < this.nodes.length; i++) {
            drawLine(this.ctx, this.nodes[i-1].x, this.nodes[i-1].y, this.nodes[i].x, this.nodes[i].y);
        }
		// Draw nodes
		setColors(this.ctx,'rgb(10,70,160)','white');
		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].draw(this.ctx);
		}
    }

	// We need atleast 4 points to start rendering the curve.
    if(this.nodes.length < 4) return;

	// draw all tangents
	if(this.showTangents)
		this.drawTangents();
}

// NOTE: Task 5 code.
CatmullRomSpline.prototype.drawTask5 = function()
{
	// clear the rect
	this.ctx.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);

    if (this.showControlPolygon) {
		// Connect nodes with a line
        setColors(this.ctx,'rgb(10,70,160)');
        for (var i = 1; i < this.nodes.length; i++) {
            drawLine(this.ctx, this.nodes[i-1].x, this.nodes[i-1].y, this.nodes[i].x, this.nodes[i].y);
        }
		// Draw nodes
		setColors(this.ctx,'rgb(10,70,160)','white');
		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].draw(this.ctx);
		}
    }

	// We need atleast 4 points to start rendering the curve.
    if(this.nodes.length < 4) return;

	// Draw the curve
	this.draw();

	if(this.showTangents)
		this.drawTangents();
}


// Add a control point to the curve
CatmullRomSpline.prototype.addNode = function(x,y)
{
	this.nodes.push(new Node(x,y));
}
