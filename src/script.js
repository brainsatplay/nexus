import './style.css'
import * as THREE from 'three'
import {UserMarker} from './UserMarker'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import Stats from 'three/examples/jsm/libs/stats.module'

// Loading Manager
const loadingManager = new THREE.LoadingManager()
loadingManager.onProgress = () => {
    console.log('progressing')
}

// Textures
const texture = new THREE.TextureLoader(loadingManager).load("/img/mapTexture.jpeg")
const displacementMap = new THREE.TextureLoader(loadingManager).load("/img/mapDisplacement.jpeg")

const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('/textures/matcaps/8.png')


// // fonts
// const fontLoader = new THREE.FontLoader()
// fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
//     points.forEach((point,name) => {

//         const textGeometry = new THREE.TextBufferGeometry(
//             name,
//             {
//                 font: font,
//                 size: 0.5/10,
//                 height: 0.2/10,
//                 curveSegments: 5,
//                 bevelEnabled: true,
//                 bevelThickness: 0.03/10,
//                 bevelSize:0.02/10,
//                 bevelOffset:0,
//                 bevelSegments: 4
//             }
//         )
//         textGeometry.computeBoundingBox()
//         textGeometry.center()
//         const textMaterial = new THREE.MeshMatcapMaterial({matcap: matcapTexture})
//         const text = new THREE.Mesh(textGeometry, textMaterial)
//         text.position.set(point.x, point.y, 0.1)
//         scene.add(text)
//     })
// })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
const light = new THREE.AmbientLight(0xffffff);
light.position.set(0, 5, 10);
light.intensity = 1.4;
scene.add(light);

// const redLight = new THREE.DirectionalLight(0xff0000,1);
// redLight.position.set(0, 0, 1.0);
// scene.add(redLight);
// const helper = new THREE.DirectionalLightHelper( redLight, 1 );
// scene.add( helper );

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 3

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
document.body.appendChild(renderer.domElement)

// Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.screenSpacePanning = true
controls.enableDamping = true
//controls.addEventListener('change', render)

// Texture
let imageWidth = 1200;
let imageHeight = 600;
const segmentsX = 150
const imageAspect = imageWidth/imageHeight
let fov_y = camera.position.z * camera.getFilmHeight() / camera.getFocalLength();
let meshWidth = fov_y * camera.aspect;
let meshHeight = meshWidth / imageAspect;
const planeGeometry = new THREE.PlaneGeometry(meshWidth, meshHeight, segmentsX, segmentsX/imageAspect)
const material = new THREE.MeshStandardMaterial()
material.map = texture
material.displacementMap = displacementMap

// Mesh
const plane = new THREE.Mesh(planeGeometry, material)
scene.add(plane)

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    meshWidth = fov_y * camera.aspect
    meshHeight = meshWidth / imageAspect
    regeneratePlaneGeometry()
    points.forEach(point => {
        point.updateMesh(meshWidth,meshHeight)
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
}, 
false)

// Fullscreen
window.addEventListener('dblclick', () => {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement
    if (!fullscreenElement){
        if (canvas.requestFullscreen){
            canvas.requestFullscreen()
        } else if (canvas.webkitRequestFullscreen){
            canvas.webkitRequestFullscreen()
        }
    } else {
        if (document.exitFullscreen){
            document.exitFullscreen()
        } else if (document.webkitExitFullscreen){
            document.webkitExitFullscreen()
        }
    }
})

// Material Properties
material.transparent = true;
material.depthTest = false;
material.opacity = 0.3;

material.color.setHex(Number('0x00b3ff'.replace('#', '0x')))
material.displacementScale = 0.1;
material.wireframe = true;

function regeneratePlaneGeometry() {
    let newGeometry = new THREE.PlaneGeometry(
        meshWidth, meshHeight, segmentsX, segmentsX/imageAspect
    )
    plane.geometry.dispose()
    plane.geometry = newGeometry
}


function updateMaterial() {
    material.side = Number(material.side)
    material.needsUpdate = true
}


// Animate
var animate = function () {
    requestAnimationFrame(animate)
    placeUsers()
    stats.update()
    controls.update()
    renderer.render(scene, camera)
};

// Set Default Users
let points = new Map()
let diameter = 1e-1/6;
points.set('me',new UserMarker({diameter:diameter, meshWidth:meshWidth, meshHeight:meshHeight}))
points.set('Cape Horn',new UserMarker({latitude: -33.918861, longitude: 18.423300, diameter:diameter, meshWidth:meshWidth, meshHeight:meshHeight})); // Cape Town
points.set('Los Angeles',new UserMarker({latitude: 34.0522, longitude: -118.2437, diameter:diameter, meshWidth:meshWidth, meshHeight:meshHeight})); // Cape Town

// Get My Location
getGeolocation()

// Stats
const stats = Stats()
document.body.appendChild(stats.dom)

// GUI
// const gui = new dat.GUI();

// Draw Shapes
function placeUsers(){
    points.forEach(point => {

        // Remove old spheres
        point.prevSpheres.forEach((obj) => {
            obj.geometry.dispose();
            obj.material.dispose();
            scene.remove( obj );
        })

        point.sphere.material.opacity = 0.01 + (Math.cos(Date.now()/1000)+1.0)/2

        // Add new sphere
        scene.add(point.sphere)
    })
}

// Geolocation
function getGeolocation(){
    navigator.geolocation.getCurrentPosition(
       // Success   
    (pos) => {
        points.get('me').setGeolocation(pos.coords)
    }, 
    // Error
    (err) => {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }, 
    // Options
    {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    });
}
animate();