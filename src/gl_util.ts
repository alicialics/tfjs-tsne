/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import * as webgl from '@tensorflow/tfjs-backend-webgl';
import { GPGPUContextProgram } from "@tensorflow/tfjs-backend-webgl/dist/gpgpu_context";

//////////////////////  GPGPU_CONTEXT  /////////////////////////////
// Method of the GPGPUContext class

export function createVertexProgram(
    // TO REMOVE -> if it goes in the context it should get its own webglcontext
    gpgpu: webgl.GPGPUContext, vertexShaderSource: string,
    fragmentShaderSource: string): GPGPUContextProgram  {
  // this.throwIfDisposed();
  const gl = gpgpu.gl;

  const vertexShader: WebGLShader =
      webgl.webgl_util.createVertexShader(gl, vertexShaderSource);
  const fragmentShader: WebGLShader =
      webgl.webgl_util.createFragmentShader(gl, fragmentShaderSource);
  const program = webgl.webgl_util.createProgram(gl);
  webgl.webgl_util.callAndCheck(
      gl, () => gl.attachShader(program, vertexShader));
  webgl.webgl_util.callAndCheck(
      gl, () => gl.attachShader(program, fragmentShader));
  webgl.webgl_util.linkProgram(gl, program);
  const gpgpuContextProgram = Object.assign(program, { vao: gpgpu.createVertexArray()! });
  webgl.webgl_util.validateProgram(gl, gpgpuContextProgram);
  return gpgpuContextProgram;
}

export function createProgram(gpgpu: webgl.GPGPUContext, fragmentShaderSource: string) {
  try {
    // @ts-ignore
    return gpgpu.createProgram(fragmentShaderSource);
  } catch (_) {
    const fragmentShader: WebGLShader = webgl.webgl_util.createFragmentShader(gpgpu.gl, fragmentShaderSource);
    return gpgpu.createProgram(fragmentShader);
  }
}

///////////////////////  GPGPU_UTIL  //////////////////////////////

// Generates a textures whose access is linearly interpolated
export function createAndConfigureInterpolatedTexture(
    gl: WebGLRenderingContext, width: number, height: number,
    numChannels: number, pixels?: ArrayBufferView): WebGLTexture {
  webgl.webgl_util.validateTextureSize(width, height);
  const texture = webgl.webgl_util.createTexture(gl);

  const tex2d = gl.TEXTURE_2D;
  const internalFormat = getTextureInternalFormat(gl, numChannels);
  const format = getTextureFormat(gl, numChannels);

  webgl.webgl_util.callAndCheck(gl, () => gl.bindTexture(tex2d, texture));
  webgl.webgl_util.callAndCheck(
      gl, () => gl.texParameteri(tex2d, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE));
  webgl.webgl_util.callAndCheck(
      gl, () => gl.texParameteri(tex2d, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE));
  webgl.webgl_util.callAndCheck(
      gl, () => gl.texParameteri(tex2d, gl.TEXTURE_MIN_FILTER, gl.LINEAR));
  webgl.webgl_util.callAndCheck(
      gl, () => gl.texParameteri(tex2d, gl.TEXTURE_MAG_FILTER, gl.LINEAR));
  webgl.webgl_util.callAndCheck(
      gl,
      () => gl.texImage2D(
          tex2d, 0, internalFormat, width, height, 0, format,
          getTextureType(gl), pixels));

  webgl.webgl_util.callAndCheck(
      gl, () => gl.bindTexture(gl.TEXTURE_2D, null));
  return texture;
}

export function createAndConfigureTexture(
    gl: WebGLRenderingContext, width: number, height: number,
    numChannels: number, pixels?: ArrayBufferView): WebGLTexture {
  webgl.webgl_util.validateTextureSize(width, height);
  const texture = webgl.webgl_util.createTexture(gl);

  const tex2d = gl.TEXTURE_2D;
  const internalFormat = getTextureInternalFormat(gl, numChannels);
  const format = getTextureFormat(gl, numChannels);

  webgl.webgl_util.callAndCheck(gl, () => gl.bindTexture(tex2d, texture));
  webgl.webgl_util.callAndCheck(
      gl, () => gl.texParameteri(tex2d, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE));
  webgl.webgl_util.callAndCheck(
      gl, () => gl.texParameteri(tex2d, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE));
  webgl.webgl_util.callAndCheck(
      gl, () => gl.texParameteri(tex2d, gl.TEXTURE_MIN_FILTER, gl.NEAREST));
  webgl.webgl_util.callAndCheck(
      gl, () => gl.texParameteri(tex2d, gl.TEXTURE_MAG_FILTER, gl.NEAREST));
  webgl.webgl_util.callAndCheck(
      gl,
      () => gl.texImage2D(
          tex2d, 0, internalFormat, width, height, 0, format,
          getTextureType(gl), pixels));
  webgl.webgl_util.callAndCheck(
      gl, () => gl.bindTexture(gl.TEXTURE_2D, null));
  return texture;
}

export function createAndConfigureUByteTexture(
    gl: WebGLRenderingContext, width: number, height: number,
    numChannels: number, pixels?: ArrayBufferView): WebGLTexture {
  webgl.webgl_util.validateTextureSize(width, height);
  const texture = webgl.webgl_util.createTexture(gl);

  const tex2d = gl.TEXTURE_2D;
  const internalFormat = getTextureInternalUByteFormat(gl, numChannels);
  const format = getTextureFormat(gl, numChannels);

  webgl.webgl_util.callAndCheck(gl, () => gl.bindTexture(tex2d, texture));
  webgl.webgl_util.callAndCheck(
      gl, () => gl.texParameteri(tex2d, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE));
  webgl.webgl_util.callAndCheck(
      gl, () => gl.texParameteri(tex2d, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE));
  webgl.webgl_util.callAndCheck(
      gl, () => gl.texParameteri(tex2d, gl.TEXTURE_MIN_FILTER, gl.NEAREST));
  webgl.webgl_util.callAndCheck(
      gl, () => gl.texParameteri(tex2d, gl.TEXTURE_MAG_FILTER, gl.NEAREST));
  webgl.webgl_util.callAndCheck(
      gl,
      () => gl.texImage2D(
          tex2d, 0, internalFormat, width, height, 0, format,
          getTextureTypeUByte(gl), pixels));
  webgl.webgl_util.callAndCheck(
      gl, () => gl.bindTexture(gl.TEXTURE_2D, null));
  return texture;
}

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

// This functions are not exported by DeepLearnJS but are need from the
// functions that I am hacking to access the backend.
// Ideally my functions will be part of DeepLearnJS and there will be no need
// to have identical external copies

///////////////////////  GPGPU_UTIL  //////////////////////////////
// EXACT COPY DLJS
function getTextureInternalFormat(
    gl: WebGLRenderingContext, numChannels: number): number {
  if (numChannels === 4) {
    // tslint:disable-next-line:no-any
    return (gl as any).RGBA32F;
  } else if (numChannels === 3) {
    // tslint:disable-next-line:no-any
    return (gl as any).RGB32F;
  } else if (numChannels === 2) {
    // tslint:disable-next-line:no-any
    return (gl as any).RG32F;
  }
  // tslint:disable-next-line:no-any
  return (gl as any).R32F;
}

function getTextureInternalUByteFormat(
    gl: WebGLRenderingContext, numChannels: number): number {
  if (numChannels === 4) {
    // tslint:disable-next-line:no-any
    return (gl as any).RGBA8;
  } else if (numChannels === 3) {
    // tslint:disable-next-line:no-any
    return (gl as any).RGB8;
  } else if (numChannels === 2) {
    // tslint:disable-next-line:no-any
    return (gl as any).RG8;
  }
  // tslint:disable-next-line:no-any
  return (gl as any).R8;
}

function getTextureFormat(
    gl: WebGLRenderingContext, numChannels: number): number {
  if (numChannels === 4) {
    // tslint:disable-next-line:no-any
    return (gl as any).RGBA;
  } else if (numChannels === 3) {
    // tslint:disable-next-line:no-any
    return (gl as any).RGB;
  } else if (numChannels === 2) {
    // tslint:disable-next-line:no-any
    return (gl as any).RG;
  }
  // tslint:disable-next-line:no-any
  return (gl as any).RED;
}
// EXACT COPY DLJS
function getTextureType(gl: WebGLRenderingContext) {
  return gl.FLOAT;
}

function getTextureTypeUByte(gl: WebGLRenderingContext) {
  return gl.UNSIGNED_BYTE;
}
