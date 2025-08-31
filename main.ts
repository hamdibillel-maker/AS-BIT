// Define the namespace for the AS BIT extension.
// The block defines the name that appears in the MakeCode block category.
// The color and icon properties customize the category's appearance.
//% color="#0066CC" icon="\uf1b9" block="AS BIT"
namespace asbit {

    // --- PINOUT DEFINITIONS BASED ON YOUR ROBOT'S SCHEMATIC ---
    const BUZZER_PIN = DigitalPin.P9;
    const NEOPIXEL_PIN = DigitalPin.P6;
    const RGB_RED_PIN = DigitalPin.P5;
    const RGB_GREEN_PIN = DigitalPin.P4;
    const RGB_BLUE_PIN = DigitalPin.P3;
    const LEFT_MOTOR_SPEED_PIN = DigitalPin.P16;
    const LEFT_MOTOR_DIR_PIN = DigitalPin.P15;
    const RIGHT_MOTOR_SPEED_PIN = DigitalPin.P14;
    const RIGHT_MOTOR_DIR_PIN = DigitalPin.P13;

    // --- INTERNAL HELPERS ---

    // Internal function to control motors
    function setMotors(leftSpeed: number, rightSpeed: number): void {
        const leftDir = leftSpeed > 0 ? 1 : 0;
        const rightDir = rightSpeed > 0 ? 1 : 0;

        pins.digitalWritePin(LEFT_MOTOR_DIR_PIN, leftDir);
        pins.digitalWritePin(RIGHT_MOTOR_DIR_PIN, rightDir);

        pins.analogWritePin(LEFT_MOTOR_SPEED_PIN, Math.abs(leftSpeed));
        pins.analogWritePin(RIGHT_MOTOR_SPEED_PIN, Math.abs(rightSpeed));
    }

    // Define directions as an enum for easy selection in blocks
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

    /**
     * Controls the movement of the AS BIT robot.
     * @param direction The direction to move (forward, backward, left, right, stop).
     * @param speed The motor speed from 0 to 1023.
     */
    //% blockId="asbit_move" block="move %direction at speed %speed"
    //% speed.min=0 speed.max=1023
    //% weight=100 blockGap=8
    export function move(direction: Motors, speed: number): void {
        switch (direction) {
            case Motors.Forward:
                setMotors(speed, speed);
                break;
            case Motors.Backward:
                setMotors(-speed, -speed);
                break;
            case Motors.Left:
                setMotors(-speed, speed);
                break;
            case Motors.Right:
                setMotors(speed, -speed);
                break;
            case Motors.Stop:
                setMotors(0, 0);
                break;
        }
    }

    /**
     * Sets the color of the onboard RGB LEDs.
     * @param red The red value from 0 to 255.
     * @param green The green value from 0 to 255.
     * @param blue The blue value from 0 to 255.
     */
    //% blockId="asbit_set_rgb" block="set RGB to R:%red G:%green B:%blue"
    //% red.min=0 red.max=255
    //% green.min=0 green.max=255
    //% blue.min=0 blue.max=255
    //% weight=90 blockGap=8
    export function setRGB(red: number, green: number, blue: number): void {
        pins.analogWritePin(RGB_RED_PIN, red * 4);
        pins.analogWritePin(RGB_GREEN_PIN, green * 4);
        pins.analogWritePin(RGB_BLUE_PIN, blue * 4);
    }

    /**
     * Sets the color of the NeoPixel strip.
     * @param red The red value from 0 to 255.
     * @param green The green value from 0 to 255.
     * @param blue The blue value from 0 to 255.
     */
    //% blockId="asbit_set_neopixel" block="set NeoPixel to R:%red G:%green B:%blue"
    //% red.min=0 red.max=255
    //% green.min=0 green.max=255
    //% blue.min=0 blue.max=255
    //% weight=80 blockGap=8
    export function setNeoPixelColor(red: number, green: number, blue: number): void {
        let strip = neopixel.create(NEOPIXEL_PIN, 1, NeoPixelMode.RGB);
        strip.showColor(neopixel.rgb(red, green, blue));
    }

    /**
     * Plays a tone on the buzzer.
     * @param frequency The frequency in Hz.
     * @param duration The duration in milliseconds.
     */
    //% blockId="asbit_play_tone" block="play tone at %frequency Hz for %duration ms"
    //% frequency.min=0 frequency.max=20000
    //% duration.min=0 duration.max=5000
    //% weight=70
    export function playTone(frequency: number, duration: number): void {
        music.playTone(frequency, duration);
    }
}
// This is the program logic that uses the blocks defined above.
basic.forever(function () {
    if (input.buttonIsPressed(Button.P0)) {
        asbit.move(asbit.Motors.Forward, 1000)
    }
})

basic.showString("C")
