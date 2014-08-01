var exec = require('child_process').exec
  , Promise = require('promise')

 
/**
 * 
 * exec a command to play a sound
 *
 * the system must support mpg321 command
 *
 */
var playWithMpg321 = function( path  ){
	return new Promise(function(resolve,rejected){
		console.log( 'start play ' + path )
		exec('mpg321 '+path , function( error, stdout , stderr ){
			if(!error)
				resolve()

			console.log( 'stop play ' + path )
			resolve()
		})
		
	})
}

// exec promise after promise until there is no promise in the queue
var chainPromise = (function(){
	var queue = [];
	var running = false;

	// this function return a promise which do nothing but resolve when the queu is empty
	// when its not, grab the first-in item in the queu and execute the function
	// when the function is finished ( after resolve if it's a promise, right after else ), chain another p function and when it finish resolve
	var p = function( ){
		running = true
		return new Promise(function(resolve,reject){

			// is the queu empty?
			if( !queue.length ){
				// yes, resolve, and stop running
				running = false
				return resolve()
			}

			// there are yet another tasks
			var fn = queue.shift()

			// start executing the promise
			var res = fn();

			// if the result is then-able
			if( res.then )

				// chain another p to the end of the fn, and resolve this promise at the end
				res
				.then( p )
				.then( resolve )

			else

				// if the result is not then-able, call another p and resolve this promise at the end
				p()
				.then( resolve )
		})
	}

	return function( fn ){
		queue.push( fn )

		if( !running )
			p()
	}
})()


/**
 * 
 * play the sound specified by path,
 * 
 * if a sound is already playing, wait for the end and play it
 *
 */
var play = function( path ){
	console.log( "queu "+ path )
	chainPromise( function(){ return playWithMpg321( path ) } );
}

module.exports = { 
	play : play
}
