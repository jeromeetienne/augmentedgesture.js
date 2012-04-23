//////////////////////////////////////////////////////////////////////////////////
//		Augmented gesture						//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Constructor
*/
AugmentedGesture	= function(opts){
	this._opts	= opts || new AugmentedGesture.Options();
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
// TODO should that be elsewhere ?						//
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
//										//
//////////////////////////////////////////////////////////////////////////////////

AugmentedGesture.Options	= function(){
	this.general	= {
		video	: {
			w		: 320/4,
			h		: 240/4,
			frameRate	: 1
		}
	};
	this.pointers	= {};
	this.pointers['right']	= {
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
				min	: 151,
				max	: 255
			},
			g	: {
				min	: 0,
				max	: 255
			},
			b	: {
				min	:  0,
				max	:  90
			}
		},
		smooth	: {
			vWidth	: 9,
			hWidth	: 9
		}
	};
	this.pointers['left']	= {
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
				max	:  90
			},
			g	: {
				min	: 120,
				max	: 255
			},
			b	: {
				min	:  20,
				max	: 255
			}
		},
		smooth	: {
			vWidth	: 9,
			hWidth	: 9
		}
	};
};

AugmentedGesture.prototype.enableDatGui	= function(){
	var guiOpts	= this._opts;
	// to add a pointer to guiOpts
	function addGuiPointer(gui, pointerId){
		var pointerOpts	= guiOpts.pointers[pointerId];
		var mainFolder	= gui.addFolder("Pointer: "+pointerId);
		// pointer folder
		mainFolder.add(pointerOpts.pointer	, 'display');
		mainFolder.add(pointerOpts.pointer	, 'coordSmoothV', 0, 1);
		mainFolder.add(pointerOpts.pointer	, 'coordSmoothH', 0, 1);
		// Right folder
		var folder	= mainFolder.addFolder('Display');
		//folder.open();
		folder.add(pointerOpts.disp	, 'enable');
		folder.add(pointerOpts.disp	, 'HHist');
		folder.add(pointerOpts.disp	, 'VHist');
		folder.add(pointerOpts.disp	, 'HLine');
		folder.add(pointerOpts.disp	, 'VLine');
		// Threshold folder
		var folder	= mainFolder.addFolder('Threshold');
		//folder.open();
		folder.add(pointerOpts.colorFilter.r	, 'min', 0, 255).name('red min');
		folder.add(pointerOpts.colorFilter.r	, 'max', 0, 255).name('red max');
		folder.add(pointerOpts.colorFilter.g	, 'min', 0, 255).name('green min');
		folder.add(pointerOpts.colorFilter.g	, 'max', 0, 255).name('green max');
		folder.add(pointerOpts.colorFilter.b	, 'min', 0, 255).name('blue min');
		folder.add(pointerOpts.colorFilter.b	, 'max', 0, 255).name('blue max');
		folder.add(pointerOpts.smooth		, 'hWidth', 0, 20).step(1);
		folder.add(pointerOpts.smooth		, 'vWidth', 0, 20).step(1);
	}
	// wait for the page to load before initializing it
	window.addEventListener('load', function(){
		var gui		= new dat.GUI();
		// General folder
		var folder	= gui.addFolder('General');
		//folder.open();
		folder.add(guiOpts.general.video, 'w', 0, 320).step(40).name('videoW');
		folder.add(guiOpts.general.video, 'h', 0, 240).step(30).name('videoH');
		folder.add(guiOpts.general.video, 'frameRate', 1, 30).step(1);

		// add 2 pointers
		addGuiPointer(gui, 'right');
		addGuiPointer(gui, 'left');
		// try to save value but doesnt work
		//gui.remember(guiOpts);		
	});
	return this;	// for chained API
};

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
	var guiOpts	= this._opts;
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


	function processImageToPointer(pointerId){
		var tmpImgData	= ImgProc.duplicate(imageData, ctx);
		var pointerOpts	= guiOpts.pointers[pointerId];
		ImgProc.threshold(tmpImgData, pointerOpts.colorFilter.r, pointerOpts.colorFilter.g, pointerOpts.colorFilter.b);
		if( pointerOpts.disp.enable )	imageData	= tmpImgData;
		// horizontal coord X discovery
		var hist	= ImgProc.computeVerticalHistogram(tmpImgData, function(p, i){
			return p[i+1] !== 0 ? true : false;
		});
		ImgProc.windowedAverageHistogram(hist, pointerOpts.smooth.vWidth);
		var maxVRight	= ImgProc.getMaxHistogram(hist);
		if( pointerOpts.disp.VHist )	ImgProc.displayVerticalHistogram(imageData, hist);
		// horizontal coord Y discovery
		var hist	= ImgProc.computeHorizontalHistogram(tmpImgData, function(p, i){
			return p[i+1] !== 0 ? true : false;
		});
		ImgProc.windowedAverageHistogram(hist, pointerOpts.smooth.hWidth);
		var maxHRight	= ImgProc.getMaxHistogram(hist);
		if( pointerOpts.disp.HHist )	ImgProc.displayHorizontalHistogram(imageData, hist);
	
		return {
			maxH	: maxHRight,
			maxV	: maxVRight
		};
	}

// Right
	var pointerId	= 'right';
	var pointerLoc	= processImageToPointer(pointerId)
	var maxHRight	= pointerLoc.maxH;
	var maxVRight	= pointerLoc.maxV;

// Left
	var pointerId	= 'left';
	var pointerLoc	= processImageToPointer(pointerId)
	var maxHLeft	= pointerLoc.maxH;
	var maxVLeft	= pointerLoc.maxV;
	
// Display Crosses
	// right
	var pointerId	= 'right';
	var pointerOpts	= guiOpts.pointers[pointerId];
	if( pointerOpts.disp.VLine )	ImgProc.vline(imageData, maxVRight.idx, 0, 0, 255);
	if( pointerOpts.disp.HLine )	ImgProc.hline(imageData, maxHRight.idx, 0, 0, 255);
	// left
	var pointerId	= 'left';
	var pointerOpts	= guiOpts.pointers[pointerId];
	if( pointerOpts.disp.VLine )	ImgProc.vline(imageData, maxVLeft.idx, 0, 255, 0);
	if( pointerOpts.disp.HLine )	ImgProc.hline(imageData, maxHLeft.idx, 0, 255, 0);

// pointer Right
/*
 * Note on makeing the pointer not always valid
 * - what about the follow algo
 * - if maxVRight.max < guiOpts.pointers['right'].threshold.minVhist then maxVRight.idx is invalid
 * - if maxHRight.max < guiOpts.pointers['right'].threshold.minHhist then maxHRight.idx is invalid
 * - ok but what to do when one is invalid ?
 *   - do i invalid the pointer all together ?
 *   - when pointer is invalid how to put it back
*/
/**
 * what if i do
 * - if maxVRight.max < guiOpts.pointers['right'].threshold.minVhist then pointerR === null
 * - if >= and pointerR then normal update
 * - if >= and pointerR === null then jump direction to maxVRight position
 * - trigger event for pointerUp pointerDown, pointerMove
*/

/**
 * Once you got that you can do $1 gesture recognition
*/
	var pointerId	= 'right';
	var pointerPos	= this._pointerR;
	var pointerOpts	= guiOpts.pointers[pointerId];
	pointerPos.x	+= (maxVRight.idx - pointerPos.x) * pointerOpts.pointer.coordSmoothV;
	pointerPos.y	+= (maxHRight.idx - pointerPos.y) * pointerOpts.pointer.coordSmoothH;
	if( pointerOpts.pointer.display ){
		ImgProc.vline(imageData, Math.floor(pointerPos.x), 255, 0, 255);
		ImgProc.hline(imageData, Math.floor(pointerPos.y), 255, 0, 255);
	}
// pointer Left
	var pointerId	= 'left';
	var pointerPos	= this._pointerL;
	var pointerOpts	= guiOpts.pointers[pointerId];
	pointerPos.x	+= (maxVLeft.idx - pointerPos.x) * pointerOpts.pointer.coordSmoothV;
	pointerPos.y	+= (maxHLeft.idx - pointerPos.y) * pointerOpts.pointer.coordSmoothH;
	if( pointerOpts.pointer.display ){
		ImgProc.vline(imageData, Math.floor(pointerPos.x), 255, 0, 0);
		ImgProc.hline(imageData, Math.floor(pointerPos.y), 255, 0, 0);
	}

	// update the canvas
	ctx.putImageData(imageData, 0, 0);
	// notify the event
	this.trigger('update', this._pointerR, this._pointerL);
}

