// Class definition for a Bezier Curve
var BezierCurve = function(canvasId, ctx)
{
	// Setup all the data related to the actual curve.
	this.nodes = new Array();
	this.showControlPolygon = true;
	this.showAdaptiveSubdivision = true;
	this.tParameter = 0.5;
	this.tDepth = 3;

	// Set up all the data related to drawing the curve
	this.cId = canvasId;
	this.dCanvas = document.getElementById(this.cId);
	if (ctx) {
		this.ctx = ctx;
		return;
	} else {
		this.ctx = this.dCanvas.getContext('2d');
	}
	this.computeCanvasSize();

	// Setup event listeners
	this.cvState = CVSTATE.Idle;
	this.activeNode = null;

	// closure
	var that = this;

	// Event listeners
	this.dCanvas.addEventListener('resize', this.computeCanvasSize());

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

BezierCurve.prototype.setT = function(t)
{
	this.tParameter = t;
}

BezierCurve.prototype.setDepth = function(d)
{
	this.tDepth = d;
}

BezierCurve.prototype.setShowControlPolygon = function(bShow)
{
	this.showControlPolygon = bShow;
}

BezierCurve.prototype.setShowAdaptiveSubdivision = function(bShow)
{
	this.showAdaptiveSubdivision = bShow;
}

BezierCurve.prototype.mousePress = function(event)
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

BezierCurve.prototype.mouseMove = function(event) {
	if (this.cvState == CVSTATE.SelectPoint || this.cvState == CVSTATE.MovePoint) {
		var pos = getMousePos(event);
		this.activeNode.setPos(pos.x,pos.y);
	} else {
		// No button pressed. Ignore movement.
	}
}

BezierCurve.prototype.mouseRelease = function(event)
{
	this.cvState = CVSTATE.Idle; this.activeNode = null;
}

BezierCurve.prototype.computeCanvasSize = function()
{
	var renderWidth = Math.min(this.dCanvas.parentNode.clientWidth - 20, 820);
    var renderHeight = Math.floor(renderWidth*9.0/16.0);
    this.dCanvas.width = renderWidth;
    this.dCanvas.height = renderHeight;
}

BezierCurve.prototype.drawControlPolygon = function()
{
	for (var i = 0; i < this.nodes.length-1; i++)
		drawLine(this.ctx, this.nodes[i].x, this.nodes[i].y,
					       this.nodes[i+1].x, this.nodes[i+1].y);

}

BezierCurve.prototype.drawControlPoints = function()
{
	for (var i = 0; i < this.nodes.length; i++)
		this.nodes[i].draw(this.ctx);
}

BezierCurve.prototype.deCasteljauSplit = function(t)
{
	// split the curve recursively and call the function
	var left = new BezierCurve(this.cId, this.ctx);
	var right = new BezierCurve(this.cId, this.ctx);


// ################ Edit your code below
	// TODO: Task 1 - Split this curve at parameter location 't' into two new curves
    //                using the De Casteljau algorithm
    // A few useful notes:
    // You can get the current control points using this.nodes
    // For a degree 2 curve there are 3 control points (this.nodes[0], this.nodes[1], this.nodes[2]); for a degree 3 curve, there are 4 control points
    // To do a De Casteljau split, you need to create several new control points by interpolating between existing control points
    // You then need to add these control points to the left- and right- split curve
    // To linearly interpolate between two points at parameter s, use
    
    // var newNode = Node.lerp(a, b, s);
    
    // Your code will look similar to
    
    // var p00 = this.nodes[0];
    // var p01 = this.nodes[1];
    // ....
    
    // var p10 = Node.lerp(p00, p01, ....)
    // var p11 = ......
    // ......
    
    // left.nodes.push(....);
    // right.nodes.push(....);

	if (this.nodes.length == 3)
	{
		// degree 2 bezier curve
		// split the segments about 't'
		var [p00, p01, p02] = this.nodes;
		var p03 = Node.lerp(p00, p01, t);
		var p04 = Node.lerp(p01, p02, t);
		var p05 = Node.lerp(p03, p04, t);
		left.nodes.push(p00, p03, p05);
		right.nodes.push(p05, p04, p02);
	}
	else if (this.nodes.length == 4)
	{
		// degree 3 bezier curve
		var [p00, p01, p02, p03] = this.nodes;
		var p04 = Node.lerp(p00, p01, t);
		var p05 = Node.lerp(p01, p02, t);
		var p06 = Node.lerp(p02, p03, t);
		var p07 = Node.lerp(p04, p05, t);
		var p08 = Node.lerp(p05, p06, t);
		var p09 = Node.lerp(p07, p08, t);
		left.nodes.push(p00, p04, p07, p09);
		right.nodes.push(p09, p08, p06, p03);
	}
// ################


	return {left: left, right: right};
}

BezierCurve.prototype.deCasteljauDraw = function(depth)
{

// ################ Edit your code below
	// TODO: Task 2 - Implement a De Casteljau draw function.
    
    // While depth is positive, split the curve in the middle (using this.deCasteljauSplit(0.5))
    // Then recursively draw the left and right subcurve, with parameter depth-1
    // When depth reaches zero, you can approximate the curve with its control polygon
    // you can draw the control polygon with this.drawControlPolygon();

	if(depth>0) {
		var {left, right} = this.deCasteljauSplit(0.5);
		left.deCasteljauDraw(depth-1);
		right.deCasteljauDraw(depth-1);
	} else {
		this.drawControlPolygon();
	}
// ################

}

BezierCurve.prototype.adapativeDeCasteljauDraw = function(drawSubDivisionPoint)
{	
	// TODO: Task 3 - Implement the adaptive De Casteljau draw function
	// NOTE: Only for graduate students
    // Compute a flatness measure.
    // If not flat, split and recurse on both
    // Else draw control vertices of the curve
	var deviation = 0;
	var [first_point, ...interior_nodes]  = this.nodes.slice(0, this.nodes.length-1);
	var last_point = this.nodes[this.nodes.length-1];

	// Line defined by first_point and last_point is Ax + By + C = 0
	var {x: x1, y: y1} = first_point;
	var {x: x2, y: y2} = last_point;
	var A = y2 - y1;
    var B = x1 - x2;
    var C = x2 * y1 - x1 * y2;

	// calculate deviation sum
	for(var i=0; i<interior_nodes.length; i++) {
		var {x, y} = interior_nodes[i];
		deviation += Math.abs((A * x + B * y + C) / Math.sqrt(A ** 2 + B ** 2));
	}

	if(deviation<5) {
		this.drawControlPolygon();
		if(drawSubDivisionPoint) {
			for (node of this.nodes) {
				node.draw(this.ctx);
			}
		}
	} else {
		var {left, right} = this.deCasteljauSplit(0.5);
		left.adapativeDeCasteljauDraw(drawSubDivisionPoint);
		right.adapativeDeCasteljauDraw(drawSubDivisionPoint);
	}
	
	
}

// NOTE: Code for task 1
BezierCurve.prototype.drawTask1 = function()
{
	this.ctx.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);
	if(this.showControlPolygon)
	{
		// Connect nodes with a line
        setColors(this.ctx,'rgb(10,70,160)');
		this.drawControlPolygon();

		// Draw control points
		setColors(this.ctx,'rgb(10,70,160)','white');
		this.drawControlPoints();
	}

	if (this.nodes.length < 3)
		return;

	// De Casteljau split for one time
	var split = this.deCasteljauSplit(this.tParameter);
	setColors(this.ctx, 'red');
	split.left.drawControlPolygon();
	setColors(this.ctx, 'green');
	split.right.drawControlPolygon();

	setColors(this.ctx,'red','red');
	split.left.drawControlPoints();
	setColors(this.ctx,'green','green');
	split.right.drawControlPoints();

	// Draw some random stuff
	drawText(this.ctx, this.nodes[0].x - 20,
					   this.nodes[0].y + 20,
				  	   "t = " + this.tParameter);
}

// NOTE: Code for task 2
BezierCurve.prototype.drawTask2 = function()
{
	this.ctx.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);

	if (this.showControlPolygon)
	{
		// Connect nodes with a line
        setColors(this.ctx,'rgb(10,70,160)');
		this.drawControlPolygon();

		// Draw control points
		setColors(this.ctx,'rgb(10,70,160)','white');
		this.drawControlPoints();
    }

	if (this.nodes.length < 3)
		return;

	// De-casteljau's recursive evaluation
	setColors(this.ctx,'black');
	this.deCasteljauDraw(this.tDepth);
}

// NOTE: Code for task 3
BezierCurve.prototype.drawTask3 = function()
{
	this.ctx.clearRect(0, 0, this.dCanvas.width, this.dCanvas.height);

	if (this.showControlPolygon)
	{
		// Connect nodes with a line
        setColors(this.ctx,'rgb(10,70,160)');
		this.drawControlPolygon();

		// Draw control points
		setColors(this.ctx,'rgb(10,70,160)','white');
		this.drawControlPoints();
    }

	if (this.nodes.length < 3)
		return;

	// De-casteljau's recursive evaluation
	// setColors(this.ctx,'black');
	// this.deCasteljauDraw(this.tDepth);

	// adaptive draw evaluation
	setColors(this.ctx,'black','white');
	if(this.showAdaptiveSubdivision) {
		this.adapativeDeCasteljauDraw(true);
	}else{
		this.adapativeDeCasteljauDraw(false);
	}		
}

// Add a control point to the Bezier curve
BezierCurve.prototype.addNode = function(x,y)
{
	if (this.nodes.length < 4)
		this.nodes.push(new Node(x,y));
}
