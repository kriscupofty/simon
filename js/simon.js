var KEYS = ['c', 'd', 'e', 'f'];
var NOTE_DURATION = 1000;

// NoteBox
//
// Acts as an interface to the coloured note boxes on the page, exposing methods
// for playing audio, handling clicks,and enabling/disabling the note box.
function NoteBox(key, onClick) {
	// Create references to box element and audio element.
	var boxEl = document.getElementById(key);
	var audioEl = document.getElementById(key + '-audio');
	if (!boxEl) throw new Error('No NoteBox element with id' + key);
	if (!audioEl) throw new Error('No audio element with id' + key + '-audio');

	// When enabled, will call this.play() and this.onClick() when clicked.
	// Otherwise, clicking has no effect.
	var enabled = true;
	// Counter of how many play calls have been made without completing.
	// Ensures that consequent plays won't prematurely remove the active class.
	var playing = 0;

	this.key = key;
	this.onClick = onClick || function () {};

	// Plays the audio associated with this NoteBox
	this.play = function() {return new Promise(function (resolve) {
		playing++;
		// Always play from the beginning of the file.
		audioEl.currentTime = 0;
		audioEl.play().then(function() {
			if(enabled) {
				boxEl.classList.add('active');
			}

			setTimeout(function () {
				playing--
				if (!playing && enabled) {
					boxEl.classList.remove('active');
				}
				resolve(); 
			}, NOTE_DURATION)
		});	// Set active class for NOTE_DURATION time
	})}

	// Enable this NoteBox
	this.enable = function () {
		enabled = true;
	}

	// Disable this NoteBox
	this.disable = function () {
		enabled = false;
	}

	// Call this NoteBox's clickHandler and play the note.
	this.clickHandler = function () {
		var that = this;
		if (!enabled) return;

		this.play().then(function() {that.onClick(that.key)});
	

	}.bind(this)

	boxEl.addEventListener('mousedown', this.clickHandler);
}

// Example usage of NoteBox.
//
// This will create a map from key strings (i.e. 'c') to NoteBox objects so that
// clicking the corresponding boxes on the page will play the NoteBox's audio.
// It will also demonstrate programmatically playing notes by calling play directly.
var notes = {};
var currKey;
var keys_played = [];
var keys_to_be_played;
var random;

function checkKey(key) {
	console.log('key', key);
	if(key !== currKey) {
		console.log('end');
		keys_played = [];
		return simon();
	} 

	currKey = keys_to_be_played.shift();
	console.log('currkey', currKey);

	if(currKey == undefined) 
		setTimeout(simon(), NOTE_DURATION * 2);
}


KEYS.forEach(function (key) {
	notes[key] = new NoteBox(key, checkKey);
});

/*KEYS.concat(KEYS.slice().reverse()).forEach(function(key, i) {
	setTimeout(notes[key].play.bind(null, key), i * NOTE_DURATION);
}); */


function simon() {
	random = Math.floor(Math.random() * 4);
	keys_played.push(KEYS[random]); 

	function playSeq() {
		for(var key in notes){
			notes[key].disable();
		}

		return new Promise(function(resolve) {
			keys_played.forEach(function(key, i) {
			console.log(key);
			setTimeout(function() {
				notes[key].play().then(function() {
					if(i == (keys_played.length -1))
					resolve()
				});

				
				}, i * NOTE_DURATION);
			
			})
		})
			
	
	}

	playSeq().then(afterSeq); 

	function afterSeq () {
		for(var key in notes){
			notes[key].enable();
		}

		keys_to_be_played = keys_played.slice(0); // copy the array 
		console.log('keys_played', keys_played);
	
		currKey = keys_to_be_played.shift();
		console.log('currkey', currKey);
	}	
}


simon(); 