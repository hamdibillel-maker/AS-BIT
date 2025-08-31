/**
 * AS BIT Robot Extension
 * Simplified, clean, and block-friendly.
 */
//% color=#2E8B57 icon="\uf1b9" block="AS BIT Robot"
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

    // === RGB Pin ===
    const RGB_PIN = DigitalPin.P8;

    // === Enums ===
    export enum CarDirection {
        Forward,
        Backward,
        Left,
        Right,
        SpinLeft,
        SpinRight
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
    //% speed.defl=80
    //% weight=90
    export function car_run(direction: CarDirection, speed: number = 80): void {
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

            case CarDirection.SpinLeft:
                pins.digitalWritePin(LEFT_MOTOR_FORWARD, 0);
                pins.digitalWritePin(LEFT_MOTOR_BACKWARD, 1);
                pins.digitalWritePin(RIGHT_MOTOR_FORWARD, 1);
                pins.digitalWritePin(RIGHT_MOTOR_BACKWARD, 0);
                break;

            case CarDirection.SpinRight:
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

    // === Sensor Reading (Analog & Digital) ===
    /**
     * Read line sensor analog value
     * @param sensor Left or Right
     */
    //% block="Read %sensor line sensor (analog)"
    //% weight=85
    export function readLineAnalog(sensor: LineSensor): number {
        const pin = sensor === LineSensor.Left ? LINE_SENSOR_LEFT : LINE_SENSOR_RIGHT;
        return pins.analogReadPin(pin);
    }

    /**
     * Read line sensor as digital (black/white)
     * @param sensor Left or Right
     * @param threshold Threshold value 0-1023, eg: 500
     */
    //% block="Is %sensor line detected? (threshold %threshold)"
    //% threshold.min=0 threshold.max=1023
    //% threshold.defl=500
    //% weight=84
    export function isLineDetected(sensor: LineSensor, threshold: number = 500): boolean {
        return readLineAnalog(sensor) > threshold;
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
        return Math.round(d / 58);
    }

    // === RGB LED (NeoPixel) - Only Predefined Colors ===
    let strip: neopixel.Strip = null;
    function getStrip(): neopixel.Strip {
        if (!strip) {
            strip = neopixel.create(RGB_PIN, 1, NeoPixelMode.RGB);
        }
        return strip;
    }

    /**
     * Set RGB to predefined color
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

    // === Bluetooth Serial ===
    /**
     * Send message over Bluetooth
     * @param msg Message to send
     */
    //% block="Send Bluetooth: %msg"
    //% weight=60
    export function sendBluetooth(msg: string): void {
        serial.writeLine(msg);
    }

    /**
     * Run code when Bluetooth data is received
     */
    //% block="On Bluetooth received"
    //% weight=59
    export function onBluetoothReceived(handler: () => void) {
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), handler);
    }
}
