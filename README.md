#ork-flavored-redmine-issue

 ![w3 ork peon portrait](http://classic.battle.net/war3/images/orc/units/portraits/peon.gif)
 > Du travail, encore du travail

Play warcraft III sounds when an issue is submited or resolved in redmine.

Do polling on the redmine API to detect changes.

Play sound using by executing the command mpg321, which is therefore required.

## config

### connection

connections informations are grabed from `config.json` 

    {
        "url" : "http://www.redmine.org/issues.json",       // the url to the redmine issue API
        "requestParams" : {                                 // params passed to request.js to fetch the API
            "auth" : {                                         // if you wish to use basic auth, set the user and pass fields
                "user" : "loktar",
                "pass" : "orkorkork"
            },
            "strictSSL" : true,                             // allow untrusted certificate
            "headers": {                                    
                "X-Redmine-API-Key": "<api-key>"            // if you wish to use your api key, set this field
            }
        },
        delay : 30000,                                      // the time to wait between two request to the API
    }

### sounds

Sounds should be located in the sounds folder

Each folder should be named from a status. When an status's issue is set to this value a sound from the folder is picked and played.

> _example_
> 
>  + sounds
>     + New 
>        - sound1.mp3
>        - sound2.mp3
>     + Closed 
>        - sound3.mp3
>   
>  when an issue is set to the `New` status, a sound ( sound1 or sound2 ) is played
>  

The table of playable sound can be altered passing values in `config.json`

    "soundTable" : {

        "Resolved" : "Closed",   // the status `Resolved` will trigger the same sound than `Closed`

        "Fermé" :  "Closed"      // this can be useful for l10n 
    } 

## license

I do not own the w3 peon's sounds. I guess it's ok to let them in the repository.