//TemplateGenerator
//Fill in the table TemplateShapes that the script makes using the images from the imgur link
//imgur link: https://imgur.com/a/vekJIAg

//Also make a macro called ShapeMaker or something, body should read: !ShapemakerMacro
//Share that macro with all players.

//Warning! This only works on the page that the player tab is on. Make sure to select a token before clicking the shape

on("ready", function() {
    
    var getCleanImgsrc = function (imgsrc) {
        var parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^\?]*)(\?[^?]+)?$/);
        if(parts) {
            return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
        }
        return;
    };

    if (!findObjs({_type: 'rollabletable', name: 'TemplateShapes'})[0])
    {
        createObj('rollabletable', {
            name: 'TemplateShapes'
        });

        let TemplateShapesID = findObjs({_type: 'rollabletable', name: 'TemplateShapes'})[0].id;

        createObj('tableitem', {
            _rollabletableid: TemplateShapesID,
            name: '60ftConeFlat'
        });
        createObj('tableitem', {
            _rollabletableid: TemplateShapesID,
            name: '60ftConeAngled'
        });
        createObj('tableitem', {
            _rollabletableid: TemplateShapesID,
            name: '30ftLineFlat'
        });
        createObj('tableitem', {
            _rollabletableid: TemplateShapesID,
            name: '30ftLineAngle1'
        });
        createObj('tableitem', {
            _rollabletableid: TemplateShapesID,
            name: '30ftLineAngle2'
        });
        createObj('tableitem', {
            _rollabletableid: TemplateShapesID,
            name: '30ftLineAngle3'
        });
        createObj('tableitem', {
            _rollabletableid: TemplateShapesID,
            name: '30ftConeFlat'
        });
        createObj('tableitem', {
            _rollabletableid: TemplateShapesID,
            name: '30ftConeAngled'
        });
        createObj('tableitem', {
            _rollabletableid: TemplateShapesID,
            name: '20ftRad'
        });
        createObj('tableitem', {
            _rollabletableid: TemplateShapesID,
            name: '15ftRad'
        });
        createObj('tableitem', {
            _rollabletableid: TemplateShapesID,
            name: '15ftConeFlat'
        });
        createObj('tableitem', {
            _rollabletableid: TemplateShapesID,
            name: '15ftConeAngled'
        });
        createObj('tableitem', {
            _rollabletableid: TemplateShapesID,
            name: '10ftRad'
        });
        createObj('tableitem', {
            _rollabletableid: TemplateShapesID,
            name: '5ftRad'
        });
     }

    on("chat:message", function (msg) {
        
        if (msg.type === "api" && msg.content.split(' ')[0] === "!TemplateGenerator")  {
            MakeShape(msg);
        }
        if (msg.type === "api" && msg.content.split(' ')[0] === "!ShapemakerMacro")  {
            const TemplateShapesID = (findObjs({type: 'rollabletable', name: 'TemplateShapes'}, {caseInsensitive: true})||{id:'doesnotexist'})[0].id;
            const TemplateShapesArray = findObjs({type: 'tableitem', _rollabletableid: TemplateShapesID})
            .map((ti)=>getCleanImgsrc(ti.get('avatar')))
            .filter((i)=>!_.isUndefined(i));

            sendChat("", "&{template:sf_spell} {{name=Shape Maker}} {{title=AOE Templates}}  {{rightbanner=Click}}"+
            " {{notes=Select PC token and Click\n" +
            ' Radii:\n' +
            ' <a href="!TemplateGenerator 5ftRad 10 10"> <img src = ' + TemplateShapesArray[13] + ' height=\"30\" width=\"30\"> </a> ' +
            ' <a href="!TemplateGenerator 10ftRad 20 20"> <img src = ' + TemplateShapesArray[12] + ' height=\"30\" width=\"30\"> </a> ' +
            ' <a href="!TemplateGenerator 15ftRad 30 30"> <img src = ' + TemplateShapesArray[9] + ' height=\"30\" width=\"30\"> </a> ' +
            ' <a href="!TemplateGenerator 20ftRad 40 40"> <img src = ' + TemplateShapesArray[8] + ' height=\"30\" width=\"30\"> </a> \n' +
            ' Cones:\n' +
            ' <a href="!TemplateGenerator 15ftConeFlat 15 15"> <img src = ' + TemplateShapesArray[10] + ' height=\"30\" width=\"30\"> </a> ' + 
            ' <a href="!TemplateGenerator 15ftConeAngled 15 15"> <img src = ' + TemplateShapesArray[11] + ' height=\"30\" width=\"30\"> </a> ' + 
            ' <a href="!TemplateGenerator 30ftConeFlat 40 30"> <img src = ' + TemplateShapesArray[6] + ' height=\"30\" width=\"40\"> </a> ' + 
            ' <a href="!TemplateGenerator 30ftConeAngled 30 30"> <img src = ' + TemplateShapesArray[7] + ' height=\"30\" width=\"30\"> </a> ' + 
            ' <a href="!TemplateGenerator 60ftConeFlat 80 60"> <img src = ' + TemplateShapesArray[0] + ' height=\"30\" width=\"40\"> </a> ' + 
            ' <a href="!TemplateGenerator 60ftConeAngled 60 60"> <img src = ' + TemplateShapesArray[1] + ' height=\"30\" width=\"30\"> </a> \n' + 
            ' 30 ft Lines:\n' +
            ' <a href="!TemplateGenerator 30ftLineFlat 5 30"> <img src = ' + TemplateShapesArray[2] + ' height=\"30\" width=\"5\"> </a> ' + 
            ' <a href="!TemplateGenerator 30ftLineAngle1 10 30"> <img src = ' + TemplateShapesArray[3] + ' height=\"30\" width=\"10\"> </a> ' + 
            ' <a href="!TemplateGenerator 30ftLineAngle2 15 25"> <img src = ' + TemplateShapesArray[4] + ' height=\"30\" width=\"20\"> </a> ' + 
            ' <a href="!TemplateGenerator 30ftLineAngle3 20 20"> <img src = ' + TemplateShapesArray[5] + ' height=\"30\" width=\"30\"> </a>}}');
        }
    });

    function MakeShape(msg)
    {
        let campaign = findObjs({type: "campaign"})[0];
        let pageID = campaign.get("playerpageid");

        if(!msg.selected) 
        {
            sendChat("", "/w " + msg.who + " no token selected for generation point.");
            return;
        }
        
        let playerToken = getObj(msg.selected[0]._type, msg.selected[0]._id);
        let shapeName = msg.content.split(' ')[1];
        let shapeTable = findObjs({_type: 'rollabletable', name: 'TemplateShapes'})[0];
        let shapeItem = findObjs({_type: 'tableitem', _rollabletableid: shapeTable.id, name: shapeName})[0];
        let shapeWidth = msg.content.split(' ')[2];
        let shapeHeight = msg.content.split(' ')[3];
        let playerID = msg.playerid;

        
        createObj('graphic', {
            imgsrc: getCleanImgsrc(shapeItem.get('avatar')),
            name: shapeName,
            left: playerToken.get('left'),
            top: playerToken.get('top'),
            _pageid: pageID,
            layer: "objects",
            height: parseInt(shapeHeight)*14,
            width: parseInt(shapeWidth)*14,
            controlledby: playerID
        });
    }
});