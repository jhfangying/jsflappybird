var FlappyBird=function(canvas){
	var _context;
	var _canvas;
	var _time;
	var _v=0;//前景速度 单位px/s
	var _g=9.8;//重力加速度
	var _pixpermile=80;// 每米长度像但与多少像素，真实比例是4202像素等于1米
	var _date=new Date();
	var _timespan;
	var _data={'x':10,'y':10,'width':20,'height':20};
	var _render=function(){
		var now=new Date();
		_timespan=now-_date;


		_date=now;
		calculateObj(_timespan);
		_canvas.width=_canvas.width;
		drawCanvas();


		window.requestAnimationFrame(_render);
	};
	var calculateObj=function(timespan){

		_data['y']=_data['y']+(_g*_pixpermile*timespan/1000*timespan*_g*_pixpermile*timespan/1000*timespan-_v*_v)/2*_g*_pixpermile;//+0.5*_g*(timespan/1000*timespan/1000);
		 _v=_v+_g*_pixpermile*timespan/1000;
	}
	
	// var calculateSpeed=function(timespan){

	// }

	var drawCanvas=function(){
		_context.fillStyle='#000';
		_context.fillRect(_data['x'],_data['y'],_data['width'],_data['height']);
	}
	_canvas=document.getElementById('flappybird1');
	_context=_canvas.getContext("2d");
	_render();
};