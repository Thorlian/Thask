
var body = document.getElementsByTagName("body")[0];
var pageContent; //useless variable
var gThasks = {
	"timeOld":0,
	"timedThasks":[],
	"counter":0, //counter is used for id generation,
	"primes":[], //primes is an id-array of all primethasks
	"new":{"id":"","name":"","description":"","priority":0, "goal":0, "time":0, "subTime":0, "super":null, "sub":[], "history":{}}, //new thasks get saved here during their creation
	"blank":{"id":"","name":"","description":"","priority":0, "goal":0, "time":0, "subTime":0, "super":null, "sub":[], "history":{}},
	"routines":[],
	"archive":{}

}; //a default blank thask
var gTimerFreq = 10000//thask timer update frequency in msec
var gTimedThasks; //array of thasks that are currently timed
//var gTimeOld; //variables for the timer interval method
var gTimeNew;
var gTimeGap;
var gTimer; //timer interval id
var gTimerActive = false;
//testing values newThask("t")
//Object creation and manipulation

function newThask(pName, pDesc = "empty",pSuper = null, pGoal = 0){ //creates new thask, returns thaskid
	var tId = idGenerator(pName);
	var tThask = {"id":tId, "name":pName, "description": pDesc, "priority":0, "goal":pGoal, "time":0, "subTime":0, "super":null, "sub":[], "history":{}};
	gThasks[tId]= tThask;
	gThasks["primes"].push(tId);

	if(pSuper != null){
		linkSubSuper(tId, pSuper);
	}
	return tId;
}
 function idGenerator(pName){ //generater unique thask id from a name
 	var tId = (pName.substring(0, 10) + ((gThasks.counter + "").padStart(10, 0))).padStart(20, 0); //generating unique id
 	gThasks.counter++;
	return tId;
 }

function linkSubSuper(pSub, pSuper){  //links two thasks in a super sub hierarchy, unlinks sub from previous super if nessesary, takes ids

	if(!getSupers(pSuper).includes(pSub)){ //check if pSuper is sub of pSub
		if(getPrime(pSub) == pSub){
			removePrime(pSub);
			gThasks[pSuper].sub.push(pSub);
			gThasks[pSub].super = pSuper;
			return 0;
		}
		else{
			unlinkSubSuper(pSub);
			gThasks[pSuper].sub.push(pSub);
			gThasks[pSub].super = pSuper;
			return 1;
		}
	}
	else{
		console.log();
		return 2;
	}
}


function unlinkSubSuper(pSub) { //unlinks pSub from its superthask if possible
	//if(pPrimeRemoval){ removePrime(pSub); } I dont get why this was here, maybe regret later
	tSub = gThasks[pSub];
	if (tSub.super == undefined){
		removePrime(pSub);
		return 0;
	}
	tSuper = gThasks[tSub.super];
	console.log("Removing link between super " + tSuper.id + " and sub " + tSub.id);
	tSub.super = null;
	tSuper.sub = tSuper.sub.filter(function( item ) {
  	return item !== tSub.id;
	});
}

function getPrime(pThask){ //finds and returns the Primethask of a given thaskID, Prime is defined as the highest node in a thasktree
	pThask = gThasks[pThask];
	return (pThask.super == null) ? pThask.id : getPrime(pThask.super);  //checks if pThask is its own prime, if not starts recursion
}

function getSubs(pThask){ //returns all nodes beneath given thasknode, takes thaskID
	pThask = gThasks[pThask];
	var tSubs = pThask.sub;
/*
	for(var i = 0; i < pThask.sub.length; i++){
		tSubs.push(...getSubs(pThask.sub[i]));
	}*/ //standard for loop, maybe useful for legacy browsers
	pThask.sub.forEach(function(pItem){
		tSubs.push(...getSubs(pItem));
	});
	return tSubs;
}

function getSupers(pThask, pArr = []){ //returns the ids of all superthask of a given thask inclueding its own id
	pThask = gThasks[pThask];
	if (pThask.super == null) {
		pArr.push(pThask.id);
		return pArr;
	}
	else {
		pArr.push(pThask.id);
		return getSupers(pThask.super, pArr);
	}
}

function removePrime(pThask){ //checks if pThaks is in the gThasks.prime array, removes it if true
	if (gThasks.primes.includes(pThask)){
		gThasks.primes.splice(gThasks.primes.indexOf(pThask), 1);
	}
}



/* Thask Object
	"id":id, "name":name, "describtion": desc, "goal":goal, "history":
*/



//functions for saving and retrieving data localy

function saveLocalThasks(){ //save thask in html5 web storag
	if (typeof(Storage) !== "undefined") {
    localStorage.setItem("thasks", JSON.stringify(gThasks));
	} else {
    document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Storage...";
	}
}

function loadLocalThasks(){ //load thasks from web storage
	if (typeof(Storage) !== "undefined") {
		var tThasks = localStorage.getItem("thasks");
		gThasks = (tThasks == null) ? gThasks : JSON.parse(tThasks);
	} else {
    document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Storage...";
	}
}

function archiveThasks(pThask){
	unlinkSubSuper(pThask);
	var tThask = gThasks[pThask];
	gThasks.archive[pThask] = tThask;
	tThask.sub.forEach(function(pElem){
			archiveThasks(pElem);
	});
	delete gThasks[pThask];
	saveLocalThasks();
}

function archiveSingleThask(pThask){
	console.log(pThask);
	var tThask = gThasks[pThask];
	var tSuper = (tThask.super == null) ? null : tThask.super;
	if(tSuper == null) {
		tThask.sub.forEach(function(pElem){
			gThasks.primes.push(pElem);
		});
	}
	tThask.sub.forEach(function(pElem){
		gThasks[pElem].super = tSuper;
	});
	gThasks.archive[tThask.id] = tThask;
	unlinkSubSuper(pThask);
	delete gThasks[pThask];
	saveLocalThasks();
}



// functions for the timer

function startTimer(pThask){
	if (pThask == "new" || pThask == null) { return 1;}
	clearInterval(gTimer);
	gTimedThasks = [];
	gThasks.timeOld = new Date().getTime();
	gTimerActive = true;
	getSupers(pThask).forEach(function(pItem){
		gTimedThasks.push(gThasks[pItem]);
		gThasks["timedThasks"].push(pItem);
	});
	console.log(gTimedThasks); //testing, remove later
	updateDisplayedTimers();


	gTimer = setInterval(timerFunction, gTimerFreq); //starts the interval, no code allowed below

}

function timerFunction(){
	var tDate = formatDate(new Date());
	gTimeNew = new Date().getTime();
	gTimeGap = gTimeNew - gThasks.timeOld;
	gThasks.timeOld = gTimeNew;
	gTimedThasks[0].time += gTimeGap;
	gTimedThasks[0].history[tDate] = (isNaN(gTimedThasks[0].history[tDate])) ? gTimeGap : gTimedThasks[0].history[tDate] + gTimeGap;
	gTimedThasks.slice(1).forEach(function(pItem){
		pItem.subTime += gTimeGap;
	});
	updateTimer();
	saveLocalThasks();
}

function stopTimer(){
	clearInterval(gTimer);
	gTimerActive = false;
	gThasks.timeOld = 0;
	gThasks.timedThasks = [];
	gTimedThasks = [];
}

function toggleTimer(pThask){
	if (gThasks.timeOld == 0){
		startTimer(pThask);
	} else {
		stopTimer();
	}
}

function restoreTimer(){
	gTimedThasks = [];
	//clearInterval(gTimer);
	if (gThasks.timeOld != 0){
		gThasks.timedThasks.forEach(function(pItem){
			gTimedThasks.push(gThasks[pItem]);
		});
		updateDisplayedTimers();
		gTimer = setInterval(timerFunction, gTimerFreq);
	}
}







function formatDate(pDate){
	return pDate.toISOString().slice(0,13) + ((pDate.getTimezoneOffset() < 0) ? "+":"-" ) + ( "00" + Math.floor(Math.abs(pDate.getTimezoneOffset())/60)).slice(-2);
}






function arrayIntersection(pArr1, pArr2){
		return pArr1.filter(value => -1 !== pArr2.indexOf(value));
}
function arrayRemoveElement(pArr, pElem){
	pArr.splice(pArr.indexOf(pElem), 1);
}








//Page intitializing functions

//page saving
function savePage() {
	var tJSON = JSON.stringify(pageContent);
	$.post("/json", {"json" : tJSON});
}

function loadJSON() {
	$.getJSON('/files/current.json', function(json){
		pageContent = json;
		//createPage(pageContent);
	});
}

//modal
// Get the modal
// Get the button that opens the modal
// When the user clicks the button, open the modal
// When the user clicks anywhere outside of the modal, close it

//	$("#boxModal").css("display", "flex");
//	$("#newBoxModal").css("display", "none");
