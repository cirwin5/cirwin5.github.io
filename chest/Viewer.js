//Interaction

var modelRotationX = 	0;
var modelRotationY = 	0;
var modelTranslationZ = 3;

var dragging = false;
var lastClientX;
var lastClientY;

function onmousedown(event) {
	dragging = 		true;
	lastClientX = 	event.clientX;
	lastClientY = 	event.clientY;
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

var a;
var canvas;
var gl;

var lightPositionLocation;
var lightColorLocation;

var vertexPositionLocation;
var vertexNormalLocation;
var projectionMatrixLocation;
var vertexTexCoordLocation;

var positionBuffer;
var normalBuffer;
var triangleBuffer;

var positionArray;
var normalArray;
var triangleArray;
var texCoordArray;

var lightPositionX;
var lightPositionY;
var lightPositionZ;

var modelTexture;
var modelImage;

function flatten(a) {
	return a.reduce(function (b, v) { b.push.apply(b, v); return b; }, [])
}

function chestInit() {
	
	//Initialize the WebGL context.
	
	canvas = 	document.getElementById("webgl");
	gl = 		getWebGLContext(canvas, false);
	
	canvas.onmousedown = 	onmousedown;
	canvas.onmouseup = 		onmouseup;
	canvas.onmousemove = 	onmousemove;
	
	// Initialize the program object and its uniforms.
	
	initShaders(gl, document.getElementById("vertexShader").text, 
					document.getElementById("fragmentShader").text);
	
	lightPositionLocation = 	gl.getUniformLocation(gl.program, "lightPosition");
	lightColorLocation = 		gl.getUniformLocation(gl.program, "lightColor");
	projectionMatrixLocation = 	gl.getUniformLocation(gl.program, "projectionMatrix");
	modelMatrixLocation = 		gl.getUniformLocation(gl.program, "modelMatrix");
	
	// Initialize vertex and buffer objects.
	
	vertexPositionLocation = 	gl.getAttribLocation(gl.program, "vertexPosition");
	vertexNormalLocation = 		gl.getAttribLocation(gl.program, "vertexNormal");
	vertexTexCoordLocation = 	gl.getAttribLocation(gl.program, "vertexTexCoord");
	
	gl.enableVertexAttribArray(vertexPositionLocation);
	gl.enableVertexAttribArray(vertexNormalLocation);
	gl.enableVertexAttribArray(vertexTexCoordLocation);

	positionArray = 	new Float32Array(flatten(vertices));
	normalArray = 		new Float32Array(flatten(normals));
	triangleArray = 	new Uint16Array(flatten(triangles));
	texCoordArray = 	new Float32Array(flatten(texcoords));
	
	positionBuffer = 	gl.createBuffer();
	normalBuffer = 		gl.createBuffer();
	triangleBuffer = 	gl.createBuffer();
	texCoordBuffer = 	gl.createBuffer();
	
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, positionArray, gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, normalArray, gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, texCoordArray, gl.STATIC_DRAW);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleArray, gl.STATIC_DRAW);
	
	// Initialize texture
	
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

	modelImage = new Image();
	modelImage.onload = function() {
		loadTexture(modelImage);
	}
	modelImage.crossOrigin = "anonymous";
	modelImage.src = "http://i.imgur.com/7thU1gD.jpg";

	requestAnimationFrame(draw);
	
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
	
	gl.uniform4f(lightPositionLocation, lightPositionX, lightPositionY, lightPositionZ, 1);
	gl.uniform3f(lightColorLocation, 1.0, 1.0, 1.0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.vertexAttribPointer(vertexPositionLocation, 3, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.vertexAttribPointer(vertexNormalLocation, 3, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	gl.vertexAttribPointer(vertexTexCoordLocation, 2, gl.FLOAT, false, 0, 0);
	
	gl.bindTexture(gl.TEXTURE_2D, modelTexture);
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
	gl.drawElements(gl.TRIANGLES, triangleArray.length, gl.UNSIGNED_SHORT, 0);

}

//---------------------------------------------------------------------------
//Create sliders

function slider() {
	modelTranslationZ = parseFloat(document.getElementById("modelTranslationZInput").value);
	lightPositionX = 	parseFloat(document.getElementById("lightPositionXInput").value);
	lightPositionY = 	parseFloat(document.getElementById("lightPositionYInput").value);
	lightPositionZ = 	parseFloat(document.getElementById("lightPositionZInput").value);
	
	document.getElementById("modelTranslationZOutput").innerHTML = modelTranslationZ;
	document.getElementById("lightPositionXOutput").innerHTML = lightPositionX;
	document.getElementById("lightPositionYOutput").innerHTML = lightPositionY;
	document.getElementById("lightPositionZOutput").innerHTML = lightPositionZ;
	
	requestAnimationFrame(draw);
}

//---------------------------------------------------------------------------
//Load texture

function loadTexture(image) {
	modelTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, modelTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	requestAnimationFrame(draw);
}
