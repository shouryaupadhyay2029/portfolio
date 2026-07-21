import React, { useEffect, useRef } from 'react';
import { Renderer, Geometry, Program, Mesh } from 'ogl';
import './Canvas.css';

/**
 * Canvas component renders a WebGL fullscreen quad.
 * High-performance tactile sand-grain material shader with crisp, visible specks matching Image 2.
 * Capped at DPR 1.0 for instant 60 FPS performance.
 */
export default function Canvas({ isLayer2 = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. Initialize OGL Renderer (Capped at 1.0 DPR for max GPU performance)
    const renderer = new Renderer({
      canvas: canvasRef.current,
      alpha: false,
      antialias: false,
      dpr: 1.0,
    });

    const gl = renderer.gl;

    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
      uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
    });

    const vertex = `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // High-Visibility Sand Grain Material Shader (Matching Image 2)
    const fragment = `
      precision highp float;
      uniform vec2  uResolution;
      uniform float uTime;
      uniform vec2  uMouse;
      uniform float uIsLayer2;
      varying vec2  vUv;

      // High-precision hash for micro sand particles
      float hash(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * 0.1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }

      // Refined, subtle tactile sand grain texture
      vec3 getSandGrainColor(vec2 pixCoord) {
        // Fine pixel grain specs
        float n1 = hash(pixCoord);
        float n2 = hash(pixCoord * 1.73 + vec2(13.5, 37.1));
        
        // Softened sand particles (subtle bright specks & dark pores)
        float brightSpecks = smoothstep(0.85, 0.99, n1) * 0.075;
        float darkPores    = -smoothstep(0.86, 0.99, n2) * 0.045;
        float fineGrain    = (n1 - 0.5) * 0.032;

        float totalSand = brightSpecks + darkPores + fineGrain;
        return vec3(totalSand);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        vec3 sandGrain = getSandGrainColor(gl_FragCoord.xy);

        // Subtle ambient mouse spotlight
        float distToMouse = distance(uv, uMouse);
        float mouseGlow = exp(-distToMouse * distToMouse * 2.5) * 0.03;

        if (uIsLayer2 > 0.5) {
          // Terracotta Orange Lens Canvas (#D86F2A with subtle tactile grain)
          vec3 orange = vec3(0.847, 0.435, 0.165);
          vec3 shadow = vec3(0.14, 0.05, 0.015);
          float vign = uv.y * (1.0 - uv.y) * 0.3 + 0.7;
          vec3 col = mix(shadow, orange, vign + mouseGlow) + sandGrain * 0.3;
          gl_FragColor = vec4(col, 1.0);
        } else {
          // Dark Architectural Sand Slate
          vec3 sandBase = vec3(0.055, 0.055, 0.058);
          float vign = uv.y * (1.0 - uv.y) * 0.25 + 0.75;
          vec3 finalColor = sandBase * vign + vec3(mouseGlow) + sandGrain * 0.45;
          gl_FragColor = vec4(finalColor, 1.0);
        }
      }
    `;

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uResolution: { value: [gl.canvas.width, gl.canvas.height] },
        uTime:       { value: 0 },
        uMouse:      { value: [0.5, 0.5] },
        uIsLayer2:   { value: isLayer2 ? 1.0 : 0.0 },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      if (!canvasRef.current) return;
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (program.uniforms.uResolution) {
        program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height];
      }
    }

    let animId = null;
    const targetMouse = { x: 0.5, y: 0.5 };
    const currentMouse = { x: 0.5, y: 0.5 };

    const onMouseMove = (e) => {
      targetMouse.x = e.clientX / window.innerWidth;
      targetMouse.y = 1.0 - (e.clientY / window.innerHeight);
    };

    const render = (now) => {
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.05;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.05;

      program.uniforms.uTime.value = now * 0.001;
      program.uniforms.uMouse.value = [currentMouse.x, currentMouse.y];

      renderer.render({ scene: mesh });
      animId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', resize);
    resize();
    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isLayer2]);

  return <canvas ref={canvasRef} className="canvas-webgl" />;
}
