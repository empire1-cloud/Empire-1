"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[659],{69659:function(e,o,r){r.r(o),r.d(o,{volumetricLightingRenderVolumeVertexShader:function(){return d}});var i=r(44953);r(73546),r(62123),r(68816),r(88633);let t="volumetricLightingRenderVolumeVertexShader",n=`#include<__decl__sceneVertex>
#include<__decl__meshVertex>
attribute vec3 position;varying vec4 vWorldPos;void main(void) {vec4 worldPos=world*vec4(position,1.0);vWorldPos=worldPos;gl_Position=viewProjection*worldPos;}
`;i.v.ShadersStore[t]||(i.v.ShadersStore[t]=n);let d={name:t,shader:n}}}]);