//Next Gunner
//For use in HUD sheet for Starfinder on Roll20
//Make sure to enter the macro text into the attacher section on each gun. Use a newline before pasting macro.
//The Macro should be of this form, with <> around sections you replace:
// !NextGunner -- <Ship Name> -- ?{gunner name|<Gun Guy>|<Psycho Gunner>|<Bad Gun>|<Mr Useless>}

on("ready", function() 
{
    on("chat:message", function (msg) {
        if (msg.type === "api" && msg.content.split(' -- ')[0] === "!NextGunner")
        {
            shipChar = findObjs({_type: 'character', name: msg.content.split(' -- ')[1]})[0];
            gunnerAttribute = findObjs({_type: 'attribute', _characterid: shipChar.id, name: 'gunner'})[0];
            let gunnerName = msg.content.split(' -- ')[2];
            gunnerAttribute.set('current', gunnerName);
            gunnerRollAttribute = findObjs({_type: 'attribute', _characterid: shipChar.id, name: 'gunner_roll'})[0];
            gunnerRollAttribute.set('current', '{@{' + gunnerName + '|piloting_ranks},@{' + gunnerName + '|bab}}kh1+@{' + gunnerName + '|dexterity_mod}');
        }
    });
});