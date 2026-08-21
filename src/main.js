import './style.css';
import crawlerImg from '/assets/crawler.png';
import bumblebeeImg from '/assets/bumblebee.png';
import grasshopperImg from '/assets/grasshopper.png';

let animationFrameId = null;
let bugStateList = [];
let isFeatureMode = false;
let currentMouseX = -1000;
let currentMouseY = -1000;

// Track custom cursor & mouse position in one place
const cursor = document.getElementById('custom-cursor');

window.addEventListener('mousemove', (e) => {
  currentMouseX = e.clientX;
  currentMouseY = e.clientY;

  if (cursor) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    cursor.style.display = 'block';
  }

  // Floating doodles logic
  const doodles = document.querySelectorAll('.doodle-float');
  const normalizedX = e.clientX / window.innerWidth - 0.5;
  const normalizedY = e.clientY / window.innerHeight - 0.5;

  doodles.forEach((doodle, index) => {
    const depth = (index % 3) + 1.5;
    const moveX = normalizedX * 40 * depth;
    const moveY = normalizedY * 40 * depth;
    doodle.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });
});

document.addEventListener('mouseleave', () => {
  if (cursor) {
    cursor.style.display = 'none';
  }
});

// Bug Infestation Logic
function toggleBugFeature() {
  const knob = document.getElementById('toggle-knob');
  const icon = document.getElementById('toggle-icon');
  const container = document.getElementById('bug-infestation-container');

  if (!knob || !icon || !container) return;

  knob.classList.toggle('bug-toggle-checked');
  isFeatureMode = knob.classList.contains('bug-toggle-checked');

  if (isFeatureMode) {
    knob.classList.remove('bg-[#ff0055]');
    knob.classList.add('bg-[#00f0ff]');
    icon.textContent = 'star';
    icon.classList.remove('text-charcoal-text');
    icon.classList.add('text-[#ff0055]');
    icon.classList.add('text-4xl');

    const bugs = container.querySelectorAll('.crawling-bug-container');
    bugs.forEach((bug) => {
      bug.classList.add('is-feature');
    });
  } else {
    knob.classList.add('bg-[#ff0055]');
    knob.classList.remove('bg-[#00f0ff]');
    icon.textContent = 'bug_report';
    icon.classList.add('text-charcoal-text');
    icon.classList.remove('text-[#ff0055]');
    icon.classList.remove('text-4xl');

    const bugs = container.querySelectorAll('.crawling-bug-container');
    bugs.forEach((bug) => {
      bug.classList.remove('is-feature');
    });
  }
}

function spawnBugs() {
  bugStateList = [];
  const container = document.getElementById('bug-infestation-container');
  if (!container) return;

  container.innerHTML = '';

  const bugTypes = [
    { src: crawlerImg, type: 'crawler' },
    { src: bumblebeeImg, type: 'bumblebee' },
    { src: grasshopperImg, type: 'grasshopper' }
  ];

  for (let i = 0; i < 20; i++) {
    const bugWrapper = document.createElement('div');
    bugWrapper.classList.add('crawling-bug-container');
    if (isFeatureMode) bugWrapper.classList.add('is-feature');

    const bug = document.createElement('img');
    const randBugType = bugTypes[Math.floor(Math.random() * bugTypes.length)];
    bug.src = randBugType.src;
    bug.classList.add('crawling-bug-visual');

    const starSvg = document.createElement('div');
    starSvg.classList.add('star-visual');
    starSvg.style.color = i % 2 === 0 ? '#ff0055' : '#00f0ff';
    starSvg.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;

    const size = Math.random() * 40 + 20;
    bugWrapper.style.width = `${size}px`;
    bugWrapper.style.height = `${size}px`;

    bugWrapper.appendChild(bug);
    bugWrapper.appendChild(starSvg);

    let x = Math.random() * window.innerWidth;
    let y = Math.random() * window.innerHeight;
    let rotation = Math.random() * 360;

    bugWrapper.style.left = `${x}px`;
    bugWrapper.style.top = `${y}px`;
    bugWrapper.style.transform = `rotate(${rotation}deg)`;

    container.appendChild(bugWrapper);

    let speed = Math.random() * 6 + 2;

    const state = {
      element: bugWrapper,
      def: randBugType,
      x: x,
      y: y,
      rotation: rotation,
      baseSpeed: speed,
      speed: speed,
      hopTimer: 0,
      baseId: i
    };

    bugStateList.push(state);
  }

  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(animateBugs);
}

function animateBugs() {
  bugStateList.forEach((state) => {
    const dx = state.x - currentMouseX;
    const dy = state.y - currentMouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (isFeatureMode) {
      state.rotation += (Math.random() - 0.5) * 2;
      state.speed = 2;

      state.x += Math.cos((state.rotation * Math.PI) / 180) * state.speed;
      state.y += Math.sin((state.rotation * Math.PI) / 180) * state.speed;
      state.y += Math.sin(Date.now() / 1000 + state.baseId) * 0.5;
    } else {
      if (distance < 250) {
        const angleToMouse = (Math.atan2(dy, dx) * 180) / Math.PI;
        state.rotation = angleToMouse;
        state.speed = Math.max(state.speed, 30);
      } else {
        if (state.def.type !== 'bumblebee') state.speed = state.baseSpeed;
      }

      if (state.def.type === 'crawler') {
        state.x += Math.cos((state.rotation * Math.PI) / 180) * state.speed;
        state.y += Math.sin((state.rotation * Math.PI) / 180) * state.speed;
        state.rotation += (Math.random() - 0.5) * 45;
      } else if (state.def.type === 'bumblebee') {
        if (distance >= 250) state.speed = Math.random() * 20 + 10;
        state.x += Math.cos((state.rotation * Math.PI) / 180) * state.speed;
        state.y += Math.sin((state.rotation * Math.PI) / 180) * state.speed;
        state.rotation += (Math.random() - 0.5) * 90;
      } else if (state.def.type === 'grasshopper') {
        state.hopTimer++;
        if (state.hopTimer > 30 || distance < 250) {
          state.speed = Math.random() * 80 + 40;
          state.x += Math.cos((state.rotation * Math.PI) / 180) * state.speed;
          state.y += Math.sin((state.rotation * Math.PI) / 180) * state.speed;
          if (distance >= 250) state.rotation += (Math.random() - 0.5) * 120;
          state.hopTimer = 0;
        } else {
          state.speed = 0;
        }
      }
    }

    // Screen wrapping
    if (state.x < -30) state.x = window.innerWidth + 30;
    if (state.x > window.innerWidth + 30) state.x = -30;
    if (state.y < -30) state.y = window.innerHeight + 30;
    if (state.y > window.innerHeight + 30) state.y = -30;

    state.element.style.transform = `translate(-50%, -50%) rotate(${state.rotation}deg)`;
    state.element.style.left = `${state.x}px`;
    state.element.style.top = `${state.y}px`;
  });

  // Keep continuous loop running
  animationFrameId = requestAnimationFrame(animateBugs);
}

function createConfettiParticle(color, shape) {
  const particle = document.createElement('div');
  particle.classList.add('confetti');
  particle.style.backgroundColor = color;
  particle.style.border = '2px solid #1C1B1B';

  if (shape === 'square') {
    particle.style.borderRadius = '4px';
  } else if (shape === 'triangle') {
    particle.style.backgroundColor = 'transparent';
    particle.style.borderLeft = '8px solid transparent';
    particle.style.borderRight = '8px solid transparent';
    particle.style.borderBottom = `16px solid ${color}`;
    particle.style.borderRadius = '0';
    particle.style.border = 'none';
  } else {
    particle.style.borderRadius = '50%';
  }

  particle.style.left = Math.random() * 80 + 10 + 'vw';
  particle.style.top = '70vh';

  const duration = Math.random() * 2 + 1.5;
  const xMovement = (Math.random() - 0.5) * 800;

  particle.style.animation = `confetti-fall ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
  particle.style.transform = `translateX(${xMovement}px)`;

  document.body.appendChild(particle);

  setTimeout(() => {
    particle.remove();
  }, duration * 1000);
}

// Global scope bindings for module type compatibility
window.spawnBugs = spawnBugs;
window.toggleBugFeature = toggleBugFeature;
window.createConfettiParticle = createConfettiParticle;

// Initial spawn on page load
document.addEventListener('DOMContentLoaded', () => {
  spawnBugs();
});