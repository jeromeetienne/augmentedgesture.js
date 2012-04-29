var Player	= function(){
	this._object3d	= tQuery.createCube().addTo(world).scale(0.25,1,0.5).scaleBy(0.5);
	this._object3d.translateX(1.3);
	
	this._playerW	= 0.25*0.5;
	this._playerH	= 1.00*0.5;

}