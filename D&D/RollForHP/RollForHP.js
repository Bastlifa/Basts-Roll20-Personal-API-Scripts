// Roll for HP
on("ready", function() {

    on("chat:message", function (msg) {
        if (msg.type === "api" && msg.content.split(' ')[0] === "!RollForHP")  {
            RollForHP(msg);
        }
    });
});

function RollForHP(msg)
{
    if (!msg.selected) { return; }
    let parts = msg.content.split(' ');
    if (!parts[1]) {sendChat("", "no HD entered"); return;}
    let hd = parts[1];
    let hpBonus = 0;
    if (parts[2]) { hpBonus = parseInt(parts[2]); }
    let hpEntry = parts[1].toLowerCase().split('d');
    
    _.each(msg.selected,function (o) {
        let hp = xDy(parseInt(hpEntry[0]), parseInt(hpEntry[1])) + hpBonus*parseInt(hpEntry[0]);
        sendChat("", "/w gm Monster HP set to " + String(hp));
        getObj(o._type,o._id).set({
            bar1_value: hp,
            bar1_max: hp
        });
    });
}

function xDy (x, y)
{
    let diceTot = 0;
    for (let i = 0; i < x; i++)
    {
        diceTot += randomInteger(y);
    }
    return diceTot;
}