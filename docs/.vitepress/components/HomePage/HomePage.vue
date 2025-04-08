<script setup lang="ts">
import { ref,onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import * as TWEEN from '@tweenjs/tween.js'
let scene:any = null
let camera:any = null
let renderer:any = null
let control:any = null
let earthPoints:any = null
let moon = null
let jupt = null
const ALL_IMGS = [
    {
        url:'./assets/img/earth.jpg',
        data:null,
        width:0,
        height:0
    },
    {
        url:'./assets/img/glow.png',
        data:null,
        width:0,
        height:0
    }
]




let imageData = {
    width:0,
    height:0,
    data:null
}

function getPosColor(x,y){
  const sum = (imageData.width*y) - (imageData.width -x) - 1
  return imageData.data[sum*4]
}


function isLandByUV(c:number, f:number) {
  let n:any = parseInt(`${ALL_IMGS[0].width * c}`) // 根据横纵百分比计算图象坐标系中的坐标
  let o = parseInt(`${ALL_IMGS[0].height * f}`) // 根据横纵百分比计算图象坐标系中的坐标
  return 1 >= ALL_IMGS[0].data.data[4 * (o * ALL_IMGS[0].width + n)] // 查找底图中对应像素点的rgba值并判断
}

// 加载图片
const loadAllImage = ()=> {
    const promises = ALL_IMGS.map((item)=>{
        return new Promise((resolve)=>{
            const img = new Image()
            img.src = item.url
            img.onload = function(e){
                const canvas = document.createElement("canvas")
                canvas.width = img.width
                canvas.height = img.height
                const ctx = canvas.getContext('2d')
                ctx.drawImage(img,0,0,img.width,img.height)
                imageData = ctx.getImageData(0,0,img.width,img.height)
                resolve({
                    img,
                    imageData
                })
            }
        })
    })
    return Promise.all(promises).then((res:any)=>{
        res.forEach((v,i)=>{
            ALL_IMGS[i].width = v.img.width
            ALL_IMGS[i].height = v.img.height
            ALL_IMGS[i].data = v.imageData
        })
        return
    })
}

const initBasic = ()=>{
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / 800, 0.1, 1000);
    camera.position.z = 5;
    camera.position.x = 0;
    camera.position.y = 0;
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, 800);
    const el = document.querySelector('#homePage-banner')
    el.appendChild(renderer.domElement);


    // const size = 100;
    // const divisions = 100;

    // const gridHelper = new THREE.GridHelper( size, divisions );
    // scene.add( gridHelper );

    // const axesHelper = new THREE.AxesHelper( 5 );
    // scene.add( axesHelper );


    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // 颜色和强度
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff,1,0,1); // 颜色、强度和距离
    pointLight.position.set(0, 10, 0); // 设置光源位置
    scene.add(pointLight);
}

const initControl = ()=>{
    control = new OrbitControls(camera, renderer.domElement);
}


const initEarth = ()=>{
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const step = 250
    for (let i = 0; i < step; i++) {
        let vec = new THREE.Vector3()
        let radians = step * (1 - Math.sin(i / step * Math.PI)) / step + .5 // 每个纬线圈内的角度均分
        for (let j = 0; j < step; j += radians) {
            let c = j / step // 底图上的横向百分比
            let f = i / step // 底图上的纵向百分比
            if (isLandByUV(c, f)) { // 根据横纵百分比判断在底图中的像素值
                const vec3 = new THREE.Vector3()
                var color = new THREE.Color();
                vec3.setFromSpherical(new THREE.Spherical(3.0,f * Math.PI,c * Math.PI * 2 - Math.PI / 2))
                positions.push(vec3.x,vec3.y,vec3.z)
                //if(vec3.x > 0){
                    color.setRGB(3/255,168/255,158/255);
                // } else {
                //     color.setRGB(138/255, 43/255, 226/255);
                // }
                colors.push(color.r, color.g, color.b);
            }
        }
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    var material = new THREE.PointsMaterial({
        vertexColors:true,  // 颜色通过buffer传递进去
        size: 0.01,
        //blending:THREE.AdditiveBlending,
        transparent:false,
        depthWrite: true,
        deepTest:true
    });
    earthPoints = new THREE.Points(geometry, material);
    //earthPoints.scale.set(2,2,2)
    scene.add(earthPoints);
}


// const initEarthGlow = ()=>{
//     const map = new THREE.TextureLoader().load( './assets/img/glow.png' );

//     const vertexShader = `
//     varying vec2 vUv;
//     void main() {
//         vUv = uv;
//         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//     }
// `;

// const fragmentShader = `
//     uniform sampler2D map;
//     varying vec2 vUv;
//     void main() {
//         vec4 color = texture2D(map, vUv);
//         if (color.a < 0.5) {
//             // 将透明部分渲染成粉色
//             gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0); // 粉色 (R=1.0, G=0.0, B=1.0)
//         } else {
//             // 渲染正常部分
//             gl_FragColor = color;
//         }
//     }
// `;





//     const material2 = new THREE.SpriteMaterial({
//        uniforms: {
//         map: { value: map }
//        },
//         vertexShader,
//         fragmentShader,
//         transparent: true,
//         depthTest: true,
//         depthWrite: true,
//     });

//     const sprite = new THREE.Sprite( material2 );
//     sprite.position.set(0,0,0);
//     sprite.scale.set(11.0,11.0,1.0)
//     scene.add( sprite );
// }
function latLongToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
}

// 初始化地球光柱
const initEarthGlow = ()=>{
    // 自定义着色器代码
    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        varying vec2 vUv;
        void main() {
            vec2 center = vec2(0.5, 0.5);
            float dist = distance(vUv, center);
            if(dist < 0.5) {
                gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0); // 蓝色渐变圆
            } else {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
            }
        }
    `;

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: false,
        depthWrite: true,
        depthTest: true
    });

    const sprite = new THREE.Sprite(material);
    sprite.position.set(0,0,0)
    sprite.scale.set(7.5, 7.5, 1);
    // 添加onBeforeRender回调,在每一帧渲染前更新sprite的朝向
    sprite.onBeforeRender = function(renderer, scene, camera) {
        // 让sprite始终面向相机
        sprite.quaternion.copy(camera.quaternion);
    };
    scene.add(sprite);
}


const initLines = ()=>{
    const radius = 3.5;  // 地球的半径
    const beijing = latLongToVector3(39.9042, 116.4074, radius);
    const london = latLongToVector3(51.5074, -0.1278, radius);
    const r = 3.8
    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, r, 0),
        new THREE.Vector3(r+2, 0, 0),
        new THREE.Vector3(0, -r, 0)
    ]);

    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });  // 红色线条
    const line = new THREE.Line(geometry, material);
    scene.add(line);
}


const initMoon = ()=>{
    const map = new THREE.TextureLoader().load( './assets/img/moon.png' );
    const geometry = new THREE.SphereGeometry(0.5,64,64);
	const material = new THREE.MeshBasicMaterial({
        map,
        opacity: 0.5, // 可以通过透明度整体调节光圈
        depthWrite: true, //禁止写入深度缓冲区数据
    });
	moon = new THREE.Mesh( geometry, material );
    moon.position.x = 0
    moon.position.y = 0
    moon.position.z = -4
	scene.add( moon );
}


const initJupiter = ()=>{
    const map = new THREE.TextureLoader().load( './assets/img/jupt.jpg' );
    const geometry = new THREE.SphereGeometry(0.5,64,64);
	const material = new THREE.MeshBasicMaterial({
        map,
        opacity: 0.5, // 可以通过透明度整体调节光圈
        depthWrite: true, //禁止写入深度缓冲区数据
    });
	jupt = new THREE.Mesh( geometry, material );
    jupt.position.x = -10
    jupt.position.y = 0
	scene.add( jupt );
}




const initShader = ()=>{

}

const initUFO = ()=>{
    const loader = new OBJLoader()
    const mtlLoader = new MTLLoader();
    return new Promise((resolve,reject)=>{
        mtlLoader.load('./assets/obj/UFO_Empty.mtl', function (materials) {
            materials.preload();
            loader.load('./assets/obj/UFO_Empty.obj',function(object){
                resolve({object,materials,loader})
            },()=>{},(err)=>{
                reject(err)
            })
        })
    })
}

const initBox = ()=>{
    var vertexShader = `
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;
// 片元着色器代码
var fragmentShader = `
    uniform vec3 color;
    varying vec2 vUv;

    void main() {
        gl_FragColor = vec4(vUv.x,vUv.y,1.0,1.0);
    }
`;

var shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        color: { value: new THREE.Color(0xff0000) } // 红色
    }
});


    //scene.add(cube)




    const geometry3 = new THREE.RingGeometry( 1, 2, 32 );
    console.log('uv',geometry3.attributes);

}

onMounted(async ()=>{
    await loadAllImage()
    initBasic()
    initControl()
    initEarth()
    //initStars()
    // 初始地球光晕
    initEarthGlow()
    initLines()
    // 初始月亮
    //initMoon()
    // 木星
    //initJupiter()



    function animate() {
        requestAnimationFrame(animate)
        earthPoints.rotation.y += 0.006
        renderer.render(scene, camera)
    }
    
    animate();
    
})

</script>

<template>
  <div class="homePage">
      <div class="homePage-banner" id="homePage-banner">

      </div>
  </div>
</template>

<style>
.homePage{
    position: relative;
}
.homePage-banner{
    position: fixed;
    background: black;
    left:0;
    right:0;
    top:60px;
    height:800px;
    z-index:1;
}
</style>
