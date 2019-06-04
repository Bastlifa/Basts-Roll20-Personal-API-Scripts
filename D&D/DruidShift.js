/**************************************** Druid Shift ****************************************
This is for the 5E OGL sheet in Roll20. It will probably not work with any others without
some modification. Also, I didn't do much in the way of error checking.

The GM must make character named Druid X, where X is the creature being shifted into.
It is suggested that the GM duplicate existing creatures, rename them, and assign to the druid 
player. The images for the characters must be uploaded and assigned to the avatar of the druid
form characters. The easiest way I've found it to open the character sheet, edit, right click
the picture in the avatar, copy, paste into your image program, save, upload and put it back in.
Maybe you could just upload it back into the avatar directly. Anyways, this won't work if you
don't first upload the image to your library.

Either the druid player should have a general macro, or the forms characters should 
each have a token action with the body !DSBaseChar

It's helpful if the druid character has token actions for each desired form.

If you use multiple druids, or shapeshifters, add another check for !DSCharName for them.

I put in several example forms in the code. Delete or add as needed.

In the !DSBaseChar part of the code, you must replace 'Druid Char Name' with 
'<the druid character's name, exactly>'. 
*********************************************************************************************/


on("ready", function() {
    
    var getCleanImgsrc = function (imgsrc) {
        var parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^\?]*)(\?[^?]+)?$/);
        if(parts) 
        {
            return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
        }
        return;
    };
    
    on("chat:message", function (msg) {
        // Make sure to copy your druid character's name exactly in CharacterGet parameter.
        if (msg.type === "api" && msg.content === "!DSBaseChar")  {
            CharacterGet('Druid Char Name', msg, 'Normal', 0);
        }
        if (msg.type === "api" && msg.content === "!DSCaveBear")  {
            CharacterGet('Druid Cave Bear', msg, 'Large', 60);
        }
        if (msg.type === "api" && msg.content === "!DSAllosaurus")  {
            CharacterGet('Druid Allosaurus', msg, 'Large', 0);
        }
        if (msg.type === "api" && msg.content === "!DSCrocodile")  {
            CharacterGet('Druid Crocodile', msg, 'Large', 0);
        }
        if (msg.type === "api" && msg.content === "!DSDireWolf")  {
            CharacterGet('Druid Dire Wolf', msg, 'Large', 0);
        }
        if (msg.type === "api" && msg.content === "!DSGiantSpider")  {
            CharacterGet('Druid Giant Spider', msg, 'Large', 60);
        }
        if (msg.type === "api" && msg.content === "!DSGiantToad")  {
            CharacterGet('Druid Giant Toad', msg, 'Large', 30);
        }
    
    });
    


    function Size(charSize, msg)
    {
    

    if (charSize === "Normal"){
        _.each(msg.selected,function (o) {
            getObj(o._type,o._id).set("height", 70);
            getObj(o._type,o._id).set("width", 70);
            
        });}
        
        if (charSize === "Large"){
        _.each(msg.selected,function (o) {
            getObj(o._type,o._id).set("height", 140);
            getObj(o._type,o._id).set("width", 140);
            
        });}
        
        if (charSize === "Huge"){
        _.each(msg.selected,function (o) {
            getObj(o._type,o._id).set("height", 210);
            getObj(o._type,o._id).set("width", 210);
            
        });}
        
        if (charSize === "Gargantuan"){
        _.each(msg.selected,function (o) {
            getObj(o._type,o._id).set("height", 280);
            getObj(o._type,o._id).set("width", 280);
            
        });}
    }

    

    function CharacterGet(characterName, msg, charSize, darkvision)
    {
        var ShiftCharacter = findObjs({ type: 'character', name: characterName })[0];
        //sendChat("", "ShiftChar is: " + ShiftCharacter.get('name'));
            if(getAttrByName(ShiftCharacter.get('id'), 'npc', 'current') == 1)
            {
                //sendChat("", "NPC thing happened");
                _.each(msg.selected,function (o) {
                    getObj(o._type,o._id).set({
                        imgsrc: getCleanImgsrc(ShiftCharacter.get('avatar')),
                        bar1_link: 'None',
                        represents: ShiftCharacter.id,
                        bar1_value: getAttrByName(ShiftCharacter.get('id'), 'hp', 'max'),
                        bar1_max: getAttrByName(ShiftCharacter.get('id'), 'hp', 'max'),
                        light_radius: darkvision,
                        light_dimradius: 0,
                        light_otherplayers: false
                    });
                });
            }
            else
            {   
                //sendChat("", "PC thing happened");
                _.each(msg.selected,function (o) {
                    getObj(o._type,o._id).set({
                        imgsrc: getCleanImgsrc(ShiftCharacter.get('avatar')),
                        represents: ShiftCharacter.id,
                        bar1_value: getAttrByName(ShiftCharacter.get('id'), "hp", 'current'),
                        bar1_max: getAttrByName(ShiftCharacter.get('id'), "hp", 'max'),
                        bar1_link: findObjs({type: "attribute", characterid: ShiftCharacter.get('id'), name: 'hp'})[0].id,
                        light_radius: darkvision,
                        light_dimradius: 0,
                        light_otherplayers: false
                    });
                });
            }
        
    
        Size(charSize, msg);
    }

});