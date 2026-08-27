"use client";
// React Bits "Grainient" ambient background (ogl WebGL), trimmed to the props
// this project uses. The pine-tone field behind every view; callers gate it to
// desktop, and reduced-motion users get the flat deep pine fallback below.
import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

const hexToRgb = (hex: string): [number, number, number] => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return [1, 1, 1];
  return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
};

const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uContrast;
uniform float uSaturation;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;
#define S(a,b,t) smoothstep(a,b,t)
mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(-1.0+2.0*hash(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(-1.0+2.0*hash(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);return 0.5+0.5*n;}
void main(){
  float t=iTime*uTimeSpeed;
  vec2 uv=gl_FragCoord.xy/iResolution.xy;
  float ratio=iResolution.x/iResolution.y;
  vec2 tuv=uv-0.5;
  tuv/=max(uZoom,0.001);
  float degree=noise(vec2(t*0.1,tuv.x*tuv.y)*uNoiseScale);
  tuv.y*=1.0/ratio;
  tuv*=Rot(radians((degree-0.5)*uRotationAmount+180.0));
  tuv.y*=ratio;
  float ws=max(uWarpStrength,0.001);
  float amplitude=uWarpAmplitude/ws;
  float warpTime=t*uWarpSpeed;
  tuv.x+=sin(tuv.y*uWarpFrequency+warpTime)/amplitude;
  tuv.y+=sin(tuv.x*(uWarpFrequency*1.5)+warpTime)/(amplitude*0.5);
  float s=max(uBlendSoftness,0.0);
  float blendX=tuv.x;
  float edge0=-0.3-s;
  float edge1=0.2+s;
  vec3 layer1=mix(uColor3,uColor2,S(edge0,edge1,blendX));
  vec3 layer2=mix(uColor2,uColor1,S(edge0,edge1,blendX));
  vec3 col=mix(layer1,layer2,S(0.5+s,-0.3-s,tuv.y));
  vec2 grainUv=uv*max(uGrainScale,0.001);
  float grain=fract(sin(dot(grainUv,vec2(12.9898,78.233)))*43758.5453);
  col+=(grain-0.5)*uGrainAmount;
  col=(col-0.5)*uContrast+0.5;
  float luma=dot(col,vec3(0.2126,0.7152,0.0722));
  col=mix(vec3(luma),col,uSaturation);
  col=clamp(col,0.0,1.0);
  fragColor=vec4(col,1.0);
}
`;

type GrainientProps = {
  color1?: string;
  color2?: string;
  color3?: string;
  timeSpeed?: number;
  warpStrength?: number;
  grainAmount?: number;
  zoom?: number;
  className?: string;
};

export default function Grainient({
  color1 = "#35705B",
  color2 = "#1F4D3F",
  color3 = "#16382E",
  timeSpeed = 0.15,
  warpStrength = 1.0,
  grainAmount = 0.08,
  zoom = 0.9,
  className = "",
}: GrainientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Static fallback for reduced-motion users: flat deep pine, no WebGL.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      container.style.background = color3;
      return;
    }

    const renderer = new Renderer({
      webgl: 2,
      alpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uTimeSpeed: { value: timeSpeed },
        uWarpStrength: { value: warpStrength },
        uWarpFrequency: { value: 5.0 },
        uWarpSpeed: { value: 2.0 },
        uWarpAmplitude: { value: 50.0 },
        uBlendSoftness: { value: 0.05 },
        uRotationAmount: { value: 500.0 },
        uNoiseScale: { value: 2.0 },
        uGrainAmount: { value: grainAmount },
        uGrainScale: { value: 2.0 },
        uContrast: { value: 1.15 },
        uSaturation: { value: 1.0 },
        uZoom: { value: zoom },
        uColor1: { value: new Float32Array(hexToRgb(color1)) },
        uColor2: { value: new Float32Array(hexToRgb(color2)) },
        uColor3: { value: new Float32Array(hexToRgb(color3)) },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)));
      const res = program.uniforms.iResolution.value as Float32Array;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
      renderer.render({ scene: mesh });
    };
    const ro = new ResizeObserver(setSize);
    ro.observe(container);
    setSize();

    let raf = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    const t0 = performance.now();
    const loop = (t: number) => {
      (program.uniforms.iTime as { value: number }).value = (t - t0) * 0.001;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };
    const tryStart = () => {
      if (isVisible && isPageVisible && raf === 0) raf = requestAnimationFrame(loop);
    };
    const tryStop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) tryStart();
        else tryStop();
      },
      { threshold: 0 }
    );
    io.observe(container);
    const onVisibility = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) tryStart();
      else tryStop();
    };
    document.addEventListener("visibilitychange", onVisibility);
    tryStart();

    return () => {
      tryStop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      try {
        container.removeChild(canvas);
      } catch {}
    };
  }, [color1, color2, color3, timeSpeed, warpStrength, grainAmount, zoom]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
      aria-hidden="true"
    />
  );
}
