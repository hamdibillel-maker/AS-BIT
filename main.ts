//% color="#0066CC" icon="\uf1b9" block="AS BIT"
namespace asbit {
    const BUZZER_PIN = DigitalPin.P9;
    const NEOPIXEL_PIN = DigitalPin.P6;
    const RGB_RED_PIN = DigitalPin.P5;
    const RGB_GREEN_PIN = DigitalPin.P4;
    const RGB_BLUE_PIN = DigitalPin.P3;
    const LEFT_MOTOR_SPEED_PIN = AnalogPin.P16;
    const LEFT_MOTOR_DIR_PIN = DigitalPin.P15;
    const RIGHT_MOTOR_SPEED_PIN = AnalogPin.P14;
    const RIGHT_MOTOR_DIR_PIN = DigitalPin.P13;

    function setMotors(leftSpeed: number, rightSpeed: number): void {
        const leftDir = leftSpeed > 0 ? 1 : 0;
        const rightDir = rightSpeed > 0 ? 1 : 0;
        const scaledLeft = Math.abs(leftSpeed * 10.23);
        const scaledRight = Math.abs(rightSpeed * 10.23);

        pins.digitalWritePin(LEFT_MOTOR_DIR_PIN, leftDir);
        pins.digitalWritePin(RIGHT_MOTOR_DIR_PIN, rightDir);

        pins.analogWritePin(LEFT_MOTOR_SPEED_PIN, scaledLeft);
        pins.analogWritePin(RIGHT_MOTOR_SPEED_PIN, scaledRight);
    }

    export enum Motors {
        //% block="forward"
        Forward,
        //% block="backward"
        Backward,
        //% block="left"
        Left,
        //% block="right"
        Right,
        //% block="stop"
        Stop
    }

    //% blockId="asbit_move" block="move %direction at speed %speed"
    //% speed.min=0 speed.max=100
    export function move(direction: Motors, speed: number): void {
        switch (direction) {
            case Motors.Forward: setMotors(speed, speed); break;
            case Motors.Backward: setMotors(-speed, -speed); break;
            case Motors.Left: setMotors(-speed, speed); break;
            case Motors.Right: setMotors(speed, -speed); break;
            case Motors.Stop: setMotors(0, 0); break;
        }
    }

    //% blockId="asbit_set_rgb_analog" block="set RGB analog R:%red G:%green B:%blue"
    //% red.min=0 red.max=255 green.min=0 green.max=255 blue.min=0 blue.max=255
    export function setRGBAnalog(red: number, green: number, blue: number): void {
        pins.analogWritePin(RGB_RED_PIN, red * 4);
        pins.analogWritePin(RGB_GREEN_PIN, green * 4);
        pins.analogWritePin(RGB_BLUE_PIN, blue * 4);
    }

    //% blockId="asbit_set_neopixel" block="set NeoPixel R:%red G:%green B:%blue"
    export function setNeoPixelColor(red: number, green: number, blue: number): void {
        let strip = neopixel.create(NEOPIXEL_PIN, 1, NeoPixelMode.RGB);
        strip.showColor(neopixel.rgb(red, green, blue));
    }

    //% blockId="asbit_play_tone" block="play tone %frequency Hz for %duration ms"
    //% frequency.min=100 frequency.max=5000 duration.min=50 duration.max=2000
    export function playTone(frequency: number, duration: number): void {
        music.playTone(frequency, duration);
    }

    export enum RGB_Colors {
        //% block="red"
        Red,
        //% block="green"
        Green,
        //% block="blue"
        Blue,
        //% block="yellow"
        Yellow,
        //% block="magenta"
        Magenta,
        //% block="cyan"
        Cyan,
        //% block="white"
        White,
        //% block="off"
        Off
    }

    //% blockId="asbit_set_rgb_digital" block="set RGB digital %color"
    export function setRGBDigital(color: RGB_Colors): void {
        pins.digitalWritePin(RGB_RED_PIN, 0);
        pins.digitalWritePin(RGB_GREEN_PIN, 0);
        pins.digitalWritePin(RGB_BLUE_PIN, 0);

        switch (color) {
            case RGB_Colors.Red: pins.digitalWritePin(RGB_RED_PIN, 1); break;
            case RGB_Colors.Green: pins.digitalWritePin(RGB_GREEN_PIN, 1); break;
            case RGB_Colors.Blue: pins.digitalWritePin(RGB_BLUE_PIN, 1); break;
            case RGB_Colors.Yellow: pins.digitalWritePin(RGB_RED_PIN, 1); pins.digitalWritePin(RGB_GREEN_PIN, 1); break;
            case RGB_Colors.Magenta: pins.digitalWritePin(RGB_RED_PIN, 1); pins.digitalWritePin(RGB_BLUE_PIN, 1); break;
            case RGB_Colors.Cyan: pins.digitalWritePin(RGB_GREEN_PIN, 1); pins.digitalWritePin(RGB_BLUE_PIN, 1); break;
            case RGB_Colors.White: pins.digitalWritePin(RGB_RED_PIN, 1); pins.digitalWritePin(RGB_GREEN_PIN, 1); pins.digitalWritePin(RGB_BLUE_PIN, 1); break;
            case RGB_Colors.Off: break;
        }
    }
}
