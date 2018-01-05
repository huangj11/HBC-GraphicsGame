/* Julie Huang      CSC 350     Honors by Contract project */

var canvas;
var gl;
var program;

var NumVerticesCube = 0;
var NumVerticesPyr = 0;
var NumVerticesTot = 0;

var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0),

    vec4(0, 0.25, 0.0, 1.0),
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),

    vec4(0, 0.25, 0.0, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0),

    vec4(0, 0.25, 0.0, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),

    vec4(0, 0.25, 0.0, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, -0.5, 0.5, 1.0),
];

var points = [];
var normalsArray = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [0, 0, 0];
var maxTurn = 0;
var move = 0;
var maxMove = [0, 0, 0, 0];
var dir = vec4(1, 0, 0, 0);
var dir2 = vec4(1, 0, 0, 0);

var v = vec4(1, 0, 0, 0);
var vNorm = normalize(v);

var locTemp = vec4(0, 0, 0, 0);
var locTemp2 = vec4(-1.5, 0, 0, 0);

var angleRot2 = 0;
var axisRot2 = vec3(0, 1, 0);
var loc = vec4(0, 0, 0, 1);
var loc2 = vec4(-1.5, 0, 0, 1);
var locColorTrig = vec4(0, 2, 0, 1);

var changeDir = false;
var turnDirY = true;
var changeMove = false;


var view = 3;
var near = -8;
var far = 8;
var left = -view;
var right = view;
var ytop = view;
var bottom = -view;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
var viewChange = true;
var texChange = false;


//light variables
var lightPosition = vec4(1, 1, 3, 0.0);
var lightAmbient = vec4(0.6, 0.6, 0.6, 1.0);
var lightDiffuse = vec4(0.8, 0.4, 0.4, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);


//material properties for creature 1
var materialAmbient = vec4(0.2, 1, 1, 1.0);
var materialDiffuse = vec4(0.0, 0.5, 0.6, 1.0);
var materialSpecular = vec4(0.9, 1.0, 1.0, 1.0);

//material properties for creature 2
var materialAmbient2 = vec4(1, 0.0, 0.7, 1.0);
var materialDiffuse2 = vec4(0.5, 0.1, 0.4, 1.0);
var materialSpecular2 = vec4(1.0, 1.0, 1.0, 1.0);

var materialShininess = 10;

//material properties for color trigger
var materialAmbient3 = vec4(Math.random(), Math.random(), Math.random(), 1.0);
var materialDiffuse3 = vec4(Math.random(), Math.random(), Math.random(), 1.0);
var materialSpecular3 = vec4(Math.random(), Math.random(), Math.random(), 1.0);

//lighting calculations for creature 1
var ambientProduct = mult(lightAmbient, materialAmbient);
var diffuseProduct = mult(lightDiffuse, materialDiffuse);
var specularProduct = mult(lightSpecular, materialSpecular);

//lighting calculations for creature 2
var ambientProduct2 = mult(lightAmbient, materialAmbient2);
var diffuseProduct2 = mult(lightDiffuse, materialDiffuse2);
var specularProduct2 = mult(lightSpecular, materialSpecular2);

//lightinng calculations for color trigger
var ambientProduct3 = mult(lightAmbient, materialAmbient3);
var diffuseProduct3 = mult(lightDiffuse, materialDiffuse3);
var specularProduct3 = mult(lightSpecular, materialSpecular3);


var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }



    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    //draw polygons
    drawPyramid();
    colorCube();
    NumVerticesTot = NumVerticesCube + NumVerticesPyr;

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");


    document.getElementById("ChangeView").onclick = function () {
        viewChange = !viewChange;
    };
    document.getElementById("RandomJump").onclick = function () {
        loc[0] = (Math.random() * (2.55*2)) - 2.55;
        loc[1] = (Math.random() * (2.7+3)) - 3;
        loc[2] = (Math.random() * (4*2)) - 4;
    };
    document.getElementById("RandomColor").onclick = function () {
        materialAmbient3 = vec4(Math.random(), Math.random(), Math.random(), 1.0);
        materialDiffuse3 = vec4(Math.random(), Math.random(), Math.random(), 1.0);
        materialSpecular3 = vec4(Math.random(), Math.random(), Math.random(), 1.0);
        
        ambientProduct3 = mult(lightAmbient, materialAmbient3);
        diffuseProduct3 = mult(lightDiffuse, materialDiffuse3);
        specularProduct3 = mult(lightSpecular, materialSpecular3);
    };
    
    document.getElementById("ToggleTexture").onclick = function () {
        texChange = !texChange;
    };
    
    render();
}

//configures texture
function configureTexture(image) {
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
        gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

function degrees(radians) {
    return radians * 180.0 / Math.PI;
}

function drawPyramid() {

    quad(3, 0, 4, 7);

    triangle(vertices[8], vertices[9], vertices[10]);

    triangle(vertices[11], vertices[12], vertices[13]);

    triangle(vertices[14], vertices[15], vertices[16]);

    triangle(vertices[17], vertices[18], vertices[19]);



    NumVerticesPyr += 18;

}

function colorCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);

    NumVerticesCube += 36;

}

//connects geometry and topology
function quad(a, b, c, d) {

    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);
    normal = normalize(normal);

    points.push(vertices[a]);
    normalsArray.push(normal);
    points.push(vertices[b]);
    normalsArray.push(normal);
    points.push(vertices[c]);
    normalsArray.push(normal);
    points.push(vertices[a]);
    normalsArray.push(normal);
    points.push(vertices[c]);
    normalsArray.push(normal);
    points.push(vertices[d]);
    normalsArray.push(normal);
}


function triangle(a, b, c) {

    points.push(a);
    points.push(b);
    points.push(c);

    // normals are vectors
    normalsArray.push(a[0], a[1], a[2], 0.0);
    normalsArray.push(b[0], b[1], b[2], 0.0);
    normalsArray.push(c[0], c[1], c[2], 0.0);

}

window.onkeydown = function (event) {
    var key = String.fromCharCode(event.keyCode);
    switch (key) {
    case '0': //move forward
            
        //update X and Z coordinates of both creatures with constraints
        if ((loc[0] + (dir[0] * 0.5) < 2.55) && (loc[0] + (dir[0] * 0.5) > -2.55)) {
            loc[0] += (dir[0] * 0.5);
        }
        else {
            if (loc[0] > 0) {
                loc[0] = 2.55;
            }
            else {
                loc[0] = -2.55;
            }
        }
            
        if (((loc[2] + (dir[2] * 0.5)) < -near) && ((loc[2] + (dir[2] * 0.5)) > -far+1.5)) {
            loc[2] += (dir[2] * 0.5);
        }
        else {
            if (loc[2] > 0) {
                loc[2] = -near;
            } else {
                loc[2] = -far+1.5;
            }
        }


        changeMove = true;
        break;

    case 'A': //turn left
        changeDir = true;
        turnDirY = false;
        axis = yAxis; //1
        maxTurn = theta[axis] - 90;

        //update direction vector
        dir = mult(rotate(90, 0, 1, 0), dir);
        //round direction vector
        for (var j = 0; j < 4; j++) {
            dir[j] = Math.round(dir[j]);
        }
        break;
            
    case 'D': //turn right
        changeDir = true;
        turnDirY = true;
        axis = yAxis; //1
        maxTurn = theta[axis] + 90;
            
        //update direction vector
        dir = mult(rotate(90, 0, -1, 0), dir);
        //round direction vector
        for (var j = 0; j < 4; j++) {
            dir[j] = Math.round(dir[j]);
        }
        break;

    case 'W': //move up
        //update Y coordinates of creature 1
        loc[1] += 0.5;
        loc2[1] += 0.5;

        if (loc[1] < 2.5) {
            loc[1] += (dir[1] * 0.5);
        } else {
            loc[1] = 2.7;

        }
        break;
            
    case 'S': //move down
        //update Y coordinates of creature 1
        loc[1] -= 0.5;
        loc2[1] -= 0.5;
        if (loc[1] > -2.75) {
            loc[1] += (dir[1] * 0.5);
        } else {
            loc[1] = -3;
        }
        break;

    }

};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //if creature 1 is at location of color change trigger
    if (equal(loc, locColorTrig)){
        ambientProduct = ambientProduct3;
        diffuseProduct = diffuseProduct3;
        specularProduct = specularProduct3;
    }
    
    //send lighting to shader
    gl.uniform4fv(gl.getUniformLocation(program,
        "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program,
        "shininess"), materialShininess);

    if(texChange){
        var image = document.getElementById("texImage2");
    }
    else{
       var image = document.getElementById("texImage"); 
    }
    configureTexture(image);
    
    //handles view changes
    if (viewChange == false) {
        eye = vec3(0, 0, 0);
    } else {
        eye = vec3(0, .75, 2);
    }


    //view and projection
    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    creatureTr = mat4();

    //rotate creature
    if (changeDir) {
        if (turnDirY) {
            if (theta[axis] < maxTurn)
                theta[axis] += 10;
        } else {
            if (theta[axis] > maxTurn)
                theta[axis] -= 10;
        }

    }


    creatureTr = mult(rotateY(theta[1]), creatureTr);

    //move creature
    
    //handles fluid movement
    var step = 0;
    if (step < 1) {
        step += 0.2;
    }
    
    locTemp[0] += step * (loc[0] - locTemp[0]);
    locTemp[1] += step * (loc[1] - locTemp[1]);
    locTemp[2] += step * (loc[2] - locTemp[2]);

    creatureTr = mult(translate(locTemp[0], locTemp[1], locTemp[2]), creatureTr);

    creatureTr = mult(modelViewMatrix, creatureTr);


    //HAT---------

    hatTr = mat4();
    hatTr = mult(scalem(0.6, 0.5, 0.6), hatTr); //size scale
    hatTr = mult(translate(0.0, 0.4, 0), hatTr); //initial position

    //apply creature transformation
    hatTr = mult(creatureTr, hatTr)


    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(hatTr));
    gl.drawArrays(gl.TRIANGLES, 0, NumVerticesPyr);

    //NOSE---------

    noseTr = mat4();
    noseTr = mult(scalem(0.2, 0.2, 0.2), noseTr); //size scale
    //rotate to side
    noseTr = mult(rotateY(45), noseTr);
    noseTr = mult(translate(0.25, 0.0, 0), noseTr); //initial position


    //apply creature transformation
    noseTr = mult(creatureTr, noseTr);

    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(noseTr));
    gl.drawArrays(gl.TRIANGLES, 0, NumVerticesPyr);


    //CUBE-----------
    bodyTr = mat4();
    bodyTr = mult(scalem(0.5, 0.4, 0.5), bodyTr); //size scale

    //apply creature transformation
    bodyTr = mult(creatureTr, bodyTr);

    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(bodyTr));

    gl.drawArrays(gl.TRIANGLES, NumVerticesPyr, NumVerticesCube);

    //------- CREATURE 2 -------
    
    //send creature2 lighting to shader
    gl.uniform4fv(gl.getUniformLocation(program,
        "ambientProduct"), flatten(ambientProduct2));
    gl.uniform4fv(gl.getUniformLocation(program,
        "diffuseProduct"), flatten(diffuseProduct2));
    gl.uniform4fv(gl.getUniformLocation(program,
        "specularProduct"), flatten(specularProduct2));
    gl.uniform4fv(gl.getUniformLocation(program,
        "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program,
        "shininess"), materialShininess);

    //direction vector for creature 2
    dir2 = normalize(subtract(loc, loc2));
    var dir2Norm = normalize(dir2);
    
    //angle of rotation for creature 2
    angleRot2 = Math.acos(dot(vNorm, dir2Norm));
    angleRot2 = degrees(angleRot2);
    
    //axis of rotation for creature 2
    if (angleRot2 != 180 && angleRot2 != 0) {
        axisRot2 = cross(vNorm, dir2Norm);
    }

    var creatureTr2 = mat4();
    creatureTr2 = mult(scalem(0.6, 0.6, 0.6), creatureTr2);

    creatureTr2 = mult(rotate(angleRot2, axisRot2), creatureTr2);

    //move creature
    if (changeMove) {

        loc2[0] = ((loc[0] - loc2[0]) - (dir2[0] * 0.8)) + loc2[0];
        loc2[1] = ((loc[1] - loc2[1]) - (dir2[1] * 0.8)) + loc2[1];
        loc2[2] = ((loc[2] - loc2[2]) - (dir2[2] * 0.8)) + loc2[2];

        //handles fluid movement
        var step2 = 0;
        if (step2 < 1) {
            step2 += 0.02;
        }

        locTemp2[0] += step2 * (loc2[0] - locTemp2[0])
        locTemp2[1] += step2 * (loc2[1] - locTemp2[1])
        locTemp2[2] += step2 * (loc2[2] - locTemp2[2])
    }

    creatureTr2 = mult(translate(locTemp2[0], locTemp2[1], locTemp2[2]), creatureTr2);

    creatureTr2 = mult(modelViewMatrix, creatureTr2);

    //HAT---------

    var hatTr2 = mat4();
    hatTr2 = mult(scalem(0.8, 0.4, 0.8), hatTr2); //size scale
    hatTr2 = mult(translate(0.0, 0.35, 0), hatTr2); //initial position

    //apply creature transformation
    hatTr2 = mult(creatureTr2, hatTr2)

    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(hatTr2));

    gl.drawArrays(gl.TRIANGLES, 0, NumVerticesPyr);

    //NOSE---------

    var noseTr2 = mat4();
    noseTr2 = mult(scalem(0.2, 0.1, 0.2), noseTr2); //size scale
    //rotate to side
    noseTr2 = mult(rotateY(45), noseTr2);
    noseTr2 = mult(translate(0.25, -0.0, 0), noseTr2); //initial position


    //apply creature transformation
    noseTr2 = mult(creatureTr2, noseTr2);

    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(noseTr2));

    gl.drawArrays(gl.TRIANGLES, NumVerticesPyr, NumVerticesCube);


    //CUBE-----------
    var bodyTr2 = mat4();
    bodyTr2 = mult(scalem(0.6, 0.3, 0.6), bodyTr2); //size scale

    //apply creature transformation
    bodyTr2 = mult(creatureTr2, bodyTr2);

    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(bodyTr2));

    gl.drawArrays(gl.TRIANGLES, NumVerticesPyr, NumVerticesCube);
    
    //color change--------
    //send creature 3 lighting to shader
    gl.uniform4fv(gl.getUniformLocation(program,
        "ambientProduct"), flatten(ambientProduct3));
    gl.uniform4fv(gl.getUniformLocation(program,
        "diffuseProduct"), flatten(diffuseProduct3));
    gl.uniform4fv(gl.getUniformLocation(program,
        "specularProduct"), flatten(specularProduct3));
    gl.uniform4fv(gl.getUniformLocation(program,
        "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program,
        "shininess"), materialShininess);
    

    //transformation matrix for trigger
    var ctmColorTrig = mat4();
    ctmColorTrig = mult(scalem(0.2, 0.2, 0.2), ctmColorTrig);
    ctmColorTrig = mult(translate(locColorTrig[0], locColorTrig[1], locColorTrig[2]), ctmColorTrig);
    
    
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctmColorTrig));

    gl.drawArrays(gl.TRIANGLES, NumVerticesPyr, NumVerticesCube);


    requestAnimFrame(render);
}