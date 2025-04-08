<script setup lang="js">
import { ref,onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as TWEEN from '@tweenjs/tween.js'
let scene = null
let camera = null
let renderer = null
let control = null



const ALL_IMGS = [
    {
        url:'./assets/img/lock.png',
        data:null,
        width:0,
        height:0
    },
]
// 
const points = [
    {id:1,posX:0,posY:0},
    {id:2,posX:0,posY:-2},
    {id:3,posX:0,posY:-4},
    {id:4,posX:0,posY:-6},
    {id:5,posX:0,posY:-8}
]

// 
const rect = [
    {id:0,x:1,y:1,w:3,h:2,text:'hello',color:0xffa500},
    {id:1,x:-1,y:-1,w:3,h:2,text:'雷达区',color: 0x00ff00},
]


const robots = [
    {
        id:0,
        name:'AVG01',
        posX:2,
        posY:-4,
        path:[[2,-6],[-2,-6],[-2,-5],[-2,0]],
        object:null,
    },
    {
        id:1,
        name:'AVG02',
        posX:2,
        posY:-6,
        object:null,
        path:[[-3,5],[-3,4],[-3,2],[-3,0]]
    }
]


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
    return Promise.all(promises).then((res)=>{
        res.forEach((v,i)=>{
            ALL_IMGS[i].width = v.img.width
            ALL_IMGS[i].height = v.img.height
            ALL_IMGS[i].data = v.imageData
        })
        return
    })
}


const initBasic = ()=>{
    scene = new THREE.Scene()
    const ratio = window.innerWidth / (window.innerHeight - 60)
    camera = new THREE.PerspectiveCamera(75,ratio,0.1,1000)
    camera.position.x = 3
    camera.position.y = 3
    camera.position.z = 3
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight - 60)
    const el = document.querySelector('#map-container')
    el.appendChild(renderer.domElement)


    const size = 100
    const divisions = 100

    const gridHelper = new THREE.GridHelper( size, divisions )
    scene.add( gridHelper )
    const axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );
    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // 颜色和强度
    //scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff,1,0,1); // 颜色、强度和距离
    pointLight.position.set(0,10,0); // 设置光源位置
    //scene.add(pointLight);
}

const initControl = ()=>{
    control = new OrbitControls(camera, renderer.domElement)
}

const initStation = () => {
    points.forEach((item)=>{
        const geometry = new THREE.BoxGeometry(1,1,1)
		const material = new THREE.MeshBasicMaterial({color: 0x00ff00})
		const cube = new THREE.Mesh(geometry,material)
        cube.position.set(item.posX,0,item.posY)
		scene.add(cube);
    })
}

const initRect = ()=>{
    rect.forEach((item)=>{
        const rectShape = new THREE.Shape()
        rectShape.moveTo(0,0)
        rectShape.lineTo(item.w,0)
        rectShape.lineTo(item.w,item.h)
        rectShape.lineTo(0,item.h)
		
        const geometry = new THREE.ShapeGeometry(rectShape)
        const material = new THREE.MeshBasicMaterial({color: item.color })
        const mesh = new THREE.Mesh( geometry, material )
        mesh.position.set(item.x,0,item.y)
        scene.add(mesh)
    })
}


const createTextCanvas = (text)=>{
    var canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 128
    var context = canvas.getContext('2d')
    context.font = 'Bold 14px Arial'
    context.fillStyle = 'white'
    context.fillText(text, 10, 50)
    return canvas
}


const loadImage = ()=>{
    return new Promise((resolve,reject)=>{
        new THREE.TextureLoader().load('/assets/img/lock.png',(texture)=>{
            resolve(texture)
        })
    })
}




const initRobots = ()=> {
    robots.forEach(item=>{
        const geometry = new THREE.BoxGeometry(0.5,0.3,0.8)
        const material = new THREE.MeshBasicMaterial({
            color: 0xFF33FF,
            opacity: 0.5, // 可以通过透明度整体调节光圈
            depthWrite: true, //禁止写入深度缓冲区数据
        })
        const cube = new THREE.Mesh(geometry,material)
        cube.position.set(item.posX,0,item.posY)
        item.object = cube
        scene.add(cube)
    })

       robots.forEach((item)=>{
        if(item.path[0]){
        new TWEEN.Tween({x:item.posX,y:0,z:item.posY})
        .to({x:item.path[0][0],y:0,z:item.path[0][1]},3000)
        .onUpdate((obj)=>{
            item.object.position.x = obj.x
            item.object.position.z = obj.z
        })
        .onComplete(()=>{
            if(item.path[0]){
                item.posX = item.path[0][0]
                item.posY = item.path[0][1]
                const bb = item.path.shift()
                item.path.push(bb)
            }
        })
        .repeat(Infinity)
        .start()
        }
  
    })
}

const uniforms = {
    centerColor: { value: new THREE.Color(0xff0000) }, // 红色
    edgeColor: { value: new THREE.Color(0x0000ff) }   // 蓝色
}

const initCircle = ()=>{
    const geometry = new THREE.CircleGeometry( 1, 5 );
    const uvAttribute = geometry.attributes.uv;
    console.log("uv",uvAttribute)

    // 顶点着色器
const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

// 片段着色器
const fragmentShader = `
    varying vec2 vUv;
    uniform vec3 centerColor;
    uniform vec3 edgeColor;
    void main() {
        // 计算距离圆心的距离
        float dist = length(vUv - vec2(0.5, 0.5));
        // 线性插值颜色
        vec3 color = mix(centerColor, edgeColor, dist);
        gl_FragColor = vec4(color, 1.0);
    }
`;

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms
    })
    //const material = new THREE.MeshBasicMaterial( { color: 0xffff00,opacity:0.7,depthWrite: true } );
    const circle = new THREE.Mesh( geometry, material );
    circle.position.set(0,0,2)
    circle.rotation.x = THREE.MathUtils.degToRad(-90);
    scene.add( circle );
}




const initBufferRect = ()=>{
    const geometry = new THREE.BufferGeometry()
    const vertices = [
        0,0,0,
        2,0,0,
        2,0,2,
        0,0,0,
        2,0,2,
        0,0,2,
    ]
    const uvs = [
        0,1,
        1,1,
        1,0,
        0,1,
        1,0,
        0,0,
    ]
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))


    // 顶点着色器
    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    // 片段着色器
    const fragmentShader = `
        varying vec2 vUv;
        void main() {
            //float d = length(vUv-vec2(0.5));
            //float v = 1.0-smoothstep(0.2,0.6,d);

            float d = sqrt(vUv.x)*1000.0;
            float d2 = sqrt(vUv.y)*1000.0;
            gl_FragColor = vec4(vec3(fract(d+d2)),1.0);
            //gl_FragColor = vec4(1.0,v,1.0,1.0);
        }
    `;

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide // 使材质双面渲染
    })
    //const material = new THREE.MeshBasicMaterial( { color: 0xffff00,opacity:0.7,depthWrite: true } );
    const circle = new THREE.Mesh( geometry, material );
    //circle.position.set(0,0,2)
    //circle.rotation.x = THREE.MathUtils.degToRad(-90);
    scene.add( circle );
}






const animate =()=>{
    renderer.render(scene, camera);
    const random = Math.random()
    //uniforms.centerColor.value.set(random > 0.1 ? 0x00ff00 : 0xff0000); // 绿色
    uniforms.edgeColor.value.set(0xffff00);  // 黄色
    window.requestAnimationFrame(animate)
    //TWEEN.update()
}

const init = ()=>{
    //await loadAllImage()
    initBasic()
    initControl()
    initStation()
    initRobots()
    initBufferRect()
    initCircle()

    animate()
    //renderer.render(scene, camera)


    //initRect()
    
}



onMounted(()=>{
    init()
})
</script>
<template>
<div class="robot-map" id="map-container">
    
</div>
</template>

<style>
.robot-map{
    position: fixed;
    background: black;
    left:0;
    right:0;
    top:60px;
    bottom:0;
    z-index:1000;
}

</style>