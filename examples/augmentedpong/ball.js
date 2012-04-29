var Ball	= function(){
	var angle	= Math.random()*Math.PI*2;
	this._velocityX	= Math.cos(angle)*0.03;
	this._velocityY	= Math.sin(angle)*0.03;

	this._object3d	= tQuery.createSphere().addTo(world).scaleBy(ballRadius);
}


Ball.prototype.destroy	= function(){
}

Ball.prototype.update	= function(){
	var position	= this._object3d.get(0).position;
	// update position
	position.x	+= this._velocityX;	
	position.y	+= this._velocityY;

	// bounce the ball if it reach the border
	if( position.x < -fieldW/2 )	this._velocityX	*= -1;
	if( position.x > +fieldW/2 )	this._velocityX	*= -1;
	if( position.y < -fieldH/2 )	this._velocityY	*= -1;
	if( position.y > +fieldH/2 )	this._velocityY	*= -1;
	
	// get the boundaries
	position.x	= Math.max(position.x, -fieldW/2);
	position.x	= Math.min(position.x, +fieldW/2);
	position.y	= Math.max(position.y, -fieldH/2);
	position.y	= Math.min(position.y, +fieldH/2);
	
	['right', 'left'].forEach(function(playerId){
		var object3d	= players[playerId].object3d;
		var racketX	= object3d.get(0).position.x;
		var racketY	= object3d.get(0).position.y;
		var mayHitLeft	= (position.x+ballRadius/2) >= (racketX-racketW/2);
		var mayHitRight	= (position.x-ballRadius/2) <= (racketX+racketW/2);
		var mayHitTop	= (position.y+ballRadius/2) >= (racketY-racketH/2);
		var mayHitBottom= (position.y-ballRadius/2) <= (racketY+racketH/2);
		if( mayHitLeft && mayHitRight && mayHitTop && mayHitBottom ){
			this._velocityX	*= -1;
			var deltaX	= racketW/2 + ballRadius/2;
			position.x	= racketX + (playerId === 'right'? -deltaX : +deltaX);
		}		
	}.bind(this));
}