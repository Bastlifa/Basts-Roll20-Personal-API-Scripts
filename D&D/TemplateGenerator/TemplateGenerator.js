//TemplateGenerator
//make the macro seen in other file.
//Make a rollable table with template shapes, and names being: Circle, Cone, Square, Line. Table name is: TemplateShapes
//Here are some shapes I made. Use them, or make your own: https://imgur.com/a/UZiIl

on("ready", function() {
    
    var getCleanImgsrc = function (imgsrc) {
        var parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^\?]*)(\?[^?]+)?$/);
        if(parts) {
            return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
        }
        return;
    };

    on("chat:message", function (msg) {
        
        if (msg.type === "api" && msg.content.split(' ')[0] === "!TemplateGenerator")  {
            MakeShape(msg);
        }
        /*if (msg.type === "api" && msg.content.split(' ')[0] === "!ClearTemplates")  {
            ClearShapes();
        }*/
    });

    function MakeShape(msg)
    {
        let campaign = findObjs({type: "campaign"})[0];
        let pageID = campaign.get("playerpageid");
        let gridScale = 5 / parseFloat(findObjs({_type: 'page', _id: pageID})[0].get('scale_number'));
        if(!msg.selected) 
        {
            sendChat("", "/w " + msg.who + " no token selected for generation point.");
            return;
        }
        
        let playerToken = getObj(msg.selected[0]._type, msg.selected[0]._id);
        let shapeName = msg.content.split(' ')[1];
        let shapeTable = findObjs({_type: 'rollabletable', name: 'TemplateShapes'})[0];
        let shapeItem = findObjs({_type: 'tableitem', _rollabletableid: shapeTable.id, name: shapeName})[0];
        let shapeSize = msg.content.split(' ')[2] * gridScale;
        if (shapeName == "Circle") {shapeSize *= 2; }
        let playerID = msg.playerid;

        if (shapeName != 'Line' && shapeName != 'Cone')
        {
            createObj('graphic', {
                imgsrc: getCleanImgsrc(shapeItem.get('avatar')),
                name: shapeName,
                left: playerToken.get('left'),
                top: playerToken.get('top'),
                _pageid: pageID,
                layer: "objects",
                height: parseInt(shapeSize)*14,
                width: parseInt(shapeSize)*14,
                controlledby: playerID
            });
        }

        else if (shapeName === 'Line'|| shapeName === 'Cone')
        {
            let lineOffsetTop = 0;
            let lineOffsetLeft = 0;
            let lineAngle = 0;
            if (msg.content.split(' ')[3])
            {
                lineAngle = parseInt(msg.content.split(' ')[3]);
                lineAngleRad = lineAngle*Math.PI/180;
                if (lineAngle == 0 || lineAngle == 90 || lineAngle == 180 || lineAngle == 270)
                {
                    lineOffsetTop = ((5*gridScale+ parseInt(shapeSize))/2)*Math.sin(lineAngleRad);
                    lineOffsetLeft = ((5*gridScale+ parseInt(shapeSize))/2)*Math.cos(lineAngleRad);
                }
                else 
                {
                    lineOffsetTop = ((7*gridScale+ parseInt(shapeSize))/2)*Math.sin(lineAngleRad);
                    lineOffsetLeft = ((7*gridScale+ parseInt(shapeSize))/2)*Math.cos(lineAngleRad);
                }
                
            }
            if (shapeName === 'Line')
            {
                createObj('graphic', {
                    imgsrc: getCleanImgsrc(shapeItem.get('avatar')),
                    name: shapeName,
                    left: playerToken.get('left') + lineOffsetLeft*14,
                    top: playerToken.get('top') - lineOffsetTop*14,
                    _pageid: pageID,
                    layer: "objects",
                    height: 70 * gridScale,
                    width: parseInt(shapeSize)*14,
                    controlledby: playerID,
                    rotation: -1*lineAngle
                });
            }
            if (shapeName === 'Cone')
            {
                createObj('graphic', {
                    imgsrc: getCleanImgsrc(shapeItem.get('avatar')),
                    name: shapeName,
                    left: playerToken.get('left') + lineOffsetLeft*14,
                    top: playerToken.get('top') - lineOffsetTop*14,
                    _pageid: pageID,
                    layer: "objects",
                    height: parseInt(shapeSize)*14,
                    width: parseInt(shapeSize)*14,
                    controlledby: playerID,
                    rotation: -1*(lineAngle + 90)
                });
            }
            
        
        }
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