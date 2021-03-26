import './style.css'
import * as THREE from 'three'
import {UserMarker} from './UserMarker'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
// const light = new THREE.PointLight(0xffffff, 2);
const light = new THREE.AmbientLight(0xffffff);
light.position.set(0, 5, 10);
light.intensity = 1.4;
scene.add(light);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 3

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.screenSpacePanning = true
controls.enableDamping = true
//controls.addEventListener('change', render)

let imageWidth = 1200;
let imageHeight = 600;
const segmentsX = 150
const imageAspect = imageWidth/imageHeight
let fov_y = camera.position.z * camera.getFilmHeight() / camera.getFocalLength();
let meshWidth = fov_y * camera.aspect;
let meshHeight = meshWidth / imageAspect;
const planeGeometry = new THREE.PlaneGeometry(meshWidth, meshHeight, segmentsX, segmentsX/imageAspect)
const material = new THREE.MeshPhongMaterial()
const texture = new THREE.TextureLoader().load("/img/texMap.jpeg")
material.map = texture

const displacementMap = new THREE.TextureLoader().load("img/dispMap.jpeg")
material.displacementMap = displacementMap

const plane = new THREE.Mesh(planeGeometry, material)
scene.add(plane)

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
    render()
}, 
false)

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

const gui = new dat.GUI()
material.transparent = true;
material.depthTest = false;
material.opacity = 0.3;

// gui.add(material,'opacity')
// .min(0)
// .max(1)
// .step(0.01)
// .name('Opacity')


var data = {
    color: 0x00b3ff,
    emissive: material.emissive.getHex(),
    specular: material.specular.getHex()
};

material.color.setHex(Number(data.color.toString().replace('#', '0x')))
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


// App

var animate = function () {
    requestAnimationFrame(animate)
    draw()
    controls.update()
    render()
};

let points = new Map()
let diameter = 1e-1/6;
points.set('me',new UserMarker({diameter:diameter, meshWidth:meshWidth, meshHeight:meshHeight}))
points.set('CapeCod',new UserMarker({latitude: -33.918861, longitude: 18.423300, diameter:diameter, meshWidth:meshWidth, meshHeight:meshHeight})); // Cape Town
points.set('LA',new UserMarker({latitude: 34.0522, longitude: -118.2437, diameter:diameter, meshWidth:meshWidth, meshHeight:meshHeight})); // Cape Town

getGeolocation()

function draw(){
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

function render() {
    renderer.render(scene, camera)
}
animate();