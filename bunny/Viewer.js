//Interaction

var modelRotationX = 0;
var modelRotationY = 0;
var modelTranslationZ = 3;

var dragging = false;
var lastClientX;
var lastClientY;

function onmousedown(event) {
	dragging = true;
	lastClientX = event.clientX;
	lastClientY = event.clientY;
}

function onmouseup(event) {
	dragging = false;
}

function onmousemove(event) {
	if (dragging) {
		modelRotationY = modelRotationY + event.clientX - lastClientX;
		modelRotationX = modelRotationX + event.clientY - lastClientY;
		
		if (modelRotationX > 90.0) {
			modelRotationX = 90.0;
		}
		
		if (modelRotationX < -90.0) {
			modelRotationX = -90.0;
		}
		
		requestAnimationFrame(draw);
	}
	
	lastClientX = event.clientX;
	lastClientY = event.clientY;
	
}

//---------------------------------------------------------------------------
//Intialization

var canvas;
var gl;

var normals;

var lightDirectionLocation;
var lightColorLocation;
var objectColorLocation;

var vertexPositionLocation;
var vertexNormalLocation;
var projectionMatrixLocation;
var modelMatrixLocation;

var positionBuffer;
var normalBuffer;
var triangleBuffer;

var positionArray;
var normalArray;
var triangleArray;

//Create vector operations

function add(a, b) {
	return [
		a[0] + b[0],
		a[1] + b[1],
		a[2] + b[2],
	];
}

function subtract(a, b) {
	return [
		a[0] - b[0],
		a[1] - b[1],
		a[2] - b[2],
	];
}

function dot(a, b) {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function crossProduct(a, b) {
	return [
		a[1] * b[2] - a[2] * b[1],
		a[2] * b[0] - a[0] * b[2],
		a[0] * b[1] - a[1] * b[0],
	];
}

function normalize(a) {
	var len = Math.sqrt(dot(a, a));
	
	return [
		a[0] / len,
		a[1] / len,
		a[2] / len
	];
}

function flatten(a) {
	return a.reduce(function (b, v) { b.push.apply(b, v); return b; }, [])
}

function init() {
	
	//Initialize the WebGL context.
	
	canvas = document.getElementById("webgl");
	gl	= getWebGLContext(canvas, false);
	
	canvas.onmousedown = onmousedown;
	canvas.onmouseup = onmouseup;
	canvas.onmousemove = onmousemove;
	
	//Initialize Normals.
	
	normals = [];
	
	for(i = 0; i < vertices.length; i++) {
		normals.push([0,0,0]);
	}
	
	for(i = 0; i < triangles.length; i++) {
		var i0 = triangles[i][0];
		var i1 = triangles[i][1];
		var i2 = triangles[i][2];
		
		var a = normalize(subtract(vertices[i1], vertices[i0]));
		var b = normalize(subtract(vertices[i2], vertices[i0]));

		var n = normalize(crossProduct(a, b));
		
		normals[i0] = add(normals[i0], n);
		normals[i1] = add(normals[i1], n);
		normals[i2] = add(normals[i2], n);
		
	}

	for(i = 0; i < normals.length; i++) {
		normals[i] = normalize(normals[i]);
	}
	
	// Initialize the program object and its uniforms.
	
	initShaders(gl, document.getElementById("vertexShader").text, 
					document.getElementById("fragmentShader").text);
	
	lightDirectionLocation = gl.getUniformLocation(gl.program, "lightDirection");
	lightColorLocation = gl.getUniformLocation(gl.program, "lightColor");
	objectColorLocation = gl.getUniformLocation(gl.program, "objectColor");
	projectionMatrixLocation = gl.getUniformLocation(gl.program, "projectionMatrix");
	modelMatrixLocation = gl.getUniformLocation(gl.program, "modelMatrix");
	
	// Initialize vertex and index buffer objects.
	
	vertexPositionLocation = gl.getAttribLocation(gl.program, "vertexPosition");
	vertexNormalLocation = gl.getAttribLocation(gl.program, "vertexNormal");
	
	gl.enableVertexAttribArray(vertexPositionLocation);
	gl.enableVertexAttribArray(vertexNormalLocation);

	positionArray = new Float32Array(flatten(vertices));
	normalArray = new Float32Array(flatten(normals));
	triangleArray = new Uint16Array(flatten(triangles));
	
	positionBuffer = gl.createBuffer();
	normalBuffer = gl.createBuffer();
	triangleBuffer = gl.createBuffer();
	
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, positionArray, gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, normalArray, gl.STATIC_DRAW);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleArray, gl.STATIC_DRAW);
	
	draw();
	
}

//---------------------------------------------------------------------------
//Render

function draw() {
	
	var projectionMatrix = new Matrix4();
	projectionMatrix.setPerspective(45, 1, 1, 10);
	gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix.elements);
	
	var modelMatrix = new Matrix4();
	modelMatrix.setTranslate(0, 0, -modelTranslationZ);
	modelMatrix.rotate(modelRotationX, 1, 0, 0);
	modelMatrix.rotate(modelRotationY, 0, 1, 0);
	gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix.elements);
	
	gl.uniform3f(lightDirectionLocation, 0.0, 1.0, 0.0);
	gl.uniform3f(lightColorLocation,     1.0, 1.0, 1.0);
	gl.uniform3f(objectColorLocation,    0.8, 0.8, 0.8);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.vertexAttribPointer(vertexPositionLocation, 3, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.vertexAttribPointer(vertexNormalLocation, 3, gl.FLOAT, false, 0, 0);
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
	gl.drawElements(gl.TRIANGLES, triangleArray.length, gl.UNSIGNED_SHORT, 0);
	
}


