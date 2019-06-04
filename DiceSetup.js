// Type !DiceMacroSetup into chat and hit enter
// Standard dice macros are created for you.
// Saves about 1 minute.

on("ready", function() 
{
    on("chat:message", function (msg) 
    {
        if (msg.type === "api" && msg.content === "!DiceMacroSetup")
        {
            if (playerIsGM(msg.playerid))
            {
                if (!findObjs({_type: 'macro', _playerid: msg.playerid, name: 'd2'})[0])
                {
                    createObj('macro', {
                        name: 'd2',
                        playerid: msg.playerid,
                        istokenaction: false,
                        visibleto: "all",
                        action: "/roll 1d2"
                    });
                }
                if (!findObjs({_type: 'macro', _playerid: msg.playerid, name: 'd3'})[0])
                {
                    createObj('macro', {
                        name: 'd3',
                        playerid: msg.playerid,
                        istokenaction: false,
                        visibleto: "all",
                        action: "/roll 1d3"
                    });
                }
                if (!findObjs({_type: 'macro', _playerid: msg.playerid, name: 'd4'})[0])
                {
                    createObj('macro', {
                        name: 'd4',
                        playerid: msg.playerid,
                        istokenaction: false,
                        visibleto: "all",
                        action: "/roll 1d4"
                    });
                }
                if (!findObjs({_type: 'macro', _playerid: msg.playerid, name: 'd6'})[0])
                {
                    createObj('macro', {
                        name: 'd6',
                        playerid: msg.playerid,
                        istokenaction: false,
                        visibleto: "all",
                        action: "/roll 1d6"
                    });
                }
                if (!findObjs({_type: 'macro', _playerid: msg.playerid, name: 'd8'})[0])
                {
                    createObj('macro', {
                        name: 'd8',
                        playerid: msg.playerid,
                        istokenaction: false,
                        visibleto: "all",
                        action: "/roll 1d8"
                    });
                }
                if (!findObjs({_type: 'macro', _playerid: msg.playerid, name: 'd10'})[0])
                {
                    createObj('macro', {
                        name: 'd10',
                        playerid: msg.playerid,
                        istokenaction: false,
                        visibleto: "all",
                        action: "/roll 1d10"
                    });
                }
                if (!findObjs({_type: 'macro', _playerid: msg.playerid, name: 'd12'})[0])
                {
                    createObj('macro', {
                        name: 'd12',
                        playerid: msg.playerid,
                        istokenaction: false,
                        visibleto: "all",
                        action: "/roll 1d12"
                    });
                }
                if (!findObjs({_type: 'macro', _playerid: msg.playerid, name: 'd20'})[0])
                {
                    createObj('macro', {
                        name: 'd20',
                        playerid: msg.playerid,
                        istokenaction: false,
                        visibleto: "all",
                        action: "/roll 1d20"
                    });
                }
                if (!findObjs({_type: 'macro', _playerid: msg.playerid, name: 'd100'})[0])
                {
                    createObj('macro', {
                        name: 'd100',
                        playerid: msg.playerid,
                        istokenaction: false,
                        visibleto: "all",
                        action: "/roll 1d100"
                    });
                }
            }
        }
    });
});