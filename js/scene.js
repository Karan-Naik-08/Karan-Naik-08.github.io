import * as THREE from 'three';

(function () {
  const canvas = document.getElementById('hero-canvas');
  const hero = document.getElementById('hero');
  if (!canvas || !hero) return;

  function fallbackToGradient() {
    canvas.remove();
    hero.classList.add('hero-fallback-gradient');
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || !window.WebGLRenderingContext) {
    fallbackToGradient();
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    fallbackToGradient();
    return;
  }

  const isMobile = window.matchMedia('(max-width: 640px)').matches;
  const isTablet = !isMobile && window.matchMedia('(max-width: 1023px)').matches;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const PARTICLE_COUNT = isMobile ? 900 : isTablet ? 1200 : 2500;
  const LINE_DISTANCE = 1.1;
  const RADIUS = 6;

  window.__heroParticleCount = PARTICLE_COUNT;

  const rootStyles = getComputedStyle(document.documentElement);
  const particleColor = new THREE.Color((rootStyles.getPropertyValue('--color-primary-on-dark') || '#2997ff').trim());
  const lineColor = new THREE.Color((rootStyles.getPropertyValue('--color-on-dark') || '#ffffff').trim());

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 9;

  const group = new THREE.Group();
  scene.add(group);

  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const points = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    let x, y, z, len;
    do {
      x = Math.random() * 2 - 1;
      y = Math.random() * 2 - 1;
      z = Math.random() * 2 - 1;
      len = Math.sqrt(x * x + y * y + z * z);
    } while (len === 0 || len > 1);
    const r = RADIUS * Math.cbrt(Math.random());
    x = (x / len) * r;
    y = (y / len) * r;
    z = (z / len) * r;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    points.push(new THREE.Vector3(x, y, z));
  }

  const pointsGeometry = new THREE.BufferGeometry();
  pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pointsMaterial = new THREE.PointsMaterial({
    color: particleColor,
    size: 0.06,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
  });
  group.add(new THREE.Points(pointsGeometry, pointsMaterial));

  const linePositions = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (points[i].distanceTo(points[j]) < LINE_DISTANCE) {
        linePositions.push(points[i].x, points[i].y, points[i].z, points[j].x, points[j].y, points[j].z);
      }
    }
  }
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
  const lineMaterial = new THREE.LineBasicMaterial({ color: lineColor, transparent: true, opacity: 0.08 });
  group.add(new THREE.LineSegments(lineGeometry, lineMaterial));

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute('aria-label', 'Decorative animated network of connected points');

  function resize() {
    const { clientWidth, clientHeight } = hero;
    if (clientWidth === 0 || clientHeight === 0) return;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight, false);
  }
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(hero);

  let targetRotationX = 0;
  let targetRotationY = 0;
  if (!isCoarsePointer) {
    hero.addEventListener('mousemove', (event) => {
      const rect = hero.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      targetRotationY = nx * 0.4;
      targetRotationX = ny * 0.2;
    });
  }

  let autoRotation = 0;
  let currentPointerX = 0;
  let currentPointerY = 0;

  function animate() {
    autoRotation += 0.0006;
    currentPointerX += (targetRotationX - currentPointerX) * 0.05;
    currentPointerY += (targetRotationY - currentPointerY) * 0.05;
    group.rotation.x = currentPointerX;
    group.rotation.y = autoRotation + currentPointerY;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();
