// # MD2Character
// This is annoted source of the examples for ```tQuery.MD2Character``` plugin.
// The live demo can be found [here](../)
 
// ## The 3D World

// First we initialize the world in 3D.
// With ```tQuery.createWorld()```, we create a ```tQuery.World```.
// With ```.boilerplate()```, we setup a boilerplate on this world. A boilerplate is
// a fast way to get you started on the right foot. It is the [learningthreejs
// boilerplate for three.js](http://learningthreejs.com/blog/2011/12/20/boilerplate-for-three-js/)
// With ```.start()```, we start the rendering loop. So from now on, the world scene
// gonna be rendered periodically, typically 60time per seconds.
var world	= tQuery.createWorld().boilerplate().start();

// remove the camera control
world.removeCameraControls()

world.camera().position.set(0,1.5, 4);
world.camera().lookAt(new THREE.Vector3(0,1,-1));

// Change the background color. This confusing line ensure the background of the
// 3D scene will be rendered as ```0x000000``` color, aka black. We set a black
// background to give an impression of night.
world.renderer().setClearColorHex( 0x000000, world.renderer().getClearAlpha() );

// ## The Lights 

// Here we setup the lights of our scene. This is important as it determine how
// your scene looks. We add a ambient light and 2 directional lights.
// The ambient light is a dark grey, to simulate the lack of light during the night.
// We setup a directional light in front colored redish.... This is like a setting sun.
// In the opposite direction, we put another direction light, bluish. This is like
// the moon. Well this was my rational :)
tQuery.createAmbientLight().addTo(world).color(0x444444);
tQuery.createDirectionalLight().addTo(world).position(-1,1,1).color(0xFF88BB).intensity(3);
tQuery.createDirectionalLight().addTo(world).position( 1,1,-1).color(0x4444FF).intensity(2);


// # The Ground

// We create a large checkerboard with ```tquery.checkerboard.js``` plugin.
// We scale the checkerboard to 100 per 100 units in the 3D world. Thus it is
// quite large and disappears into the fog. It gives the cheap impression of
// an infinite checkerboard.
tQuery.createCheckerboard({
	segmentsW	: 100,	// number of segment in width
	segmentsH	: 100	// number of segment in Height
}).addTo(world).scaleBy(100);

// # The Character 

// We use ```tQuery.RatamahattaMD2Character``` plugin. Its inherits from
// ```tQuery.MD2Character``` plugin. All the configuration for this particular
// character ```ratamahatta``` is already done for you.
// We attach it to tQuery world.
var character	= new tQuery.RatamahattaMD2Character().attach(world);

// When an animation is completed, switch to animation
character.bind('animationCompleted', function(character, animationName){
	console.log("anim completed", animationName);
	this.animation('stand');
});




// init augmenter gesture
var aGesture	= new AugmentedGesture().enableDatGui().start().domElementThumbnail();

//
// handle the right pointer
//
var pointerId	= "right";
var pointerOpts	= new AugmentedGesture.OptionPointer();
pointerOpts.pointer.crossColor	= {r:    0, g: 255, b:   0};
pointerOpts.colorFilter.r	= {min:   0, max:  95};
pointerOpts.colorFilter.g	= {min: 115, max: 255};
pointerOpts.colorFilter.b	= {min:  25, max: 150};
aGesture.addPointer(pointerId, pointerOpts);

//
// handle the left pointer
//
var pointerId	= "left";
var pointerOpts	= new AugmentedGesture.OptionPointer();
pointerOpts.pointer.crossColor	= {r:    255, g:   0, b: 128};
pointerOpts.colorFilter.r	= {min: 190, max: 255};
pointerOpts.colorFilter.g	= {min:  30, max: 255};
pointerOpts.colorFilter.b	= {min:   0, max: 100};
aGesture.addPointer(pointerId, pointerOpts);

// handle the state automata to guess guesture from pointers
var userPosition	= {
	punchRight	: false,
	punchLeft	: false,
	needUpdate	: false
};
aGesture.bind("mousemove.left", function(event){
	var state	= event.x > 1 - 1/3;
	if( state === userPosition.punchLeft )	return;
	userPosition.punchLeft	= state;
	userPosition.needUpdate	= true;
});
aGesture.bind("mousemove.right", function(event){
	var state	= event.x < 1/3;
	if( state === userPosition.punchRight )	return;
	userPosition.punchRight	= state;
	userPosition.needUpdate	= true;
});
world.loop().hook(function(){
	if( userPosition.needUpdate === false )	return;
	userPosition.needUpdate = false;
	if( userPosition.punchRight ){
		// action to do when there is punchRight
		character.animation('crdeath');
		character.setSkin(Math.floor(Math.random()*5 % 5));
	}else if( userPosition.punchLeft ){
		// action to do when there is punchLeft
		character.animation('crpain');
		character.setWeapon(Math.floor(Math.random()*11 % 11));
	}
});



