var fs = require('fs')
  , path = require('path')


var getFolders=function (dir){
    return fs.readdirSync(dir).filter( function( fileName ){
      return fs.statSync( path.join( dir, fileName )).isDirectory()
    });
}

var getSoundsFiles=function (dir){
    return fs.readdirSync(dir)
}

/**
 *
 * for each sub-directory in dir
 * 
 *   - grab all the mp3 files in subfolders
 *   - put theirs path into a named list
 *   - the list is labeled with the name of the folder,
 *     - if the folder's name contains '-' chars, one list will be created for each name separeted by -
 * 
 *
 * ex 
 *
 *  +sounds
 *     + new 
 *        - sound1.mp3
 *     + resolved-closed
 *        - sound2.mp3
 *        - sound3.mp3
 *
 *
 *  will be parsed as 
 *   [
 *     new : [
 *       sounds/new/sound1.mp3
 *     ],
 *     resolved : [
 *       sounds/new/sound2.mp3,
 *       sounds/new/sound3.mp3
 *     ],
 *     closed : [
 *       sounds/new/sound2.mp3,
 *       sounds/new/sound3.mp3
 *     ]
 *   ]
 */
module.exports = function( dir ){

	var folders = getFolders( dir )

  	var sounds = {}

	for( var i=folders.length;i--;){
		var d = path.join( dir , folders[i] )

    var files = getSoundsFiles( d ).map(function( name ){ return path.join( d +'/' , name ) })

    var associatedState = folders[i].split('-')

    for( var j=associatedState.length;j--;)

		  sounds[ associatedState[j] ] = files;
	}

  	return sounds;
}