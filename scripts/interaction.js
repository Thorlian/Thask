var gDisplayedTimers = [];
var gCurrentEditor = null;
var gCurrentDisplay = null;
var gAutoSaver;

function appendTimer(pThaskElem){ //takes id of thask card dom element and appends timer if element and thask exist
  var tThask = pThaskElem.substr(0, 20);
  var tTimer = createTimerElement(tThask);
  $(tTimer).slideUp(0);
  $('#' + pThaskElem + ' .thaskFooter').prepend(tTimer);
  gDisplayedTimers.push(tThask);
  updateTimer();
}

function thaskOnClick(pThaskElem){
  var tThask = pThaskElem.substr(0, 20);
  console.log(pThaskElem);
  launchThaskEditor(tThask);
  displayChildren(tThask);



}

function updateTimer(){
  if (gDisplayedTimers.length == 0){return 1;}
  var tTime;
  if(gThasks.timedThasks[0] == gCurrentEditor){
    $('#creatorButton1 .material-icons').text("pause");
  }
  $("#" + gThasks.timedThasks[0] + "B1 .material-icons").text("pause");
  gDisplayedTimers.forEach(function(pItem){
    tTime = gThasks[pItem].time + gThasks[pItem].subTime;
    $("." + pItem + "Timer .timerCounter").text(formatTimer(tTime));
    if (gThasks[pItem].goal != 0){
       $("." + pItem + "Timer .timerProgress").css("width", "" + (Math.min(Math.ceil((tTime / gThasks[pItem].goal * 100)), 100))  + "%");
     }
  });
}

function updateDisplayedTimers() { //updates the gDisplayedThasks variable
  var tArr;
  if(gCurrentDisplay == null){
    tArr = gThasks.primes;
  }else{
    tArr = gThasks[gCurrentDisplay].sub;
  }
  tArr = arrayIntersection(tArr, gThasks["timedThasks"]);
  if(gThasks.timedThasks.includes(gCurrentEditor) && !gDisplayedTimers.includes(gCurrentEditor))
    tArr.push(gCurrentEditor);
  gDisplayedTimers = tArr;

}




function launchThaskEditor(pThask){
  $('#thaskCreator *').off("input");

  closeEditor();
  if(pThask == "new"){
    gThasks["new"] = $.extend(true,{},gThasks["blank"]);
    gThasks["new"].super = gCurrentDisplay;
  }

  var tThask = gThasks[pThask];

  $("#creatorTitle").html(tThask.name);
  $("#creatorField").html(tThask.description);
  //console.log(tThask);

  gCurrentEditor = pThask;

  $("#creatorTimer").removeClass();
  $("#creatorTimer").addClass(gCurrentEditor + "Timer");
  $("#creatorCurrentTime").text(formatTimer(gThasks[gCurrentEditor].time));
  $("#creatorGoalHours").text(formatTimer(gThasks[gCurrentEditor].goal).split(":")[0]);
  $("#creatorGoalMinutes").text(formatTimer(gThasks[gCurrentEditor].goal).split(":")[1]);
  $('#creatorField').on("input", function(){
    console.log("autosavingDescription");
    gThasks[gCurrentEditor].description = $('#creatorField').html();
  });
  $('#creatorHeader > h2').on("input", function(){
    console.log("autosavingTitle");
    gThasks[gCurrentEditor].name = $('#creatorHeader > h2').html();
  });
  $('#thaskCreator').show(150);

  setTimeout(function() {
    updateDisplayedTimers();
    updateTimer();
  }, 250);

}

function saveEditor(){
  if(gCurrentEditor == "new"){
    gThasks["new"].id = idGenerator(gThasks["new"].name);
    gThasks[gThasks["new"].id] = gThasks["new"];
    gCurrentEditor = gThasks["new"].id;
    if(gThasks["new"].super == null){
      gThasks["primes"].push(gThasks["new"].id);
    } else {
      gThasks[gThasks["new"].super].sub.push(gThasks["new"].id);
    }
    gCurrentEditor = gThasks["new"].id;
  }
  if ( gCurrentEditor != null){
    //console.log("saving goal");
    gThasks[gCurrentEditor].goal = $("#creatorGoalHours").text()*3600000+ $("#creatorGoalMinutes").text()*60000;
  }
  refreshThasks();
  saveLocalThasks();
}


function closeEditor(){
  saveEditor();
  $('#thaskCreator').hide(150);
  //potentially remove interval
}

function upwardsButton(){//called by the up button in the editor header, rises one layer in the thask tree
  if (gCurrentDisplay == null){ return 1;}
  if(gThasks[gCurrentDisplay].super == null){
    displayThasks(gThasks.primes);
    gCurrentDisplay = null;
    $('#sideBarButton1').addClass("greyedOutButton");
    closeEditor();
    updateDisplayedTimers();
  } else {
    displayChildren(gThasks[gCurrentDisplay].super);
    closeEditor();
    launchThaskEditor(gCurrentDisplay);
  }
}

function floatyButtonAdd(){
  launchThaskEditor("new");
}

function thaskButtonClick(pId){
  event.stopPropagation()
  var tThask = pId.substr(0, 20);
  var tSwitch = pId.substr(20);
  console.log("'"+tThask + "' " +tSwitch);
  switch(tSwitch){
    case "B1": //play/pause timer
      if (gThasks.timeOld == 0){
        $("#" + tThask + "B1 .material-icons").text("pause");
      }else{
        $("#" + tThask + "B1 .material-icons").text("play_arrow");
      }
      if(!($("#" + tThask + "Timer").length)){
        appendTimer(tThask);  }
      $("#" + tThask + "Timer").slideDown(250);
      toggleTimer(tThask);
      break;
    case "B2"://show timer
      if(!($("#" + tThask + "Timer").length)){
        appendTimer(tThask);  }
      $("#" + tThask + "Timer").slideToggle(250);
      break;
    case "B3"://show children
      displayChildren(tThask);
      break;
    case "B4"://open editor
      launchThaskEditor(tThask);
      break;
    case "B5"://archive thask tbd
      archiveDialog(tThask);
      break;
  }
}


function sideBarButtonClick(pId){
  switch(pId){
    case "sideBarButton1": //up
      upwardsButton();
      break;
    case "sideBarButton2": //home
      closeEditor();
      gCurrentDisplay  = null;
      $('#sideBarButton1').addClass("greyedOutButton");
      displayThasks(gThasks.primes);
      updateDisplayedTimers();
      break;
    case "sideBarButton3": //Pin Grid Toggle
      break;
    case "sideBarButton4": //Editor Toggle
      if(gCurrentEditor == null){ gCurrentEditor = "new";}
      $('#thaskCreator').toggle(150);
      break;
    case "sideBarButton5": //grid Toggle
      $('#thaskWrapper').toggle(150);
      break;
  }

}

function creatorButtonClick(pId){
  switch(pId){
    case "creatorButton1":
    if (gThasks.timeOld == 0){
      $("#creatorButton1 .material-icons").text("pause");
    }else{
      $("#creatorButton1 .material-icons").text("play_arrow");
    }
    toggleTimer(gCurrentEditor);
      break;
    case "creatorButton2":
      $("#creatorTimer").slideToggle(150);
      break;
    case "creatorButton3": //display children
      displayChildren(gCurrentEditor);
      break;
    case "creatorButton4":
      saveEditor();
      break;
  }

}

function archiveDialog(pThask){
  var tDialog = $('<div>', {text: "Archived Data can not be restored! Choose to archive just the Thask or the Thask as well as its Children."})
  tDialog.dialog({
      resizable: false,
      draggable: false,
      dialogClass: "archive_dialog",
      title: "Archive?",
      closeOnEscape: true,
      height: "auto",
      appendTo: "#contentContainer",
      width: 600,
      modal: true,
      buttons: {
        "Thask": function() {
          archiveSingleThask(pThask);
          refreshThasks();
          $( this ).dialog( "close" );
        },
        "Thask + SubThasks": function() {
          archiveThasks(pThask);
          refreshThasks();
          $( this ).dialog( "close" );
        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      },
      close: function( pEvent, pUi ) {$( this ).dialog("destroy");}
    });
}

function displayChildren(pThask){
  displayThasks(gThasks[pThask].sub);
  $('#sideBarButton1').removeClass("greyedOutButton");
  gCurrentDisplay = pThask;
  updateDisplayedTimers();
}

function refreshThasks(){
  tDisplay = (gCurrentDisplay == null) ? gThasks.primes : gThasks[gCurrentDisplay].sub;
  displayThasks(tDisplay);
}

function stopEventBubbling(){
  event.stopPropagation();
}




$( document ).ready(function() {
    loadLocalThasks();
		createPage();
    restoreTimer();
});

$(document).on('keydown', '.editor', function(e){ //lets the user insert tab keys into elements with class editor
  //detect 'tab' key
  if(e.keyCode == 9){
    //add tab
    document.execCommand('insertHTML', false, '&#009');
    //prevent focusing on next element
    e.preventDefault()
  }
});
