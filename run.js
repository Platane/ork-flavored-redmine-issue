var request = require("request")
  , Stream = require('stream').Stream
  , fs = require('fs')
  , audio = require('./soundPlayer')
  , loadSoundList = require('./loadSoundList')


//// load config

// analyze sounds folder
// grab the mp3 files and puts them in a list, sorted by directory
var soundTable = loadSoundList('./sounds')


// read config

// default config
var config = {
	url : 'http://www.redmine.org/issues.json',
	delay : 10000
}
// read
fs.readFile('./config.json', 'utf8', function (err,data) {
  
	try{
		if (err) 
			throw err
		config = JSON.parse( data )
	}catch( e ){
		console.log("unable to read the config.json file, default config will be used ["+ e +"]");
	} finally {

		console.log("config : " , config );

		// alter soundTable
		if( config.soundTable )
			for( var i in config.soundTable )
				if( soundTable[ config.soundTable[i] ] )
					soundTable[ i ] = soundTable[ config.soundTable[i] ]

		console.log( "soundTable : " , soundTable );


		// start the listen loop
        cycle()
    }
  
});


////////
// pipes

/**
 *
 * This pipe receive object issue in input
 * 
 * The issue that have changed since the last call will be passed as output
 */
var filterChangedIssue = (function(){

	var last

	return function( ){
		var stream = new Stream();
    	stream.writable = stream.readable = true

    	var now = {}

    	stream.destroy = function(){
    		last = now
    		this.emit('close')
    	};

    	stream.write = function( issue ){
    		now[ issue.id ] = issue.status.name

    		if( last && issue.status.name != last[ issue.id ] )
    			this.emit('data' , { 
    				issue : issue , 
    				newState : issue.status.name , 
    				lastState : last[ issue.id ] ,
    				name : issue.subject
    			})
    	};

    	stream.end = function( issue ){
    		
    		// check is an issue was present in the last cycle, and not in this one
    		if( last )
    			for( var id in last )
    				if( !now[ id ] )
    					this.emit('data' , { 
		    				issue : {id:id} , 
		    				name : '',
		    				newState : 'Closed' , 
		    				lastState : last[ id ] 
	    				})

    		last = now;

    		this.emit('end')
    	};

    	return stream
	}
})();

/**
 *
 * This pipe receive bit of a Json string representing the issues
 * 
 * The issue object will be passed one by one as output
 */
var extractIssues = function( ){
	var stream = new Stream();
	stream.writable = stream.readable = true

	var buffer = ""

	stream.destroy = function(){ this.emit('close') };

	stream.write = function( data ){
		buffer += data.toString('utf8')
	};

	stream.end = function( ){
		try{
			var issues = JSON.parse( buffer ).issues

			if( !issues )
				throw new Error("issues can not be find in the json")

		}catch( e ){
			return this.emit( 'error' , e )
		}

		for(var i=0,l=issues.length;i<l;i++)
			this.emit('data', issues[i] );

		this.emit('end')
	};

	return stream
}

/**
 *
 * This pipe receive object which represent the issue in input
 * 
 * It trigger a sound based on the status of the issue
 */
var playSound = function( soundTable ){
	var stream = new Stream();
	stream.writable = stream.readable = true

	stream.destroy = function(){ this.emit('close') };

	stream.write = function( issue ){

		// play a sound associated to the issue
		var set
		if( !(set=soundTable[ issue.newState ] ) || !set.length )
			return console.log( "no sound found for "+issue.newState )

		// pisk one
		var soundPath = set[ Math.floor( Math.random() * set.length ) ]

		// play
		audio.play( soundPath );
	};

	stream.end = function( ){
		this.emit('end')
	};

	return stream
}


////////////
// main loop
var timeout
config.delay = config.delay || 30000
var cycle = function(){

	console.log( 'cycle')

	// get the file
	request.get( config.url , config.requestParams || {} )

	// if an error occur during this phase, notif and retry later
	.on('error',function( error ){
		console.log("connection error, retry in "+( config.delay * 5 )+" ms",error)
		clearTimeout( timeout )
		timeout = setTimeout( cycle , ( config.delay * 5 ) )
	})


	// parse the data as Json and extract the issues one by one
	.pipe( extractIssues() )

	// if an error occur during this phase, notif and retry later
	.on('error',function( error ){
		console.log("parsing error, retry in "+( config.delay * 5 )+" ms",error)
		clearTimeout( timeout )
		timeout = setTimeout( cycle , ( config.delay * 5 ) )
	})

	// filter, grab only the issue for which the status has changed
	.pipe( filterChangedIssue() )


	// intercept the issues which pass the filter
	.on('data',function( issue ){
		console.log( (issue.name || '??' )+" was "+issue.lastState+" and turns "+issue.newState );
	})

	// for those, play a sound
	.pipe( playSound( soundTable ) )

	// when this end, redo all the process later
	.on('end' , function(){
		clearTimeout( timeout )
		timeout = setTimeout( cycle , config.delay )
	})
}




