//配置信息
var config={
    'container':{//游戏所放的位置的元素名称
        'id':'flappybird',//元素id
        'width':600,//宽度
        'height':600//高度
    },
    'canvas':{//画布
        'top':0,//顶部坐标
        'bottom':600,//底部坐标
        'background_image':'',//背景图
        'resource':''//资源图片
    },
    'world':{
        'g':9.8,//加速度
    },
    'bird':{//鸟
        'speed':80,
        'dropspeed':0,
        'origin_pos':[200,300],
        'area':[[0,0,100,50],[0,0,100,50],[0,0,100,50]]
    },
    'obstacle':{//障碍物
        'num':3,//每个画面显示障碍物的个数
        'safearea_height':300,//安全范围的高度
        'width':80,//障碍物宽度
        'area':[0,0,100,50],//障碍物在资源图片上的坐标
    },
    'ground':{//地面
        'z_distance':1,
        'area':[0,0,100,50],//地面资源图片上的坐标
    },
    'clound':{//云
        'z_distance':10,
        'area':[[0,0,100,50],[0,0,100,50],[0,0,100,50]],//云资源图片上的坐标
    },
    // 'sky':{//天空

    // }
}
var FlappyBird = function(canvas) {

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
    //鸟动作图1
    // var _birdimage1 = new Image();
    // //鸟动作图2
    // var _birdimage2 = new Image();
    // //地上的草
    // var _ground_grass_image=new Image();
    // //云
    // var _yun_image=new Image();
    var _source_image=new Image();
    //天空
    var _sky_image=new Image();
    //柱子
    var _obstacle_image=new Image();
    
    var _topY=0;
    var _groundY = 600;
    var _v = 0;//小鸟初始速度 单位px/s
    var _backgroundv=10;
    var _g = 9.8;//重力加速度
    var _pixpermile = 100;// 每米长度像但与多少像素，真实比例是4202像素等于1米
    var _date = new Date();
    //帧时间差
    var _timespan;
    //鸟
    var _bird = {'x': 200, 'y': 300, 'width': 40, 'height': 40, 'isdead': 2};
    //障碍物数据
    var _obstacle_height=300;
    var _obstacle_distance=400;
    var _obstacle = [];
    var _show_obstacle_num=8;
    var _obstacle_x=500;
    var _obstacle_width=80;
    var _canvas_width = 600;
    var _canvas_height = 600;
    var _grass_unit_width=400;
    var _grass=[];
    var _grass_x=0;
    var _yun=[];
    var _yun_x=0;
    var _yun_unit_width=400;
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
        resetCanvas();
        drawCanvas();
        window.requestAnimationFrame(_render);
    };
    //重置画布内容
    var resetCanvas = function() {
        _first_canvas_context.clearRect(0, 0, _first_canvas.width, _first_canvas.height);
        _obstacle_canvas_context.clearRect(0, 0, _first_canvas.width, _first_canvas.height);
        _ground_canvas_context.clearRect(0, 0, _first_canvas.width, _first_canvas.height);
        _yun_canvas_context.clearRect(0, 0, _first_canvas.width, _first_canvas.height);
    };
    
    //计算鸟的坐标
    var calculateBird = function(timespan) {
        if (_bird['isdead'] == 1 && _bird['y'] >= _groundY - _bird['height']){
            return;
        }
        if (_bird['isdead'] == 2 && _bird['y'] >= _groundY - _bird['height']) {
            _bird['y'] = _groundY - _bird['height'];
            _bird['isdead'] = 1;
            return;
        };
        //当鸟飞到上边界时
        if( _bird['y'] < _topY){
            _bird['y']=_topY;
            _v=0;
        }
        _bird['y'] = _bird['y'] + _v * timespan / 1000;
        _v = _v + _g * _pixpermile * timespan / 1000;

    };

    var calculateObstacle=function(timespan){
        if (_bird['isdead'] == 1)
            return;
        for(var i=0,l=_obstacle.length;i<l;i++){
            _obstacle[i]['x']=_obstacle[i]['x']-_backgroundv*timespan/1000;
        }
        init_obstacle();
    };
    
    var calculateGroundGrass=function(timespan){
    	if (_bird['isdead'] == 1)
            return;
        for(var i=0,l=_grass.length;i<l;i++){
            _grass[i]['x']=_grass[i]['x']-_backgroundv*timespan/1000*0.5;
        }
        initGroundGrass();
    }


    var calculateYun=function(timespan){
    	if (_bird['isdead'] == 1)
            return;
        for(var i=0,l=_yun.length;i<l;i++){
            _yun[i]['x']=_yun[i]['x']-_backgroundv*timespan/1000/20;
        }
        initYun();
    }

    //检查鸟的状态，有没有碰上柱子或者地板
    var checkBirdState=function(){
        for(var i=0,l=_obstacle.length;i<l;i++){
            if(_obstacle[i]['x']<=_bird['x']+_bird['width'] && _obstacle[i]['x']+_obstacle_width>_bird['x']){
                if(_bird['y']<=_obstacle[i]['y'] || _bird['y']+_bird['height']>=_obstacle[i]['y']+_obstacle_height){
                    _bird['isdead']=1;
                    return;
                }
            }
        }
    };
    //初始化障碍物
    var init_obstacle=function(){
        if(_obstacle.length>0 && _obstacle[0]['x']+_obstacle_width<0){
            _obstacle.shift();
        }
        while(_obstacle.length<_show_obstacle_num){
            if(_obstacle.length==0){
                _obstacle.push({'x':_obstacle_x,'y':parseInt(Math.random()*(250-50+1)+50)});
            }else{
                _obstacle.push({'x':_obstacle[_obstacle.length-1]['x']+_obstacle_distance,'y':parseInt(Math.random()*(250-50+1)+50)});
            }
        }
    };

    var initGroundGrass=function(){
    	if(_grass.length>0 && _grass[0]['x']+_grass_unit_width<0){
            _grass.shift();
        }
        while(_grass.length<Math.ceil(_canvas_width/_grass_unit_width)+1){
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
        while(_yun.length<Math.ceil(_canvas_width/_yun_unit_width)+1){
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
        
        drawBird();

    };
    //画出帧数字
    var drawFrame = function() {
        _first_canvas_context.fillStyle = "#00f";
        _first_canvas_context.font = "italic 16px sans-serif";
        _first_canvas_context.textBaseline = "top";
        _first_canvas_context.fillText(Math.floor(1000 / _timespan), 0, 0);
    };
    //画障碍物
    var drawFirstLayoutBackground=function(){
        _obstacle_canvas_context.fillStyle='#000';
        for(var i=0,l=_obstacle.length;i<l;i++){
            _obstacle_canvas_context.drawImage(_obstacle_image,170,50,50,340, _obstacle[i]['x'],_topY,_obstacle_width,_obstacle[i]['y']-_topY);
            _obstacle_canvas_context.drawImage(_obstacle_image,170,30,50,340,_obstacle[i]['x'],_obstacle[i]['y']+_obstacle_height,_obstacle_width,_groundY-_obstacle[i]['y']+_obstacle_height);
        }
    }
    //画草地
    var drawGroundGrass=function(){
    	for(var i=0,l=_grass.length;i<l;i++){
    		_ground_canvas_context.drawImage(_source_image,10,445,993,144, _grass[i]['x'],_groundY- 50, _grass_unit_width, 50);
    	}
    }
    //画天空
    var drawSky=function(){
    	_sky_canvas_context.drawImage(_sky_image,0,0,_canvas_width,_canvas_height);
    }
    //画云
    var drawYun=function(){
    	for(var i=0,l=_grass.length;i<l;i++){
    		_sky_canvas_context.drawImage(_source_image,12,103,952,300, _yun[i]['x'],10, _yun_unit_width, 300);
    	}
    }
    //画出鸟
    var drawBird = function() {
        if (_bird['isdead'] == 1) {
            _first_canvas_context.drawImage(_source_image,0,0,94,80, _bird['x'], _bird['y'], _bird['width'], _bird['height']);
            return;
        }
        var time = new Date();
        if (time.getMilliseconds() % 500 < 250) {
            _first_canvas_context.drawImage(_source_image,0,0,94,80, _bird['x'], _bird['y'], _bird['width'], _bird['height']);
        } else {
            _first_canvas_context.drawImage(_source_image,94,0,94,80, _bird['x'], _bird['y'], _bird['width'], _bird['height']);
        }
    };
    //绑定空格键到窗口上
    var bindKey = function() {
        $(window).bind('keyup', function(event) {
            if (event.keyCode == 32) {
                if (_bird['isdead'] != 1){
                    _v = -500;
                }
            }
        });
    };

    //设置canvas属性
    var setCanvas=function(canvas){
        canvas=document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.left = 0;
        canvas.style.top = 0;
        canvas.height = _canvas_width;
        canvas.width = _canvas_height;
        return canvas;
    }

    _flappybird = document.getElementById('flappybird');

    _first_canvas =setCanvas(_first_canvas);
    _obstacle_canvas = setCanvas(_obstacle_canvas);
    _ground_canvas=setCanvas(_ground_canvas);
	_sky_canvas=setCanvas(_sky_canvas);
	_yun_canvas=setCanvas(_yun_canvas);
    //资源图片
    _source_image.src='./sucai.png';
    _sky_image.src='./tian.jpg';
    _obstacle_image.src='./zhuzi.png';
    
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