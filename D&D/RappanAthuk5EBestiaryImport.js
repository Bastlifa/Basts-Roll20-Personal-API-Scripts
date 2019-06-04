//Rappan Athuk Bestiary PDF Importer
//A Horrible Idea
//Create Character
//Make ability on attributes and abilities tab
//Carefully copy the NPC text from RA 5E PDF
//Save ability
//Drag character to map (default token)
//Select token
//Type !RAimport
//Monster NPC character sheet is filled out for you
//Enjoy
/*******************************************************
 * Warning! This script requires a table will all
 * of the beasts names, copied exactly 
 * (typo corrected though) from the bestiary.
 * I have a script to make such a table, but I'm not
 * sure if it's legal to share.
 * ****************************************************/

var scNPC = 0;
var scLevelNPC = 0;
var scAbilityNPC = "intelligence";
var legActionNPC = 0;
var reactionNPC = 0;

var generateUUID = (function() {
    "use strict";

    var a = 0, b = [];
    return function() {
        var c = (new Date()).getTime() + 0, d = c === a;
        a = c;
        for (var e = new Array(8), f = 7; 0 <= f; f--) {
            e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
            c = Math.floor(c / 64);
        }
        c = e.join("");
        if (d) {
            for (f = 11; 0 <= f && 63 === b[f]; f--) {
                b[f] = 0;
            }
            b[f]++;
        } else {
            for (f = 0; 12 > f; f++) {
                b[f] = Math.floor(64 * Math.random());
            }
        }
        for (f = 0; 12 > f; f++){
            c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
        }
        return c;
    };
}()),

generateRowID = function () {
    "use strict";
    return generateUUID().replace(/_/g, "Z");
};
on("ready", function() {

    on("chat:message", function (msg) {
        if (msg.type === "api" && msg.content === "!RAimport")  {
            scNPC = 0;
            scLevelNPC = 0;
            scAbilityNPC = "intelligence";
            legActionNPC = 0;
            reactionNPC = 0;
            ImportMonster(msg);
        }
    });
    on("chat:message", function (msg) {
        if (msg.type === "api" && msg.content === "!RAActionTest")  {
            ActionTest(msg);
        }
    });
});

function ActionTest(msg)
{
    let reps = getObj(msg.selected[0]._type,msg.selected[0]._id).get('represents');

    let actionObj = {
        name: "blah",
        description: "bobloblaw"
    }
    const repString = `repeating_npcaction_${generateRowID()}`;
        
    const data = {};
    Object.keys(actionObj).forEach(field => {
        data[`${repString}_${field}`] = actionObj[field];
    });
    setAttrs(reps, data);
}

function ImportMonster(msg)
{
    //make sure a token representing a character is selected
    if (!msg.selected) { sendChat("", "No representative token selected"); return; }
    else if (!getObj(msg.selected[0]._type,msg.selected[0]._id).get('represents')) { sendChat("", "No representative token selected"); return; }

    //find the character and ability
    let reps = getObj(msg.selected[0]._type,msg.selected[0]._id).get('represents');
    let charSheet = getObj('character', reps);
    let ability = findObjs({_type: 'ability', _characterid: reps})[0];
    
    //get the text of the ability
    let importString = ability.get('action');

    //Parse the text
    let aImportText = importString.split("\n");

    let aSaveBonus = ["","","","","",""];
    if (aImportText[7].split(' ')[0] == "Saving")
    {
        aSaveBonus = ParseSaves(aImportText[7].split(' '));
    }

    let skillStart;
    let aSkillString = [];
    for (let i=0; i<aImportText.length; i++)
    {
        if (aImportText[i].split(' ')[0] == "Skills")
        {
            skillStart = i;
        }
    }
    
    while (!["Damage", "Condition", "Senses"].includes(aImportText[skillStart].split(' ')[0]))
    {
        aSkillString.push(aImportText[skillStart]);
        skillStart++;
    }

    let aSkillBonus = ParseSkills(aSkillString);

    let dmgVuln = "";
    for (let i=0; i<aImportText.length; i++)
    {
        if (aImportText[i].split(' ')[0] == "Damage" && aImportText[i].split(' ')[1] == "Vulnerabilities")
        {
            dmgVuln = aImportText[i].split(' ').slice(2).join(' ');
        }
    }

    let dmgResist = ParseResistances(aImportText);

    let dmgImmunity = ParseImmunities(aImportText);

    let condImmunity = ParseCondImmunities(aImportText);

    let sensesString = ParseSenses(aImportText);

    let languagesString = ParseLanguages(aImportText);

    let CR = 0;
    for (let i=0; i<aImportText.length; i++)
    {
        if (aImportText[i].split(' ')[0] == "Challenge")
        {
            CR = aImportText[i].split(' ')[1];
        }
    }

    let tokenSize = 1;
    switch(true)
    {
        case (aImportText[1].split(' ')[0] == "Medium"):
            tokenSize = 1;
            break;
        case (aImportText[1].split(' ')[0] == "Tiny"):
            tokenSize = 1;
            break;
        case (aImportText[1].split(' ')[0] == "Small"):
            tokenSize = 1;
            break;
        case (aImportText[1].split(' ')[0] == "Large"):
            tokenSize = 2;
            break;
        case (aImportText[1].split(' ')[0] == "Huge"):
            tokenSize = 3;
            break;
        case (aImportText[1].split(' ')[0] == "Gargantuan"):
            tokenSize = 4;
            break;
        default:
            break;
    }

    // array of form [traitName, traitString]
    let npcTraits = ParseTraits(aImportText);
    
    let npcActions = ParseActions(aImportText);

    let npcReactions = ParseReactions(aImportText);

    let npcLegendaryActions = ParseLegendaryActions(aImportText);

    let charObjData =
    {
        npc_name: aImportText[0],
        npc_type: aImportText[1],
        npc_ac: aImportText[2].split(' ')[2],
        npc_actype: aImportText[2].split(' ').length > 3 ? aImportText[2].split(' ').slice(3).join(' ').replace('(', '').replace(')','') : "",
        hp_max: aImportText[3].split(' ')[2],
        npc_hpformula: aImportText[3].split(' ').length > 3 ? aImportText[3].split(' ').slice(3).join(' ').replace('(', '').replace(')','') : "",
        npc_speed: aImportText[4].split(' ').slice(1).join(' '),
        strength_base: aImportText[6].split(' ')[0],
        dexterity_base: aImportText[6].split(' ')[2],
        constitution_base: aImportText[6].split(' ')[4],
        intelligence_base: aImportText[6].split(' ')[6],
        wisdom_base: aImportText[6].split(' ')[8],
        charisma_base: aImportText[6].split(' ')[10],
        npc_str_save_base: aSaveBonus[0],
        npc_dex_save_base: aSaveBonus[1],
        npc_con_save_base: aSaveBonus[2],
        npc_int_save_base: aSaveBonus[3],
        npc_wis_save_base: aSaveBonus[4],
        npc_cha_save_base: aSaveBonus[5],
        npc_acrobatics_base: aSkillBonus[0],
        npc_animal_handling_base: aSkillBonus[1],
        npc_arcana_base: aSkillBonus[2],
        npc_athletics_base: aSkillBonus[3],
        npc_deception_base: aSkillBonus[4],
        npc_history_base: aSkillBonus[5],
        npc_insight_base: aSkillBonus[6],
        npc_intimidation_base: aSkillBonus[7],
        npc_investigation_base: aSkillBonus[8],
        npc_medicine_base: aSkillBonus[9],
        npc_nature_base: aSkillBonus[10],
        npc_perception_base: aSkillBonus[11],
        npc_performance_base: aSkillBonus[12],
        npc_persuasion_base: aSkillBonus[13],
        npc_religion_base: aSkillBonus[14],
        npc_sleight_of_hand_base: aSkillBonus[15],
        npc_stealth_base: aSkillBonus[16],
        npc_survival_base: aSkillBonus[17],
        npc_vulnerabilities: dmgVuln,
        npc_resistances: dmgResist,
        npc_immunities: dmgImmunity,
        npc_condition_immunities: condImmunity,
        npc_senses: sensesString,
        npc_languages: languagesString,
        npc_challenge: CR,
        token_size: tokenSize,
        npcspellcastingflag: scNPC,
        spellcasting_ability: scAbilityNPC,
        caster_level: scLevelNPC,
        npcreactionsflag: reactionNPC,
        npc_legendary_actions: 3*legActionNPC
    }

    const data = {};
    Object.keys(charObjData).forEach(field => {
        data[field] = charObjData[field];
    });
    setAttrs(reps, data);
    
    AddTraits(npcTraits, reps);
    AddActions(npcActions, reps);
    AddReactions(npcReactions, reps);
    AddLegActions(npcLegendaryActions, reps);
    charSheet.set("name", aImportText[0]);
}


function ParseSaves(aSaveString)
{
    let aSaveBonus = ["","","","","",""];

    for(let i=0; i<aSaveString.length - 1; i++)
    {
        if (aSaveString[i] == "Str")
        {
            aSaveBonus[0] = aSaveString[i+1];
        }
        if (aSaveString[i] == "Dex")
        {
            aSaveBonus[1] = aSaveString[i+1];
        }
        if (aSaveString[i] == "Con")
        {
            aSaveBonus[2] = aSaveString[i+1];
        }
        if (aSaveString[i] == "Int")
        {
            aSaveBonus[3] = aSaveString[i+1];
        }
        if (aSaveString[i] == "Wis")
        {
            aSaveBonus[4] = aSaveString[i+1];
        }
        if (aSaveString[i] == "Cha")
        {
            aSaveBonus[5] = aSaveString[i+1];
        }
    }

    for (let i=0; i<aSaveBonus.length; i++)
    {
        if (aSaveBonus[i].includes(','))
        {
            aSaveBonus[i] = aSaveBonus[i].replace(',', '');
        }
    }

    return aSaveBonus;
}

function ParseSkills(aSkillString)
{
    let aSkillBonus = ["","","","","","", "", "", "", "", "", "", "", "", "", "", "", ""];
    let skillString = aSkillString.join(' ');
    let aJoinedSkillString = skillString.split(' ');

    for(let i=0; i<aJoinedSkillString.length - 1; i++)
    {
        if (aJoinedSkillString[i] == "Acrobatics")
        {
            aSkillBonus[0] = aJoinedSkillString[i+1];
        }
        if (aJoinedSkillString[i] == "Animal Handling")
        {
            aSkillBonus[1] = aJoinedSkillString[i+1];
        }
        if (aJoinedSkillString[i] == "Arcana")
        {
            aSkillBonus[2] = aJoinedSkillString[i+1];
        }
        if (aJoinedSkillString[i] == "Athletics")
        {
            aSkillBonus[3] = aJoinedSkillString[i+1];
        }
        if (aJoinedSkillString[i] == "Deception")
        {
            aSkillBonus[4] = aJoinedSkillString[i+1];
        }
        if (aJoinedSkillString[i] == "History")
        {
            aSkillBonus[5] = aJoinedSkillString[i+1];
        }
        if (aJoinedSkillString[i] == "Insight")
        {
            aSkillBonus[6] = aJoinedSkillString[i+1];
        }
        if (aJoinedSkillString[i] == "Intimidation")
        {
            aSkillBonus[7] = aJoinedSkillString[i+1];
        }
        if (aJoinedSkillString[i] == "Investigation")
        {
            aSkillBonus[8] = aJoinedSkillString[i+1];
        }
        if (aJoinedSkillString[i] == "Medicine")
        {
            aSkillBonus[9] = aJoinedSkillString[i+1];
        }
        if (aJoinedSkillString[i] == "Nature")
        {
            aSkillBonus[10] = aJoinedSkillString[i+1];
        }
        if (aJoinedSkillString[i] == "Perception")
        {
            aSkillBonus[11] = aJoinedSkillString[i+1];
        }
        if (aJoinedSkillString[i] == "Performance")
        {
            aSkillBonus[12] = aJoinedSkillString[i+1];
        }
        if (aJoinedSkillString[i] == "Persuasion")
        {
            aSkillBonus[13] = aJoinedSkillString[i+1];
        }
        if (aJoinedSkillString[i] == "Religion")
        {
            aSkillBonus[14] = aJoinedSkillString[i+1];
        }
        if (aJoinedSkillString[i] == "Sleight of Hand")
        {
            aSkillBonus[15] = aJoinedSkillString[i+1];
        }
        if (aJoinedSkillString[i] == "Stealth")
        {
            aSkillBonus[16] = aJoinedSkillString[i+1];
        }
        if (aJoinedSkillString[i] == "Survival")
        {
            aSkillBonus[17] = aJoinedSkillString[i+1];
        }
    }

    for (let i=0; i<aSkillBonus.length; i++)
    {
        if (aSkillBonus[i].includes(','))
        {
            aSkillBonus[i] = aSkillBonus[i].replace(',', '');
        }
    }

    return aSkillBonus;
}

function ParseResistances(aImportText)
{
    let aResistLines = [];
    for (let i=0; i<aImportText.length; i++)
    {
        if (aImportText[i].split(' ')[0] == "Damage" && aImportText[i].split(' ')[1] == "Resistances")
        {
            aResistLines.push(i);
            let j = i+1;
            while (!["Damage", "Condition", "Senses"].includes(aImportText[j].split(' ')[0]))
            {
                aResistLines.push(j);
                j++;
            }
        }
    }

    let resistString = "";
    for (let i=0; i<aResistLines.length; i++)
    {
        resistString += " " + aImportText[aResistLines[i]];
    }
    if (resistString != "")
    {
        resistString = resistString.replace(" Damage Resistances ", "");
    }
    return resistString;
}

function ParseImmunities(aImportText)
{
    let aImmunityLines = [];
    for (let i=0; i<aImportText.length; i++)
    {
        if (aImportText[i].split(' ')[0] == "Damage" && aImportText[i].split(' ')[1] == "Immunities")
        {
            aImmunityLines.push(i);
            let j = i+1;
            while (!["Condition", "Senses"].includes(aImportText[j].split(' ')[0]))
            {
                aImmunityLines.push(j);
                j++;
            }
        }
    }

    let immunityString = "";
    for (let i=0; i<aImmunityLines.length; i++)
    {
        immunityString += " " + aImportText[aImmunityLines[i]];
    }
    if (immunityString != "")
    {
        immunityString = immunityString.replace(" Damage Immunities ", "");
    }
    return immunityString;
}

function ParseCondImmunities(aImportText)
{
    let aCondImmunityLines = [];
    for (let i=0; i<aImportText.length; i++)
    {
        if (aImportText[i].split(' ')[0] == "Condition" && aImportText[i].split(' ')[1] == "Immunities")
        {
            aCondImmunityLines.push(i);
            let j = i+1;
            while (!["Senses"].includes(aImportText[j].split(' ')[0]))
            {
                aCondImmunityLines.push(j);
                j++;
            }
        }
    }

    let condImmunityString = "";
    for (let i=0; i<aCondImmunityLines.length; i++)
    {
        condImmunityString += " " + aImportText[aCondImmunityLines[i]];
    }
    if (condImmunityString != "")
    {
        condImmunityString = condImmunityString.replace(" Condition Immunities ", "");
    }
    return condImmunityString;
}

function ParseSenses(aImportText)
{
    let aSensesLines = [];
    for (let i=0; i<aImportText.length; i++)
    {
        if (aImportText[i].split(' ')[0] == "Senses")
        {
            aSensesLines.push(i);
            let j = i+1;
            while (!["Languages", "Challenge"].includes(aImportText[j].split(' ')[0]))
            {
                aSensesLines.push(j);
                j++;
            }
        }
    }

    let sensesString = "";
    for (let i=0; i<aSensesLines.length; i++)
    {
        sensesString += " " + aImportText[aSensesLines[i]];
    }
    if (sensesString != "")
    {
        sensesString = sensesString.replace(" Senses ", "");
    }
    return sensesString;
}

function ParseLanguages(aImportText)
{
    let aLanguagesLines = [];
    for (let i=0; i<aImportText.length; i++)
    {
        if (aImportText[i].split(' ')[0] == "Languages")
        {
            aLanguagesLines.push(i);
            let j = i+1;
            while (!["Challenge"].includes(aImportText[j].split(' ')[0]))
            {
                aLanguagesLines.push(j);
                j++;
            }
        }
    }

    let languagesString = "";
    for (let i=0; i<aLanguagesLines.length; i++)
    {
        languagesString += " " + aImportText[aLanguagesLines[i]];
    }
    if (languagesString != "")
    {
        languagesString = languagesString.replace(" Languages ", "");
    }
    return languagesString;
}

function ParseTraits(aImportText)
{
    let traitTrue = false;
    let traitLine;
    for (let i=0; i<aImportText.length - 2; i++)
    {

        if (aImportText[i].split(' ')[0] == "Challenge" && aImportText[i+1] != "Actions")
        {
            traitTrue = true;
            if (aImportText[i+1] != "")
            {
                traitLine = i+1;
            }
            else
            {
                traitLine = i+2;
            }
        }
    }

    if (!traitTrue) { return ""; }

    let aTraits = [];
    while (traitTrue)
    {
        let aSingleTrait = ParseSingleTrait(aImportText, traitLine);
        aTraits.push([aSingleTrait[0], aSingleTrait[1]]);
        traitLine = aSingleTrait[2];
        traitTrue = aSingleTrait[3];
    }

    return aTraits;
}

function ParseSingleTrait(aImportText, traitLine)
{
    let moreTraits = true;
    let traitString = "";
    let aTraitString = [];
    let i= traitLine;
    
    do
    {
        aTraitString.push(aImportText[i]);
        i++;
    } while (aImportText[i] != "" && aImportText[i] != "Actions" && !CheckForName(aImportText[i]))
    i--;

    if (aTraitString[0].split(' ')[0] == "Spellcasting.")
        {
            scNPC = 1;
            let aSpellCasting = SpellcastingNPC(aTraitString)
            traitString = aSpellCasting[0];
            scLevelNPC = aSpellCasting[1];
            scAbilityNPC = aSpellCasting[2];
        }
    else
    {
        traitString = aTraitString.join(' ');
    }
    if (traitString.charAt(0) == ' ')
    {
        traitString = traitString.substring(1);
    }
    if (aImportText[i] != "Actions")
    {
        i++;
    }
    if(aImportText[i] == "Actions")
    {
        moreTraits = false;
    }

    let demPer = traitString.indexOf('.');

    let traitName = traitString.substring(0, demPer);

    traitString = traitString.substring(demPer + 2);

    return [traitName, traitString, i, moreTraits];
}

function SpellcastingNPC(aTraitString)
{
    let ajoinedString = (aTraitString.join(' ')).split(' ');
    let scLevel = 1;
    for (let i=0; i<ajoinedString.length; i++)
    {
        if (ajoinedString[i].includes("-level"))
        {
            scLevel = ajoinedString[i].replace(/[^0-9]/g, '');
        }
    }

    /*let saveDC = 8;
    for (let i=0; i<ajoinedString.length - 2; i++)
    {
        if (ajoinedString[i].toLowerCase() == "save" && ajoinedString[i+1].toLowerCase() == "dc")
        {
            scLevel = ajoinedString[i+2];
            if (scLevel.substring(scLevel.length - 1) == ",")
            {
                scLevel = scLevel.substring(0, scLevel.length-1);
            }
            saveDC = parseInt(scLevel);
        }
    }*/

    let spellcastingAbility = "@{intelligence_mod}+";
    for (let i=0; i<ajoinedString.length - 3; i++)
    {
        if (ajoinedString[i].toLowerCase() == "spellcasting" && ajoinedString[i+1].toLowerCase() == "ability" && ajoinedString[i+2].toLowerCase() == "is")
        {
            spellcastingAbility = "@{" + ajoinedString[i+3].toLowerCase() + "_mod}+";
        }
    }
    let spellcastingString = "";
    let preSpells = true;
    let cantripsLine;
    for (let i=0; i<aTraitString.length; i++)
    {
        if (aTraitString[i].split(' ')[0] == "Cantrips")
        {
            preSpells = false;
        }
        if (preSpells)
        {
            spellcastingString += aTraitString[i] + ' ';
        }
        else
        {
            spellcastingString += "\n" + aTraitString[i];
        }
    }

    if (spellcastingString.charAt(0) == " ")
    {
        spellcastingString = spellcastingString.substring(1);
    }
    
    return [spellcastingString, scLevel, spellcastingAbility];
}

function ParseActions(aImportText)
{
    let actionLine;
    let actionsTrue = false;
    for (let i=0; i<aImportText.length - 2; i++)
    {
        if (aImportText[i].split(' ')[0] == "Actions")
        {
            actionsTrue = true;
            if (aImportText[i+1] != "")
            {
                actionLine = i+1;
            }
            else
            {
                actionLine = i+2;
            }
        }
    }

    if (!actionsTrue) { return ""; }

    let aActions = [];
    while (actionsTrue)
    {
        let aSingleAction = ParseSingleAction(aImportText, actionLine);
        aActions.push([aSingleAction[0], aSingleAction[1], aSingleAction[4], aSingleAction[5], aSingleAction[6], aSingleAction[7], aSingleAction[8], aSingleAction[9], aSingleAction[10], aSingleAction[11]]);
        actionLine = aSingleAction[2];
        actionsTrue = aSingleAction[3];
    }
    return aActions;
}

function ParseSingleAction(aImportText, actionLine)
{
    let moreActions = true;
    let i = actionLine;
    let aActionString = []
    let isAttack = false;
    let actionName = "";
    let attackType = "";
    let dmg1 = "";
    let dmg1Type = "";
    let dmg2 = "";
    let dmg2Type = "";
    let toHit = "";
    let range = "";

    if (aImportText[i] == "" || aImportText[i] == "\n") { i++; }

    if (aImportText[i] != "" && aImportText[i] != "Reactions" && aImportText[i] != "Legendary Actions")
    {
        let k = i;
        for(let j = i; j<aImportText.length && !(j>k && CheckForActionName(aImportText[j])); j++)
        {
            aActionString.push(aImportText[j]);
            i=j;
        }
    }

    let actionString = aActionString.join(' ');
    if (actionString.charAt(0) == ' ')
    {
        actionString = actionString.substring(1);
    }

    actionString.replace("  ", " ");

    if (i<aImportText.length)
    {
        if (aImportText[i] != "Legendary Actions" && aImportText[i] != "Reactions" && i<aImportText.length - 1)
        {
            i++;
        }
        if(aImportText[i] == "Legendary Actions" || aImportText[i] == "Reactions" || i == aImportText.length - 1)
        {
            if (aImportText[i] == "Legendary Actions") {sendChat("", "blahblah")}
            moreActions = false;
        }
    }
    else
    {
        moreActions = false;
    }
        
    actionName = actionString.substring(0, actionString.indexOf('.'));
    actionBody = actionString.substring(actionString.indexOf('.') + 2);

    
    if (actionBody.includes("Weapon Attack:") || actionBody.includes("Spell Attack:"))
    {
        isAttack = true;
        if (actionBody.includes("Melee Weapon Attack:") || actionBody.includes("Melee Spell Attack:")) { attackType = "Melee"; }
        else                                                                                           { attackType = "Ranged"; }
        range = "5 ft.";
        if (actionBody.includes("reach"))
        {
            range = actionBody.substring(actionBody.indexOf("reach") + 6, actionBody.indexOf("reach") + 6 + 7);
            if (range.includes(',')) { range = range.replace(',', ''); }
        }
        else if (actionBody.includes("range"))
        {
            range = actionBody.substring(actionBody.indexOf("range") + 6, actionBody.indexOf("ft.") + 3);
            if (range.charAt(range.length -1) == ',') { range = range.substring(0, range.length - 1); }
        }
        toHit = actionBody.substring(actionBody.indexOf("+")+1, actionBody.indexOf("+") + 3);
        
        if (toHit.charAt(2) == ' ') { toHit = toHit.substring(0, toHit.length-2) }
        if (actionBody.includes("Hit:"))
        {
            let dmgSubString = actionBody.substring(actionBody.indexOf("Hit:"));
            dmg1 = dmgSubString.substring(dmgSubString.indexOf('(') + 1, dmgSubString.indexOf(')'));
            dmg1Type = dmgSubString.substring(dmgSubString.indexOf(')') +1, dmgSubString.indexOf("damage") - 1);
            if (dmgSubString.includes("plus"))
            {
                let dmg2SubString = dmgSubString.substring(dmgSubString.indexOf("damage"));
                dmg2 = dmg2SubString.substring(dmg2SubString.indexOf('(') + 1, dmg2SubString.indexOf(')'));
                dmg2Type = dmg2SubString.substring(dmg2SubString.indexOf(')') + 1, dmg2SubString.indexOf("damage.") - 1);
            }
        }
        actionBody = actionBody.substring(actionBody.indexOf("damage. "));
    }

    return [actionName, actionBody, i, moreActions, isAttack, attackType, toHit, dmg1, dmg1Type, dmg2, dmg2Type, range];
}

function ParseLegendaryActions(aImportText)
{
    let legALine;
    let legATrue = false;
    for (let i=0; i<aImportText.length - 2; i++)
    {
        if (aImportText[i] == "Legendary Actions")
        {
            legATrue = true;
            legActionNPC = 1;
            legALine = i+1;
        }
    }

    if (!legATrue) {return "";}

    do
    {
        legALine++;
        sendChat("", String(legALine));
    } while (!CheckForLegActionName(aImportText[legALine]) && (legALine < aImportText.length - 1));

   
    if (!legATrue) { return ""; }

    let aLegActions = [];
    while (legATrue)
    {
        let aSingleLegAction = ParseSingleLegendaryAction(aImportText, legALine);
        aLegActions.push([aSingleLegAction[0], aSingleLegAction[1]]);
        legALine = aSingleLegAction[2];
        legATrue = aSingleLegAction[3];
    }
    return aLegActions;
}

function ParseSingleLegendaryAction(aImportText, legALine)
{
    let i = legALine;
    let aLegActionString = [];
    let moreLegActions = false;
    
    
    do
    {
        aLegActionString.push(aImportText[i]);
        i++;
    } while (aImportText[i] != "" && !CheckForLegActionName(aImportText[i]) && i < aImportText.length - 1)

    let legActionString = aLegActionString.join(' ');

    if (legActionString.charAt(0) == ' ')
    {
        legActionString = legActionString.substring(1);
    }
    sendChat("", "i: " + String(i));
    sendChat("", "aImportText.length: " + String(aImportText.length));
    if(i < (aImportText.length - 1))
    {
        moreLegActions = true;
    }

    let legActionName = legActionString.substring(0, legActionString.indexOf('.'));
    let legActionBody = legActionString.substring(legActionString.indexOf('.') + 2);
    
    return [legActionName, legActionBody, i, moreLegActions];
}

function ParseReactions(aImportText)
{
    let reactLine;
    let reactTrue = false;
    for (let i=0; i<aImportText.length - 2; i++)
    {
        if (aImportText[i] == "Reactions")
        {
            reactTrue = true;
            reactionNPC = 1;
            reactLine = i;
        }
    }

    if (!reactTrue) { return "";}

    do
    {
        reactLine++;
    } while (!CheckForReactionName(aImportText[reactLine]) && (reactLine < aImportText.length - 1));

   
    if (!reactTrue) { return ""; }

    let aReactions = [];
    while (reactTrue)
    {
        let aSingleReaction = ParseSingleReaction(aImportText, reactLine);
        aReactions.push([aSingleReaction[0], aSingleReaction[1]]);
        reactLine = aSingleReaction[2];
        reactTrue = aSingleReaction[3];
    }
    return aReactions;
}

function ParseSingleReaction(aImportText, reactLine)
{
    let i = reactLine;
    let aReactionString = [];
    let moreReactions = false;

    do
    {
        aReactionString.push(aImportText[i]);
        i++;
    } while (aImportText[i] != "" && !CheckForReactionName(aImportText[i]) && i < aImportText.length - 1)

    let reactionString = aReactionString.join(' ');

    if (reactionString.charAt(0) == ' ')
    {
        reactionString = reactionString.substring(1);
    }

    if(i < (aImportText.length - 1))
    {
        moreReactions = true;
    }

    let reactionName = reactionString.substring(0, reactionString.indexOf('.'));
    let reactionBody = reactionString.substring(reactionString.indexOf('.') + 2);

    return [reactionName, reactionBody, i, moreReactions];
}

function AddTraits(npcTraits, reps)
{
    for (let i=0; i<npcTraits.length; i++)
    {
        let traitObj = 
        {
            name: npcTraits[i][0],
            desc: npcTraits[i][1]
        }
        
        const repString = `repeating_npctrait_${generateRowID()}`;
        
        const data = {};
        Object.keys(traitObj).forEach(field => {
            data[`${repString}_${field}`] = traitObj[field];
        });
        setAttrs(reps, data);
    }
}

function AddActions(npcActions, reps)
{
    
    for (let i=0; i<npcActions.length; i++)
    {
        let actionObj;
        if (npcActions[i][2] == true)
        {
            actionObj = {       
                name: npcActions[i][0],
                attack_flag: "on",
                description: npcActions[i][1],
                attack_type: npcActions[i][3],
                attack_range: npcActions[i][9],
                attack_tohit: npcActions[i][4],
                attack_target: "One Target",
                attack_damage: npcActions[i][5],
                attack_damagetype: npcActions[i][6],
                attack_damage2: npcActions[i][7],
                attack_damagetype2: npcActions[i][8],
                ['npc_options-flag']: "unchecked"
            }
        }
        else if (npcActions[i][0] != "")
        {
            actionObj = {
                name: npcActions[i][0],
                description: npcActions[i][1],
                ['npc_options-flag']: "unchecked"
            }
        }
        
        const repString = `repeating_npcaction_${generateRowID()}`;
        
        const data = {};
        Object.keys(actionObj).forEach(field => {
            data[`${repString}_${field}`] = actionObj[field];
        });
        setAttrs(reps, data);
    }
}

function AddLegActions(npcLegendaryActions, reps)
{
    if (npcLegendaryActions == "") {return;}
    for (let i=0; i<npcLegendaryActions.length; i++)
    {
        let actionObj = {
            name: npcLegendaryActions[i][0],
            description: npcLegendaryActions[i][1],
            ['npc_options-flag']: "unchecked"
        }

        const repString = `repeating_npcaction-l_${generateRowID()}`;
        
        const data = {};
        Object.keys(actionObj).forEach(field => {
            data[`${repString}_${field}`] = actionObj[field];
        });
        setAttrs(reps, data);
    }
}

function AddReactions(npcReactions, reps)
{
    if (npcReactions == "") {return;}
    for (let i=0; i<npcReactions.length; i++)
    {
        let actionObj = {
            name: npcReactions[i][0],
            desc: npcReactions[i][1],
            ['npc_options-flag']: "unchecked"
        }

        const repString = `repeating_npcreaction_${generateRowID()}`;
        
        const data = {};
        Object.keys(actionObj).forEach(field => {
            data[`${repString}_${field}`] = actionObj[field];
        });
        setAttrs(reps, data);
    }
}

//checks to see if the line is a new action, trait, etc. Looks for capitalized words followed by a '.' Allows for (3/day) as well, because of legendary resistance
function CheckForName(textLine)
{
    let nameTrue = false;
    if (textLine == "") { return nameTrue; }
    if (!textLine.includes('.'))
    {
        return nameTrue;
    }
    else
    {
        nameTrue = true;
        let aitemStart = textLine.substring(0, textLine.indexOf('.')).split(' ');
        let aKeyWords = ["(3/day)", "(2/day)", "(1/day)", "(1/Week)", "of", "the", "in", "or", "on", "a", "an"];
        for(let i=0; i<aitemStart.length; i++)
        {
            
            if (!aKeyWords.includes(aitemStart[i]))
            {
                if (aitemStart[i][0] != aitemStart[i][0].toUpperCase() || aitemStart[i][0].toUpperCase() == aitemStart[i][0].toLowerCase())
                {
                    nameTrue = false;
                }   
            }
        }
    }
    return nameTrue;
}

function CheckForActionName(textLine)
{
    let nameTrue = false;
    let tempLine = textLine;
    if (textLine == "") { return nameTrue; }

    let aLowerWords = ["of", "the", "in", "or", "on", "a", "an"];
    if (!tempLine.includes('.'))
    {
        if (tempLine == "Legendary Actions" || tempLine == "Reactions")
        {
            nameTrue = true;   
        }
        return nameTrue;
    }
    else
    {
        if (textLine.includes('(') && textLine.includes(')'))
        {
            tempLine = textLine.replace(/ *\([^)]*\) */g, "");
        }
        nameTrue = true;

        let aitemStart = tempLine.substring(0, tempLine.indexOf('.')).split(' ');
        for(let i=0; i<aitemStart.length; i++)
        {
            if (!aLowerWords.includes(aitemStart[i]))
            {
                if (aitemStart[i][0] != aitemStart[i][0].toUpperCase() || aitemStart[i][0].toUpperCase() == aitemStart[i][0].toLowerCase())
                {
                    nameTrue = false;
                }   
            }
        }
    }
    return nameTrue;
}

function CheckForReactionName(textLine)
{
    let nameTrue = false;
    let tempLine = textLine;
    if (textLine == "") { return nameTrue; }

    let aLowerWords = ["of", "the", "in", "or", "on", "a", "an"];
    if (!tempLine.includes('.'))
    {
        if (tempLine == "Legendary Actions")
        {
            nameTrue = true;   
        }
        return nameTrue;
    }
    else
    {
        if (textLine.includes('(') && textLine.includes(')'))
        {
            tempLine = textLine.replace(/ *\([^)]*\) */g, "");
        }
        nameTrue = true;

        let aitemStart = tempLine.substring(0, tempLine.indexOf('.')).split(' ');
        for(let i=0; i<aitemStart.length; i++)
        {
            if (!aLowerWords.includes(aitemStart[i]))
            {
                if (aitemStart[i][0] != aitemStart[i][0].toUpperCase() || aitemStart[i][0].toUpperCase() == aitemStart[i][0].toLowerCase())
                {
                    nameTrue = false;
                }   
            }
        }
    }
    return nameTrue;
}

function CheckForLegActionName(textLine)
{
    let nameTrue = false;
    let tempLine = textLine;
    if (textLine == "") { return nameTrue; }

    let aLowerWords = ["of", "the", "in", "or", "on", "a", "an", "spell"];
    if (!tempLine.includes('.'))
    {
        return nameTrue;
    }
    else
    {
        if (textLine.includes('(') && textLine.includes(')'))
        {
            tempLine = textLine.replace(/ *\([^)]*\) */g, "");
        }
        nameTrue = true;

        let aitemStart = tempLine.substring(0, tempLine.indexOf('.')).split(' ');
        for(let i=0; i<aitemStart.length; i++)
        {
            if (!aLowerWords.includes(aitemStart[i]))
            {
                if (aitemStart[i][0] != aitemStart[i][0].toUpperCase() || aitemStart[i][0].toUpperCase() == aitemStart[i][0].toLowerCase())
                {
                    nameTrue = false;
                }   
            }
        }
    }
    return nameTrue;
}