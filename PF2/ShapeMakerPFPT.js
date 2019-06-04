//TemplateGenerator
//Creates a rollable table called TemplateShapes
//Add images from imgur links to the avatars for table items:
// https://imgur.com/a/EimYRXn
// https://imgur.com/a/5vspxdU
//Make a macro called ShapeMaker, or whatever you please. Share with all players. Body of macro should be: !ShapemakerMacro

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
        createObj('tableitem', {
            _rollabletableid: TemplateShapesID,
            name: '30ftRad'
        });
        createObj('tableitem', {
            _rollabletableid: TemplateShapesID,
            name: '60ftLineFlat'
        });
        createObj('tableitem', {
            _rollabletableid: TemplateShapesID,
            name: '60ftLineAngle1'
        });
        createObj('tableitem', {
            _rollabletableid: TemplateShapesID,
            name: '60ftLineAngle2'
        });
        createObj('tableitem', {
            _rollabletableid: TemplateShapesID,
            name: '60ftLineAngle3'
        });
        createObj('tableitem', {
            _rollabletableid: TemplateShapesID,
            name: 'flipv'
        });
        createObj('tableitem', {
            _rollabletableid: TemplateShapesID,
            name: 'fliph'
        });
        createObj('tableitem', {
            _rollabletableid: TemplateShapesID,
            name: 'rotccw'
        });
        createObj('tableitem', {
            _rollabletableid: TemplateShapesID,
            name: 'rotcw'
        });
    }

    on("chat:message", function (msg) {
        
        if (msg.type === "api" && msg.content.split(' ')[0] === "!TemplateGenerator")  {
            MakeShape(msg);
        }
        if (msg.type === "api" && msg.content === "!TemplateGeneratorFlipShapeV")  {
            FlipShape('vert', msg);
        }
        if (msg.type === "api" && msg.content === "!TemplateGeneratorFlipShapeH")  {
            FlipShape('horiz', msg);
        }
        if (msg.type === "api" && msg.content === "!TemplateGeneratorRotShapeCW")  {
            RotShape('cw', msg);
        }
        if (msg.type === "api" && msg.content === "!TemplateGeneratorRotShapeCCW")  {
            RotShape('ccw', msg);
        }
        if (msg.type === "api" && msg.content.split(' ')[0] === "!ShapemakerMacro")  {
            const TemplateShapesID = (findObjs({type: 'rollabletable', name: 'TemplateShapes'}, {caseInsensitive: true})||{id:'doesnotexist'})[0].id;
            const TemplateShapesArray = findObjs({type: 'tableitem', _rollabletableid: TemplateShapesID})
            .map((ti)=>getCleanImgsrc(ti.get('avatar')))
            .filter((i)=>!_.isUndefined(i));

            sendChat("", "&{template:generic} {{name=Shape Maker}}"+
            " {{notes=Select PC token and Click\n" +
            ' Radii:\n' +
            ' <a href="!TemplateGenerator 5ftRad 10 10"> <img src = ' + TemplateShapesArray[13] + ' height=\"30\" width=\"30\"> </a> ' +
            ' <a href="!TemplateGenerator 10ftRad 20 20"> <img src = ' + TemplateShapesArray[12] + ' height=\"30\" width=\"30\"> </a> ' +
            ' <a href="!TemplateGenerator 15ftRad 30 30"> <img src = ' + TemplateShapesArray[9] + ' height=\"30\" width=\"30\"> </a> ' +
            ' <a href="!TemplateGenerator 20ftRad 40 40"> <img src = ' + TemplateShapesArray[8] + ' height=\"30\" width=\"30\"> </a> ' +
            ' <a href="!TemplateGenerator 30ftRad 60 60"> <img src = ' + TemplateShapesArray[14] + ' height=\"30\" width=\"30\"> </a>\n' +
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
            ' <a href="!TemplateGenerator 30ftLineAngle3 20 20"> <img src = ' + TemplateShapesArray[5] + ' height=\"30\" width=\"30\"> </a> \n' +
            ' 60 ft Lines:\n' +
            ' <a href="!TemplateGenerator 60ftLineFlat 5 60"> <img src = ' + TemplateShapesArray[15] + ' height=\"30\" width=\"5\"> </a> ' + 
            ' <a href="!TemplateGenerator 60ftLineAngle1 55 20"> <img src = ' + TemplateShapesArray[16] + ' height=\"10\" width=\"40\"> </a> ' + 
            ' <a href="!TemplateGenerator 60ftLineAngle2 50 25"> <img src = ' + TemplateShapesArray[17] + ' height=\"20\" width=\"30\"> </a> ' + 
            ' <a href="!TemplateGenerator 60ftLineAngle3 40 40"> <img src = ' + TemplateShapesArray[18] + ' height=\"20\" width=\"20\"> </a> ' +
            ' Controls:\n ' +
            ' <a href="!TemplateGeneratorFlipShapeV"> <img src = ' + TemplateShapesArray[19] + ' height=\"20\" width=\"20\"> </a> ' +
            ' <a href="!TemplateGeneratorFlipShapeH"> <img src = ' + TemplateShapesArray[20] + ' height=\"20\" width=\"20\"> </a> ' +
            ' <a href="!TemplateGeneratorRotShapeCCW"> <img src = ' + TemplateShapesArray[21] + ' height=\"20\" width=\"20\"> </a> ' +
            ' <a href="!TemplateGeneratorRotShapeCW"> <img src = ' + TemplateShapesArray[22] + ' height=\"20\" width=\"20\"> </a>}}');
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

    function FlipShape(flipAxis, msg)
    {
        if(!msg.selected)
        {
            sendChat("", "/w " + msg.who + " no token selected for flip.");
            return;
        }
        let shapeToken = getObj(msg.selected[0]._type, msg.selected[0]._id);
        if (flipAxis == 'vert')
        {
            if (shapeToken.get('flipv'))
            {
                shapeToken.set('flipv', false);
            }
            else
            {
                shapeToken.set('flipv', true);
            }
        }
        else if (flipAxis == 'horiz')
        {
            if (shapeToken.get('fliph'))
            {
                shapeToken.set('fliph', false);
            }
            else
            {
                shapeToken.set('fliph', true);
            }
        }
        else
        {
            return;
        }
    }

    function RotShape(direction, msg)
    {
        if(!msg.selected)
        {
            sendChat("", "/w " + msg.who + " no token selected for flip.");
            return;
        }
        let shapeToken = getObj(msg.selected[0]._type, msg.selected[0]._id);
        if (direction == 'ccw')
        {
            shapeToken.set('rotation', shapeToken.get('rotation') - 90);
        }
        else if (direction == 'cw')
        {
            shapeToken.set('rotation', shapeToken.get('rotation') + 90);
        }
        else 
        { return; }
    }
    /*function ClearShapes()
    {
        let campaign = findObjs({type: "campaign"})[0];
        let pageID = campaign.get("playerpageid");
        let circles = findObjs({type: 'graphic', _pageid: pageID, name: 'Circle'});
        for (var i = 0; i< circles.length; i++)
        {
            circles[i].remove();
        }
    }*/

});