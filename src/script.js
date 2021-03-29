import './style.css'
import * as THREE from 'three'
import {UserMarker} from './UserMarker'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import Stats from 'three/examples/jsm/libs/stats.module'
import testVertexShader from './shaders/map/vertex.glsl'
import testFragmentShader from './shaders/map/fragment.glsl'

// Raycaster
const raycaster = new THREE.Raycaster()

// Loading Manager
const loadingManager = new THREE.LoadingManager()
loadingManager.onProgress = () => {
    console.log('progressing')
}

// Textures
const texture = new THREE.TextureLoader(loadingManager).load("./img/mapTexture.jpeg")
// const texture = new THREE.TextureLoader(loadingManager).load("./img/map.jpeg")
const displacementMap = new THREE.TextureLoader(loadingManager).load("./img/mapDisplacement.jpeg")


// const textureLoader = new THREE.TextureLoader()
// const matcapTexture = textureLoader.load('./textures/matcaps/8.png')

// // Text
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
// const light = new THREE.AmbientLight(0x00b3ff);
const light = new THREE.AmbientLight(0xffffff);
light.position.set(0, 5, 10);
light.intensity = 1.4;
scene.add(light);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000)
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

// Mouse
const mouse = new THREE.Vector2()
window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX/window.innerWidth) * 2 - 1
    mouse.y = -(e.clientY/window.innerHeight) * 2 + 1
})


window.addEventListener('click', () => {
    if (currentIntersect){
        currentIntersect.object.material.opacity = 1.0 
    }
})

// Texture
let imageWidth = 1200
let imageHeight = 600
const segmentsX = 400
const imageAspect = imageWidth/imageHeight
let fov_y = camera.position.z * camera.getFilmHeight() / camera.getFocalLength();
let meshWidth = fov_y * camera.aspect;
let meshHeight = meshWidth / imageAspect;

// Set Default Users
let points = new Map()
let diameter = 1e-2/4;
points.set('me',new UserMarker({diameter:diameter, meshWidth:meshWidth, meshHeight:meshHeight}))
// points.set('Los Angeles',new UserMarker({latitude: 34.0522, longitude: -118.2437, diameter:diameter, meshWidth:meshWidth, meshHeight:meshHeight})); // Cape Town
// let la = points.get('Los Angeles')
// Plane
const planeGeometry = new THREE.PlaneGeometry(meshWidth, meshHeight, segmentsX, segmentsX/imageAspect)
// const count = planeGeometry.attributes.position.count
// const randoms = new Float32Array(count)
// for(let i = 0; i < count; i++)
// {
//     randoms[i] = Math.random()
// }
// planeGeometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))
// console.log(displacementMap)
// planeGeometry.setAttribute('displacement', new THREE.BufferAttribute(displacementMap, 1))


// const material = new THREE.MeshStandardMaterial()
// material.map = texture
let tStart = Date.now()
 let point1 = {
    position: new THREE.Vector2(NaN,NaN)
 }
 let pointArr = [point1]
const material = new THREE.ShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
    transparent: true,
    wireframe: true,
    uniforms:
    {
        points: { value: [point1] },
        count: {value: pointArr.length },
        uTime: { value: 0 },
        uTexture: { value: texture },
        displacementMap: { value: displacementMap },
        displacementHeight: { value: 0.1 },
        colorThreshold: { value: 0.05 },
    }
})


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
    let me = points.get('me')
    material.uniforms.points.value[0]= {
        position: new THREE.Vector2(me.x,me.y)
     }
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
// material.wireframe = true;
material.blending = THREE.AdditiveBlending

function regeneratePlaneGeometry() {
    let newGeometry = new THREE.PlaneGeometry(
        meshWidth, meshHeight, segmentsX, segmentsX/imageAspect
    )
    plane.geometry.dispose()
    plane.geometry = newGeometry
}

// Animate
let currentIntersect = null

var animate = function () {
    requestAnimationFrame(animate)
    animateUsers()
    material.uniforms.uTime.value = Date.now() - tStart
    stats.update()
    controls.update()
    renderer.render(scene, camera)
};

// Get My Location
getGeolocation()

// Stats
const stats = Stats()
document.body.appendChild(stats.dom)

// GUI
// const gui = new dat.GUI({width: 400});
// gui.add(material.uniforms.colorThreshold, 'value').min(0).max(1).step(0.001).name('Threshold')

// Draw Shapes
function animateUsers(){
    raycaster.setFromCamera(mouse,camera)
    const objectArray = Array.from( points.keys() ).map(key => points.get(key).marker)
    const intersects = raycaster.intersectObjects(objectArray)

    if (intersects.length){
        if (currentIntersect === null){
            const scale = intersects[0].object.scale
            intersects[0].object.scale.set(scale.x*2,scale.y*2,scale.z*2)
            intersects[0].object.material.opacity = 0.75
        }
        currentIntersect = intersects[0]
        
    } else {
        if (currentIntersect !== null){
            const scale = currentIntersect.object.scale
            currentIntersect.object.scale.set(scale.x/2,scale.y/2,scale.z/2)
            currentIntersect.object.material.opacity = 0.50
        }
        currentIntersect = null;
    }

    points.forEach(point => {

        // Remove old marker
        point.prevMarkers.forEach((obj) => {
            obj.geometry.dispose();
            obj.material.dispose();
            scene.remove( obj );
        })

        // Add new marker
        scene.add(point.marker)
    })
}

// Geolocation
function getGeolocation(){
    navigator.geolocation.getCurrentPosition(
       // Success   
    (pos) => {
        points.get('me').setGeolocation(pos.coords)
        let me = points.get('me')
        material.uniforms.points.value[0]= {
            position: new THREE.Vector2(me.x,me.y)
         }

         controls.target.set(me.x,me.y,0.12)
         camera.position.set(me.x,me.y)
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