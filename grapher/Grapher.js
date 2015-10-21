// Grapher.js // Vertex shader program

var r, c;
var n = 16;

var vertices = new Float32Array(Math.pow(n, 2)*3);
var triangles = new Uint16Array(2*Math.pow(n-1, 2)*3);
var lines = new Uint16Array((Math.pow(n, 2)-n)*4);

// k = index counter for vertices array

var k =0;

// i = index counter for triangles array

var i = 0;

// l = index counter for lines array

var l = 0;

// Fill the vertices array

for (r = 0; r < n; r++){
	for (c = 0; c < n; c++){
		var x = 2 * (c/(n-1)) - 1;
		var z = 2 * (r/(n-1)) - 1;
		var y = 1 - Math.pow(x, 2) - Math.pow(z, 2);
		
		vertices[k] = x;
		vertices[k+1] = y;
		vertices[k+2] = z;
		k +=3;
	}
}

// Fill the triangles array

for (r = 0; r < (n-1); r++){
	for (c = 0; c < (n-1); c++){
		var i0 = (r + 0) * n + (c + 0);
		var i1 = (r + 1) * n + (c + 0);
		var i2 = (r + 0) * n + (c + 1);
		var i3 = (r + 0) * n + (c + 1);
		var i4 = (r + 1) * n + (c + 0);
		var i5 = (r + 1) * n + (c + 1);
		
		triangles[i] = i0;
		triangles[i+1] = i1;
		triangles[i+2] = i2;
		triangles[i+3] = i3;
		triangles[i+4] = i4;
		triangles[i+5] = i5;
		i += 6;
	}
}

// Fill the lines array with two blocks of loops

for (r = 0; r < n; r++){
	for (c = 0; c < (n-1); c++){
		var i0 = (r + 0) * n + (c + 0);
		var i2 = (r + 0) * n + (c + 1);
	
		lines[l] = i0;
		lines[l+1] = i2;
		l += 2;
	}
}

for (r = 0; r < (n-1); r++){
	for (c = 0; c < n; c++){
		var i0 = (r + 0) * n + (c + 0);
		var i1 = (r + 1) * n + (c + 0);
	
		lines[l] = i0;
		lines[l+1] = i1;
		l += 2;
	}
}

//------------------------------------------------------------------------------

var VSHADER_SOURCE =
	'uniform   mat4 Model;\n' +
	'uniform   mat4 Projection;\n' +
	'attribute vec4 a_Position;\n' +
	'varying mediump vec4 v_Color;\n' +
	'void main() {\n' +
	'   v_Color = (a_Position + 1.0)/2.0;\n' +
	'	gl_Position = Projection * Model * a_Position;\n' +
	'}\n';

var FSHADER_SOURCE =
	'uniform mediump vec4 Light;\n' +
	'varying mediump vec4 v_Color;\n' +
	'void main() {\n' +
	'  gl_FragColor = Light * v_Color;\n' +
	'}\n';
	
//------------------------------------------------------------------------------
	
var gl;
var canvas;

var rotateX;
var rotateY;

var vertexBuffer;
var triangleBuffer;
var linesBuffer;

var lightLocation

function init() {
	
	// Retrieve <canvas> element
	canvas = document.getElementById('webgl');
	if (!canvas) {
		console.log('Failed to get the canvas');
		return;
	}
	
	// Get the rendering context for WebGL
	gl = getWebGLContext(canvas, false);
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}
	
	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
	console.log('Failed to initialize shaders.');
	return;
	}
	
	lightLocation = gl.getUniformLocation(gl.program, 'Light')
		
	
    // Initialize vertex and index buffer objects.
	
	vertexBuffer = gl.createBuffer();
	if (!vertexBuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}
	
	triangleBuffer = gl.createBuffer();
	if (!triangleBuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}
	
	linesBuffer = gl.createBuffer();
	if (!triangleBuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangles, gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, linesBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, lines, gl.STATIC_DRAW);
	
	// Link the shader attributes to the vertex buffer object.
	
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if (a_Position < 0) {
		console.log('Failed to get the storage location of vPosition');
		return;
	}
	
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);
	
	// Set up to render.
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	
	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT);
		
	rotateY = 0.0;
	rotateX = 0.0;
	
	draw();
	
}

// Set up movement of object with mouse click

function move(event){
	
	if (event.which == 1){
		rotateY = rotateY + event.movementX;
		rotateX = rotateX + event.movementY;
		
		if (rotateX > 90.0){
			rotateX = 90.0;
		}
		if (rotateX < -90.0){
			rotateX = -90.0;
		}
		
		if (rotateY > 180.0){
			rotateY -= 360.0;
		}
		if (rotateY < -180.0){
			rotateY += 360.0;
		}
	}
}

function draw() {
	
    var z = parseFloat(document.getElementById("zinput").value);
    var f = parseFloat(document.getElementById("finput").value);
	
    document.getElementById("zoutput").innerHTML = z;
    document.getElementById("foutput").innerHTML = f;
	
	// Compute the transfrom
	
	var ProjectionLocation = gl.getUniformLocation(gl.program, 'Projection');
    var Projection = new Matrix4();
    Projection.setPerspective(f, 1, 1, 10);
    gl.uniformMatrix4fv(ProjectionLocation, false, Projection.elements);
	
	var ModelLocation = gl.getUniformLocation(gl.program, 'Model');
    var Model = new Matrix4();
    Model.setTranslate(0, 0, -z);
	Model.rotate(rotateX, 1, 0, 0);
	Model.rotate(rotateY, 0, 1, 0);
			
    gl.uniformMatrix4fv(ModelLocation, false, Model.elements);
	
    // Clear the scree,
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
    // Draw the triangle in color
	
	gl.uniform4f(lightLocation, 1, 1, 1, 1);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
    gl.drawElements(gl.TRIANGLES, triangles.length, gl.UNSIGNED_SHORT, 0);
	
    // Draw the lines in black
	
	gl.uniform4f(lightLocation, 0, 0, 0, 1);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, linesBuffer);
    gl.drawElements(gl.LINES, lines.length, gl.UNSIGNED_SHORT, 0);
	
	requestAnimationFrame(draw);
}