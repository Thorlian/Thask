var gThaskGrid  = {};
var gDisplayedThasks = [];

function createPage() { //rename later to "createThaskDisplay" and add thaskArray parameter
	var tDiv = $('<div>', { id: "thaskWrapper"});
	tDiv.append($('<div>', { id: "thaskContainer", class: "cards"}));
	$("#pageContainer").hide();
	$("#contentContainer").append(createThaskEditor());
	$('#thaskCreator').hide();
	$("#creatorTimer").slideUp(150);
  $("#contentContainer").append(tDiv);
	$("#thaskWrapper").hide();

	displayThasks(gCurrentDisplay);
	$("#pageContainer").prepend(createSideBar());


  $("#pageContainer").show(250);

	//testing



}

function displayThasks(pThasks, pId = "thaskContainer") { //takes an array of thasks and a dom id as input, emptys the dom and attaches all the thasks to it as cards
	//if(document.getElementById(pId) == null){ return 1;}

	if(pThasks == null){pThasks = gThasks.primes;}
  $("#" + pId).empty();
  pThasks.forEach(function(pItem){
      $("#" + pId).append(createThaskElement(pItem));
			new ResizeObserver(function(){ //chrome exclusive function, maybe rework later
				updateGrid(pId);
			}).observe(document.getElementById(pItem));
  });

	  $("#" + pId).append(createFloatyButton("newThaskFAB","add", "floatyButtonAdd()"));

	gThaskGrid[pId] = new Minigrid({  //turns given dom element into a minigrid
    container: ('#' + pId),
    item: '.card',
    gutter: 24
  });

	new ResizeObserver(function(){ //chrome exclusive function, maybe rework later
		updateGrid(pId);
	}).observe(document.getElementById(pId));
  /*window.addEventListener('resize', function(){
		updateGrid(pId);
	});*/
	$("#thaskWrapper").show(250);
	updateGrid(pId);
	return 0;
}

function updateGrid(pGridId){
	if(gThaskGrid[pGridId] != undefined){
		gThaskGrid[pGridId].mount();
		return 0;
	} else
		console.log(pGridId);
		return 1;
}

function createFloatyButton(pId,pIcon = "add", pFunction = "floatyButtonClick(this.id)"){ //creates and returns a fab with a given id and icon
	var tButton = $('<button>', {id:pId, class: "button floatyButton", onclick: pFunction});
	tButton.append(mIcon(pIcon));

	return tButton;
}

function mIcon(pIcon){ //creates an "i"-element with the correct css to display a material icon
	var tIcon = document.createElement("i");
	tIcon.setAttribute("class", "material-icons");
	tIcon.appendChild(document.createTextNode(pIcon));
	return tIcon;
}



function createThaskElement(pThask){
  var tThask = gThasks[pThask];

	var tElement = $('<div>', {id: tThask.id, onclick: "thaskOnClick(this.id)", class:"thaskElement card" })
	tElement.append($('<div>', {class: "thaskHeader"}).append($('<h1>', {id: (tThask.id + "Header"), html: tThask.name})));
	tElement.append($('<div>', {id: (tThask.id + "Description"), class: "thaskDescription", html: tThask.description}));


	var tButtons = $('<div>', {class:"thaskButtons"});
	tButtons.append($('<button>', {id: (tThask.id + "B1"), class: "thaskButton thaskButton1 button", onclick: "thaskButtonClick(this.id)"}).append(mIcon("play_arrow")));
	tButtons.append($('<button>', {id: (tThask.id + "B2"), class: "thaskButton thaskButton2 button", onclick: "thaskButtonClick(this.id)"}).append(mIcon("timer")));
	tButtons.append($('<button>', {id: (tThask.id + "B3"), class: "thaskButton thaskButton3 button", onclick: "thaskButtonClick(this.id)"}).append(mIcon("details")));
	tButtons.append($('<button>', {id: (tThask.id + "B4"), class: "thaskButton thaskButton4 button", onclick: "thaskButtonClick(this.id)"}).append(mIcon("edit")));
	tButtons.append($('<button>', {id: (tThask.id + "B5"), class: "thaskButton thaskButton5 button", onclick: "thaskButtonClick(this.id)"}).append(mIcon("archive")));

	tElement.append($('<div>', {class: "thaskFooter", onclick:"stopEventBubbling()"}).append(tButtons));



  return tElement;
}

function createTimerElement(pThask){ //generates and returns timer
	var tThask = gThasks[pThask];

	var tBox = document.createElement("div");
	var tCur = document.createElement("div");
	var tGoal;
	var tBar;
	var tProgress;

	tBox.setAttribute("id", pThask+ "Timer");
	tBox.setAttribute("class", "timerBox " + pThask + "Timer");


	if(tThask.goal == 0){  //differentiating between timers that need to show the goal and timers that don't
		tCur.setAttribute("class", "timerCounter timeCounterNoGoal");
	} else{
		tGoal = document.createElement("div");
		tBar = document.createElement("div");
		tProgress = document.createElement("div");

		tCur.setAttribute("class", "timerCounter timeCounterWithGoal");

		tGoal.setAttribute("class", "timerGoal");
		tBar.setAttribute("class", "timerBar");
		tProgress.setAttribute("class", "timerProgress");
		tProgress.setAttribute("id", pThask + "progress");

		tGoal.appendChild(document.createTextNode(formatTimer(tThask.goal)));
		tBar.appendChild(tProgress);
		tBox.appendChild(tBar);
	}

	tCur.appendChild(document.createTextNode(formatTimer(tThask.time)));
	tBox.appendChild(tCur);

	if(tThask.goal > 0){ tBox.appendChild(tGoal);   }
	return tBox;
}

function formatTimer(pMsec){ //returns a String HH:MM for a given amount of milliseconds
	var tMinutes = ((pMsec/1000)/60);
	var tHours = Math.floor(tMinutes/60);
	var tMinutes = (Math.floor(tMinutes%60) +"").padStart(2, "0");

	return (tHours + ":" + tMinutes);
}

function timerToMs(pTimer){
	var tSplit = pTimer.split(":");
	return (tSplit[0]*3600000 + tSplit[1]*60000);
}



function createThaskEditor(){
	var tContainer = $('<div>', { id: "thaskCreator"});

	var tHeader = $('<div>', { id: "creatorHeader"});
	tHeader.append($('<h2>', {id: "creatorTitle", contenteditable: "true", class: "editable"}));
	tContainer.append(tHeader);


	tContainer.append($('<div>', { id: "creatorField", contenteditable: "true", class: "editor editable"}));

	var tFooter = $('<div>', { id: "creatorFooter"});
	var tTimer = $('<div>', { id: "creatorTimer"});
	var tButtons = $('<div>', {id: "creatorButtons"});

	tTimer.append($('<div>', {class:"timerBar"}).append($('<div>', {class:"timerProgress"})));
	tTimer.append($('<div>', {id: "creatorCurrentTime", class: "timerCounter"}));
	tTimer.append($('<div>', {id: "creatorGoalTime", class: "timerGoal"}).append( [
			$('<p>', {id: "creatorGoalHours", class: "editable creatorGoalDigit", contenteditable: "true"}),
			$('<p>', {text: ":"}),
			$('<p>', {id: "creatorGoalMinutes", class: "editable creatorGoalDigit", contenteditable: "true"})] ));

	tButtons.append($('<button>', { id: "creatorButton1", class: "button creatorButton", onclick:"creatorButtonClick(this.id)"}).append(mIcon("play_arrow")));
	tButtons.append($('<button>', { id: "creatorButton2", class: "button creatorButton", onclick:"creatorButtonClick(this.id)"}).append(mIcon("timer")));
	tButtons.append($('<button>', { id: "creatorButton3", class: "button creatorButton", onclick:"creatorButtonClick(this.id)"}).append(mIcon("details")));
	tButtons.append($('<button>', { id: "creatorButton4", class: "button creatorButton", onclick:"creatorButtonClick(this.id)"}).append(mIcon("save")));


	tFooter.append(tTimer);
	tFooter.append(tButtons);

	tContainer.append(tFooter);

	return tContainer;
}

function createSideBar(){
	var tBar = $('<div>', {id: "sideBar", class: "thaskSideBar"});
	tBar.append($('<button>', {id: "sideBarButton1", class: "button sideBarButton greyedOutButton", onclick:"sideBarButtonClick(this.id)"}).append(mIcon("change_history")));
	tBar.append($('<button>', {id: "sideBarButton2", class: "button sideBarButton", onclick:"sideBarButtonClick(this.id)"}).append(mIcon("home")));
	tBar.append($('<button>', {id: "sideBarButton3", class: "button sideBarButton", onclick:"sideBarButtonClick(this.id)"}).append(mIcon("star_border")));
	tBar.append($('<button>', {id: "sideBarButton4", class: "button sideBarButton", onclick:"sideBarButtonClick(this.id)"}).append(mIcon("text_fields")));
	tBar.append($('<button>', {id: "sideBarButton5", class: "button sideBarButton", onclick:"sideBarButtonClick(this.id)"}).append(mIcon("dashboard")));
	return tBar;
}
