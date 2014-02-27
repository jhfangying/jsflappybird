var FlappyBird = function(canvas) {

    //所有信息所在html标签
    var _flappybird;
    //鸟画布
    var _first_canvas;
    //障碍物画布
    var _obstacle_canvas;
    //鸟画布内容
    var _first_canvas_context;
    //障碍物画布内容
    var _obstacle_canvas_context;

    var _time;
    //鸟动作图1
    var _birdimage1 = new Image();
    //鸟动作图2
    var _birdimage2 = new Image();
    var _topY=0;
    var _groundY = 1000;
    var _v = 0;//小鸟初始速度 单位px/s
    var _backgroundv=80;
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
    //显示画布内容
    var _render = function() {
        var now = new Date();
        _timespan = now - _date;
        _date = now;
        checkBirdState();
        calculateBird(_timespan);
        calculateObstacle(_timespan);
        
        resetCanvas();
        drawCanvas();
        window.requestAnimationFrame(_render);
    };
    //重置画布内容
    var resetCanvas = function() {
        _first_canvas_context.clearRect(0, 0, _first_canvas.width, _first_canvas.height);
        _obstacle_canvas_context.clearRect(0, 0, _first_canvas.width, _first_canvas.height);
    };
    
    //计算鸟的坐标
    var calculateBird = function(timespan) {
        if (_bird['isdead'] == 1 && _bird['y'] >= _groundY - _bird['height']){
            return;
        }
        // if(_bird['isdead'] == 1 && _bird['y'] < _groundY - _bird['height']){


        // }  


        if (_bird['isdead'] == 2 && _bird['y'] >= _groundY - _bird['height']) {
            _bird['y'] = _groundY - _bird['height'];
            _bird['isdead'] = 1;
            return;
        };
        _bird['y'] = _bird['y'] + _v * timespan / 1000;//(_g*_pixpermile*timespan/1000*timespan*_g*_pixpermile*timespan/1000*timespan-_v*_v)/2*_g*_pixpermile;//+0.5*_g*(timespan/1000*timespan/1000);
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
                _obstacle.push({'x':_obstacle_x,'y':parseInt(Math.random()*(700-200+1)+200)});
            }else{
                _obstacle.push({'x':_obstacle[_obstacle.length-1]['x']+_obstacle_distance,'y':parseInt(Math.random()*(800-100+1)+100)});
            }
        }
    };
    //画出画布内容,从后往前画
    var drawCanvas = function() {
        drawFirstLayoutBackground();

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
    var drawFirstLayoutBackground=function(){
        _obstacle_canvas_context.fillStyle='#000';
        for(var i=0,l=_obstacle.length;i<l;i++){
            _obstacle_canvas_context.fillRect(_obstacle[i]['x'],_topY,_obstacle_width,_obstacle[i]['y']-_topY);
            _obstacle_canvas_context.fillRect(_obstacle[i]['x'],_obstacle[i]['y']+_obstacle_height,_obstacle_width,_groundY-_obstacle[i]['y']+_obstacle_height);
        }
    }
    //画出鸟
    var drawBird = function() {
        if (_bird['isdead'] == 1) {
            _first_canvas_context.drawImage(_birdimage1, _bird['x'], _bird['y'], _bird['width'], _bird['height']);
            return;
        }
        var time = new Date();
        if (time.getMilliseconds() % 500 < 250) {
            _first_canvas_context.drawImage(_birdimage1, _bird['x'], _bird['y'], _bird['width'], _bird['height']);
        } else {
            _first_canvas_context.drawImage(_birdimage2, _bird['x'], _bird['y'], _bird['width'], _bird['height']);
        }
    };
    var drawObstacle=function(){
        
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
    var _canvas_width = 1000;
    var _canvas_height = 1000;
    _flappybird = document.getElementById('flappybird');

    _first_canvas = document.createElement('canvas');

    _obstacle_canvas = document.createElement('canvas');
    _first_canvas.style.position = 'absolute';
    _first_canvas.style.left = 0;
    _first_canvas.style.top = 0;
    _first_canvas.height = _canvas_width;
    _first_canvas.width = _canvas_height;

    _obstacle_canvas.style.position = 'absolute';
    _obstacle_canvas.style.left = 0;
    _obstacle_canvas.style.top = 0;
    _obstacle_canvas.height = _canvas_width;
    _obstacle_canvas.width = _canvas_height;

    _birdimage1.src = './wuya.png';
    _birdimage2.src = './mifeng.png';

    _flappybird.appendChild(_obstacle_canvas);
    _flappybird.appendChild(_first_canvas);

    _obstacle_canvas_context = _obstacle_canvas.getContext("2d");
    _first_canvas_context = _first_canvas.getContext("2d");


    bindKey();
    _render();
};