module.exports = {
    title:'前端Sam哥',
    description: 'A VitePress site',
    appearance: 'light',
    themeConfig:{
        nav:[
            { text: '首页', link: '/',activeMatch: '/'  },
            { text: '数学算法', link: '/articles/algmath/index.md',activeMatch: '/articles/algmath/index.md' },
            { text: '我的作品', link: '/articles/works/index.md',activeMatch: '/articles/works/index.md' },
            { text: '机器人小车', link: '/articles/works/robotCar.md',activeMatch: '/articles/works/robotCar.md' },
            { 
                text: '文档教程',
                items:[
                    {text:'WebGL文档',link:'/articles/docs/webgl.md'},
                    {text:'Shader教程',link:'/articles/docs/shader.md'},
                    {text:'Three.js教程'}
                ] 
            }
        ],
        footer: {
            message: '其实我也不知道写啥注脚',
            copyright: '那我就随便写个吧',
        }
    },
    
}