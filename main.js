import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as lil from 'lil-gui';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// --- Lights ---

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// const helper = new THREE.DirectionalLightHelper( directionalLight, 0.5 );
// scene.add( helper );

const pointLight = new THREE.PointLight(0xffffff, 1, 10, 2);
pointLight.position.set(1, -1, 1);
scene.add(pointLight);

// const sphereSize = .2;
// const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
// scene.add( pointLightHelper );

// --- Texture Loader ---
let loader = new THREE.TextureLoader();
let color = loader.load('./text/color.jpg');
let roughness = loader.load('./text/roughness.jpg');
let normal = loader.load('./text/normal.png');
let height = loader.load('./text/height.png');

const geometry = new THREE.BoxGeometry( 3, 1.8, 2 );
const material = new THREE.MeshStandardMaterial({ 
    map: color, 
    roughnessMap: roughness, 
    normalMap: normal, 
    displacementMap: height, 
    displacementScale: 0.001, 
    roughness: 1, 
    metalness: 0 
});
const box = new THREE.Mesh( geometry, material );
scene.add( box );

camera.position.z = 5;

const canvas = document.querySelector('canvas');
const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio);

window.addEventListener('resize', ()=>{
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 5;
controls.enableZoom = true;

// ------- lil-gui Controls --------
const gui = new lil.GUI();

// --- Material Folder ---
const matFolder = gui.addFolder('Material');
matFolder.addColor({ color: material.color.getHex() }, 'color').onChange(value => material.color.set(value));
matFolder.add(material, 'wireframe');
matFolder.add(material, 'metalness', 0, 1, 0.01);
matFolder.add(material, 'roughness', 0, 1, 0.01);
matFolder.add(box.scale, 'x', 0.1, 5, 0.1).name('scale X');
matFolder.add(box.scale, 'y', 0.1, 5, 0.1).name('scale Y');
matFolder.add(box.scale, 'z', 0.1, 5, 0.1).name('scale Z');
matFolder.close();

// --- Position Folder ---
const posFolder = gui.addFolder('Position');
posFolder.add(box.position, 'x', -10, 10, 0.1).name('pos X');
posFolder.add(box.position, 'y', -10, 10, 0.1).name('pos Y');
posFolder.add(box.position, 'z', -10, 10, 0.1).name('pos Z');
posFolder.close();

// --- Geometry Folder ---
const geoFolder = gui.addFolder('Geometry');
const geoParams = { 
    type: 'Box', 
    width: 3, 
    height: 1.8, 
    depth: 2, 
    radius: 1.2, 
    segments: 32 
};

function updateGeometry() {
    let newGeo;
    if (geoParams.type === 'Box') {
        newGeo = new THREE.BoxGeometry(geoParams.width, geoParams.height, geoParams.depth);
    } else if (geoParams.type === 'Sphere') {
        newGeo = new THREE.SphereGeometry(geoParams.radius, geoParams.segments, geoParams.segments);
    } else if (geoParams.type === 'Torus') {
        newGeo = new THREE.TorusGeometry(geoParams.radius, 0.4, geoParams.segments, geoParams.segments);
    } else if (geoParams.type === 'Cylinder') {
        newGeo = new THREE.CylinderGeometry(geoParams.radius, geoParams.radius, geoParams.height, geoParams.segments);
    }
    box.geometry.dispose();   // cleanup old geometry
    box.geometry = newGeo;
}

// Dropdown for type
geoFolder.add(geoParams, 'type', ['Box', 'Sphere', 'Torus', 'Cylinder']).onChange(updateGeometry);
geoFolder.add(geoParams, 'width', 0.5, 10, 0.1).onChange(updateGeometry).name('Box Width');
geoFolder.add(geoParams, 'height', 0.5, 10, 0.1).onChange(updateGeometry).name('Box Height');
geoFolder.add(geoParams, 'depth', 0.5, 10, 0.1).onChange(updateGeometry).name('Box Depth');
geoFolder.add(geoParams, 'radius', 0.1, 5, 0.1).onChange(updateGeometry).name('Radius');
geoFolder.add(geoParams, 'segments', 3, 64, 1).onChange(updateGeometry).name('Segments');
geoFolder.close();

// --- Lights Folder ---
const lightFolder = gui.addFolder('Lights');

// Ambient Light Controls
const ambFolder = lightFolder.addFolder('Ambient Light');
ambFolder.add(ambientLight, 'intensity', 0, 2, 0.01);
ambFolder.addColor({ color: ambientLight.color.getHex() }, 'color').onChange(value => ambientLight.color.set(value));
ambFolder.close();

// Directional Light Controls
const dirFolder = lightFolder.addFolder('Directional Light');
dirFolder.add(directionalLight, 'intensity', 0, 5, 0.01);
dirFolder.add(directionalLight.position, 'x', -10, 10, 0.1).name('pos X');
dirFolder.add(directionalLight.position, 'y', -10, 10, 0.1).name('pos Y');
dirFolder.add(directionalLight.position, 'z', -10, 10, 0.1).name('pos Z');
dirFolder.addColor({ color: directionalLight.color.getHex() }, 'color').onChange(value => directionalLight.color.set(value));
dirFolder.close();

// Point Light Controls
const pointFolder = lightFolder.addFolder('Point Light');
pointFolder.add(pointLight, 'intensity', 0, 5, 0.01);
pointFolder.add(pointLight, 'distance', 0, 50, 0.1);
pointFolder.add(pointLight, 'decay', 0, 5, 0.01);
pointFolder.add(pointLight.position, 'x', -10, 10, 0.1).name('pos X');
pointFolder.add(pointLight.position, 'y', -10, 10, 0.1).name('pos Y');
pointFolder.add(pointLight.position, 'z', -10, 10, 0.1).name('pos Z');
pointFolder.addColor({ color: pointLight.color.getHex() }, 'color').onChange(value => pointLight.color.set(value));
pointFolder.close();

lightFolder.close();


// ------- Animate --------
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render( scene, camera );
}

animate();
