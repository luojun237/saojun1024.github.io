import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export default class RobotMap {
    constructor(options) {
        this.options = options;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        // 添加xy轴
        this.addAxis();
        // 添加网格辅助
        this.addGrid();
        // 添加相机
        this.camera = new THREE.PerspectiveCamera(75, this.options.width / this.options.height, 0.1, 1000);
        this.camera.position.set(200, 200, 200);
        this.scene.add(this.camera);
        // 添加灯光
        this.addLight();
    }

    init() {
        this.createPoints();
        this.createLines();
        // 渲染器
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.options.width, this.options.height);
        // 添加控制器
        this.addControls();
        this.options.el.appendChild(this.renderer.domElement);
        // 开始渲染
        this.animate();
    }

    addLight() {
       // 光照
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); 
        directionalLight.position.set(0, 0, 2000);
        this.scene.add(directionalLight);
    }

    addControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.enableZoom = true;
    }

    addAxis() {
        const axis = new THREE.AxesHelper(1000);
        this.scene.add(axis);
    }

    addGrid() {
        const grid = new THREE.GridHelper(500,40);
        this.scene.add(grid);
    }

    createPoints() {
        this.options.points.data.forEach(point => {
           if(point.type === 'circle'){
                const geometry = new THREE.CircleGeometry(this.options.points.radius, 32);
               
                // 将对于点的name文字添加到点上,创建一个canvas,绘制point.name
                const canvas = document.createElement('canvas');
                canvas.width = 100;
                canvas.height = 100;
                const ctx = canvas.getContext('2d');
                // 设置背景透明
                ctx.clearRect(0, 0, 100, 100);
                // 只设置文字颜色为红色
                ctx.fillStyle = 'red';
                ctx.font = '50px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(point.name, 50, 50);
                const texture = new THREE.Texture(canvas);
                texture.needsUpdate = true;
                const material = new THREE.MeshBasicMaterial({ 
                    map: texture,
                    color: '#409eff',
                    transparent: false
                });
                const circle = new THREE.Mesh(geometry, material);
                // x轴旋转90度
                circle.rotateX(-Math.PI / 2);
                circle.position.set(point.x, 0,-point.y);
                this.scene.add(circle);

               
               
                
                
                
           }else{ // 正方形
                const geometry = new THREE.PlaneGeometry(this.options.points.radius*1.5, this.options.points.radius*1.5);
                const material = new THREE.MeshBasicMaterial({ color: this.options.points.color }); // 材质为绿色
                const cube = new THREE.Mesh(geometry, material);
                cube.rotateX(-Math.PI / 2);
                cube.position.set(point.x, 0, -point.y);
                this.scene.add(cube);
           }
        });
    }


    createLines() {
        this.options.lines.data.forEach(line => {
            // 找到起点和终点的坐标
            const startPoint = this.options.points.data.find(point => point.id === line.start);
            const endPoint = this.options.points.data.find(point => point.id === line.end);

            // 计算起点，终点的中点
            const middlePoint = {
                x: (startPoint.x + endPoint.x) / 2,
                y: (startPoint.y + endPoint.y) / 2
            }
            // 计算长度
            const length = Math.sqrt((startPoint.x - endPoint.x) ** 2 + (startPoint.y - endPoint.y) ** 2);

            // 使用planeGeometry绘制直线
            const geometry = new THREE.PlaneGeometry(length, 2);
            const material = new THREE.MeshBasicMaterial({ color:this.options.points.color });
            const plane = new THREE.Mesh(geometry, material);
           
            plane.position.set(middlePoint.x, 0, -middlePoint.y);
            // 计算角度
            const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
            plane.rotateY(angle);
            // 计算旋转角度
            const rotation = new THREE.Euler(0, angle, 0);
            plane.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotation.y);
            this.scene.add(plane);
            
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
}
