import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * CrowdCanvas — Walking Peeps Crowd Simulator
 * Recreated from Open Peeps / Szenia Zadvornykh / Skiper UI
 *
 * Renders an animated interactive crowd of illustrated characters
 * walking continuously across a 2D canvas with randomized speed and bounce.
 */
export default function CrowdCanvas({
  src = '/images/peeps/all-peeps.png',
  rows = 15,
  cols = 7,
  className = '',
  style = {},
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = { src, rows, cols };

    // UTILS
    const randomRange = (min, max) => min + Math.random() * (max - min);
    const randomIndex = (array) => (randomRange(0, array.length) | 0);
    const removeFromArray = (array, i) => array.splice(i, 1)[0];
    const removeItemFromArray = (array, item) => removeFromArray(array, array.indexOf(item));
    const removeRandomFromArray = (array) => removeFromArray(array, randomIndex(array));
    const getRandomFromArray = (array) => array[randomIndex(array) | 0];

    // TWEEN FACTORIES
    const resetPeep = ({ stage, peep }) => {
      const direction = Math.random() > 0.5 ? 1 : -1;
      
      // Calculate responsive peep scale based on canvas height so characters fit the footer stage
      const baseScale = Math.min((stage.height * 0.72) / peep.height, 0.65);
      peep.scale = baseScale * randomRange(0.85, 1.15);

      const scaledW = peep.width * peep.scale;
      const scaledH = peep.height * peep.scale;

      // Realistic ground alignment with slight depth-of-field offset
      const depthY = (Math.random() - 0.5) * (stage.height * 0.18);
      const startY = stage.height - scaledH - 8 + depthY;
      let startX;
      let endX;

      if (direction === 1) {
        startX = -scaledW - 40;
        endX = stage.width + 40;
        peep.scaleX = 1;
      } else {
        startX = stage.width + scaledW + 40;
        endX = -scaledW - 40;
        peep.scaleX = -1;
      }

      peep.x = startX;
      peep.y = startY;
      peep.anchorY = startY + scaledH;

      return { startX, startY, endX };
    };

    const normalWalk = ({ peep, props }) => {
      const { startX, startY, endX } = props;
      const xDuration = randomRange(9, 14);
      const yDuration = 0.24;
      const bounce = Math.max(3, 8 * (peep.scale || 0.5));

      const tl = gsap.timeline();
      tl.timeScale(randomRange(0.7, 1.3));
      tl.to(
        peep,
        {
          duration: xDuration,
          x: endX,
          ease: 'none',
        },
        0
      );
      tl.to(
        peep,
        {
          duration: yDuration,
          repeat: Math.round(xDuration / yDuration),
          yoyo: true,
          y: startY - bounce,
        },
        0
      );

      return tl;
    };

    const walks = [normalWalk];

    // FACTORY FUNCTIONS
    const createPeep = ({ image, rect }) => {
      const peep = {
        image,
        rect: [],
        width: 0,
        height: 0,
        scale: 0.5,
        drawArgs: [],
        x: 0,
        y: 0,
        anchorY: 0,
        scaleX: 1,
        walk: null,
        setRect: (newRect) => {
          peep.rect = newRect;
          peep.width = newRect[2];
          peep.height = newRect[3];
        },
        render: (targetCtx) => {
          targetCtx.save();
          targetCtx.translate(peep.x, peep.y);
          targetCtx.scale(peep.scaleX * (peep.scale || 1), peep.scale || 1);
          targetCtx.drawImage(
            peep.image,
            peep.rect[0],
            peep.rect[1],
            peep.rect[2],
            peep.rect[3],
            0,
            0,
            peep.width,
            peep.height
          );
          targetCtx.restore();
        },
      };

      peep.setRect(rect);
      return peep;
    };

    // MAIN
    const img = document.createElement('img');
    const stage = { width: 0, height: 0 };
    const allPeeps = [];
    const availablePeeps = [];
    const crowd = [];

    const createPeeps = () => {
      const { rows: r, cols: c } = config;
      const { naturalWidth: width, naturalHeight: height } = img;
      const total = r * c;
      const rectWidth = width / r;
      const rectHeight = height / c;

      for (let i = 0; i < total; i++) {
        allPeeps.push(
          createPeep({
            image: img,
            rect: [
              (i % r) * rectWidth,
              ((i / r) | 0) * rectHeight,
              rectWidth,
              rectHeight,
            ],
          })
        );
      }
    };

    const addPeepToCrowd = () => {
      if (!availablePeeps.length) return null;
      const peep = removeRandomFromArray(availablePeeps);
      const walk = getRandomFromArray(walks)({
        peep,
        props: resetPeep({ peep, stage }),
      }).eventCallback('onComplete', () => {
        removePeepFromCrowd(peep);
        addPeepToCrowd();
      });

      peep.walk = walk;
      crowd.push(peep);
      crowd.sort((a, b) => a.anchorY - b.anchorY);
      return peep;
    };

    const initCrowd = () => {
      // Concurrently active pedestrians scaled to stage width
      const maxActive = Math.max(5, Math.min(20, Math.round(stage.width / 95)));
      for (let i = 0; i < maxActive && availablePeeps.length; i++) {
        const p = addPeepToCrowd();
        if (p?.walk) p.walk.progress(Math.random());
      }
    };

    const removePeepFromCrowd = (peep) => {
      removeItemFromArray(crowd, peep);
      availablePeeps.push(peep);
    };

    const render = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      crowd.forEach((peep) => {
        peep.render(ctx);
      });

      ctx.restore();
    };

    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      stage.width = canvas.clientWidth;
      stage.height = canvas.clientHeight;
      canvas.width = Math.round(stage.width * dpr);
      canvas.height = Math.round(stage.height * dpr);

      crowd.forEach((peep) => {
        if (peep.walk) peep.walk.kill();
      });

      crowd.length = 0;
      availablePeeps.length = 0;
      availablePeeps.push(...allPeeps);

      initCrowd();
    };

    const init = () => {
      createPeeps();
      resize();
      gsap.ticker.add(render);
    };

    img.onload = init;
    img.src = config.src;

    const handleResize = () => resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      gsap.ticker.remove(render);
      crowd.forEach((peep) => {
        if (peep.walk) peep.walk.kill();
      });
    };
  }, [src, rows, cols]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        ...style,
      }}
    />
  );
}
