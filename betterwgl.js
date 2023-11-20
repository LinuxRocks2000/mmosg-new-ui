// draw flat images with GPUs. Not for 3d.
class BetterWGL {
    constructor(target) {
        this.target = target;
        this.gl = target.getContext("webgl2");
        if (!this.gl) {
            alert("GL initialization failure! Your browser may not support WebGL 2, or it may be disabled. Some functionality may be impaired.");
            return;
        }
        this.program = this.gl.createProgram();
        this.linked = false;
        this.aLocs = {};
        this.uLocs = {};
    }

    _createShader(type, source) {
        var shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        var success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }

        console.log(this.gl.getShaderInfoLog(shader));
        this.gl.deleteShader(shader);
    }

    attachFragmentShader(fShad) {
        this.gl.attachShader(this.program, this._createShader(this.gl.FRAGMENT_SHADER, fShad));
    }

    attachVertexShader(vShad) {
        this.gl.attachShader(this.program, this._createShader(this.gl.VERTEX_SHADER, vShad));
    }

    _getAttributeLocation(a) {
        if (!this.aLocs[a]) {
            this.aLocs[a] = this.gl.getAttribLocation(this.program, a);
        }
        return this.aLocs[a];
    }

    _getUniformLocation(a) {
        if (!this.uLocs[a]) {
            this.uLocs[a] = this.gl.getUniformLocation(this.program, a);
        }
        return this.uLocs[a];
    }

    setup() {
        this.linked = true;
        this.gl.linkProgram(this.program);
        this.gl.useProgram(this.program);
        var position = this._getAttributeLocation("position");
        var positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        var plane = new Float32Array([
            -1.0, 1.0,
            -1.0, -1.0,
            1.0, 1.0,
            1.0, -1.0
        ]);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, plane, this.gl.STATIC_DRAW);
        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);
        this.gl.enableVertexAttribArray(position);
        this.gl.vertexAttribPointer(position, 2, this.gl.FLOAT, false, 0, 0);
    }

    draw() {
        if (!this.linked) {
            this.setup();
        }
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.bindVertexArray(this.vao);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

    resize(w, h) {
        this.target.width = w;
        this.target.height = h;
        this.gl.viewport(0, 0, w, h);
    }

    uniformInt(name, data) {
        var handle = this._getUniformLocation(name);
        var toGPU = new Int32Array(Array.isArray(data) ? data.length * (Array.isArray(data[0]) ? data[0].length : 1) : 1);
        if (Array.isArray(data)) {
            for (var x = 0; x < data.length; x ++) {
                if (Array.isArray(data[0])) {
                    for (var y = 0; y < data[0].length; y ++) {
                        toGPU[y + x * data[0].length] = data[x][y];
                    }
                }
                else {
                    toGPU[x] = data[x];
                }
            }
        }
        else {
            toGPU[0] = data;
        }
        if (Array.isArray(data[0])) {
            if (data[0].length == 1) {
                this.gl.uniform1iv(handle, toGPU);
            }
            else if (data[0].length == 2) {
                this.gl.uniform2iv(handle, toGPU);
            }
            else if (data[0].length == 3) {
                this.gl.uniform3iv(handle, toGPU);
            }
            else if (data[0].length == 4) {
                this.gl.uniform4iv(handle, toGPU);
            }
        }
        else {
            this.gl.uniform1iv(handle, toGPU);
        }
    }

    uniformFloat(name, data) {
        var handle = this._getUniformLocation(name);
        var toGPU = new Float32Array(Array.isArray(data) ? data.length * (Array.isArray(data[0]) ? data[0].length : 1) : 1);
        if (Array.isArray(data)) {
            for (var x = 0; x < data.length; x ++) {
                if (Array.isArray(data[0])) {
                    for (var y = 0; y < data[0].length; y ++) {
                        toGPU[y + x * data[0].length] = data[x][y];
                    }
                }
                else {
                    toGPU[x] = data[x];
                }
            }
        }
        else {
            toGPU[0] = data;
        }
        if (Array.isArray(data[0])) {
            if (data[0].length == 1) {
                this.gl.uniform1fv(handle, toGPU);
            }
            else if (data[0].length == 2) {
                this.gl.uniform2fv(handle, toGPU);
            }
            else if (data[0].length == 3) {
                this.gl.uniform3fv(handle, toGPU);
            }
            else if (data[0].length == 4) {
                this.gl.uniform4fv(handle, toGPU);
            }
        }
        else {
            this.gl.uniform1fv(handle, toGPU);
        }
    }

    setTexture(name, image, active = 0) {
        this.gl.activeTexture(this.gl.TEXTURE0 + active);
        var texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
        this.uniformInt(name, active);
    }
}
