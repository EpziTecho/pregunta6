var juego = new Phaser.Game(370, 768, Phaser.CANVAS, "bloque_juego");
var teclaDerecha;
var teclaIzquierda;
var teclaArriba;
var teclaAbajo;
var fondo;
var carro;
var cursores;
var enemigos;
var balas;
var gasolinas;
var timer;
var timerGasolina;
var puntos = 0;
var enemigosDerrotados = 0;
var vidas = 3;
var textoPuntos;
var textoVidas;
var enemigosObjetivo = 2; // Establecer la cantidad de enemigos a derrotar

var Juego = {
    preload: function () {
        juego.load.image("bg", "img/bg2.png");
        juego.load.spritesheet("personaje", "img/personaje.png", 48, 58);
        juego.load.spritesheet("carroMalo", "img/ENEMIGOS.png", 48, 48);
        juego.load.image("gasolina", "img/gas.png");
        juego.load.image("bala", "img/laser.png");
        juego.load.audio("disparo", "audio/laser.mp3");
        juego.load.audio("explosion", "audio/explosion.mp3");
        juego.load.audio("audio", "audio/audio.mp3");
    },

    create: function () {
        fondo = juego.add.tileSprite(0, 0, 370, 768, "bg");
        carro = juego.add.sprite(100, 600, "personaje");

        carro.animations.add("movi", [0, 1, 2], 10, true);
        //animacion de movimiento a la izquierda
        carro.animations.add("izquierda", [3, 4, 5], 10, true);
        //animacion de movimiento a la derecha
        carro.animations.add("derecha", [6, 7, 8], 10, true);
        carro.anchor.setTo(0.5);
        juego.physics.enable(carro, Phaser.Physics.ARCADE);

        botonDisparo = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        textoPuntos = juego.add.text(20, 20, "Puntos: 0", {
            font: "14px Arial",
            fill: "#fff",
        });
        textoVidas = juego.add.text(20, 40, "Vidas: 3", {
            font: "14px Arial",
            fill: "#fff",
        });

        enemigos = juego.add.group();
        enemigos.enableBody = true;
        enemigos.physicsBodyType = Phaser.Physics.ARCADE;
        enemigos.createMultiple(20, "carroMalo"); // Crear hasta 20 enemigos, ajustar según necesidad
        enemigos.setAll("anchor.x", 0.5);
        enemigos.setAll("anchor.y", 0.5);
        enemigos.setAll("outOfBoundsKill", true);
        enemigos.setAll("checkWorldBounds", true);

        balas = juego.add.group();
        balas.enableBody = true;
        balas.physicsBodyType = Phaser.Physics.ARCADE;
        balas.createMultiple(20, "bala");
        balas.setAll("anchor.x", 0);
        balas.setAll("anchor.y", 0.2);
        balas.setAll("outOfBoundsKill", true);
        balas.setAll("checkWorldBounds", true);

        gasolinas = juego.add.group();
        gasolinas.enableBody = true;
        gasolinas.physicsBodyType = Phaser.Physics.ARCADE;
        gasolinas.createMultiple(20, "gasolina");
        gasolinas.setAll("anchor.x", 0.5);
        gasolinas.setAll("anchor.y", 0.5);
        gasolinas.setAll("outOfBoundsKill", true);
        gasolinas.setAll("checkWorldBounds", true);

        timer = juego.time.events.loop(1500, this.crearCarroMalo, this);
        timerGasolina = juego.time.events.loop(2000, this.crearGasolina, this);

        teclaDerecha = juego.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        teclaIzquierda = juego.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        teclaArriba = juego.input.keyboard.addKey(Phaser.Keyboard.UP);
        teclaAbajo = juego.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        var audio = juego.add.audio("audio");
        audio.play();
    },

    update: function () {
        fondo.tilePosition.y += 3;

        var moving = false; // Rastreo de movimiento del personaje

        // Movimiento horizontal del personaje principal
        if (teclaDerecha.isDown && carro.x < juego.width - carro.width) {
            carro.animations.play("derecha");
            carro.x++;
            moving = true; // Está en movimiento
        } else if (teclaIzquierda.isDown && carro.x > 0) {
            carro.animations.play("izquierda");
            carro.x--;
            moving = true; // Está en movimiento
        }

        // Movimiento vertical del personaje principal
        if (teclaArriba.isDown && carro.y > 0) {
            carro.y--;
            if (!moving) {
                // Solo reproducir animación de movi si no se mueve horizontalmente
                carro.animations.play("movi");
            }
        } else if (teclaAbajo.isDown && carro.y < juego.height - carro.height) {
            carro.y++;
            if (!moving) {
                // Solo reproducir animación de movi si no se mueve horizontalmente
                carro.animations.play("movi");
            }
        }

        // Si no se están presionando teclas de movimiento, reproducir animación de movi
        if (
            !teclaDerecha.isDown &&
            !teclaIzquierda.isDown &&
            !teclaArriba.isDown &&
            !teclaAbajo.isDown
        ) {
            carro.animations.play("movi");
        }
        if (juego.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            this.disparar();
        }

        juego.physics.arcade.overlap(
            balas,
            enemigos,
            this.explosion,
            null,
            this
        );
        juego.physics.arcade.overlap(carro, enemigos, this.choque, null, this);
        juego.physics.arcade.overlap(
            carro,
            gasolinas,
            this.recogerGasolina,
            null,
            this
        );
    },

    disparar: function () {
        var bala = balas.getFirstExists(false);
        if (bala) {
            bala.reset(
                carro.x + carro.width / 2 - bala.width / 2,
                carro.y - bala.height
            );

            bala.body.velocity.y = -300;
            tiempoBala = juego.time.now + 100;
            const sonido_disparo = juego.sound.add("disparo");
            sonido_disparo.play();
        }
    },

    explosion: function (bala, enemigo) {
        bala.kill();
        enemigo.kill();
        juego.sound.play("explosion");
        puntos += 100;
        enemigosDerrotados++;
        textoPuntos.text = "Puntos: " + puntos;
        if (enemigosDerrotados >= enemigosObjetivo) {
            this.iniciarFadeoutnextLevel("nivel2.html"); // Ajusta la URL según necesidad
        }
    },

    choque: function (carro, enemigo) {
        enemigo.kill();
        vidas--;
        textoVidas.text = "Vidas: " + vidas;
        if (vidas === 0) {
            this.iniciarFadeOutGameOver("index.html");
        }
    },

    recogerGasolina: function (carro, gasolina) {
        gasolina.kill();
        puntos += 150;
        textoPuntos.text = "Puntos: " + puntos;
    },

    crearCarroMalo: function () {
        var posicion = Math.floor(Math.random() * 3) + 1;
        var enemigo = enemigos.getFirstDead();
        enemigo.reset(posicion * 73, 0);
        enemigo.body.velocity.y = 200;
        enemigo.anchor.setTo(0.5);
    },

    crearGasolina: function () {
        var posicion = Math.floor(Math.random() * 3) + 1;
        var gasolina = gasolinas.getFirstDead();
        gasolina.reset(posicion * 73, 0);
        gasolina.body.velocity.y = 200;
        gasolina.anchor.setTo(0.5);
    },

    iniciarFadeoutnextLevel: function () {
        var fadeOutSprite = juego.add.sprite(0, 0, "bg");
        fadeOutSprite.width = juego.width;
        fadeOutSprite.height = juego.height;
        fadeOutSprite.alpha = 0;

        var text = juego.add.text(
            juego.world.centerX,
            juego.world.centerY,
            "Nivel 2 en 3",
            {
                font: "40px Arial",
                fill: "#ffffff",
            }
        );
        text.anchor.setTo(0.5, 0.5);

        var fadeOutTween = juego.add
            .tween(fadeOutSprite)
            .to({ alpha: 1 }, 1500, Phaser.Easing.Linear.None, true); //parametros: (objetivo, duración, tipo de animación, autoiniciar)

        // Crear temporizador para actualizar el texto del contador
        var counter = 3;
        var interval = setInterval(function () {
            counter--;
            if (counter >= 0) {
                text.setText("Nivel 2 en " + counter);
            } else {
                text.setText(""); // Borra el texto cuando el contador llega a 0
                clearInterval(interval);
            }
        }, 1000); // Cambia cada 500 ms

        fadeOutTween.onComplete.add(function () {
            window.location.href = "nivel2.html"; // Asegúrate de que esta URL es correcta
        }, this);
    },

    iniciarFadeOutGameOver: function (targetUrl) {
        var fadeOutSprite = juego.add.sprite(0, 0, "bg");
        fadeOutSprite.width = juego.width;
        fadeOutSprite.height = juego.height;
        fadeOutSprite.alpha = 0;

        var text = juego.add.text(
            juego.world.centerX,
            juego.world.centerY,
            "Mision cumplida",
            {
                font: "40px Arial",
                fill: "#ffffff",
            }
        );
        text.anchor.setTo(0.5, 0.5);

        var fadeOutTween = juego.add
            .tween(fadeOutSprite)
            .to({ alpha: 1 }, 1500, Phaser.Easing.Linear.None, true); // parametros

        var counter = 2;
        var interval = setInterval(function () {
            counter--;
            if (counter >= 0) {
                text.setText("Game over");
            }
        }, 1000); // Cambia cada 500 ms

        fadeOutTween.onComplete.add(function () {
            window.location.href = targetUrl; // redirigir a la portada
        }, this);
    },
};

juego.state.add("principal", Juego);
juego.state.start("principal");