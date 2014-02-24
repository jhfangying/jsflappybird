var FlappyBird=function(canvas){
	var _context;
	var _render=function(){
		if(typeof("canvas")==="string"){
			canvas=document.getElementById(canvas);
		}
		_context=canvas.getContext("2d");
		// alert(canvas);
	}
	_render();
};