import RobotMap from './core';

const robotMap = new RobotMap({
    el:document.getElementById('container'),
    width:window.innerWidth,
    height:window.innerHeight,
    points:{
        data:[
            { id:1,name:'1',x:0,y:0,type:'circle'},         
            { id:2,name:'2',x:50,y:0,type:'circle'},         
            { id:3,name:'3',x:100,y:0,type:'rect'},         
            { id:4,name:'4',x:150,y:0,type:'rect'},         
            { id:5,name:'5',x:200,y:0,type:'rect'},         
            { id:6,name:'6',x:250,y:0,type:'circle'},
            { id:7,name:'7',x:250,y:50,type:'circle'},
            { id:8,name:'8',x:250,y:100,type:'circle'},
            { id:9,name:'9',x:250,y:150,type:'rect'},
            { id:10,name:'10',x:250,y:200,type:'rect'},
            { id:11,name:'11',x:250,y:250,type:'circle'},
            { id:12,name:'12',x:0,y:-50,type:'circle'},
            { id:13,name:'13',x:0,y:-100,type:'circle'},
            { id:14,name:'14',x:0,y:-150,type:'rect'},
            { id:15,name:'15',x:0,y:-200,type:'rect'},
            { id:16,name:'16',x:0,y:-250,type:'circle'},
            { id:17,name:'17',x:50,y:-100,type:'circle'},
            { id:18,name:'18',x:100,y:-100,type:'circle'},
            { id:19,name:'19',x:150,y:-100,type:'rect'},
        ],
        color:'#409eff',
        radius:8
    },
    lines:{
        data:[
            { id:1,name:'1',start:1,end:2},
            { id:2,name:'2',start:2,end:3},
            { id:3,name:'3',start:3,end:4},
            { id:4,name:'4',start:4,end:5},
            { id:5,name:'5',start:5,end:6},
            { id:6,name:'6',start:6,end:7},
            { id:7,name:'7',start:7,end:8},
            { id:8,name:'8',start:8,end:9},
            { id:9,name:'9',start:9,end:10},
        ]
    }
});

robotMap.init();
