/*******************************************************************
A script for creating a star system, with random details.
The user GM creates a new page, size should be at least 50x50,
but either way, it should be square, or at least as wide as it
is high. Make the map have no grid, preferably. It's also advised
that the GM name the page after the star system being generated.

GM names the system. Then enters the command 
!STASysGen <systemname>. I would use a macro with the body:
!STASysGen ?{System Name}.

This will create the star map background (random from
table), and fill the map with token objects that the GM can move
but should not. The reason they are on the object layer is
to let players target then with a scan macro. The objects
include one or more random stars, asteroid belts, gas giants
terrestrial planets, and moons. These will be tied to
characters, which will have attributes that report information
about the objects.

It is advised that the GM create a folder called 'Systems',
with sub-folders for particular star systems, and move any 
characters created by the !STASysGen command into the appropriate
folder.

The system will not be to scale, because either the stars
and planets would be tiny, or the map would be gigantic.
As an example, trying to fit Neptune (30 au out) onto a
50x50 map means that a small appearing star is larger than
1 au, which would encompass Earth. 
*******************************************************************/

//Work no longer in progress. Partially complete. I tried to do too much :(

on("ready", function() {
    "use strict";

    //variables which will be used by multiple functions.
    var mapSize;
    var mapPixels;
    var starSizeBase;
    var starSizeMult;
    var orbitPathPixels;
    var orbitPathEmbiggenPixels;
    var SystemHazards = [];
    var systemName = "";
    var systemChar;
    var SeverRadiationSum;
    var ionStormSum;
    var flaresSum;
    var gravDistortionSum;
    var luminositySum;
    var pageid;
    var asteroidBelts;
    var orbitDistFontSize = 22;
    var orbitDistFSPix = 29;
    var StarfieldToken;
    var habitZoneMin;
    var habitZoneMax;
    var noLifeNow;
    var noLifeEver;
    var planetSizeBase;
    var planetSizeMult;
    var planetCount;
    var asteroidBeltCorrection = 1;
    
    var colorNameArray = ["Blue", "White", "Yellow", "Orange", "Red", "Pulsar", "Black Hole"];
    var starSizeArray = [3, 0, 1, 1, 3, 0, 0];

    //gets an image for use in creating graphics (tokens and map objects)
    var getCleanImgsrc = function (imgsrc) {
        var parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^\?]*)(\?[^?]+)?$/);
        if(parts) 
        {
            return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
        }
        return;
    };

    //function for adding star system attribures
    var addSysAttr = function (attrName, attrCurrent)
    {
        createObj('attribute', {
            name: attrName,
            current: attrCurrent,
            characterid: systemChar.id
        });
    }
    
    //function for adding star system abilities
    //TODO: make this do something
    var addSysAbil = function (abilName, abilBody)
    {
        createObj('ability', {
            name: attrName,
            action: attrCurrent,
            characterid: systemChar.id
        });
    }

    //sleep function to deal with asynchronous computing problems, such as order of token placement.
    //this is probably horrible practice, but I don't know a better way.
    //var sleep = function(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

    // finds the starfield table items, selects one at random,
    // places it in the current page, on map layer, filling screen.
    function GenerateStarfield(IDofPage, NameOfSystem)
    {
        //find and assign map size, and associated variables
        pageid = IDofPage;
        mapSize = findObjs({type: 'page', id: pageid})[0].get('width');
        mapPixels = 70*mapSize
        starSizeBase = 2.8*mapSize;
        starSizeMult = 1.2*mapSize;
        orbitPathPixels = 15.4*mapSize;
        orbitPathEmbiggenPixels = 4.2*mapSize;
        SeverRadiationSum = 0;
        ionStormSum = 0;
        flaresSum = 0;
        gravDistortionSum = 0;
        luminositySum = 0;
        systemName = NameOfSystem;
        asteroidBelts = 0;
        planetSizeBase = 1.0*mapSize;
        planetSizeMult = 0.5*mapSize;
        planetCount = 0;

        //first find the starfield table id
        const sfTableID = (findObjs({type: 'rollabletable', name: 'Starfields'}, {caseInsensitive: true})||{id:'doesnotexist'})[0].id;
        const starfieldArray = findObjs({type: 'tableitem', _rollabletableid: sfTableID})
            .map((ti)=>getCleanImgsrc(ti.get('avatar')))
            .filter((i)=>!_.isUndefined(i));

        StarfieldToken = createObj('graphic', {
            subtype: 'token',
            pageid: pageid,
            imgsrc: _.sample(starfieldArray),
            left: mapPixels/2,
            top: mapPixels/2,
            height: mapPixels,
            width: mapPixels,
            layer: "map"
        });

        //await sleep(500);
        GenerateStar();
    }

    // creates from 1 to 3 stars or star-mass objects, and places them on the map. 
    // calls for star characters to be created
    function GenerateStar()
    {
        //first find the star table id and get the images
        const starsTableID = (findObjs({type: 'rollabletable', name: 'Stars'}, {caseInsensitive: true})||{id:'doesnotexist'})[0].id;
        const starsArray = findObjs({type: 'tableitem', _rollabletableid: starsTableID})
            .map((ti)=>getCleanImgsrc(ti.get('avatar')))
            .filter((i)=>!_.isUndefined(i));
        
        //This will be used to store the stars for sorting or messing with
        var StarsObjArray = [];
        // 1 to 3 stars per system, with weith towards 2, then 1, then 3.
        var starWeightedCount = Math.floor(Math.random() * 100);
        var starCount;
        if (starWeightedCount < 40)                                 { starCount = 1; }
        else if (starWeightedCount >= 40 && starWeightedCount < 90) { starCount = 2; }
        else                                                        { starCount = 3; }

        // loop over the star count to generate all of them
        for (var i = 1; i <= starCount; i++) 
        {
            var StarObj = {};
            // star color table is set up in game. Colors should match name array
            // weighted chance at star color. All colors are equal here, 
            // but black holes and pulsars are rare
            var starWeightedColor = Math.floor(Math.random() * 100);
            var starColor;
            
            if (starWeightedColor < 18)                                 { starColor = 0; }
            else if (starWeightedColor >= 18 && starWeightedColor < 36) { starColor = 1; }
            else if (starWeightedColor >= 36 && starWeightedColor < 54) { starColor = 2; }
            else if (starWeightedColor >= 54 && starWeightedColor < 72) { starColor = 3; }
            else if (starWeightedColor >= 72 && starWeightedColor < 90) { starColor = 4; }
            else if (starWeightedColor >= 90 && starWeightedColor < 96) { starColor = 5; }
            else                                                        { starColor = 6; }
        
            // variable star size based on color.
            var starSize = Math.floor((Math.random() * (starSizeMult * starSizeArray[starColor]) + starSizeBase));
            
            // a little boost to small blue stars, I think they should be large, but I don't know astronomy.
            if (starSize < 200 && starColor == 0) { starSize += 100; }
            //shrink the pulsars and black holes. Small, but massive
            if (starColor == 5 || starColor == 6) { starSize -= Math.floor(Math.random()*starSizeMult); }
            // shrink the white stars a bit
            if (starColor == 1) { starSize -= Math.floor(Math.random()*starSizeMult/2); }

            //star placement
            var starLeft;
            var starTop;
            if (starCount == 1) //center the star
            {
                starLeft = mapPixels/2;
                starTop = mapPixels/2;
            }
            if (starCount == 2) //offset each from the center
            {
                //this is ugly, just a way of determining whether they go left or right. i-2 might work, I dunno what Math.sign(0) is.
                starLeft = mapPixels/2 - Math.sign((i/2)-.75)*(starSize/2);
                starTop = mapPixels/2
            }
            if (starCount == 3) //makes a triangle offset from the center
            {
                if (i == 1)
                {
                    starLeft = mapPixels/2 - (starSize/2);
                    starTop = mapPixels/2 + (starSize/2);
                }
                if (i == 2)
                {
                    starLeft = mapPixels/2 + (starSize/2);
                    starTop = mapPixels/2 + (starSize/2);
                }
                if (i == 3)
                {
                    starLeft = mapPixels/2;
                    starTop = mapPixels/2 - (starSize/2);
                }
            }
            
            StarObj.token = createObj('graphic', {
                subtype: 'token',
                pageid: pageid,
                imgsrc: starsArray[starColor],
                left: starLeft,
                top: starTop,
                height: starSize,
                width: starSize,
                layer: "objects",
                showname: true,
                showplayers_name: true
            });
            
            StarObj.color = starColor;
            
            StarsObjArray.push(StarObj);

        }
        
        const sortByTokenHeight = (t1,t2) => t2.token.get('height') - t1.token.get('height');
        StarsObjArray.sort(sortByTokenHeight);

        //adds numbering to red bar, the star bar.
        for(var i =0; i<StarsObjArray.length; i++)
        {
            StarsObjArray[i].token.set("bar3_value", i);
        }

        // adds a system character to track a variety of things
        systemChar = createObj('character', {
                        name: systemName + " System",
                        avatar: StarsObjArray[0].token.get('imgsrc')
                        });

        const RadiusToMass = .00028748;
        const WhiteDwarfUpperMass = 1.3;
        const WhiteDwarfLowerMass = 0.8;
        const PulsarMassUpper = 3;
        const PulsarMassLower = 1;
        const BlackHoleMassUpper = 30;
        const BlackHoleMassLower = 3;
        const RadiusOfSol = 695700
        
        var HeightToRadius = RadiusOfSol / (starSizeBase + starSizeMult/2);
        var colorNameArray = ["Blue", "White", "Yellow", "Orange", "Red", "Pulsar", "Black Hole"];
        var ionStormArray = [1.5, 0, 0, 0, 0, 3, 3];
        var flaresArray = [1.8, 1.1, 1.2, 1.2, 1.2, 0, 0];
        var gravEddyArray = [0, 0, 0, 0, 0, 1.5, 2.5];
        var radiationArray = [2, 1.1, 1.2, 1.2, 1.2, 5, 5];
        var greekLetterArray = ["Alpha", "Beta", "Gamma"]
        var StarNamesArray = [];
        for (var i=0; i< StarsObjArray.length; i++)
        {
            // pointless switch because I'm getting confused by all of the arrays
            var LumColCoef;
            switch (StarsObjArray[i].color) {
                case (0):
                    LumColCoef = 3;
                    break;
                case(1):
                    LumColCoef = 2;
                    break;
                case(2):
                    LumColCoef = 1;
                    break;
                case(3):
                    LumColCoef = 0.9;
                    break;
                case(4):
                    LumColCoef = 0.7;
                    break;
                case(5):
                    LumColCoef = 2;
                    break;
                case(6):
                    LumColCoef = 0;
                    break;
                default:
                    break;
            }

            /*this may be lack of imagination on my part, but if a black hole or pulsar is in system,
            then the system had a supernova, which would kill all life. If the system has a blue star,
            then the star hasn't been going very long (they have short lifespans, I think), so the 
            system should never have developed life.*/
            if(StarsObjArray[i].color >= 5) { noLifeNow = true; }
            if(StarsObjArray[i].color == 1) { noLifeEver = true; }

            // Assigns star name. Also assigns greek letters to the stars if more than 1.
            if(StarsObjArray.length > 1) { StarsObjArray[i].token.set("name", systemName + " " + greekLetterArray[i]);}
            else                         { StarsObjArray[i].token.set("name", systemName);}

            //makes all the tokens represent the system character.
            StarsObjArray[i].token.set("represents", systemChar.id);

            // finds the color of the star, puts it in character. Adds giant or dwarf to large or small stars
            if (StarsObjArray[i].color!=5 && StarsObjArray[i].color!=6) 
            {addSysAttr('Star ' + i + ' Color', (colorNameArray[StarsObjArray[i].color] + StarSizeName(StarsObjArray[i].token.get("height"))));}
            else {addSysAttr('Star ' + i + ' Color', colorNameArray[StarsObjArray[i].color]);}
            
            // sets the size of the star in km radius
            addSysAttr('Star ' + i + ' Size', (Math.round(100 * StarsObjArray[i].token.get("height")*HeightToRadius))/100);
            
            // sets the Luminosity of the star
            addSysAttr('Star ' + i + ' Luminosity', ((Math.round(100*(StarsObjArray[i].color!=6)*Math.pow(StarsObjArray[i].token.get("height"),2)/Math.pow((starSizeBase + starSizeMult),2))* LumColCoef))/100);
            
            // sets the star's mass. White dwarfs, pulsars, and black hole mass is not here based on size, for my own ease.
            if(StarsObjArray[i].color!=5 && StarsObjArray[i].color!=6 && StarsObjArray[i].color !=1)
            {addSysAttr('Star ' + i + ' Mass', Math.floor(1000 * Math.pow(StarsObjArray[i].token.get("height"), 3)*Math.pow(1/(starSizeBase + starSizeMult/2), 3))/1000);}
            else if(StarsObjArray[i].color!=5 && StarsObjArray[i].color!=6)
            {addSysAttr('Star ' + i + ' Mass', Math.floor(1000 * (Math.random() * (WhiteDwarfUpperMass - WhiteDwarfLowerMass) + WhiteDwarfLowerMass))/1000);}
            else if(StarsObjArray[i].color!=6)
            {addSysAttr('Star ' + i + ' Mass', Math.floor(1000 * (Math.random() * (PulsarMassUpper - PulsarMassLower) + PulsarMassLower))/1000);}
            else
            {addSysAttr('Star ' + i + ' Mass', Math.floor(1000 * (Math.random() * (BlackHoleMassUpper - BlackHoleMassLower) + BlackHoleMassLower))/1000);}

            // sets the star's flares property
            {addSysAttr('Star ' + i + ' Flares', Math.floor(Math.random()*flaresArray[StarsObjArray[i].color]));}
            
            // sets the star's gravitation distortion property
            if (StarsObjArray[i].color == 6 || (StarsObjArray[i].color == 5 && StarsObjArray.length != 1))
            {addSysAttr('Star ' + i + ' Gravitational Distortion', Math.floor(Math.random()*gravEddyArray[StarsObjArray[i].color]));}
            else {addSysAttr('Star ' + i + ' Gravitational Distortion', 0);}

            // sets the star's ion storms property
            if (((StarsObjArray[i].color == 6 || StarsObjArray[i].color == 5) && StarsObjArray.length != 1) || StarsObjArray[i].color == 0)
            {addSysAttr('Star ' + i + ' Ion Storms', Math.floor(Math.random()*ionStormArray[StarsObjArray[i].color]));}
            else {addSysAttr('Star ' + i + ' Ion Storms', 0);}

            // sets the star's severe radiation property
            if (((StarsObjArray[i].color == 6 || StarsObjArray[i].color == 5) && StarsObjArray.length != 1) || StarsObjArray[i].color < 5)
            {addSysAttr('Star ' + i + ' Severe Radiation', Math.floor(Math.random()*radiationArray[StarsObjArray[i].color]));}
            else {addSysAttr('Star ' + i + ' Severe Radiation', 0);}
            
            SeverRadiationSum += getAttrByName(systemChar.id, 'Star ' + i + ' Severe Radiation', 'current');
            gravDistortionSum += getAttrByName(systemChar.id, 'Star ' + i + ' Gravitational Distortion', 'current');
            flaresSum += getAttrByName(systemChar.id, 'Star ' + i + ' Flares', 'current');
            ionStormSum += getAttrByName(systemChar.id, 'Star ' + i + ' Ion Storms', 'current');
            luminositySum += getAttrByName(systemChar.id, 'Star ' + i + ' Luminosity', 'current');
            
        }
    
        addSysAttr('Luminosity Sum', (Math.round(luminositySum*100)/100));
        addSysAttr('Dangerous Radiation Level', SeverRadiationSum);
        addSysAttr('Gravometric Distortion', gravDistortionSum);
        addSysAttr('Solar Flares', flaresSum);
        addSysAttr('Ion Storms', ionStormSum);
        
        habitZoneMax = 1.2*Math.sqrt(luminositySum);
        habitZoneMin = 0.8*Math.sqrt(luminositySum);

        PlanetGenerator();
    }

    // add a name modifier to stars
    function StarSizeName (height)
    {
        if (height < (starSizeBase + starSizeMult/2))      { return " Dwarf"; }
        else if (height > (starSizeBase + 2*starSizeMult)) { return " Giant"; }
        else                                               { return "";       }
    }

    // adds planets
    function PlanetGenerator ()
    {   
        //determine planet layout
        var planetLayoutArray = ["CenterHeavy", "FarHeavy", "FarHeavy","FarHeavy","FarHeavy","Random"];
        var planetLayout = _.sample(planetLayoutArray);

        //create planet array and planet obj/array
        var planetArray = [0,0,0,0,0,0,0,0,0,0,0,0];
        var planetObj = {};
        var planetObjArray = [];
        var planetDistanceArray = [0,0,0,0,0,0,0,0,0,0,0,0];
        
        

        //determine planet array, based on planet layout
        if (planetLayout == "CenterHeavy")
        {
            for(var i = 0; i < planetArray.length; i++)
            {
                // for inner planets (1-4), they should be 3 or 0. Beyond that, they should be 0, 1, or 2.
                if (i < 4) { planetArray[i] = PlanetSizeRandom('GasGiant');    }
                else       { planetArray[i] = PlanetSizeRandom('Terrestrial'); }
            }
        }
        else if (planetLayout == "FarHeavy")
        {
            for(var i = 0; i < planetArray.length; i++)
            {
                // for inner planets (1-4), they should be 0, 1, or 2. Beyond that, they should be 0-3. Very far planets can be 0-2.
                if (i < 4 || i > 8) { planetArray[i] = PlanetSizeRandom('Terrestrial'); }
                else                { planetArray[i] = PlanetSizeRandom('GasGiant');    }
            }
        }
        else //random arrangement
        {
            for(var i = 0; i < planetArray.length; i++)
            {
                planetArray[i] = PlanetSizeRandom('Random');
            }
        }


        //sets up the orbital paths for planets
        for(var i = 0; i<planetDistanceArray.length; i++) { planetDistanceArray[i] = PlanetDistanceFunction(i);}
        OrbitalPathsGenerator(planetArray, planetDistanceArray);

        //classifies planets, makes tokens, adds them to planet object array, updates system character sheet.
        for(var i = 0; i<planetArray.length; i++) 
        {
            if(planetArray[i] != 0)
            {
                planetObj = new Object();
                planetObj.classification = PlanetClassifier(planetArray[i], planetDistanceArray[i]);
                planetObj.token = PlanetTokenMaker(i, planetArray[i], planetObj.classification);
                planetObjArray.push(planetObj);
            }
        }
        addSysAttr("Planet Count", planetCount);
        for(var i=0; i<planetObjArray.length; i++) {
            sendChat("", "should try to call function");
            sendChat("",planetObjArray[i].classification);
            PlanetAttributesAbilities(i, planetObjArray[i]); }

    }

    // a bunch of magic numbers. I just guessed based on Solar system planet distances, counting the asteroid belt as an orbit. +/- 10%.
    // the number following 0.2 is the AU for orbits in our solar system, with guessed extrapolation for planets 9-12.
    //TODO: make sure orbits can't overlap, or overtake further orbit, while keeping some randomness. It looks ok at first glance.
    function PlanetDistanceFunction(orbit)
    {
        switch (orbit) {
            case(0):
                return Math.floor((Math.random()*0.2* 0.39 + 0.9*0.39)*100)/100;
                break;
            case(1):
                return Math.floor((Math.random()*0.2* 0.72 + 0.9*0.72)*100)/100;
                break;
            case(2):
                return Math.floor((Math.random()*0.2* 1.0 + 0.9*1.0)*100)/100;
                break;
            case(3):
                return Math.floor((Math.random()*0.2* 1.52 + 0.9*1.52)*100)/100;
                break;
            case(4):
                return Math.floor((Math.random()*0.2* 3.2 + 0.9*3.2)*100)/100;
                break;
            case(5):
                return Math.floor((Math.random()*0.2* 5.2 + 0.9*5.2)*100)/100;
                break;
            case(6):
                return Math.floor((Math.random()*0.2* 9.6 + 0.9*9.6)*100)/100;
                break;
            case(7):
                return Math.floor((Math.random()*0.2* 19 + 0.9*19)*100)/100;
                break;
            case(8):
                return Math.floor((Math.random()*0.2* 30 + 0.9*30)*100)/100;
                break;
            case(9):
                return Math.floor((Math.random()*0.2* 42 + 0.9*42)*100)/100;
                break;
            case(10):
                return Math.floor((Math.random()*0.2*55 + 0.9*55)*100)/100;
                break;
            case(11):
                return Math.floor((Math.random()*0.2*69 + 0.9*69)*100)/100;
                break;
        }
    }

    //0 is no planet, possibly an asteroid belt. 1 is small planet, like Mercury. 2 is small to large terrestrial, like Mars through larger than Earth
    //3 is a gas giant, 4 is a very large gas giant.
    function PlanetSizeRandom(planetType)
    {
        switch (planetType) {
            case ('GasGiant'):
                return _.sample([0,3,4]);
                break;
            case ('Terrestrial'):
                return _.sample([0,1,2]);
                break;
            case ('Small'):
                return _.sample([0,1]);
                break;
            case ('Random'):
                return _.sample([0,1,2,3,4]);
                break;
            default:
                break;
        }
    }

    // adds orbital paths to planets
    function OrbitalPathsGenerator (planetArray, planetDistanctArray)
    {
        //first find the Orbitalpath table id and get the images
        const orbitalPathTableID = (findObjs({type: 'rollabletable', name: 'OrbitalPaths'}, {caseInsensitive: true})||{id:'doesnotexist'})[0].id;
        const orbitalPathArray = findObjs({type: 'tableitem', _rollabletableid: orbitalPathTableID})
            .map((ti)=>getCleanImgsrc(ti.get('avatar')))
            .filter((i)=>!_.isUndefined(i));
        const randomOrbitalPath = _.sample(orbitalPathArray);
        for(var i = 0; i < planetArray.length; i++)
        {
            if(planetArray[i] != 0)
            {
                createObj('graphic', {
                    subtype: 'token',
                    pageid: pageid,
                    imgsrc: randomOrbitalPath,
                    left: mapPixels/2,
                    top: mapPixels/2,
                    height: orbitPathPixels + orbitPathEmbiggenPixels*i,
                    width: orbitPathPixels + orbitPathEmbiggenPixels*i,
                    layer: "map"
                });

                var varText = createObj('text', {
                    pageid: pageid,
                    left: mapPixels/2,
                    top: mapPixels/2 + (1/2)*orbitPathPixels + (1/2)*orbitPathEmbiggenPixels*i + orbitDistFSPix/2,
                    font_family: "Contrail One",
                    color: "rgb(255, 255, 0)",
                    font_size: orbitDistFontSize,
                    text: planetDistanctArray[i] + " AU",
                    layer: "map"
                });

            }
        }
    }

    //classifies planets
    function PlanetClassifier(size, distance)
    {
        if(size == 0)
        {
            if       (asteroidBelts == 0 && Math.random() > 0.5) {asteroidBelts++; return "AstrBelt";}
            else if  (asteroidBelts == 1 && Math.random() > 0.9) {asteroidBelts++; return "AstrBelt";}
            else                                                 {return "Nothing"; } 
        }

        if(distance>habitZoneMin && distance < habitZoneMax)
        {
            if(size == 1) { return _.sample(["D"]); }
            if(size == 2) { return _.sample(["H","L","M"]); }
            if(size == 3) { return "J";}
            if(size == 4) { return "T";}
        }
        else if (distance < habitZoneMax)
        {
            if(size == 1) { return _.sample(["D", "Y"]); }
            if(size == 2) { return _.sample(["Y"]); }
            if(size == 3) { return "J";}
            if(size == 4) { return "T";}
        }
        else
        {
            if(size == 1) { return _.sample(["D","K"]); }
            if(size == 2) { return _.sample(["K"]); }
            if(size == 3) { return "J";}
            if(size == 4) { return "T";}
        }
    }

    //makes planet tokens
    function PlanetTokenMaker(orbitNumber, planetSize, planetClassification)
    {
        var embiggenPlanet = 0;
        var orbitalRadius;
        var orbitAngleTheta = Math.random()*2*Math.PI;
        
        if(planetClassification == "AstrBelt")
        {
            //first find the Asteroid Belt table id and get the images
            const asteroidBeltTableID = (findObjs({type: 'rollabletable', name: 'AsteroidBelt'}, {caseInsensitive: true})||{id:'doesnotexist'})[0].id;
            const asteroidBeltArray = findObjs({type: 'tableitem', _rollabletableid: asteroidBeltTableID})
                .map((ti)=>getCleanImgsrc(ti.get('avatar')))
                .filter((i)=>!_.isUndefined(i));
            
            return createObj('graphic', {
                    subtype: 'token',
                    pageid: pageid,
                    imgsrc: _.sample(asteroidBeltArray),
                    left: mapPixels/2,
                    top: mapPixels/2,
                    height: orbitPathPixels + orbitPathEmbiggenPixels*orbitNumber + mapSize*asteroidBeltCorrection, //small correction based on my asteroid belt image.
                    width: orbitPathPixels + orbitPathEmbiggenPixels*orbitNumber + mapSize*asteroidBeltCorrection,
                    represents: systemChar.id,
                    name: systemName + " " + planetCount,
                    showname: true,
                    showplayers_name: true,
                    layer: "map"
                });

        }

        if(planetClassification == "J" || planetClassification == "T")
        {
            planetCount++;
            //first find the Gas Giant table id and get the images
            const gasGiantTableID = (findObjs({type: 'rollabletable', name: 'GasGiant'}, {caseInsensitive: true})||{id:'doesnotexist'})[0].id;
            const gasGiantArray = findObjs({type: 'tableitem', _rollabletableid: gasGiantTableID})
                .map((ti)=>getCleanImgsrc(ti.get('avatar')))
                .filter((i)=>!_.isUndefined(i));
            
            //Size the Gas Giant by class
            if      (planetClassification == "J") {embiggenPlanet = 1;}
            else if (planetClassification == "T") {embiggenPlanet = 2;}

            //create token and place randomly on orbit path
            orbitalRadius = (orbitNumber*orbitPathEmbiggenPixels + orbitPathPixels)/2;
            return createObj('graphic', {
                    subtype: 'token',
                    pageid: pageid,
                    imgsrc: _.sample(gasGiantArray),
                    bar1_value: planetCount,
                    left: mapPixels/2 + orbitalRadius*Math.cos(orbitAngleTheta),
                    top: mapPixels/2 + orbitalRadius*Math.sin(orbitAngleTheta),
                    height: planetSizeBase + planetSizeMult*embiggenPlanet,
                    width: planetSizeBase + planetSizeMult*embiggenPlanet,
                    represents: systemChar.id,
                    name: systemName + " " + planetCount,
                    showname: true,
                    showplayers_name: true,
                    layer: "objects"
                });
        }

        if(["D", "H", "K", "L", "M", "Y",].includes(planetClassification))
        {
            planetCount++;
            //first find the Class <planetClassification> table id and get the images.
            const planetImageTableID = (findObjs({type: 'rollabletable', name: 'Class' + planetClassification}, {caseInsensitive: true})||{id:'doesnotexist'})[0].id;
            const planetImageArray = findObjs({type: 'tableitem', _rollabletableid: planetImageTableID})
                .map((ti)=>getCleanImgsrc(ti.get('avatar')))
                .filter((i)=>!_.isUndefined(i));
            
            //create token and place randomly on orbit path
            orbitalRadius = (orbitNumber*orbitPathEmbiggenPixels + orbitPathPixels)/2;

            //Size the planet
            embiggenPlanet = planetSize - 2;

            return createObj('graphic', {
                    subtype: 'token',
                    pageid: pageid,
                    imgsrc: _.sample(planetImageArray),
                    bar1_value: planetCount,
                    left: mapPixels/2 + orbitalRadius*Math.cos(orbitAngleTheta),
                    top: mapPixels/2 + orbitalRadius*Math.sin(orbitAngleTheta),
                    height: planetSizeBase + planetSizeMult*embiggenPlanet,
                    width: planetSizeBase + planetSizeMult*embiggenPlanet,
                    represents: systemChar.id,
                    name: systemName + " " + planetCount,
                    showname: true,
                    showplayers_name: true,
                    layer: "objects"
                });
        }

    }

    function PlanetAttributesAbilities (planetNumber, planetObject)
    {   sendChat("","function called");
        var heightCoef = 1;
        var massCoef = 1*Math.pow(10,20);
        if(["D", "H", "K", "L", "M", "Y","J","T"].includes(planetObject.classification))
        {
        sendChat("", "planet attributes should be added");
        addSysAttr("Planet", planetNumber + 1);
        addSysAttr("Class", planetObject.classification);
        addSysAttr("Radius", Math.pow(planetObject.token.get("height") * heightCoef,2) );
        addSysAttr("Mass", Math.pow(planetObject.token.get("height"),3) * massCoef );
        addSysAttr("Surface Gravity", planetObject.token.get("height") * massCoef * 6.67*Math.pow(10,-20));
        
        }
    }

    function AddMoon (planetNumber, planetObject)
    {

    }

    function ScanTarget (targetID)
    {
        //first find the token to scan
        var ScanObject = getObj('token', targetID);
        var ScanCharacter;
        
        if (getObj('character', ScanObject.id)) { ScanCharacter = getObj('character', ScanObject.id); }
        // now make sure it's a star system object

        if (ScanCharacter.get('name').split(" ")[1] == 'System')
        {
            
            //if it's the token for the system itself
            if (ScanObject.get(bar1_value) == 0 && ScanObject.get(bar2_value) == 0 && ScanObject.get(bar3_value) == 0)
            {
                ScanSystem (targetID);
            }
            //if it's the token for a star in the system. Stars have red value for star number
            else if (ScanObject.get(bar1_value) == 0 && ScanObject.get(bar2_value) == 0 && ScanObject.get(bar3_value) != 0)
            {
                ScanStar (targetID);
            }
            // if it's the token for a planet in the system. Planets have green value for planet number
            else if (ScanObject.get(bar1_value) != 0 && ScanObject.get(bar2_value) == 0 && ScanObject.get(bar3_value) == 0)
            {
                ScanPlanet (targetID);
            }
            // if it's the token for a moon in the system. Moons have a green value for parent planet, and blue for moon number
            else if (ScanObject.get(bar1_value) != 0 && ScanObject.get(bar2_value) != 0 && ScanObject.get(bar3_value) != 0)
            {
                ScanMoon (targetID);
            }
        }
        else
        {
            sendChat("", "not a proper scan target.");
        }
    }

    function ScanSystem (targetID)
    {

    }

    function ScanStar (targetID)
    {
        //TODO remove, only for testing
        sendChat("", "scan a star");
    }

    function ScanPlanet (targetID)
    {

    }

    function ScanMoon (targetID)
    {

    }

    // receive message to make the thing happen.
    on("chat:message", function (msg) {
        if ('api'===msg.type && playerIsGM(msg.playerid)){
            var args;
            args = msg.content.split(/\s+/);
            let player = getObj('player',msg.playerid),
                cmds = msg.content.split(/\s+/);
            switch(cmds[0].toLowerCase()){
                case '!stasysgen': 
                        if (args[1] != null && args[1] != "" && args[1] != undefined)
                        {
                            //TODO: make sure system with args[1] name doesn't exist already.
                            systemName = args[1];
                            GenerateStarfield(player.get('lastpage'), args[1]);
                        }
                        //TODO: figure out how to query the system name in a macro, and pass to API.
                        else {sendChat("", "No system name provided.");}
                    break;
            }
        }
        if ('api' === msg.type && msg.content.split(/\s+/)[0] === "!STASysScan"){
            var args;
            args = msg.content.split(/\s+/);
            var targetID = args[1];
            if (targetID != null && targetID != "") { ScanTarget(targetID); }
        }
    });
});