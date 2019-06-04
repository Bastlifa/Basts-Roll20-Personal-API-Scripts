/*********************************************************************************
 * Starfinder Helm Controls
 * Control your ship via chat buttons.
 * First make a custom VFX called "rocket" (no quotes).
 * Copt the text from RocketVFX.txt into there, save.
 * Type !HelmControls to bring up the command pane in chat.
 * Select ship token (player page should be the same as viewing page, probably).
 * Try the commands (set speed and rotation offset first).
 ********************************************************************************/

const gridSpacing = 80;

on("ready", function() 
{
    if (!findObjs({_type: 'rollabletable', name: 'HelmControlImages'})[0])
    {
        createObj('rollabletable', {
            name: 'HelmControlImages'
        });

        let HelmControlImagesID = findObjs({_type: 'rollabletable', name: 'HelmControlImages'})[0].id;

        createObj('tableitem', {
            _rollabletableid: HelmControlImagesID,
            name: 'Left'
        });
        createObj('tableitem', {
            _rollabletableid: HelmControlImagesID,
            name: 'Right'
        });
        createObj('tableitem', {
            _rollabletableid: HelmControlImagesID,
            name: 'Forward'
        });
        createObj('tableitem', {
            _rollabletableid: HelmControlImagesID,
            name: 'SlideLeft'
        });
        createObj('tableitem', {
            _rollabletableid: HelmControlImagesID,
            name: 'SlideRight'
        });
        createObj('tableitem', {
            _rollabletableid: HelmControlImagesID,
            name: 'Reverse'
        });
        createObj('tableitem', {
            _rollabletableid: HelmControlImagesID,
            name: 'SetSpeed'
        });
    }

    const funcNamesArray = ["!HelmControls", "!ShipSpeed", "!ShipForward", "!ShipReverse", "!ShipSlideLeft", "!ShipSlideRight", "!ShipTurnLeft",
                            "!ShipTurnRight", "!ShipRefuel", "!ShipSetRotationOffset"];

    on("chat:message", function (msg) {
        if (msg.type === "api")
        {
            if (funcNamesArray.includes(msg.content.split(' ')[0]))
            {
                switch(msg.content.split(' ')[0]) 
                {
                    case ("!HelmControls"):
                        HelmControls();
                        break;
                    case ("!ShipSpeed"):
                        ShipSpeed(msg);
                        break;
                    case ("!ShipForward"):
                        ShipForward(msg);
                        break;
                    case ("!ShipReverse"):
                        ShipReverse(msg);
                        break;
                    case ("!ShipSlideLeft"):
                        ShipSlideLeft(msg);
                        break;
                    case ("!ShipSlideRight"):
                        ShipSlideRight(msg);
                        break;
                    case ("!ShipTurnLeft"):
                        ShipTurnLeft(msg);
                        break;
                    case ("!ShipTurnRight"):
                        ShipTurnRight(msg);
                        break;
                    case ("!ShipRefuel"):
                        ShipRefuel(msg);
                        break;
                    case ("!ShipSetRotationOffset"):
                        ShipSetRotationOffset(msg);
                        break;
                    default:
                        break;
                }
            }
        }
    });
});

function HelmControls()
{
    var getCleanImgsrc = function (imgsrc) {
        var parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^\?]*)(\?[^?]+)?$/);
        if(parts) {
        return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
        }
        return;
    };


    const HelmImagesID = (findObjs({type: 'rollabletable', name: 'HelmControlImages'}, {caseInsensitive: true})||{id:'doesnotexist'})[0].id;
            const HelmImageArray = findObjs({type: 'tableitem', _rollabletableid: HelmImagesID})
            .map((ti)=>getCleanImgsrc(ti.get('avatar')))
            .filter((i)=>!_.isUndefined(i));

        sendChat("", "&{template:sf_spell} {{name=Ship Controls}} {{title=Helm Buttons}}  {{rightbanner=Click}}"+
        " {{notes=Select ship and Click\n" +
        ' <a href="!ShipTurnLeft"> <img src = ' + HelmImageArray[0] + ' height=\"20\" width=\"20\"> </a> ' +
        ' <a href="!ShipForward"> <img src = ' + HelmImageArray[2] + ' height=\"20\" width=\"20\"> </a> ' +
        ' <a href="!ShipTurnRight"> <img src = ' + HelmImageArray[1] + ' height=\"20\" width=\"20\"> </a> \n' +
        ' <a href="!ShipSlideLeft"> <img src = ' + HelmImageArray[3] + ' height=\"20\" width=\"20\"> </a> ' + 
        ' <a href="!ShipReverse"> <img src = ' + HelmImageArray[5] + ' height=\"20\" width=\"20\"> </a> ' + 
        ' <a href="!ShipSlideRight"> <img src = ' + HelmImageArray[4] + ' height=\"20\" width=\"20\"> </a>\n' +
        ' [SetSpeed](!ShipSpeed ?{Speed}) [Refuel](!ShipRefuel) [Set Rot Offset](!ShipSetRotationOffset ?{Rotation Offset|0})}}');
}

function ShipSpeed(msg)
{
    if (msg.content.split(' ')[1])
    {
        let speed = parseInt(msg.content.split(' ')[1]);
        if (!msg.selected)
        {
            sendChat('', "Please Select a Ship Token");
        }
        else 
        {
            getObj(msg.selected[0]._type, msg.selected[0]._id).set("bar3_max", speed);
            getObj(msg.selected[0]._type, msg.selected[0]._id).set("bar3_value", speed);
        }
    }
}

function ShipForward(msg)
{
    if (!msg.selected) 
    {
        sendChat('', "Please Select a Ship Token");
        return; 
    }
    else
    {
        let shipToken = getObj('graphic', msg.selected[0]._id);
        if(shipToken)
        {
            let speed = shipToken.get("bar3_value")*1||0;
            if (speed <= 0)
            {
                sendChat("", "Ship is out of movement");
            }
            else
            {
                let tokenRotation = shipToken.get("rotation");
                let rotationOffset = shipToken.get("bar2_value")*1||0;
                let tokenLeft = shipToken.get("left");
                let tokenTop = shipToken.get("top");
                
                let newLeft = tokenLeft - Math.cos(((Math.PI)/180)*(tokenRotation + rotationOffset))*gridSpacing;
                let newTop = tokenTop - Math.sin(((Math.PI)/180)*(tokenRotation + rotationOffset))*gridSpacing;
                EngineFX(msg, "FWD");
                shipToken.set("left", newLeft);
                shipToken.set("top", newTop);
                speed--;
                shipToken.set("bar3_value", speed);
            }
        }
    }
}

function ShipReverse(msg)
{
    if (!msg.selected) {
        sendChat('', "Please Select a Ship Token");
        return; 
    }
    else
    {
        let shipToken = getObj('graphic', msg.selected[0]._id);
        if(shipToken)
        {
            let speed = shipToken.get("bar3_value")*1||0;
            if (speed <= 0)
            {
                sendChat("", "Ship is out of movement");
            }
            else
            {
                let tokenRotation = shipToken.get("rotation");
                let rotationOffset = shipToken.get("bar2_value")*1||0;
                let tokenLeft = shipToken.get("left");
                let tokenTop = shipToken.get("top");

                let newLeft = tokenLeft + Math.cos(((Math.PI)/180)*(tokenRotation + rotationOffset))*gridSpacing;
                let newTop = tokenTop + Math.sin(((Math.PI)/180)*(tokenRotation + rotationOffset))*gridSpacing;
                EngineFX(msg, "REV");
                shipToken.set("left", newLeft);
                shipToken.set("top", newTop);
                speed -=2;
                shipToken.set("bar3_value", speed);
            }   
        }
    }
}

function ShipSlideLeft(msg)
{
    if (!msg.selected) {
        sendChat('', "Please Select a Ship Token");
        return; 
    }
    else
    {
        let shipToken = getObj('graphic', msg.selected[0]._id);
        if(shipToken)
        {
            let speed = shipToken.get("bar3_value")*1||0;
            if (speed <= 0)
            {
                sendChat("", "Ship is out of movement");
            }
            else
            {
                let tokenRotation = shipToken.get("rotation");
                let rotationOffset = shipToken.get("bar2_value")*1||0;
                let tokenLeft = shipToken.get("left");
                let tokenTop = shipToken.get("top");

                let newLeft = tokenLeft - Math.cos(((Math.PI)/180)*(tokenRotation + rotationOffset -60))*gridSpacing;
                let newTop = tokenTop - Math.sin(((Math.PI)/180)*(tokenRotation + rotationOffset -60))*gridSpacing;
                EngineFX(msg, "SLT");
                shipToken.set("left", newLeft);
                shipToken.set("top", newTop);
                speed --;
                shipToken.set("bar3_value", speed);
            }   
        }
    }
}

function ShipSlideRight(msg)
{
    if (!msg.selected) {
        sendChat('', "Please Select a Ship Token");
        return; 
    }
    else
    {
        let shipToken = getObj('graphic', msg.selected[0]._id);
        if(shipToken)
        {
            let speed = shipToken.get("bar3_value")*1||0;
            if (speed <= 0)
            {
                sendChat("", "Ship is out of movement");
            }
            else
            {
                let tokenRotation = shipToken.get("rotation");
                let rotationOffset = shipToken.get("bar2_value")*1||0;
                let tokenLeft = shipToken.get("left");
                let tokenTop = shipToken.get("top");

                let newLeft = tokenLeft - Math.cos(((Math.PI)/180)*(tokenRotation + rotationOffset + 60))*gridSpacing;
                let newTop = tokenTop - Math.sin(((Math.PI)/180)*(tokenRotation + rotationOffset + 60))*gridSpacing;
                EngineFX(msg, "SRT");
                shipToken.set("left", newLeft);
                shipToken.set("top", newTop);
                speed --;
                shipToken.set("bar3_value", speed);
            }   
        }
    }
}

function ShipTurnLeft(msg)
{
    if (!msg.selected) {
        sendChat('', "Please Select a Ship Token");
        return; 
    }
    else
    {
        let shipToken = getObj('graphic', msg.selected[0]._id);
        if(shipToken)
        {
            let tokenRotation = shipToken.get("rotation");
            tokenRotation -= 60;
            EngineFX(msg, "TLT");
            shipToken.set("rotation", tokenRotation);
        }
    }
}

function ShipTurnRight(msg)
{
    if (!msg.selected) {
        sendChat('', "Please Select a Ship Token");
        return; 
    }
    else
    {
        let shipToken = getObj('graphic', msg.selected[0]._id);
        if(shipToken)
        {
            let tokenRotation = shipToken.get("rotation");
            tokenRotation += 60;
            EngineFX(msg, "TRT");
            shipToken.set("rotation", tokenRotation);
        }
    }
}

function ShipRefuel(msg)
{
    if (!msg.selected) {
        sendChat('', "Please Select a Ship Token");
        return; 
    }
    else
    {
        let shipToken = getObj('graphic', msg.selected[0]._id);
        if(shipToken)
        {
            let speed = shipToken.get("bar3_max")*1||0;
            shipToken.set("bar3_value", speed);
        }
    }
}

function ShipSetRotationOffset(msg)
{
    if (!msg.selected) {
        sendChat('', "Please Select a Ship Token");
        return; 
    }
    else
    {
        if (msg.content.split(' ')[1])
        {
            let rotOffset = parseInt(msg.content.split(' ')[1]);
            let shipToken = getObj('graphic', msg.selected[0]._id);
            if(shipToken)
            {
                shipToken.set("bar2_value", rotOffset);
            }
        }
    }
}

function EngineFX(msg, direction)
{
    if (!msg.selected) {
        sendChat('', "Please Select a Ship Token");
        return; 
    }
    else
    {
        let shipToken = getObj('graphic', msg.selected[0]._id);
        if(shipToken)
        {
            let campaign = findObjs({type: "campaign"})[0];
            let pageID = campaign.get("playerpageid");
            let shipLeft = shipToken.get("left");
            let shipTop = shipToken.get("top");
            let shipRot = shipToken.get("rotation") + shipToken.get("bar2_value")*1||0;
            let rocketID = findObjs({_type: "custfx", name: "rocket"})[0].id;
            let flameStartX;
            let flameStartY;
            let secondaryFlameX;
            let secondaryFlameY;
            switch(direction)
            {
                case ("FWD"):
                    flameStartX = shipLeft + Math.cos((Math.PI/180)*shipRot) * 40;
                    flameStartY = shipTop + Math.sin((Math.PI/180)*shipRot) * 40;
                    spawnFxBetweenPoints({x: flameStartX, y:flameStartY}, {x: flameStartX + Math.cos((Math.PI/180)*shipRot), y:flameStartY + Math.sin((Math.PI/180)*shipRot)}, rocketID, pageID);
                    break;
                case ("REV"):
                    flameStartX = shipLeft - Math.cos((Math.PI/180)*shipRot) * 40;
                    flameStartY = shipTop - Math.sin((Math.PI/180)*shipRot) * 40;
                    spawnFxBetweenPoints({x: flameStartX, y:flameStartY}, {x: flameStartX - Math.cos((Math.PI/180)*shipRot), y:flameStartY - Math.sin((Math.PI/180)*shipRot)}, rocketID, pageID);
                    break;
                case ("SLT"):
                    flameStartX = shipLeft + Math.cos((Math.PI/180)*shipRot) * 40;
                    flameStartY = shipTop + Math.sin((Math.PI/180)*shipRot) * 40;
                    secondaryFlameX = shipLeft - Math.cos((Math.PI/180)*shipRot) * 40;
                    secondaryFlameY = shipTop - Math.sin((Math.PI/180)*shipRot) * 40;
                    spawnFxBetweenPoints({x: flameStartX, y:flameStartY}, {x: flameStartX + Math.cos((Math.PI/180)*(shipRot - 60)), y:flameStartY + Math.sin((Math.PI/180)*(shipRot - 60))}, rocketID, pageID);
                    spawnFxBetweenPoints({x: secondaryFlameX, y: secondaryFlameY}, {x: secondaryFlameX + Math.cos((Math.PI/180)*(shipRot - 60)), y: secondaryFlameY + Math.sin((Math.PI/180)*(shipRot - 60))}, rocketID, pageID);
                    break;
                case ("SRT"):
                    flameStartX = shipLeft + Math.cos((Math.PI/180)*shipRot) * 40;
                    flameStartY = shipTop + Math.sin((Math.PI/180)*shipRot) * 40;
                    secondaryFlameX = shipLeft - Math.cos((Math.PI/180)*shipRot) * 40;
                    secondaryFlameY = shipTop - Math.sin((Math.PI/180)*shipRot) * 40;
                    spawnFxBetweenPoints({x: flameStartX, y:flameStartY}, {x: flameStartX + Math.cos((Math.PI/180)*(shipRot + 60)), y:flameStartY + Math.sin((Math.PI/180)*(shipRot + 60))}, rocketID, pageID);
                    spawnFxBetweenPoints({x: secondaryFlameX, y: secondaryFlameY}, {x: secondaryFlameX + Math.cos((Math.PI/180)*(shipRot + 60)), y: secondaryFlameY + Math.sin((Math.PI/180)*(shipRot + 60))}, rocketID, pageID);
                    break;
                case ("TLT"):
                    flameStartX = shipLeft + Math.cos((Math.PI/180)*shipRot) * 40;
                    flameStartY = shipTop + Math.sin((Math.PI/180)*shipRot) * 40;
                    secondaryFlameX = shipLeft - Math.cos((Math.PI/180)*shipRot) * 40;
                    secondaryFlameY = shipTop - Math.sin((Math.PI/180)*shipRot) * 40;
                    spawnFxBetweenPoints({x: flameStartX, y:flameStartY}, {x: flameStartX + Math.cos((Math.PI/180)*(shipRot + 90)), y:flameStartY + Math.sin((Math.PI/180)*(shipRot + 90))}, rocketID, pageID);
                    spawnFxBetweenPoints({x: secondaryFlameX, y: secondaryFlameY}, {x: secondaryFlameX + Math.cos((Math.PI/180)*(shipRot - 90)), y: secondaryFlameY + Math.sin((Math.PI/180)*(shipRot - 90))}, rocketID, pageID);
                    break;
                case ("TRT"):
                    flameStartX = shipLeft + Math.cos((Math.PI/180)*shipRot) * 40;
                    flameStartY = shipTop + Math.sin((Math.PI/180)*shipRot) * 40;
                    secondaryFlameX = shipLeft - Math.cos((Math.PI/180)*shipRot) * 40;
                    secondaryFlameY = shipTop - Math.sin((Math.PI/180)*shipRot) * 40;
                    spawnFxBetweenPoints({x: flameStartX, y:flameStartY}, {x: flameStartX + Math.cos((Math.PI/180)*(shipRot - 90)), y:flameStartY + Math.sin((Math.PI/180)*(shipRot - 90))}, rocketID, pageID);
                    spawnFxBetweenPoints({x: secondaryFlameX, y: secondaryFlameY}, {x: secondaryFlameX + Math.cos((Math.PI/180)*(shipRot + 90)), y: secondaryFlameY + Math.sin((Math.PI/180)*(shipRot + 90))}, rocketID, pageID);
                    break;
                default:
                    break;
            }
        }
    }
}