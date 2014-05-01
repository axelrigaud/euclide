(function(){
	
var ac = new webkitAudioContext();

//CREATION DES BUFFERS
//KICK
var kickSound;

var getkick = new XMLHttpRequest();
getkick.open("GET","snd/kick.wav",true);
getkick.responseType = "arraybuffer";
getkick.onload = function(){
	ac.decodeAudioData(getkick.response,function(buffer){
		kickSound = buffer;
	})
}
getkick.send();
//SNARE
var snareSound;

var getsnare = new XMLHttpRequest();
getsnare.open("GET","snd/snare.wav",true);
getsnare.responseType = "arraybuffer";
getsnare.onload = function(){
	ac.decodeAudioData(getsnare.response,function(buffer){
		snareSound = buffer;
	})
}
getsnare.send();

//HIHAT
var hihatSound;

var gethihat = new XMLHttpRequest();
gethihat.open("GET","snd/hihat.wav",true);
gethihat.responseType = "arraybuffer";
gethihat.onload = function(){
	ac.decodeAudioData(gethihat.response,function(buffer){
		hihatSound = buffer;
	})
}
gethihat.send();

//SHAKER
var shakerSound;

var getshaker = new XMLHttpRequest();
getshaker.open("GET","snd/shaker.wav",true);
getshaker.responseType = "arraybuffer";
getshaker.onload = function(){
	ac.decodeAudioData(getshaker.response,function(buffer){
		shakerSound = buffer;
	})
}
getshaker.send();

//VARIABLES GLOBALES

var noteTime = 0.0;
var rhythmIndex = 0; //où l'on se situe dans le step sequencer
var loopLength = 32; //initialisation du nombre de pas à 32
var GRID_SIZE = 32;
window.tempo = 90;
	
//PLAY FUNCTIONS

function playNote(buffer,noteTime) {
		var playSound = ac.createBufferSource();
		playSound.buffer = buffer;
		playSound.connect(ac.destination);
		playSound.noteOn(noteTime);
		}
		
window.schedule = function() {
	
		var currentTime = ac.currentTime;
		currentTime -= startTime;
		while (noteTime < currentTime + 0.200) {
			var contextPlayTime = noteTime + startTime;
			
			// si notre index correspond à une note on la joue
			if (score['kick'][rhythmIndex])
				playNote(kickSound,contextPlayTime);
				
			if (score['snare'][rhythmIndex])
				playNote(snareSound,contextPlayTime);
				
			if (score['hihat'][rhythmIndex])
				playNote(hihatSound,contextPlayTime);
				
			if (score['shaker'][rhythmIndex])
				playNote(shakerSound,contextPlayTime);
				
			advanceNote();
			
		}
		timeoutId = setTimeout("schedule()", 0);
	}
	
function advanceNote() {
    // Advance time by a 16th note...
console.log('tempo : '+tempo+' typeof tempo : '+typeof tempo);

    var secondsPerBeat = 60.0 / tempo;
	

    rhythmIndex++;
    if (rhythmIndex >= loopLength) {
        rhythmIndex = 0;
    }
	noteTime += 0.25 * secondsPerBeat; 
    
}


function handlePlay () {
	noteTime = 0.0;
    startTime = ac.currentTime + 0.005;
	tempo = $('#tempo-input').spinner('value');
	schedule();
	}
	

function handleStop () {
	clearTimeout(timeoutId);
	rhythmIndex = 0;
	}
	
function appendInstrument(trackName){
	
	instrumentTrack = document.createElement('div');
	instrumentTrack.id = trackName;
	instrumentTrack.className = "instrument-track";
	
	instrumentLabel = document.createElement('div');
	instrumentLabel.innerHTML = trackName;
	instrumentLabel.className = "instrument-label";
	instrumentTrack.appendChild(instrumentLabel);
	
	nLabel = document.createElement('span');
	nLabel.innerHTML = 'n = ';
	instrumentTrack.appendChild(nLabel);

	metricField = document.createElement('input');
	metricField.id = trackName+'Metric';
	metricField.value = 4;
	instrumentTrack.appendChild(metricField);
	
	kLabel = document.createElement('span');
	kLabel.innerHTML = " k = ";
	instrumentTrack.appendChild(kLabel);

	hitsField = document.createElement('input');
	hitsField.id = trackName+'Hits';
	hitsField.value = 1;
	instrumentTrack.appendChild(hitsField);	
	
	for (var i=0;i<32;i++)
	{
		square = document.createElement('div');
		square.id=trackName+'_'+i;
		instrumentTrack.appendChild(square);
	}
	
	tracks = document.getElementById('tracks');
	tracks.appendChild(instrumentTrack);
}





//pour une raison que j'ignore je dois mettre le jQuery dans une fonction à part de appendInstrument
function spinInstrument(trackName){
	$('#'+trackName+'Metric').spinner({
		min: 1,
		max: 32,
		spin:function(event,ui){
			console.log('tempo dans spinner metric : '+tempo)
			changePattern(trackName,ui.value,$('#'+trackName+'Hits').spinner('value'));
		},
		change:function(event,ui){
			changePattern(trackName,this.value,$('#'+trackName+'Hits').spinner('value'));
		}
	});
	$('#'+trackName+'Hits').spinner({
		min: 1,
		max: 13,
		spin:function(event,ui){
			changePattern(trackName,$('#'+trackName+'Metric').spinner('value'),ui.value);
		},
		change:function(event,ui){
			changePattern(trackName,$('#'+trackName+'Metric').spinner('value'),this.value);
		}
	});
}

//APPEND AND JQUERYUIfication

appendInstrument('kick');
appendInstrument('snare');
appendInstrument('hihat');
appendInstrument('shaker');

$("#go").button({
	text: false,
	icons: {
		primary: 'ui-icon-play'}
	})
	.click(function() {
	      var options;
	      if ( $( this ).text() === "play" ) {
	        options = {
	          label: "stop",
	          icons: {
	            primary: "ui-icon-stop"
	          }
	        };
			handlePlay();
	      } else {
	        options = {
	          label: "play",
	          icons: {
	            primary: "ui-icon-play"
	          }
	        };
			handleStop();
	      }
	      $( this ).button( "option", options );
	    });



$('#looplength').spinner({
	min: 1,
	max: 32,
	spin:function(event,ui){
		console.log('tempo dans spinner step : '+window.tempo);
		disableSquares(ui.value);
		loopLength = ui.value;
	},
	change:function(event,ui){
		console.log(this.value);
		disableSquares(this.value);
		loopLength = this.value;
	}
});



$('#tempo-input').spinner({
		min: 40,
		max: 300,
		spin:function(event,ui){
			window.tempo = ui.value;
		},
		change:function(event,ui){
			window.tempo = parseInt($('#tempo-input').val());
			//window.tempo = ui.value;
		}
	});	


spinInstrument('kick');
spinInstrument('snare');
spinInstrument('hihat');
spinInstrument('shaker');


//PATTERN MANIPULATION

function initScore(){

	score = new Array();
	
	initPattern = new Array();
	initPattern = [1,0,0,0];
	var specificMetric = 4;
	initPattern =  multiplyAndTruncate(initPattern,specificMetric);
	
	score['kick'] = initPattern;
	score['snare'] = initPattern;
	score['hihat'] = initPattern;
	score['shaker'] = initPattern;

	updateGrid(initPattern,'kick',specificMetric);
	updateGrid(initPattern,'snare',specificMetric);
	updateGrid(initPattern,'hihat',specificMetric);
	updateGrid(initPattern,'shaker',specificMetric);
}

function changePattern(instrument,specificMetric,hits_amount){
	
	newPattern = new Array();
	for(var i=0;i<hits_amount;i++)
	{

		newPattern[i]=1;
	}

	for(var j=i;j<specificMetric;j++)
	{

		newPattern[j]=0;
	}


	function Bjorklund(pattern){
		var remainingZeros = pattern.length - pattern.indexOf(0);
		var onesAmount = pattern.length - remainingZeros;
		var remainder = remainingZeros%onesAmount;
		console.log("remainder :"+remainder);
		//on bouge autant de zeros possible derrière chaque '1'
		var amountOfZeros = Math.floor(remainingZeros/onesAmount); //combien de zero devront être permutés derrière chaque 1
		var seqOfZeros = new Array(); //on créé le tableau de 0 qui sera inséré derrière chaque 1
		for(var i=0;i<amountOfZeros;i++){
			seqOfZeros.push(0);
		}
		console.log('seqOfZeros : '+seqOfZeros);
		
		var whereToAppend = new Array();
		for(var i=0;i<onesAmount;i++){
			whereToAppend.push(i*amountOfZeros+1+i);
		}
		console.log('whereToAppend : '+whereToAppend);

		whereToAppend.forEach(function(position){
			pattern.splice.apply(pattern, [position,0].concat(seqOfZeros));
			for(var j=0;j<amountOfZeros;j++){
				pattern.pop();
				remainingZeros--;
			}
		})
		console.log('pattern avant traitement des restes : '+pattern);
		//on bouge les zeros restants si il y en a
		if(remainder!=0){
			var whereToAppend2 = new Array();
			for(var i=0;i<remainder;i++){
				whereToAppend2.push((i+1)*(amountOfZeros+1)+i);
			}
			console.log('wheretoappend2 : '+whereToAppend2);

			for(var i=0;i<remainder;i++){
				pattern.splice(whereToAppend2[i],0,0);
				pattern.pop();
			}
			console.log('pattern avant traitement des petites sequences : '+pattern);
			//on bouge la petite séquence juste après chaque grande séquence R fois
			if(remainder>1){
				var permutationsAmount = onesAmount - remainder;
				for(var i=0;i<permutationsAmount;i++){
					var position = (amountOfZeros+2)*(i+1)+i*(amountOfZeros+1);
					pattern.splice(position,0,1);

					pattern.pop();
					for(var j=0;j<amountOfZeros;j++){
						position = (amountOfZeros+2)*(i+1)+i*(amountOfZeros+1)+1+j;
						pattern.splice(position,0,0);
						pattern.pop();
					}
				}	
			}
		}
	return pattern;
	}	
	
	newPattern = Bjorklund(newPattern);
	updateGrid(newPattern,instrument,specificMetric);
	newPattern = multiplyAndTruncate(newPattern,specificMetric);
	score[instrument] = newPattern;
	
}

function multiplyAndTruncate(pattern,specificMetric){
	var gridSize=GRID_SIZE;
	var howManyTimesRepeated = Math.floor(gridSize/specificMetric);
	var multipliedPattern = pattern.slice(0);
	for (var i=0;i<howManyTimesRepeated;i++){
		multipliedPattern = multipliedPattern.concat(pattern);
	}
	var truncatedPattern = multipliedPattern.slice(0,32);
	return truncatedPattern;
}

// GRID

function updateGrid(pattern,instrument,specificMetric){

	var firstBeat = new Array();
	var accents = new Array();
	var silences = new Array();
	

	for (var k in pattern){
		if(pattern[k]==1){
			accents.push(k);
		}
	}
	
	for (var k in pattern){
		if(pattern[k]==0){
			silences.push(k);
		}
	}
	
	accents.splice(0,1);

	for (var i=0;i<GRID_SIZE/specificMetric;i++)
	{

		var square = $('#'+instrument+'_'+i*specificMetric);

		if (!square.hasClass('first-step'))
			{square.attr('class','square first-step')}
			
		accents.forEach(function(accent){

			var accentInt = parseInt(accent);
			var pos = accentInt+(i*specificMetric);
			if (square = document.getElementById(instrument+'_'+pos)){
				var squareClass2 = $('#'+instrument+'_'+pos).attr('class');
				if (squareClass2 != 'hit square')
					{$('#'+instrument+'_'+pos).attr('class','hit square',0);}
				}
			});
				
		silences.forEach(function(silence){

			var silenceInt = parseInt(silence);
			var pos = silenceInt+(i*specificMetric);
			if (square = document.getElementById(instrument+'_'+pos)){
				var squareClass3 = $('#'+instrument+'_'+pos).attr('class');
				if (squareClass3 != 'silent square')
					{$('#'+instrument+'_'+pos).attr('class','silent square',0);}
				}

		});
	}
	
	disableSquares(looplength.value);
}

function disableSquares(index){
	for(var i=0;i<GRID_SIZE;i++){

		if (i>=index){ 
			$('#kick_'+i).addClass('disabled');
			$('#snare_'+i).addClass('disabled');
			$('#hihat_'+i).addClass('disabled');
			$('#shaker_'+i).addClass('disabled');

		}
		if (i<index && $('#kick_'+i).hasClass('disabled')){//on teste que sur kick puisque tous les patterns sont liés!$('#kick_'+i).hasClass('disabled')
			$('#kick_'+i).removeClass('disabled');
			$('#snare_'+i).removeClass('disabled');
			$('#hihat_'+i).removeClass('disabled');
			$('#shaker_'+i).removeClass('disabled');
		}
	}
}

initScore();

})();
