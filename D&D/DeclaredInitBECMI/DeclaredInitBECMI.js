//For using declared individual initiatives in a Rules Cyclopedia game.
//Currently, this works for the BECMI sheet, or any sheet where you have an initiative attribute
//Change that attribute's value to be the total bonus (including dex/whatever).
//Don't use the init button from the sheet, make the macro to call this a token action.
//The reason is that by putting dex bonus into the initiative bonus on the sheet,
//the sheet initiative button will count it twice. 
//So if you're going to use this, just put the total bonus in the sheet, and roll from the macro.
//Macros are on the Gist.


on("ready", function() {

    on("chat:message", function (msg) {
        if (msg.type === "api" && msg.content.split(' ')[0] === "!DeclaredInitiative" && msg.selected != null)  {
            
            InitAdd(msg);
        }
    });

    on("chat:message", function (msg) {
        if (msg.type === "api" && msg.content === "!SortInitiative")  {
            
            InitSort();
        }
    });

    on("chat:message", function (msg) {
        if (msg.type === "api" && msg.content === "!ClearInitiative")  {
            
            ClearInit();
        }
    });

});

function InitAdd(msg){
    var turnorder;
    if(Campaign().get("turnorder") == "") turnorder = []; 
    else turnorder = JSON.parse(Campaign().get("turnorder"));

    var charID;
    var charName;
    var repsChar = true;
    var inTurnOrder = false;
    if(getObj(msg.selected[0]._type, msg.selected[0]._id).get('represents'))
    {
    charID = getObj(msg.selected[0]._type, msg.selected[0]._id).get('represents');
    charName = findObjs({_type: 'character', _id: charID})[0].get('name');
    }
    else
    {
        repsChar = false;
        charName = getObj(msg.selected[0]._type, msg.selected[0]._id).get('name');
    }
    //initiative_overall
    var bonusInit = 0;
    if (msg.content.split(' ')[3]) {bonusInit = parseInt(msg.content.split(' ')[3]);}
    var charOI
    if (repsChar && findObjs({_type: 'attribute', _characterid: charID, name: 'initiative'})[0])
    {
        charOI = findObjs({_type: 'attribute', _characterid: charID, name: 'initiative'})[0].get('current');
    }
    else
    {
        charOI = 0;
    }
    var initRoll = parseInt(charOI) + randomInteger(6) + bonusInit;
    var nameMod = msg.content.split(' ')[1];
    if (msg.content.split(' ')[2] == "2Hander") { initRoll = 0; }
    charName += (' ' + nameMod);
    sendChat(msg.who, '&{template:5eDefault} {{title=Initiative}} {{subheader=' + charName + '}} {{rollname=Initiative}} {{roll=[[' + initRoll + ']]}}');
    //Add a new custom entry to the end of the turn order, or replaces value, if already in turnorder.
    turnorder.forEach(function(a)
    {
        if (a.id == getObj(msg.selected[0]._type, msg.selected[0]._id).id)
        {
            inTurnOrder = true;
            a.pr = initRoll + " " + nameMod;
        }
    })

    if (!inTurnOrder)
    {
        turnorder.push({
            id: getObj(msg.selected[0]._type, msg.selected[0]._id).id,
            pr: initRoll + " " + nameMod,
            custom: ""
        });
    }
    Campaign().set("turnorder", JSON.stringify(turnorder));
}

function InitSort(){
    var turnorder;
    if(Campaign().get("turnorder") == "") return;
    turnorder = JSON.parse(Campaign().get("turnorder"));

    turnorder.sort(function(a, b) {
        var initA = parseInt(a.pr.split(' ')[0]);
        var initB = parseInt(b.pr.split(' ')[0]);
        if (initA > initB) {
            return -1;
        }
        if (initA < initB) {
            return 1;
        }
        return 0;
    });
    
    Campaign().set("turnorder", JSON.stringify(turnorder));
}

function ClearInit(){
    if(Campaign().get("turnorder") == "") return;
    let turnorder = [];
    Campaign().set("turnorder", JSON.stringify(turnorder));
}
