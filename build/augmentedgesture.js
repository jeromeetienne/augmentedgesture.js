
//////////////////////////////////////////////////////////////////////////////////
//		Augmented gesture						//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Constructor
*/
AugmentedGesture	= function(){
	// init usermedia webcam
	// - TODO change this by a exception
	if( !AugmentedGesture.hasUserMedia )	alert('Panic: no UserMedia')
	console.assert( AugmentedGesture.hasUserMedia, "no usermedia available");
	this._video	= this._videoCtor();

	this._frameCount= 0;

	var canvas	= document.createElement('canvas');
	this._canvas	= canvas;
	canvas.width	= this._video.width	/4;
	canvas.height	= this._video.height	/4;
	
	// gesture recognition
	this._pointerR	= { x : canvas.width/2, y : canvas.height/2	};
	this._pointerL	= { x : canvas.width/2,	y : canvas.height/2	};
};

/**
 * Destructor
*/
AugmentedGesture.prototype.destroy	= function(){
	this.stop();
}

/**
 * equal to hasUserMedia
*/
AugmentedGesture.hasUserMedia	= navigator.webkitGetUserMedia ? true : false;

//////////////////////////////////////////////////////////////////////////////////
//		MicroEvent							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * microevents.js - https://github.com/jeromeetienne/microevent.js
*/
AugmentedGesture.MicroeventMixin	= function(destObj){
	destObj.bind	= function(event, fct){
		if(this._events === undefined) 	this._events	= {};
		this._events[event] = this._events[event]	|| [];
		this._events[event].push(fct);
		return fct;
	};
	destObj.unbind	= function(event, fct){
		if(this._events === undefined) 	this._events	= {};
		if( event in this._events === false  )	return;
		this._events[event].splice(this._events[event].indexOf(fct), 1);
	};
	destObj.trigger	= function(event /* , args... */){
		if(this._events === undefined) 	this._events	= {};
		if( this._events[event] === undefined )	return;
		var tmpArray	= this._events[event].slice(); 
		for(var i = 0; i < tmpArray.length; i++){
			tmpArray[i].apply(this, Array.prototype.slice.call(arguments, 1))
		}
	}
};

// make it eventable
AugmentedGesture.MicroeventMixin(AugmentedGesture.prototype);


//////////////////////////////////////////////////////////////////////////////////
//		Start/Stop							//
//////////////////////////////////////////////////////////////////////////////////

AugmentedGesture.prototype.start	= function(){
	// define the callback
	var updateFn	 = function(){
		this._reqAnimId	= requestAnimationFrame(updateFn);
		this._update();
	}.bind(this);
	// initiate the looping
	updateFn();
	// for chained api
	return this;
}

AugmentedGesture.prototype.stop	= function(){
	cancelAnimationFrame(this._reqAnimId);
	// for chained api
	return this;
};

//////////////////////////////////////////////////////////////////////////////////
//		domElement injecter						//
//////////////////////////////////////////////////////////////////////////////////

/**
 * put the .domElement() fullpage
 * Usefull as feedback to the user
*/
AugmentedGesture.prototype.domElementFullpage	= function(){
	// get domElement
	var domElement	= this.domElement();
	// add it to the body
	document.body.appendChild(domElement);
	// set the style
	domElement.style.position	= 'absolute';
	domElement.style.top		= '0px';
	domElement.style.left		= '0px';
	domElement.style.width		= "100%";
	domElement.style.height		= "100%";
	// for chained API
	return this;
}

/**
 * put the .domElement() as thumbnail.
 * Usefull as feedback to the user
*/
AugmentedGesture.prototype.domElementThumbnail	= function(){
	// get domElement
	var domElement	= this.domElement();
	// add it to the body
	document.body.appendChild(domElement);
	// set the style
	domElement.style.position	= 'absolute';
	domElement.style.top		= '0px';
	domElement.style.left		= '0px';
	domElement.style.width		= "320px";
	domElement.style.height		= "240px";		
	// for chained API
	return this;
}

/**
 * Remove the domElement from the DOM if it is attached
*/
AugmentedGesture.prototype.domElementRemove	= function(){
	// get domElement
	var domElement	= this.domElement();
	// remove domElement from its parent if needed
	domElement.parentNode && domElement.parentNode.removeChild(domElement);
	// for chained API
	return this;
}

//////////////////////////////////////////////////////////////////////////////////
//		Getter								//
//////////////////////////////////////////////////////////////////////////////////

AugmentedGesture.prototype.domElement	= function(){
	return this._canvas;
}

AugmentedGesture.prototype.pointerR	= function(){
	return this._pointerR;
}

AugmentedGesture.prototype.pointerL	= function(){
	return this._pointerL;
}

//////////////////////////////////////////////////////////////////////////////////
//										//
//////////////////////////////////////////////////////////////////////////////////

AugmentedGesture.prototype._videoCtor	= function(){
	var video	= document.createElement('video');
	video.width	= 320;
	video.height	= 240;
	video.autoplay	= true;
	navigator.webkitGetUserMedia('video', function(stream){
		video.src	= webkitURL.createObjectURL(stream);
		//console.log("pseudo object URL", video.src);
	}, function(error){
		alert('you got no WebRTC webcam');
	});
	return video;
}

/**
 * When the video update
*/
AugmentedGesture.prototype._update	= function()
{
	var canvas	= this._canvas;
	var ctx		= canvas.getContext("2d");
	// rate limiter
	this._frameCount++;
	if( this._frameCount % guiOpts.general.video.frameRate !== 0 )	return;

	// if no data is ready, do nothing
	if( this._video.readyState !== this._video.HAVE_ENOUGH_DATA )	return;
	
	// update canvas size if needed
	if( canvas.width != guiOpts.general.video.w )	canvas.width	= guiOpts.general.video.w;
	if( canvas.height != guiOpts.general.video.h )	canvas.height	= guiOpts.general.video.h;
	
	// draw video into a canvas2D
	ctx.drawImage(this._video, 0, 0, canvas.width, canvas.height);

	var imageData	= ctx.getImageData(0,0, canvas.width, canvas.height);

	// flip horizontal 
	ImgProc.fliph(imageData);
	//ImgProc.luminance(imageData);

// Right
	var rightData	= ImgProc.duplicate(imageData, ctx);
	ImgProc.threshold(rightData, guiOpts.right.colorFilter.r, guiOpts.right.colorFilter.g, guiOpts.right.colorFilter.b);
	if( guiOpts.right.disp.enable )	imageData	= rightData;
	// horizontal coord X discovery
	var hist	= ImgProc.computeVerticalHistogram(rightData, function(p, i){
		return p[i+1] !== 0 ? true : false;
	});
	ImgProc.windowedAverageHistogram(hist, guiOpts.right.smooth.vWidth);
	var maxVRight	= ImgProc.getMaxHistogram(hist);
	if( guiOpts.right.disp.VHist )	ImgProc.displayVerticalHistogram(imageData, hist);
	// horizontal coord Y discovery
	var hist	= ImgProc.computeHorizontalHistogram(rightData, function(p, i){
		return p[i+1] !== 0 ? true : false;
	});
	ImgProc.windowedAverageHistogram(hist, guiOpts.right.smooth.hWidth);
	var maxHRight	= ImgProc.getMaxHistogram(hist);
	if( guiOpts.right.disp.HHist )	ImgProc.displayHorizontalHistogram(imageData, hist);
	
// Left
	var leftData	= ImgProc.duplicate(imageData, ctx);
	ImgProc.threshold(leftData, guiOpts.left.colorFilter.r, guiOpts.left.colorFilter.g, guiOpts.left.colorFilter.b);
	if( guiOpts.left.disp.enable )	imageData	= leftData;
	// horizontal coord X discovery
	var hist	= ImgProc.computeVerticalHistogram(leftData, function(p, i){
		return p[i+1] !== 0 ? true : false;
	});
	ImgProc.windowedAverageHistogram(hist, guiOpts.left.smooth.vWidth);
	var maxVLeft	= ImgProc.getMaxHistogram(hist);
	if( guiOpts.left.disp.VHist )	ImgProc.displayVerticalHistogram(imageData, hist);
	// horizontal coord Y discovery
	var hist	= ImgProc.computeHorizontalHistogram(leftData, function(p, i){
		return p[i+1] !== 0 ? true : false;
	});
	ImgProc.windowedAverageHistogram(hist, guiOpts.left.smooth.hWidth);
	var maxHLeft	= ImgProc.getMaxHistogram(hist);
	if( guiOpts.left.disp.HHist )	ImgProc.displayHorizontalHistogram(imageData, hist);
	
// Display Crosses
	// right
	if( guiOpts.right.disp.VLine )	ImgProc.vline(imageData, maxVRight.idx, 0, 0, 255);
	if( guiOpts.right.disp.HLine )	ImgProc.hline(imageData, maxHRight.idx, 0, 0, 255);
	// left
	if( guiOpts.left.disp.VLine )	ImgProc.vline(imageData, maxVLeft.idx, 0, 255, 0);
	if( guiOpts.left.disp.HLine )	ImgProc.hline(imageData, maxHLeft.idx, 0, 255, 0);

// pointer Right
	var pointerR	= this._pointerR;
	pointerR.x	+= (maxVRight.idx - pointerR.x) * guiOpts.right.pointer.coordSmoothV;
	pointerR.y	+= (maxHRight.idx - pointerR.y) * guiOpts.right.pointer.coordSmoothH;
	if( guiOpts.right.pointer.display ){
		ImgProc.vline(imageData, Math.floor(pointerR.x), 255, 0, 255);
		ImgProc.hline(imageData, Math.floor(pointerR.y), 255, 0, 255);
	}
// pointer Left
	var pointerL	= this._pointerL;
	pointerL.x	+= (maxVLeft.idx - pointerL.x) * guiOpts.left.pointer.coordSmoothV;
	pointerL.y	+= (maxHLeft.idx - pointerL.y) * guiOpts.left.pointer.coordSmoothH;
	if( guiOpts.left.pointer.display ){
		ImgProc.vline(imageData, Math.floor(pointerL.x), 255, 0, 0);
		ImgProc.hline(imageData, Math.floor(pointerL.y), 255, 0, 0);
	}

	// update the canvas
	ctx.putImageData(imageData, 0, 0);
	// notify the event
	this.trigger('update', pointerR, pointerL);
}

AugmentedGesture.GestureRecognition	= function(){
	this._lastEvent	= null;
};


AugmentedGesture.GestureRecognition.prototype.update	= function(x, y, areaW, areaH)
{
	var sectionW	= areaW/3;
	var sectionH	= areaH/3;

	var event	= null;
	if( x < 1*sectionW )		event	= 'left';
	else if( x < 2*sectionW )	event	= 'middle';
	else 				event	= 'right';

//console.log("x", x, "areaW", areaW, "sectionW", sectionW, "event", event)
	if( event === this._lastEvent ){
		event	= null;
	}else{
		this._lastEvent	= event;
	}
	return event;
}

var DatGuiOpts	= function(){
	this.general	= {
		video	: {
			w		: 320/4,
			h		: 240/4,
			frameRate	: 1
		}
	};
	this.right	= {
		pointer	: {
			display		: true,
			coordSmoothV	: 0.3,
			coordSmoothH	: 0.3
		},
		disp	: {
			enable	: false,
			VHist	: false,
			HHist	: false,
			VLine	: false,
			HLine	: false
		},
		colorFilter	: {
			r	: {
				min	: 125,
				max	: 255
			},
			g	: {
				min	:   3,
				max	: 140
			},
			b	: {
				min	:  10,
				max	:  90
			}
		},
		smooth	: {
			vWidth	: 9,
			hWidth	: 9
		}
	};
	this.left	= {
		pointer	: {
			display		: true,
			coordSmoothV	: 0.3,
			coordSmoothH	: 0.3
		},
		disp	: {
			enable	: false,
			VHist	: false,
			HHist	: false,
			VLine	: false,
			HLine	: false
		},
		colorFilter	: {
			r	: {
				min	:   0,
				max	:  80
			},
			g	: {
				min	:  70,
				max	: 255
			},
			b	: {
				min	:   0,
				max	: 113
			}
		},
		smooth	: {
			vWidth	: 9,
			hWidth	: 9
		}
	};
};

var guiOpts	= new DatGuiOpts();

window.addEventListener('load', function(){
	var gui		= new dat.GUI();
// General folder
	var folder	= gui.addFolder('General');
	//folder.open();
	folder.add(guiOpts.general.video, 'w', 0, 320).step(40).name('videoW');
	folder.add(guiOpts.general.video, 'h', 0, 240).step(30).name('videoH');
	folder.add(guiOpts.general.video, 'frameRate', 1, 30).step(1);

// Right pointer folder
	var folder	= gui.addFolder('Right Pointer');
	folder.add(guiOpts.right.pointer	, 'display');
	folder.add(guiOpts.right.pointer	, 'coordSmoothV', 0, 1);
	folder.add(guiOpts.right.pointer	, 'coordSmoothH', 0, 1);
// Right display folder
	var folder	= gui.addFolder('Right Display');
	//folder.open();
	folder.add(guiOpts.right.disp	, 'enable');
	folder.add(guiOpts.right.disp	, 'HHist');
	folder.add(guiOpts.right.disp	, 'VHist');
	folder.add(guiOpts.right.disp	, 'HLine');
	folder.add(guiOpts.right.disp	, 'VLine');
// Right Threshold folder
	var folder	= gui.addFolder('Right Threshold');
	//folder.open();
	folder.add(guiOpts.right.colorFilter.r	, 'min', 0, 255).name('red min');
	folder.add(guiOpts.right.colorFilter.r	, 'max', 0, 255).name('red max');
	folder.add(guiOpts.right.colorFilter.g	, 'min', 0, 255).name('green min');
	folder.add(guiOpts.right.colorFilter.g	, 'max', 0, 255).name('green max');
	folder.add(guiOpts.right.colorFilter.b	, 'min', 0, 255).name('blue min');
	folder.add(guiOpts.right.colorFilter.b	, 'max', 0, 255).name('blue max');
	folder.add(guiOpts.right.smooth		, 'hWidth', 0, 20).step(1);
	folder.add(guiOpts.right.smooth		, 'vWidth', 0, 20).step(1);

// Left pointer folder
	var folder	= gui.addFolder('Left Pointer');
	folder.add(guiOpts.left.pointer	, 'display');
	folder.add(guiOpts.left.pointer	, 'coordSmoothV', 0, 1);
	folder.add(guiOpts.left.pointer	, 'coordSmoothH', 0, 1);
// Left display folder
	var folder	= gui.addFolder('Left Display');
	//folder.open();
	folder.add(guiOpts.left.disp	, 'enable');
	folder.add(guiOpts.left.disp	, 'VHist');
	folder.add(guiOpts.left.disp	, 'HHist');
	folder.add(guiOpts.left.disp	, 'VLine');
	folder.add(guiOpts.left.disp	, 'HLine');
// Left Threshold folder
	var folder	= gui.addFolder('Left Threshold');
	//folder.open();
	folder.add(guiOpts.left.colorFilter.r	, 'min', 0, 255).name('red min');
	folder.add(guiOpts.left.colorFilter.r	, 'max', 0, 255).name('red max');
	folder.add(guiOpts.left.colorFilter.g	, 'min', 0, 255).name('green min');
	folder.add(guiOpts.left.colorFilter.g	, 'max', 0, 255).name('green max');
	folder.add(guiOpts.left.colorFilter.b	, 'min', 0, 255).name('blue min');
	folder.add(guiOpts.left.colorFilter.b	, 'max', 0, 255).name('blue max');
	folder.add(guiOpts.left.smooth		, 'vWidth', 0, 20).step(1);
	folder.add(guiOpts.left.smooth		, 'hWidth', 0, 20).step(1);

// try to save value but doesnt work
	//gui.remember(guiOpts);
});
