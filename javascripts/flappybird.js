//配置信息
var config={
    'container':{//游戏所放的位置的元素名称
        'id':'flappybird',//元素id
        'width':600,//宽度
        'height':480//高度
    },
    'canvas':{//画布
        'top':0,//顶部坐标 百分比
        'bottom':1,//底部坐标 百分比
        'background_image':'',//背景图
        'resource':'./images/sucai.png'//资源图片
    },
    'world':{
        'g':9.8,//加速度
    },
    'bird':{//鸟
        'speed':160,
        'upspeed':-400,
        'dropspeed':0,
        'height':25,
        'width':25,
        'origin_pos':[0.2,0.5],//百分比
        'area':[[0,0,94,80],[94,0,94,80]]
    },
    'obstacle':{//障碍物
        'num':2,//每个画面显示障碍物的个数
        'miny':0.1,//百分比
        'maxy':0.5,//百分比
        'safearea_height':0.3,//安全范围的高度，百分比
        'width':0.2,//障碍物宽度，百分比
        'area':[170,50,50,340],//障碍物在资源图片上的坐标
        'image':'./images/zhuzi.png'
    },
    'ground':{//地面
        'z_distance':1,
        'area':[10,445,993,144],//地面资源图片上的坐标
    },
    'clound':{//云
        'z_distance':10,
        'area':[12,103,952,300],//云资源图片上的坐标
    },
    'sky':{
        'image':'./images/tian.jpg'
    }
};
var FlappyBird = function(canvas) {
     //按比例获取宽度
    var getAbsoluteWidthUnit=function(width){
        return width*config['container']['width'];
    }

    //按比例获取高度
    var getAbsoluteHeightUnit=function(height){
        return height*config['container']['height'];
    }

    //所有信息所在html标签
    var _flappybird;
    //鸟画布
    var _first_canvas;
    //障碍物画布
    var _obstacle_canvas;
    //天空画布
    var _sky_canvas;
    //云画布
    var _yun_canvas;
    //地画布
    var _ground_canvas;
    //鸟画布内容
    var _first_canvas_context;
    //障碍物画布内容
    var _obstacle_canvas_context;
    //天空画布内容
    var _sky_canvas_context;
    //地面画布内容
    var _ground_canvas_context;
    //云画布内容
    var _yun_canvas_context;
    
    var _time;
    //资源图
    var _source_image=new Image();
    //天空
    var _sky_image=new Image();
    //柱子
    var _obstacle_image=new Image();
    
    var _v = config['bird']['dropspeed'];//小鸟初始速度 单位px/s
    var _pixpermeter = 100;// 每米长度像但与多少像素，真实比例是4202像素等于1米
    var _date = new Date();
    //帧时间差
    var _timespan;
    
    //障碍物数据
    var _obstacle = [];
    var _grass=[];
    var _yun=[];

    var _obstacle_x=500;
    var _grass_x=0;
    var _yun_x=0;

    var _grass_unit_width=400;
    var _yun_unit_width=400;

    //鸟死了就是1，没死就是2，初始为2
    var _isdead=2;

    //游戏是否已经准备好开始了
    var _isready=2;
   
    //鸟
    var _bird = {'x': getAbsoluteWidthUnit(config['bird']['origin_pos'][0]) , 'y': getAbsoluteHeightUnit(config['bird']['origin_pos'][1])};
    //显示画布内容
    var _render = function() {
        var now = new Date();
        _timespan = now - _date;
        _date = now;
        checkBirdState();
        calculateBird(_timespan);
        calculateObstacle(_timespan);
        calculateGroundGrass(_timespan);
        calculateYun(_timespan);
        // calculateJiFen(_timespan);
        resetCanvas();
        drawCanvas();
        window.requestAnimationFrame(_render);
        
    };
    //重置画布内容
    var resetCanvas = function() {
        _first_canvas_context.clearRect(0, 0, config['container']['width'], config['container']['height']);
        _obstacle_canvas_context.clearRect(0, 0, config['container']['width'], config['container']['height']);
        _ground_canvas_context.clearRect(0, 0, config['container']['width'], config['container']['height']);
        _yun_canvas_context.clearRect(0, 0, config['container']['width'], config['container']['height']);
    };
    var resetGame=function(){
        _bird = {'x': getAbsoluteWidthUnit(config['bird']['origin_pos'][0]) , 'y': getAbsoluteHeightUnit(config['bird']['origin_pos'][1])};
        _obstacle=[];
        _grass=[];
        _yun=[];
        _isdead=2;
        jifen=0;
        _v = config['bird']['upspeed'];
    }
    //计算鸟的坐标
    var calculateBird = function(timespan) {
        if(_isready==2)return;
        if (_isdead == 1 && _bird['y'] >= getAbsoluteHeightUnit(config['canvas']['bottom']) - config['bird']['height']){
            return;
        }
        if (_isdead == 2 && _bird['y'] >= getAbsoluteHeightUnit(config['canvas']['bottom']) - config['bird']['height']) {
            _bird['y'] = getAbsoluteHeightUnit(config['canvas']['bottom']) - config['bird']['height'];
            _isdead = 1;
            return;
        };
        //当鸟飞到上边界时
        if( _bird['y'] < getAbsoluteHeightUnit(config['canvas']['top'])){
            _bird['y']= getAbsoluteHeightUnit(config['canvas']['top']);
            _v=0;
        }
        _bird['y'] = _bird['y'] + _v * timespan / 1000;
        _v = _v + config['world']['g'] * _pixpermeter * timespan / 1000;

    };
    var jifen=0;
    var flydistance=0;
    var calculateJifen=function(x){
        var jifenline=config['bird']['origin_pos'][0]*config['container']['width']+config['bird']['width'];
        if(x<=jifenline){
            jifen++;
            return true;
        }
        return false;
    }
    var calculateObstacle=function(timespan){
        if(_isready==2)return;
        if (_isdead == 1)
            return;
        for(var i=0,l=_obstacle.length;i<l;i++){
            _obstacle[i]['x']=_obstacle[i]['x']-getSpeed(config['bird']['speed'],0)*timespan/1000;
            if(_obstacle[i]['flag']!=1){
                if(calculateJifen(_obstacle[i]['x']+config['obstacle']['width']*config['container']['width'])){
                    _obstacle[i]['flag']=1;
                }
                
            }
        }
        init_obstacle();
    };
    
    var calculateGroundGrass=function(timespan){
        if(_isready==2)return;
        if (_isdead == 1)
            return;
        for(var i=0,l=_grass.length;i<l;i++){
            _grass[i]['x']=_grass[i]['x']-getSpeed(config['bird']['speed'],config['ground']['z_distance'])*timespan/1000;
        }
        initGroundGrass();
    };


    var calculateYun=function(timespan){
        if(_isready==2)return;
        if (_isdead == 1)
            return;
        for(var i=0,l=_yun.length;i<l;i++){
            _yun[i]['x']=_yun[i]['x']-getSpeed(config['bird']['speed'],config['clound']['z_distance'])*timespan/1000;
        }
        initYun();
    };

    //获取不同距离的速度
    var getSpeed=function(speed,z_distance){
        return speed*1/(1+z_distance);
    }
    //检查鸟的状态，有没有碰上柱子或者地板
    var checkBirdState=function(){
        for(var i=0,l=_obstacle.length;i<l;i++){
            if(_obstacle[i]['x']<=_bird['x']+config['bird']['width'] && _obstacle[i]['x']+config['obstacle']['width']>_bird['x']){
                if(_bird['y']<=_obstacle[i]['y'] || _bird['y']+config['bird']['height']>=_obstacle[i]['y']+getAbsoluteHeightUnit(config['obstacle']['safearea_height'])){
                    _isdead=1;
                    return;
                }
            }
        }
    };
    //初始化障碍物
    var init_obstacle=function(){
        if(_obstacle.length>0 && _obstacle[0]['x']+getAbsoluteWidthUnit(config['obstacle']['width'])<0){
            _obstacle.shift();
        }
        var distance=config['container']['width']/(config['obstacle']['num']);
        while(_obstacle.length<=config['obstacle']['num']){
            if(_obstacle.length==0){
                _obstacle.push({'x':_obstacle_x,'y':parseInt(Math.random()*(getAbsoluteWidthUnit(config['obstacle']['maxy']) -getAbsoluteWidthUnit(config['obstacle']['miny'])+1)+getAbsoluteWidthUnit(config['obstacle']['miny']))});
            }else{
                _obstacle.push({'x':_obstacle[_obstacle.length-1]['x']+distance,'y':parseInt(Math.random()*(getAbsoluteWidthUnit(config['obstacle']['maxy']) -getAbsoluteWidthUnit(config['obstacle']['miny'])+1)+getAbsoluteWidthUnit(config['obstacle']['miny']))});
            }
        }
    };

    //初始化草地
    var initGroundGrass=function(){
        if(_grass.length>0 && _grass[0]['x']+_grass_unit_width<0){
            _grass.shift();
        }
        while(_grass.length<Math.ceil(config['container']['width']/_grass_unit_width)+1){
            if(_grass.length==0){
                _grass.push({'x':_grass_x});
            }else{
                _grass.push({'x':_grass[_grass.length-1]['x']+_grass_unit_width});
            }
        }
    };
    
    var initYun=function(){
        if(_yun.length>0 && _yun[0]['x']+_yun_unit_width<0){
            _yun.shift();
        }
        while(_yun.length<Math.ceil(config['container']['width']/_yun_unit_width)+1){
            if(_yun.length==0){
                _yun.push({'x':_yun_x});
            }else{
                _yun.push({'x':_yun[_yun.length-1]['x']+_yun_unit_width});
            }
        }
    }

    //画出画布内容,从后往前画
    var drawCanvas = function() {
        drawGroundGrass();
        drawFirstLayoutBackground();
        drawSky();
        drawYun();
        drawFrame();
        drawStartText();
        drawJifen();
        drawBird();

    };
    //画出帧数字
    var drawFrame = function() {
        _first_canvas_context.fillStyle = "#00f";
        _first_canvas_context.font = "italic 16px sans-serif";
        _first_canvas_context.textBaseline = "top";
        _first_canvas_context.fillText(Math.floor(1000 / _timespan), 0, 0);
    };
    //画出帧数字
    var drawJifen = function() {
        _first_canvas_context.fillStyle = "#00f";
        _first_canvas_context.font = "italic 16px sans-serif";
        _first_canvas_context.textBaseline = "top";
        _first_canvas_context.fillText('分数：'+jifen, config['container']['width']*0.4, 0);
    };
    var drawStartText=function(){
        if(_isready==2 || _isdead==1){
            _first_canvas_context.fillStyle = "#000";
            _first_canvas_context.font = "italic 16px sans-serif";
            _first_canvas_context.textBaseline = "top";
            _first_canvas_context.fillText("按空格键开始游戏", config['container']['width']*0.4, config['container']['height']*0.4);
        }
    }
    //画障碍物
    var drawFirstLayoutBackground=function(){
        _obstacle_canvas_context.fillStyle='#000';
        for(var i=0,l=_obstacle.length;i<l;i++){
            _obstacle_canvas_context.drawImage(_obstacle_image,170,50,50,340, _obstacle[i]['x'],getAbsoluteHeightUnit(config['canvas']['top']),getAbsoluteHeightUnit(config['obstacle']['width']),_obstacle[i]['y']-getAbsoluteHeightUnit(config['canvas']['top']));
            _obstacle_canvas_context.drawImage(_obstacle_image,170,30,50,340,_obstacle[i]['x'],_obstacle[i]['y']+getAbsoluteHeightUnit(config['obstacle']['safearea_height']) ,getAbsoluteHeightUnit(config['obstacle']['width']),getAbsoluteHeightUnit(config['canvas']['bottom'])-_obstacle[i]['y']+getAbsoluteHeightUnit(config['obstacle']['safearea_height']));
        }
    }
    //画草地
    var drawGroundGrass=function(){
        for(var i=0,l=_grass.length;i<l;i++){
            drawResource(_ground_canvas_context,_source_image,config['ground']['area'],[_grass[i]['x'],getAbsoluteHeightUnit(config['canvas']['bottom']) - 50, _grass_unit_width, 50]);
        }
    }
    //画天空
    var drawSky=function(){
        _sky_canvas_context.drawImage(_sky_image,0,0,config['container']['width'],config['container']['height']);
    }
    //画云
    var drawYun=function(){
        for(var i=0,l=_grass.length;i<l;i++){
            drawResource(_sky_canvas_context,_source_image,config['clound']['area'],[_yun[i]['x'],10, _yun_unit_width, 400]);
        }
    }
    //画出鸟
    var drawBird = function() {
        var pos_area=[_bird['x'], _bird['y'], config['bird']['width'], config['bird']['height']];
        if (_isdead == 1) {
            drawResource(_first_canvas_context,_source_image,config['bird']['area'][0],pos_area);
            return;
        }
        var time = new Date();
        if (time.getMilliseconds() % 500 < 250) {
            drawResource(_first_canvas_context,_source_image,config['bird']['area'][0],pos_area);
        } else {
            drawResource(_first_canvas_context,_source_image,config['bird']['area'][1],pos_area);
        }
    };

    var drawResource=function(context,image,area,pos_area){
        context.drawImage(image,area[0],area[1],area[2],area[3],pos_area[0],pos_area[1],pos_area[2],pos_area[3]);
    }
    //绑定空格键到窗口上
    var bindKey = function() {
        $('#'+config['container']['id']).on('tap', function(event) {
            if(_isready==2)_isready=1;
            if (_isdead != 1){
                var media=document.getElementById('flap_sound');
                media.currentTime = 0;
                media.play();
                _v = config['bird']['upspeed'];
            }else{
                resetGame();
            }
        });
    };

    //设置canvas属性
    var setCanvas=function(canvas){
        canvas=document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.left = 10;
        canvas.style.top = 670;
        canvas.height = config['container']['height'];
        canvas.width = config['container']['width'];
        return canvas;
    }

    _flappybird = document.getElementById('flappybird');

    _first_canvas =setCanvas(_first_canvas);
    _obstacle_canvas = setCanvas(_obstacle_canvas);
    _ground_canvas=setCanvas(_ground_canvas);
    _sky_canvas=setCanvas(_sky_canvas);
    _yun_canvas=setCanvas(_yun_canvas);
    //资源图片
    _source_image.src=config['canvas']['resource'];
    _sky_image.src=config['sky']['image'];
    _obstacle_image.src=config['obstacle']['image'];
    
    _flappybird.appendChild(_sky_canvas);
    _flappybird.appendChild(_yun_canvas);
    _flappybird.appendChild(_ground_canvas);
    _flappybird.appendChild(_obstacle_canvas);
    _flappybird.appendChild(_first_canvas);
    

    _obstacle_canvas_context = _obstacle_canvas.getContext("2d");
    _first_canvas_context = _first_canvas.getContext("2d");
    _ground_canvas_context= _ground_canvas.getContext("2d");
    _sky_canvas_context= _sky_canvas.getContext("2d");
    _yun_canvas_context=_yun_canvas.getContext("2d");

    bindKey();
    _render();
};