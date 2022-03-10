// TODO: Add SDKs for Firebase products that you want to use
THREE.Cache.enabled = true;
// Instantiate a loader
const loader = new THREE.GLTFLoader();
const canvas = document.querySelector("canvas.webgl");
/**
 * Renderer
 */

var isMobile = window.innerWidth < 1024 ? true : false;
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight - 100,
};

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  powerPreference: "low-power",
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
// renderer.toneMapping = THREE.ReinhardToneMapping;

// scenes
const scene = new THREE.Scene();

scene.mouseRaycasters = [];
scene.collisionRaycasters = [];

renderer.setClearColor(0x000000, 0); // the default

scene.fog = new THREE.FogExp2(new THREE.Color(0.1, 0.1, 0.1), 0);
//gardenScene.fog = scene.fog;

/*
 * Camera
 */
// Base camera
if (isMobile) {
  camera = new THREE.PerspectiveCamera(
    85,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
} else
  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
camera.position.x = 0;
camera.position.y = 5;
camera.position.z = 20;
camera.lookAt(0, 0, 0);
scene.add(camera);
// gardenScene.add(camera);

var userLight = new THREE.AmbientLight(0xffffff, 0.6);
var directionalLight = new THREE.PointLight(0xffffff, 12);
directionalLight.position.set(20, 15, -15);
directionalLight.castShadow = true;
scene.add(userLight);
scene.add(directionalLight);
var plane = [];
var balloon;
var balloons = [];

//Set up shadow properties for the light
directionalLight.shadow.mapSize.width = 1024; // default
directionalLight.shadow.mapSize.height = 1024; // default
directionalLight.shadow.camera.near = 5; // default
directionalLight.shadow.camera.far = 40; // default
directionalLight.shadow.bias = -0.008; // default

var lerpX = 0;
var lerpY = 0;
var time = 0; // TEMPO PER IL MOVIMENTO



var loaded = false;

// ---------------------



const clock = new THREE.Clock();

const raycaster = new THREE.Raycaster();
const raycasterBehind = new THREE.Raycaster();
var lookAt = [];
const raycasterM = new THREE.Raycaster();
var intersects = []; // collisioni frontali
var intersectsMouse = [];
var intersectsBack = []; // collisioni dietro
const mouse = new THREE.Vector2();
var myPi = Math.PI / 180;

var avgTime = 0;
//var audio = new Audio("sounds/exploration.mp3");
// per lo scambio di scene
var isRunningMain = true;

// FUNZIONE LOOOP


function tick() {
  time++;

  plane.forEach((mesh) => {
    mesh.position.set(10 * lerpX, -2 + 3 * Math.abs(lerpX) + 5 * lerpY, 0);
    if (mesh.name === "elica") {
      mesh.rotation.set(
        40 * lerpY * myPi,
        0,
        90 * lerpX * myPi + 30 * myPi * time
      );
    } else mesh.rotation.set(40 * lerpY * myPi, 0, 90 * lerpX * myPi);
  });
  renderer.render(scene, camera);

  if(time%120 == 0) {
     addBalloon(balloons);
    
  }
  moveBalloons(balloons);




  // eventually used to stop the function. 
  if (isRunningMain) {
    window.requestAnimationFrame(tick);
  }
}

var rect = renderer.domElement.getBoundingClientRect();

document.onmousemove = function (e) {
  lerpX = lerp(lerpX, mouse.x, 0.01);
  lerpY = lerp(lerpY, mouse.y, 0.01);
  mouse.x = (e.clientX / rect.width) * 2 - 1;
  mouse.y = -(e.clientY / rect.height) * 2 + 1;
  cursorX = e.pageX - window.innerWidth / 2;
  cursorY = e.pageY - window.innerHeight / 2;

};

document.addEventListener("keydown", logKey);
document.addEventListener("keyup", releaseKey);
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  innerWidth = window.innerWidth;
  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  rect = renderer.domElement.getBoundingClientRect();
});

// WASD
function logKey(e) {

}

function releaseKey(e) {

}



// useful functions

function map(number, inMin, inMax, outMin, outMax) {
  return ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

tick();

// Load the plane
loader.load(
  // resource URL
  "plane.glb",
  // called when the resource is loaded
  function (gltf) {
    var gscene = gltf.scene;
    gscene.traverse(function (child) {
      if (child.isMesh) {
       
        plane.push(child);
      }
    });

    plane.forEach((mesh) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    });
  }
);



// Load a baloon mesh
loader.load(
    // resource URL
    "baloon.glb",
    // called when the resource is loaded
    function (gltf) {
      var gscene = gltf.scene;
      gscene.traverse(child => {
        if(child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    })
      balloon = gscene;
      loaded = true;
    }
  );


  // add a new balloon in a random position
function addBalloon(balloons) {

    if(loaded) {
        let newBalloon = balloon.clone();
      
        newBalloon.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, -10 - Math.random()*10);
        balloons.push(newBalloon);
        scene.add(newBalloon);
    }

}

// move and delete balloons
function moveBalloons(balloons) {
      balloons.forEach((balloon,index) => {
         try  { if(balloon.position.z > 10) {
              scene.remove(balloon);
              balloons = balloons.splice(index,1);
             
          }
          else {
          let z = balloon.position.z + 0.1;
          balloon.position.set(balloon.position.x, balloon.position.y, z)
          }
        }
        catch(e) {}
      })
}