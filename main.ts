/**
 * AS BIT Robot Extension
 * Full support for motors, sensors, RGB, sound, Bluetooth, and more.
 */
//% color=#008000 icon="\uf1b9" block="AS BIT Robot"
namespace asbit {
    // === Motor Pins ===
    const LEFT_MOTOR_FORWARD = DigitalPin.P13;
    const LEFT_MOTOR_BACKWARD = DigitalPin.P14;
    const RIGHT_MOTOR_FORWARD = DigitalPin.P15;
    const RIGHT_MOTOR_BACKWARD = DigitalPin.P16;

    // === Sensor Pins ===
    const LINE_SENSOR_LEFT = AnalogPin.P1;
    const LINE_SENSOR_RIGHT = AnalogPin.P2;
    const ULTRASONIC_TRIGGER = DigitalPin.P12;
    const ULTRASONIC_ECHO = DigitalPin.P11;

    // === RGB & Sound ===
    const RGB_PIN = DigitalPin.P8;
    const BUZZER_PIN = DigitalPin.P0;

    // === Enums ===
    export enum CarDirection {
        Forward,
        Backward,
        Left,
        Right
    }

    export enum LineSensor {
        Left,
        Right
    }

    export enum Color {
        Red,
        Green,
        Blue,
        Yellow,
        Purple,
        Cyan,
        White,
        Off
    }

    // === Motor Control ===
    /**
     * Move robot in direction at speed
     * @param direction Direction to move
     * @param speed Speed 0-100
     */
    //% block="Car move %direction at speed %speed"
    //% speed.min=0 speed.max=100
    //% weight=90
    export function car_run(direction: CarDirection, speed: number = 100): void {
        const pwm = Math.map(speed, 0, 100, 0, 1023);

        switch (direction) {
            case CarDirection.Forward:
                pins.digitalWritePin(LEFT_MOTOR_FORWARD, 1);
                pins.digitalWritePin(LEFT_MOTOR_BACKWARD, 0);
                pins.digitalWritePin(RIGHT_MOTOR_FORWARD, 1);
                pins.digitalWritePin(RIGHT_MOTOR_BACKWARD, 0);
                break;

            case CarDirection.Backward:
                pins.digitalWritePin(LEFT_MOTOR_FORWARD, 0);
                pins.digitalWritePin(LEFT_MOTOR_BACKWARD, 1);
                pins.digitalWritePin(RIGHT_MOTOR_FORWARD, 0);
                pins.digitalWritePin(RIGHT_MOTOR_BACKWARD, 1);
                break;

            case CarDirection.Left:
                pins.digitalWritePin(LEFT_MOTOR_FORWARD, 0);
                pins.digitalWritePin(LEFT_MOTOR_BACKWARD, 1);
                pins.digitalWritePin(RIGHT_MOTOR_FORWARD, 1);
                pins.digitalWritePin(RIGHT_MOTOR_BACKWARD, 0);
                break;

            case CarDirection.Right:
                pins.digitalWritePin(LEFT_MOTOR_FORWARD, 1);
                pins.digitalWritePin(LEFT_MOTOR_BACKWARD, 0);
                pins.digitalWritePin(RIGHT_MOTOR_FORWARD, 0);
                pins.digitalWritePin(RIGHT_MOTOR_BACKWARD, 1);
                break;

            default:
                car_stop();
                break;
        }
    }

    /**
     * Stop the robot
     */
    //% block="Car stop"
    //% weight=89
    export function car_stop(): void {
        pins.digitalWritePin(LEFT_MOTOR_FORWARD, 0);
        pins.digitalWritePin(LEFT_MOTOR_BACKWARD, 0);
        pins.digitalWritePin(RIGHT_MOTOR_FORWARD, 0);
        pins.digitalWritePin(RIGHT_MOTOR_BACKWARD, 0);
    }

    // === Line Sensor ===
    /**
     * Read line sensor value
     * @param sensor Left or Right sensor
     */
    //% block="Read %sensor line sensor"
    //% weight=85
    export function readLineSensor(sensor: LineSensor): number {
        const pin = sensor === LineSensor.Left ? LINE_SENSOR_LEFT : LINE_SENSOR_RIGHT;
        return pins.analogReadPin(pin);
    }

    /**
     * Check if line is detected (digital threshold)
     * @param sensor Left or Right
     * @param threshold Threshold value (0-1023), eg: 500
     */
    //% block="Is %sensor line detected? (threshold %threshold)"
    //% threshold.min=0 threshold.max=1023
    //% threshold.defl=500
    //% weight=84
    export function isLineDetected(sensor: LineSensor, threshold: number = 500): boolean {
        return readLineSensor(sensor) > threshold;
    }

    // === Ultrasonic Sensor ===
    /**
     * Get distance from ultrasonic sensor (cm)
     */
    //% block="Ultrasonic distance (cm)"
    //% weight=80
    export function ultra(): number {
        pins.setPull(ULTRASONIC_TRIGGER, PinPullMode.PullNone);
        pins.digitalWritePin(ULTRASONIC_TRIGGER, 0);
        control.waitMicros(2);
        pins.digitalWritePin(ULTRASONIC_TRIGGER, 1);
        control.waitMicros(10);
        pins.digitalWritePin(ULTRASONIC_TRIGGER, 0);

        const d = pins.pulseIn(ULTRASONIC_ECHO, PulseValue.High, 30000);
        return Math.round(d / 58);  // Convert to cm
    }

    // === RGB LED (NeoPixel) ===
    let strip: neopixel.Strip = null;
    function getStrip(): neopixel.Strip {
        if (!strip) {
            strip = neopixel.create(RGB_PIN, 1, NeoPixelMode.RGB);
        }
        return strip;
    }

    /**
     * Set RGB color
     * @param color Choose a color
     */
    //% block="Set RGB to %color"
    //% weight=75
    export function setRGB(color: Color): void {
        const c = colorToRGB(color);
        const s = getStrip();
        s.setPixelColor(0, c);
        s.show();
    }

    /**
     * Set RGB to custom color
     * @param red 0-255
     * @param green 0-255
     * @param blue 0-255
     */
    //% block="Set RGB red %red green %green blue %blue"
    //% red.min=0 red.max=255
    //% green.min=0 green.max=255
    //% blue.min=0 blue.max=255
    //% weight=74
    export function setRGBRaw(red: number, green: number, blue: number): void {
        const s = getStrip();
        s.setPixelColor(0, neopixel.rgb(red, green, blue));
        s.show();
    }

    function colorToRGB(color: Color): number {
        switch (color) {
            case Color.Red: return neopixel.colors(NeoPixelColors.Red);
            case Color.Green: return neopixel.colors(NeoPixelColors.Green);
            case Color.Blue: return neopixel.colors(NeoPixelColors.Blue);
            case Color.Yellow: return neopixel.colors(NeoPixelColors.Yellow);
            case Color.Purple: return neopixel.colors(NeoPixelColors.Purple);
            case Color.Cyan: return neopixel.colors(NeoPixelColors.Indigo);
            case Color.White: return neopixel.colors(NeoPixelColors.White);
            default: return neopixel.colors(NeoPixelColors.Black);
        }
    }

    // === Buzzer / Sound ===
    /**
     * Play tone on buzzer
     * @param frequency Frequency in Hz, eg: 500
     * @param duration Duration in ms, eg: 500
     */
    //% block="Play tone %frequency Hz for %duration ms"
    //% frequency.min=100 frequency.max=2000
    //% duration.min=10 duration.defl=500
    //% weight=60
    export function playTone(frequency: number, duration: number): void {
        pins.analogSetPitchPin(BUZZER_PIN);
        music.ringTone(frequency);
        basic.pause(duration);
        music.stopAllSounds();
    }

    /**
     * Beep once
     */
    //% block="Beep!"
    //% weight=59
    export function beep(): void {
        playTone(800, 200);
    }

    // === Bluetooth Serial (Example) ===
    /**
     * Send message over Bluetooth
     * @param msg Message to send
     */
    //% block="Send Bluetooth: %msg"
    //% weight=50
    export function sendBluetooth(msg: string): void {
        serial.writeLine(msg);
    }

    /**
     * On Bluetooth data received
     * @param handler Code to run when data is received
     */
    //% block="On Bluetooth received"
    //% weight=49
    export function onBluetoothReceived(handler: () => void) {
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), handler);
    }
}
