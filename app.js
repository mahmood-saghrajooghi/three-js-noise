/**
 * A basic ThreeJS cube scene.
 * @author Matt DesLauriers (@mattdesl)
 */

const canvasSketch = require('canvas-sketch');


// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require('three');

import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';

// Include any additional ThreeJS examples below
require('three/examples/js/controls/OrbitControls');

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: 'webgl',
  // Turn on MSAA
  attributes: { antialias: true }
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    context
  });

  // WebGL background color
  renderer.setClearColor('#000', 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  camera.position.set(0, 55, 40);
  camera.lookAt(new THREE.Vector3(0, 15, 0));

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  let meshes = [];

  let material = new THREE.ShaderMaterial({
    uniforms: {
      time: { type: 'f', value: 0 }
    },
    vertexShader: vertex,
    fragmentShader: fragment
  })

  let count = 3 * 20;

  let geometry = new THREE.BoxGeometry(1, 1, 1);

  const mesh = new THREE.InstancedMesh(
    geometry,
    material,
    count ** 3
  )

  let random = new Float32Array(count ** 3);
  let depth = new Float32Array(count ** 3);
  let pos = new Float32Array(3 * count ** 3);

  let transform = new THREE.Object3D();
  let ii = 0;
  let jj = 0;
  for (let i = 0; i < count; i++) {
    for (let j = 0; j < count; j++) {
      for (let k = 0; k < count; k++) {
        transform.position.set(i - count / 2, j - count / 2, k - count / 2);
        transform.updateMatrix();
        random[ii] = Math.random();
        depth[ii] = j / count;

        pos[jj] = i / count; jj++;
        pos[jj] = j / count; jj++;
        pos[jj] = k / count; jj++;

        mesh.setMatrixAt(ii++, transform.matrix);
      }
    }
  }

  geometry.setAttribute('random', new THREE.InstancedBufferAttribute(random, 1))
  geometry.setAttribute('depth', new THREE.InstancedBufferAttribute(depth, 1))
  geometry.setAttribute('pos', new THREE.InstancedBufferAttribute(pos, 3))

  scene.add(mesh)

  // Specify an ambient/unlit colour
  scene.add(new THREE.AmbientLight('#59314f'));

  // Add some light
  const light = new THREE.PointLight('#45caf7', 1, 15.5);
  light.position.set(2, 2, -4).multiplyScalar(1.5);
  scene.add(light);

  // let t1 = gsap.timeline({ repeat: -1, repeatDelay: 0, yoyo: true })
  // t1.to(meshes, {
  //   duration: 1,
  //   x: 1,
  //   y: 1,
  //   z: 1,
  //   stagger: {
  //     grid: [10, 10],
  //     from: "center",
  //     amount: 1.5,
  //   }
  // })

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // And render events here
    render({ time, deltaTime }) {
      // scene.rotation.y = (40 * Math.PI / 180);
      material.uniforms.time.value = time;
      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of WebGL context (optional)
    unload() {
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);