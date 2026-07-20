import React, { useEffect, useRef } from 'react';
import { Renderer, Geometry, Program, Mesh } from 'ogl';
import './Canvas.css';

/**
 * Canvas component renders a WebGL fullscreen quad.
 * Renders a dark, matte material (anodized aluminum/ceramic) with a subtle, breathing lighting response.
 * If isLayer2 is true, renders the material in its "inspected" state (5% brighter, higher contrast, enhanced grain).
 * Completely optimized: pauses render loops when window is out of focus or hidden.
 */
export default function Canvas({ isLayer2 = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. Initialize OGL Renderer
    const renderer = new Renderer({
      canvas: canvasRef.current,
      alpha: false,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio, 2), // Capped for optimum performance
    });

    const gl = renderer.gl;

    // 2. Setup Resize Handler
    function resize() {
      if (!canvasRef.current) return;
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (program.uniforms.uResolution) {
        program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height];
      }
    }

    // 3. Create Fullscreen Quad Geometry
    // Using a single large triangle trick for clip space coverage
    const geometry = new Geometry(gl, {
      position: {
        size: 2,
        data: new Float32Array([-1, -1, 3, -1, -1, 3]),
      },
      uv: {
        size: 2,
        data: new Float32Array([0, 0, 2, 0, 0, 2]),
      },
    });

    // 4. Vertex Shader
    const vertex = `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // 5. Fragment Shader
    const fragment = `
      precision highp float;
      uniform vec2  uResolution;
      uniform float uTime;
      uniform vec2  uMouse;
      uniform float uIsLayer2; // 1.0 if this is the revealed Layer 2, 0.0 otherwise
      varying vec2  vUv;

      // Sin-less hash function (high precision, no trigonometric artifacts)
      float hash(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * 0.1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }

      // 2D bilinear value noise
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }

      // FBM with 4 octaves
      float fbm4(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        value += amplitude * noise(p * frequency); p *= 2.0; amplitude *= 0.5;
        value += amplitude * noise(p * frequency); p *= 2.0; amplitude *= 0.5;
        value += amplitude * noise(p * frequency); p *= 2.0; amplitude *= 0.5;
        value += amplitude * noise(p * frequency);
        return value;
      }

      // FBM with 2 octaves
      float fbm2(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        value += amplitude * noise(p * frequency); p *= 2.0; amplitude *= 0.5;
        value += amplitude * noise(p * frequency);
        return value;
      }

      // High-precision organic grain structure (Layer 1)
      float getOrganicGrain(vec2 p) {
        // Warp coordinates locally to break raster alignment
        vec2 wp = p + vec2(noise(p * 0.08), noise(p * 0.08 + vec2(11.0, 19.0))) * 1.5;
        float n1 = hash(wp);
        float n2 = hash(wp * 1.618 + vec2(7.3, 13.9));
        return mix(n1, n2, 0.5);
      }

      // Micro scratches and hairline imperfections (Layer 5)
      float getScratches(vec2 p) {
        // High-frequency ridge-like noise to form narrow hairline cuts
        vec2 scratchWarp = vec2(noise(p * 0.02), noise(p * 0.02 + vec2(2.3, 5.7))) * 3.0;
        float scratchNoise = noise(p * 0.18 + scratchWarp);
        float line = smoothstep(0.978, 0.995, 1.0 - abs(scratchNoise - 0.5) * 2.0);
        
        // Sparse distribution mask so they only occur in tiny patches
        float mask = smoothstep(0.78, 0.94, noise(p * 0.0045));
        return line * mask;
      }

      // Layer 4: Ultra-low-frequency roughness (plaster waves)
      float getSmoothHeight(vec2 warpedUv) {
        // Smooth architectural plaster waves (completely static, slow FBM)
        return fbm4(warpedUv * 0.8) * 0.085;
      }

      // Complete height calculation combining layers 1, 4, 5 and midi-roughness
      float getHeight(vec2 pixCoord, vec2 warpedUv) {
        // Layer 4: Plaster waves (smooth base)
        float macro = getSmoothHeight(warpedUv);
        
        // Midi Concrete roughness
        float midi = noise(pixCoord * 0.04) * 0.0065;
        
        // Layer 1: Microscopic ceramic grain modulated by domain-warped density
        float grainDensity = smoothstep(0.12, 0.88, noise(pixCoord * 0.003 + noise(pixCoord * 0.0006) * 4.0));
        float micro = getOrganicGrain(pixCoord) * 0.0048 * grainDensity;
        
        // Layer 5: Micro scratches (recessed indentations)
        float scratches = getScratches(pixCoord) * -0.0075;
        
        return macro + midi + micro + scratches;
      }

      // Calculate high-detailed physical normal vector
      vec3 getNormal(vec2 pixCoord, vec2 warpedUv) {
        float delta = 1.0;
        float hL = getHeight(pixCoord + vec2(-delta, 0.0), warpedUv + vec2(-delta / uResolution.x, 0.0));
        float hR = getHeight(pixCoord + vec2(delta, 0.0), warpedUv + vec2(delta / uResolution.x, 0.0));
        float hD = getHeight(pixCoord + vec2(0.0, -delta), warpedUv + vec2(0.0, -delta / uResolution.y));
        float hU = getHeight(pixCoord + vec2(0.0, delta), warpedUv + vec2(0.0, delta / uResolution.y));
        
        // Z controls the steepness/perceived relief of details
        vec3 normal = vec3(hL - hR, hD - hU, 0.0032);
        return normalize(normal);
      }

      // Calculate low-detail normal vector for light scattering (volume diffusion)
      vec3 getSmoothNormal(vec2 warpedUv) {
        float delta = 0.004;
        float hL = getSmoothHeight(warpedUv + vec2(-delta, 0.0));
        float hR = getSmoothHeight(warpedUv + vec2(delta, 0.0));
        float hD = getSmoothHeight(warpedUv + vec2(0.0, -delta));
        float hU = getSmoothHeight(warpedUv + vec2(0.0, delta));
        
        // Slightly lower normal strength to keep diffuse light extremely soft
        vec3 normal = vec3((hL - hR) * 0.2, (hD - hU) * 0.2, delta);
        return normalize(normal);
      }

      void main() {
        // Normalised coordinates [0, 1]
        vec2 uv = gl_FragCoord.xy / uResolution;

        // 1. Organic domain warping using FBM 2 octaves
        // Completely static warped UVs to prevent lateral sliding of the material
        vec2 warp = vec2(
          fbm2(uv * 2.2),
          fbm2(uv * 2.2 + vec2(12.3, 7.7))
        ) * 0.035;
        vec2 warpedUv = uv + warp;

        // 2. Compute normal vectors (detailed surface response and smooth volume scatter)
        vec3 normal = getNormal(gl_FragCoord.xy, warpedUv);
        vec3 smoothNormal = getSmoothNormal(warpedUv);

        // 3. Cinematic soft ambient lighting — museum wall hemisphere
        // Warm charcoal ground, cool neutral slate sky, hemispherical wrap
        vec3 skyColor    = vec3(0.052, 0.053, 0.060); // Cool slate
        vec3 groundColor = vec3(0.030, 0.028, 0.026); // Warm charcoal
        float hemiFactor = 0.5 + 0.5 * smoothNormal.y;
        vec3 ambientLight = mix(groundColor, skyColor, hemiFactor);

        // 4. Primary skylight — vast overhead source, top-left bias
        // Simulates an enormous museum skylight: no hotspot, just broad tonal wash
        float breathingLight = uTime * 0.012;
        // Light sits very high (y≈1.2) and far back (z≈2.0) — acts like a ceiling
        vec3 baseLightPos = vec3(
          0.28 + sin(breathingLight) * 0.015,
          1.20 + cos(breathingLight * 0.55) * 0.015,
          2.0
        );
        // Subtle mouse parallax — only a whisper of movement
        vec3 lightPos = baseLightPos + vec3(
          (uMouse.x - 0.5) * 0.03,
          (uMouse.y - 0.5) * 0.02,
          0.0
        );
        vec3 lightDir = normalize(lightPos - vec3(uv, 0.0));

        // 5. Wrap diffuse — sub-surface plaster scattering
        float wrap = 0.65; // High wrap = light bleeds around surface
        float diffRaw        = dot(normal, lightDir);
        float diffWrap       = max(0.0, (diffRaw + wrap) / (1.0 + wrap));
        float diffSmoothRaw  = dot(smoothNormal, lightDir);
        float diffSmooth     = max(0.0, (diffSmoothRaw + wrap) / (1.0 + wrap));
        diffWrap   = pow(diffWrap, 1.3);
        diffSmooth = pow(diffSmooth, 1.6);
        float finalDiff = mix(diffSmooth, diffWrap, 0.28);
        vec3 lightColor  = vec3(1.0, 0.97, 0.93); // Neutral warm daylight
        vec3 diffuseLight = lightColor * (finalDiff * 0.030);

        // Extremely wide Gaussian bloom — mimics light travelling across a physical wall
        // k=0.18 means barely-there tonal gradient across the full viewport (NOT a hotspot)
        float lightDistance = distance(uv, lightPos.xy);
        float softBloomFactor = exp(-lightDistance * lightDistance * 0.18);
        vec3 softBloom = vec3(1.0, 0.97, 0.94) * (softBloomFactor * 0.016);

        // Secondary fill — upper right, cooler, very soft (bounce light from opposite wall)
        vec3 fillPos  = vec3(0.82, 1.1, 1.8);
        float fillDist = distance(uv, fillPos.xy);
        float fillFactor = exp(-fillDist * fillDist * 0.22);
        vec3 fillLight = vec3(0.88, 0.92, 1.0) * (fillFactor * 0.008);

        // Vertical luminance sweep — light naturally falls from top, dims at floor
        // This is the defining quality of museum wall lighting: vertical tonal travel
        float vertSweep = smoothstep(0.0, 1.0, uv.y) * 0.018;
        vec3 vertLight = vec3(1.0, 0.98, 0.96) * vertSweep;

        // Combine lighting
        vec3 finalColor = ambientLight + diffuseLight + softBloom + fillLight + vertLight;

        // 6. Layer 2: Large-scale tonal density variation in albedo (very subtle curing marks)
        float tonalDensity = fbm4(warpedUv * 1.4);
        finalColor += vec3((tonalDensity - 0.5) * 0.006);

        // 7. Layer 5: Micro scratches in albedo (simulating dirt/depth in grooves)
        float scratchVal = getScratches(gl_FragCoord.xy);
        finalColor -= vec3(scratchVal * 0.0055);

        // 8. Micro-Occlusion: crevice shadowing from high-frequency features
        // Height check of midi-roughness, grain, and scratches
        float highFreqHeight = noise(gl_FragCoord.xy * 0.04) * 0.0065 
                             + hash(gl_FragCoord.xy * 0.7) * 0.0048 
                             - scratchVal * 0.0075;
        float microAO = mix(0.72, 1.0, smoothstep(-0.008, 0.008, highFreqHeight));
        finalColor *= microAO;

        // 9. Photographic high-frequency grain overlay with 5-layer organic grain system
        // Layer 3: Soft cloudy density map to control local grain strength (from 40% to 90%)
        float cloudWarp = noise(gl_FragCoord.xy * 0.0005) * 4.0;
        float cloudNoise = noise(gl_FragCoord.xy * 0.0015 + cloudWarp);
        float grainDensity = mix(0.40, 0.90, cloudNoise);

        // Layer 1: Extremely fine film grain (almost invisible, pixel-aligned)
        float grainL1 = (hash(gl_FragCoord.xy) - 0.5) * 0.0125;

        // Layer 2: Slightly larger ceramic particles (random clusters, not evenly spread)
        float ceramicBase = noise(gl_FragCoord.xy * 0.32);
        float ceramicCluster = noise(gl_FragCoord.xy * 0.012 + vec2(43.7, 19.3));
        float grainL2 = (ceramicBase - 0.5) * smoothstep(0.4, 0.8, ceramicCluster) * 0.0165;

        // Layer 4: Very low opacity rough patches (large, organic, almost impossible to notice)
        float patchWarp = noise(gl_FragCoord.xy * 0.0004) * 2.0;
        float patchNoise = noise(gl_FragCoord.xy * 0.002 + patchWarp);
        float grainL4 = (patchNoise - 0.5) * 0.006;

        // Layer 5: Tiny imperfections (random darker pores, extremely sparse)
        float poreHash = hash(gl_FragCoord.xy * 1.5 + vec2(109.1, 73.7));
        float poreNoise = noise(gl_FragCoord.xy * 0.08);
        float grainL5 = -smoothstep(0.992, 0.9995, poreHash * poreNoise) * 0.024;

        // Combine grain layers using the density map
        float totalGrain = (grainL1 + grainL2 + grainL4) * grainDensity + grainL5;

        // Lighting Response: brighter regions reveal slightly more texture, dark regions hide it
        float luminance = dot(finalColor, vec3(0.2126, 0.7152, 0.0722));
        float grainLightScale = mix(0.30, 1.0, smoothstep(0.03, 0.085, luminance));

        // Edge Treatment: corners remain calm, eye naturally stays near center
        float centerMask = uv.x * (1.0 - uv.x) * uv.y * (1.0 - uv.y) * 16.0;
        float grainEdgeScale = mix(0.35, 1.0, smoothstep(0.0, 0.45, centerMask));

        // Apply modulated grain to color
        finalColor += vec3(totalGrain * grainLightScale * grainEdgeScale);

        // 10. Reveal Layer Color Grade (when uIsLayer2 is 1.0)
        // If Layer 2, we map the fully textured plaster luminance to premium burnt orange.
        // We use target color #D86F2A (RGB: 0.847, 0.435, 0.165) for the midtones/highlights.
        if (uIsLayer2 > 0.5) {
          // Compute high-fidelity luminance of the textured charcoal wall
          float L = dot(finalColor, vec3(0.299, 0.587, 0.114));
          
          // Vibrant premium architectural orange base & scale
          vec3 targetOrange = vec3(0.847, 0.435, 0.165); // #D86F2A
          
          // SSS/bounce glow for plaster shadow depth — warm terracotta shadow base
          vec3 warmShadowBase = vec3(0.13, 0.05, 0.015);
          
          // Map to orange color space (using scale 14.5 to keep tone rich and lively)
          finalColor = warmShadowBase + L * 14.5 * targetOrange;
          
          // Subtle contrast adjustment to ensure pores/micro scratches remain crisply defined
          float midpt = 0.46;
          finalColor = mix(finalColor, (finalColor - midpt) * 1.05 + midpt, 0.35);
        }

        // 11. Wide vignette overlay for photographic feel (edges never turn to flat black)
        float vignette = uv.x * (1.0 - uv.x) * uv.y * (1.0 - uv.y);
        vignette = clamp(pow(vignette * 16.0, 0.28), 0.0, 1.0);
        finalColor *= mix(0.85, 1.0, vignette);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    // 6. Create Shader Program
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uResolution: { value: [gl.canvas.width, gl.canvas.height] },
        uMouse:      { value: [0.5, 0.5] },
        uIsLayer2:   { value: isLayer2 ? 1.0 : 0.0 },
      },
    });

    // 7. Create Quad Mesh
    const mesh = new Mesh(gl, { geometry, program });

    // 8. Track Mouse Coordinates with Inertia
    const targetMouse  = { current: [0.5, 0.5] };
    const currentMouse = { current: [0.5, 0.5] };

    // 9. Optimize Rendering (Pause when tab is hidden or mouse is idle)
    let animationId = null;
    let isTabVisible = true;

    const render = () => {
      if (!isTabVisible) return;

      // Mouse inertia
      const dx = targetMouse.current[0] - currentMouse.current[0];
      const dy = targetMouse.current[1] - currentMouse.current[1];
      
      currentMouse.current[0] += dx * 0.04; // Increased responsiveness slightly
      currentMouse.current[1] += dy * 0.04;

      // Sleep/Wake Cycle Optimization:
      // If mouse is perfectly idle, STOP triggering WebGL redraws.
      // GPU usage drops to 0% when the cursor is still.
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.001) {
        currentMouse.current[0] = targetMouse.current[0];
        currentMouse.current[1] = targetMouse.current[1];
        program.uniforms.uMouse.value = currentMouse.current;
        renderer.render({ scene: mesh });
        animationId = null; // Exit loop, wait for next mousemove
        return;
      }

      // Update shader uniforms
      program.uniforms.uMouse.value = currentMouse.current;

      // Draw full-screen quad
      renderer.render({ scene: mesh });

      animationId = requestAnimationFrame(render);
    };

    const startLoop = () => {
      if (!animationId && isTabVisible) {
        animationId = requestAnimationFrame(render);
      }
    };

    const onMouseMove = (e) => {
      targetMouse.current[0] = e.clientX / window.innerWidth;
      targetMouse.current[1] = 1.0 - (e.clientY / window.innerHeight);
      startLoop(); // Wake up the render loop on movement
    };

    const stopLoop = () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    };

    const handleVisibilityChange = () => {
      isTabVisible = document.visibilityState === 'visible';
      if (isTabVisible) {
        startLoop();
      } else {
        stopLoop();
      }
    };


    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    resize();
    startLoop(); // Initial render

    // 10. Clean Up Resources
    return () => {
      stopLoop();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      geometry.remove();
      program.remove();
    };
  }, [isLayer2]);

  return (
    <div className="canvas-container animate-resolve-material">
      <canvas ref={canvasRef} className="canvas-element" />
    </div>
  );
}
