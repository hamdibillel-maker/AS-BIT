//
// This is the main TypeScript file for the "AS BIT" Micro:bit extension.
// It defines custom blocks to control a robot car, including motor movement,
// sensor readings, and LED lighting.
//

// Define the name of the extension and its color.
// The color is a unique hex code to make the blocks stand out in the editor.
//% color="#7B68EE" icon="\uf1b9" block="AS BIT"
namespace ASBIT {

    // --- Pin Definitions ---
    const RIGHT_MOTOR_FORWARD_PIN = AnalogPin.P13;
    const RIGHT_MOTOR_REVERSE_PIN = AnalogPin.P14;
    const LEFT_MOTOR_FORWARD_PIN = AnalogPin.P15;
    const LEFT_MOTOR_REVERSE_PIN = AnalogPin.P16;
    const BUZZER_PIN = P9;
    const NEOPIXEL_PIN = P6;
    const BLUE_LED_PIN = DigitalPin.P3;
    const GREEN_LED_PIN = DigitalPin.P4;
    const RED_LED_PIN = DigitalPin.P5;

    // --- Global Variables ---
    // A NeoPixel strip object, initialized to pin P6 with 7 pixels.
    let neopixelStrip: neopixel.Strip = null;

    /**
     * Enum for motor control directions.
     */
    export enum CarDirection {
        //% block="forward"
        Forward,
        //% block="backward"
        Backward,
        //% block="turn left"
        TurnLeft,
        //% block="turn right"
        TurnRight,
        //% block="spin left"
        SpinLeft,
        //% block="spin right"
        SpinRight,
        //% block="stop"
        Stop,
    }

    /**
     * Enum for the various colors of the digital RGB LED.
     */
    export enum RGBColors {
        //% block="Off"
        Off,
        //% block="Red"
        Red,
        //% block="Green"
        Green,
        //% block="Blue"
        Blue,
        //% block="Yellow"
        Yellow,
        //% block="Magenta"
        Magenta,
        //% block="Cyan"
        Cyan,
        //% block="White"
        White
    }

    /**
     * Enum for sensor reading types (analog or digital).
     */
    export enum ReadType {
        //% block="analog"
        Analog,
        //% block="digital"
        Digital,
    }

    // --- Initialization Block ---
    // This block is for initial setup. It sets up the NeoPixel strip and the music output pin.
    //% block="initialize AS BIT"
    //% subcategory="Car Control"
    export function initializeASBIT(): void {
        // Set up the NeoPixel strip with 7 LEDs on pin P6.
        if (!neopixelStrip) {
            neopixelStrip = neopixel.create(NEOPIXEL_PIN, 7, NeoPixelMode.RGB);
        }
        // Set the music output pin to P9 for the buzzer.
        music.setVolume(255);
        music.setPlayTone(BUZZER_PIN);
    }

    // --- Car Control Blocks ---

    /**
     * Controls the direction of the car at a specified speed.
     * @param direction The direction to move (forward, backward, left, right, etc.).
     * @param speed The speed of the car, from 0 to 100.
     */
    //% block="car direction $direction at speed $speed"
    //% speed.min=0 speed.max=100
    //% subcategory="Car Control"
    export function moveCar(direction: CarDirection, speed: number): void {
        const pwmSpeed = Math.map(speed, 0, 100, 0, 1023);

        pins.analogWritePin(LEFT_MOTOR_FORWARD_PIN, 0);
        pins.analogWritePin(LEFT_MOTOR_REVERSE_PIN, 0);
        pins.analogWritePin(RIGHT_MOTOR_FORWARD_PIN, 0);
        pins.analogWritePin(RIGHT_MOTOR_REVERSE_PIN, 0);

        switch (direction) {
            case CarDirection.Forward:
                pins.analogWritePin(LEFT_MOTOR_FORWARD_PIN, pwmSpeed);
                pins.analogWritePin(RIGHT_MOTOR_FORWARD_PIN, pwmSpeed);
                break;
            case CarDirection.Backward:
                pins.analogWritePin(LEFT_MOTOR_REVERSE_PIN, pwmSpeed);
                pins.analogWritePin(RIGHT_MOTOR_REVERSE_PIN, pwmSpeed);
                break;
            case CarDirection.TurnLeft:
                pins.analogWritePin(RIGHT_MOTOR_FORWARD_PIN, pwmSpeed);
                break;
            case CarDirection.TurnRight:
                pins.analogWritePin(LEFT_MOTOR_FORWARD_PIN, pwmSpeed);
                break;
            case CarDirection.SpinLeft:
                pins.analogWritePin(LEFT_MOTOR_REVERSE_PIN, pwmSpeed);
                pins.analogWritePin(RIGHT_MOTOR_FORWARD_PIN, pwmSpeed);
                break;
            case CarDirection.SpinRight:
                pins.analogWritePin(LEFT_MOTOR_FORWARD_PIN, pwmSpeed);
                pins.analogWritePin(RIGHT_MOTOR_REVERSE_PIN, pwmSpeed);
                break;
            case CarDirection.Stop:
                // All pins are already set to 0 at the start of the function.
                break;
        }
    }

    /**
     * Controls each motor independently with a specified speed.
     * @param leftSpeed Speed for the left motor, from -100 (reverse) to 100 (forward).
     * @param rightSpeed Speed for the right motor, from -100 (reverse) to 100 (forward).
     */
    //% block="set left wheel speed $leftSpeed right wheel speed $rightSpeed"
    //% leftSpeed.min=-100 leftSpeed.max=100
    //% rightSpeed.min=-100 rightSpeed.max=100
    //% subcategory="Car Control"
    export function setWheelsSpeed(leftSpeed: number, rightSpeed: number): void {
        const leftPwmSpeed = Math.map(Math.abs(leftSpeed), 0, 100, 0, 1023);
        const rightPwmSpeed = Math.map(Math.abs(rightSpeed), 0, 100, 0, 1023);

        if (leftSpeed >= 0) {
            pins.analogWritePin(LEFT_MOTOR_FORWARD_PIN, leftPwmSpeed);
            pins.analogWritePin(LEFT_MOTOR_REVERSE_PIN, 0);
        } else {
            pins.analogWritePin(LEFT_MOTOR_FORWARD_PIN, 0);
            pins.analogWritePin(LEFT_MOTOR_REVERSE_PIN, leftPwmSpeed);
        }

        if (rightSpeed >= 0) {
            pins.analogWritePin(RIGHT_MOTOR_FORWARD_PIN, rightPwmSpeed);
            pins.analogWritePin(RIGHT_MOTOR_REVERSE_PIN, 0);
        } else {
            pins.analogWritePin(RIGHT_MOTOR_FORWARD_PIN, 0);
            pins.analogWritePin(RIGHT_MOTOR_REVERSE_PIN, rightPwmSpeed);
        }
    }

    // --- LED Blocks ---

    /**
     * Sets the state of the digital RGB LEDs (red, green, blue).
     * @param color The desired color for the LEDs.
     */
    //% block="set digital RGB to color $color"
    //% subcategory="Car Control"
    export function setDigitalRGB(color: RGBColors): void {
        switch (color) {
            case RGBColors.Off:
                pins.digitalWritePin(RED_LED_PIN, 0);
                pins.digitalWritePin(GREEN_LED_PIN, 0);
                pins.digitalWritePin(BLUE_LED_PIN, 0);
                break;
            case RGBColors.Red:
                pins.digitalWritePin(RED_LED_PIN, 1);
                pins.digitalWritePin(GREEN_LED_PIN, 0);
                pins.digitalWritePin(BLUE_LED_PIN, 0);
                break;
            case RGBColors.Green:
                pins.digitalWritePin(RED_LED_PIN, 0);
                pins.digitalWritePin(GREEN_LED_PIN, 1);
                pins.digitalWritePin(BLUE_LED_PIN, 0);
                break;
            case RGBColors.Blue:
                pins.digitalWritePin(RED_LED_PIN, 0);
                pins.digitalWritePin(GREEN_LED_PIN, 0);
                pins.digitalWritePin(BLUE_LED_PIN, 1);
                break;
            case RGBColors.Yellow:
                pins.digitalWritePin(RED_LED_PIN, 1);
                pins.digitalWritePin(GREEN_LED_PIN, 1);
                pins.digitalWritePin(BLUE_LED_PIN, 0);
                break;
            case RGBColors.Magenta:
                pins.digitalWritePin(RED_LED_PIN, 1);
                pins.digitalWritePin(GREEN_LED_PIN, 0);
                pins.digitalWritePin(BLUE_LED_PIN, 1);
                break;
            case RGBColors.Cyan:
                pins.digitalWritePin(RED_LED_PIN, 0);
                pins.digitalWritePin(GREEN_LED_PIN, 1);
                pins.digitalWritePin(BLUE_LED_PIN, 1);
                break;
            case RGBColors.White:
                pins.digitalWritePin(RED_LED_PIN, 1);
                pins.digitalWritePin(GREEN_LED_PIN, 1);
                pins.digitalWritePin(BLUE_LED_PIN, 1);
                break;
        }
    }

    /**
     * Sets the color of the NeoPixel strip at the specified index.
     * @param index The index of the NeoPixel (0-6).
     * @param color The color to set (e.g., neopixel.colors(neopixel.rgb(255, 0, 0))).
     */
    //% block="set NeoPixel $index to color $color"
    //% index.min=0 index.max=6
    //% subcategory="Car Control"
    export function setNeoPixelColor(index: number, color: number): void {
        if (!neopixelStrip) {
            initializeASBIT();
        }
        neopixelStrip.setPixelColor(index, color);
        neopixelStrip.show();
    }

    // --- Sensor Blocks ---

    /**
     * Gets the distance from the ultrasonic sensor.
     * @param trigPin The trigger pin of the sensor (P8).
     * @param echoPin The echo pin of the sensor (P12).
     * @returns The distance in centimeters.
     */
    //% block="ultrasonic distance TRIG $trigPin ECHO $echoPin cm"
    //% trigPin.defl=P8
    //% echoPin.defl=P12
    //% subcategory="Sensors"
    export function ultrasonicDistance(trigPin: DigitalPin, echoPin: DigitalPin): number {
        pins.digitalWritePin(trigPin, 0);
        basic.pause(2);
        pins.digitalWritePin(trigPin, 1);
        basic.pause(10);
        pins.digitalWritePin(trigPin, 0);

        const duration = pins.pulseIn(echoPin, PulseValue.High, 25000);
        let distance = duration / 58;

        if (distance > 400) {
            distance = 400; // Cap at max range
        }
        return Math.round(distance);
    }

    /**
     * Reads a value from a specified pin, either analog or digital.
     * @param pin The pin to read from (P0, P1, P2).
     * @param type The type of reading to perform (analog or digital).
     * @returns The sensor reading value.
     */
    //% block="read pin $pin as $type"
    //% pin.defl=P0
    //% subcategory="Sensors"
    export function readSensor(pin: DigitalPin, type: ReadType): number {
        if (type === ReadType.Digital) {
            return pins.digitalReadPin(pin);
        } else {
            return pins.analogReadPin(pin);
        }
    }
}
