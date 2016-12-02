//JS modules
var _ = require('lodash');

/**
* @author David B - laopunk 
* @class notePlayer
* @classdesc A musical note that can be played in a browser. Plays for however long it has been defined to.
* @param {Object} obj                       - properties needed to instanciate the class
* @param {Object} obj.keynb                 - corresponding number on a piano keyboard
* @param {Object} obj.freq                  - sound frequency, in Hertz
* @param {Object} obj.octave                - musical octave the note belongs to [1-8]
* @param {Object} obj.name                  - Full name of the note
* @property {number}  pianoKeyNb            - corresponding number on a piano keyboard
* @property {number}  frequency             - sound frequency, in Hertz
* @property {number}  octave                - musical octave the note belongs to [1-8]
* @property {string}  name                  - Full name of the note
* @property {number}  duration              - length of time the sound has to be played, in seconds
* @property {number}  volume                - volume [0-1]
* @property {Boolean}  verbose              - verbose mode (true/false)
* @property {number}  attack                - time to ramp up to the desired volume [0-1]
* @property {number}  release               - time to ramp up from the desired volume to silence [0-1]
* @property {Object} audioContext           - WebAudio audioContext
* @property {Object} destinationNode        - WebAudio destinationNode
*/
function notePlayer(obj){
    try{
        //properties
        this.pianoKeyNb = obj.keynb
        this.frequency = obj.freq
        this.octave = obj.name.substr(-1,1)
        this.name = obj.name
        this.duration = _.random(0.5,3,true)
        this.volume = 1
        this.verbose = false
        this.attack = 0.3
        this.release = 0.1

        //audio API
        this.audioContext = (obj.audioContext === void 0) ? new (window.AudioContext || window.webkitAudioContext)() : obj.audioContext;
        this.destinationNode = this.audioContext.destination
    }catch(err){
        console.error(err)
        return null
    }

}

/**
 * @function buildFromName
 * @description builds a notePlayer from a specific musical note name
 * @example buildFromName("C4")
 * @param {string} noteName         - Concatenation of note + octave [1-8]
 * @param {Object} [audioContext] - The audioContext to render the sound. Created if not provided
 */

notePlayer.buildFromName = function(noteName,audioContext){
    try{
        //verify input
        if (noteName === void 0) {throw "note name was not provided"};
        //verify octave
        OCTAVE_INPUT = parseInt(noteName.slice(-1))
        if (OCTAVE_INPUT < 1 || OCTAVE_INPUT > 8) {throw "Invalid octave: "+noteName};
        //replace flats with sharp if need be
        NOTE_INPUT = noteName.slice(0,2)
        DICT_TRANSLATIONS = {
            "Cb": "B",
            "Db": "C#",
            "Eb": "D#",
            "Fb": "E",
            "Gb": "F#",
            "Ab": "G#",
            "Bb": "A#"
        }
        noteName = (DICT_TRANSLATIONS[NOTE_INPUT]) ? DICT_TRANSLATIONS[NOTE_INPUT]+OCTAVE_INPUT : noteName;
        n = _(this.getNotesInfo()).find(function(e){
            return e.name == noteName
        })
        if ( !n) { throw "Invalid note name: "+noteName+", did you forget to mention the octave nb ?"}
        else{
            n.audioContext = audioContext
            return new notePlayer(n)
        }
    }catch(e){
        console.error("NOTEPLAYER ERROR: "+e)
        console.warn("USAGE: notePlayer.buildFromName(noteNameWithOctave,[audioContext]). i.e: buildFromName('G4')")
        return null
    }
}

/**
 * @function buildFromFrequency
 * @description builds a notePlayer from a specific frequence
 * @example buildFromFrequency(440)
 * @param {number} noteFreq         - sound frequency, in Hertz
 * @param {Object} [audioContext] - The audioContext to render the sound. Created if not provided
 */
notePlayer.buildFromFrequency = function(noteFreq,audioContext){
    try{
        //verify input
        if (noteFreq === void 0) {throw "note frequency was not provided"};
        list = this.getNotesInfo()
        //eliminate junk
        if (noteFreq < list[0].freq || noteFreq > list[list.length-1].freq) {
            throw "Invalid frequency (out of range 27.5-4186): "+noteFreq
            return null
        }
        //find closest frequency
        closest = list.reduce(function (prev, curr) {
            return (Math.abs(curr.freq - noteFreq) < Math.abs(prev.freq - noteFreq) ? curr : prev);
        });
        return this.buildFromName(closest.name,audioContext)
    }catch(e){
        console.error("NOTEPLAYER ERROR: "+e)
        console.warn("USAGE: notePlayer.buildFromFrequency(frequency,[audioContext]). i.e: buildFromFrequency(440)")
        return null
    }
}


/**
 * @function buildFromKeyNb
 * @description builds a notePlayer from a specific piano key number
 * @example buildFromKeyNb(49)
 * @param {number} noteKeyNb         - corresponding number on a piano keyboard
 * @param {Object} [audioContext] - The audioContext to render the sound. Created if not provided
 */
notePlayer.buildFromKeyNb = function(noteKeyNb,audioContext){
    try{
        //verify input
        if (noteKeyNb === void 0) {throw "note keyNumber was not provided"};
        n = _(this.getNotesInfo()).find(function(e){
            return e.keynb == noteKeyNb
        })
        if ( !n) { throw "Invalid keyNumber: "+noteKeyNb+", has to be within range 1-88"}
        n.audioContext = audioContext
        return new notePlayer(n)
    }catch(e){
        console.error("NOTEPLAYER ERROR: "+e)
        console.warn("USAGE: notePlayer.buildFromKeyNb(noteKeyNb,[audioContext]). i.e: buildFromKeyNb(49)")
        return null
    }
}

/**
 * @function buildFromKeyNb
 * @description builds a notePlayer from a specific piano key number
 * @example buildFromKeyNb(49)
 * @param {number} noteKeyNb         - corresponding number on a piano keyboard
 * @param {Object} [audioContext] - The audioContext to render the sound. Created if not provided
 */
notePlayer.getNotesInfo = function(){
    DICT_KEYS = ["A","A#","B","C","C#","D","D#","E","F","F#","G","G#"]
    DICT_OCTAVES =[0,1,2,3,4,5,6,7,8]
    FREQ = 25.95654359874657 //starting point for G#-1
    KEYNB = 0      //sarting point for A0
    return _(DICT_OCTAVES).map(function(v,k){
        return _(DICT_KEYS).map(function(v2,k2){
            KEYNB++
            FREQ = FREQ * Math.pow(2, 1/12)
            return {
                  "keynb": KEYNB
                , "freq": FREQ
                , "name": v2+v
            }
        })
        .value()
    })
    .flatten()
    .dropRightWhile(function(e,i){
       return i >= 88
    })
    .value()
}



/**
 * @function play
 * @description plays the note
 * @example play(function(){console.log("end play")})
 * @param {Function} [callback]         - callback function
 */
notePlayer.prototype.play = function(callback) {
    if (this.verbose){
        console.log("Note "+this.name+" will play for a duration of "+this.duration)
    }
    //creating oscillator & gain
    var oscillator = this.audioContext.createOscillator()
    oscillator.frequency.value = this.frequency
    var gainNode = this.audioContext.createGain()
    gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + this.attack);
    gainNode.gain.setTargetAtTime(0, this.audioContext.currentTime + this.attack, this.release || this.attack);

    //Connections
    oscillator.connect(gainNode)
    gainNode.connect(this.destinationNode)
    //launch play
    oscillator.start(0)

    //event listeners
    t_np = this
    setTimeout(function(){
        if(t_np.verbose){console.log("Note "+t_np.name+" has finished playing")}
        oscillator.stop(0)
    }, this.duration * 1000); //leaving time for the fadeout

    oscillator.onended = function() {
        if( callback ) { callback() }
    }
    return oscillator;
};

/**
 * @function setAudioContext
 * @description assigns a specific audiocontext to the note
 * @example setAudioContext(ac)
 * @param {Object} ac         - Web Audio audioContext
 */
notePlayer.prototype.setAudioContext = function(ac) {
    this.audioContext = (ac == void 0) ? this.audioContext : ac;    
};

/**
 * @function setDestinationNode
 * @description assigns a specific destination node to the note (any connectable audioNode)
 * @example setDestinationNode(audioContext.destination)
 * @param {Object} dn         - Web Audio destinationNode
 */
notePlayer.prototype.setDestinationNode = function(dn) {
    this.destinationNode = (dn === void 0) ? this.audiocontext.destination : dn;
};

/**
 * @function setDuration
 * @description changes the time the note has to be played for
 * @example setDuration(2.3)
 * @param {Number} d         - Time to play the note for, in second
 */
notePlayer.prototype.setDuration = function(d) {
    this.duration = (d === void 0) ? this.duration : d;
};

/**
 * @function setVolume
 * @description changes the volume
 * @example setVolume(0.5)
 * @param {Number} v         - Volume level
 */
notePlayer.prototype.setVolume = function(v) {
    this.volume = (v === void 0) ? this.volume : v;
};

/**
 * @function setVerbose
 * @description switches verbose mode on/ff
 * @example setVerbose(); setVerbose(false)
 * @param {Number} [v]         - True or false, default is true
 */
notePlayer.prototype.setVerbose = function(v) {
    this.verbose = (v === void 0 || v === true) ? true : false;
};

/**
 * @function setAttack
 * @description Updates value of the note's attack
 * @example setAttack(0.3)
 * @param {Number} n         - [0-1] the closer to 0 the longer the attack
 */
notePlayer.prototype.setAttack = function(n) {
    this.attack = (n === void 0 || n % 1 === 0 ) ? this.attack : n;
};

/**
 * @function setRelease
 * @description Updates value of the note's release
 * @example setRelease(0.3)
 * @param {Number} n         - [0-1] the closer to 0 the longer the release
 */
notePlayer.prototype.setRelease = function(n) {
    this.release = (n === void 0 || n % 1 === 0 ) ? this.release : n;
};

module.exports = notePlayer
