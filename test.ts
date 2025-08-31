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
    const IR_LEFT_PIN = DigitalPin.P0;
    const IR_MIDDLE_PIN = DigitalPin.P1;
    const IR_RIGHT_PIN = DigitalPin.P2;
    const TRIG_PIN = DigitalPin.P8;
    const ECHO_PIN = DigitalPin.P12;

    // --- Global Variables ---
    // A NeoPixel strip object, initialized to pin P6 with 7 pixels.
    let neopixelStrip = neopixel.create(NEOPIXEL_PIN, 7, NeoPixelMode.RGB);

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
     * Enum for the direction of a single wheel.
     */
    export enum WheelDirection {
        //% block="forward"
        Forward,
        //% block="backward"
        Backward,
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
     * Enum for IR sensor names.
     */
    export enum IRSensor {
        //% block="left"
        Left,
        //% block="middle"
        Middle,
        //% block="right"
        Right,
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
     * Controls each motor independently with a specified speed and direction.
     * @param leftDir The direction for the left motor.
     * @param leftSpeed Speed for the left motor, from 0 to 100.
     * @param rightDir The direction for the right motor.
     * @param rightSpeed Speed for the right motor, from 0 to 100.
     */
    //% block="set left wheel $leftDir speed $leftSpeed right wheel $rightDir speed $rightSpeed"
    //% leftSpeed.min=0 leftSpeed.max=100
    //% rightSpeed.min=0 rightSpeed.max=100
    //% subcategory="Car Control"
    export function setWheelsSpeed(leftDir: WheelDirection, leftSpeed: number, rightDir: WheelDirection, rightSpeed: number): void {
        const leftPwmSpeed = Math.map(leftSpeed, 0, 100, 0, 1023);
        const rightPwmSpeed = Math.map(rightSpeed, 0, 100, 0, 1023);

        if (leftDir === WheelDirection.Forward) {
            pins.analogWritePin(LEFT_MOTOR_FORWARD_PIN, leftPwmSpeed);
            pins.analogWritePin(LEFT_MOTOR_REVERSE_PIN, 0);
        } else {
            pins.analogWritePin(LEFT_MOTOR_FORWARD_PIN, 0);
            pins.analogWritePin(LEFT_MOTOR_REVERSE_PIN, leftPwmSpeed);
        }

        if (rightDir === WheelDirection.Forward) {
            pins.analogWritePin(RIGHT_MOTOR_FORWARD_PIN, rightPwmSpeed);
            pins.analogWritePin(RIGHT_MOTOR_REVERSE_PIN, 0);
        } else {
            pins.analogWritePin(RIGHT_MOTOR_FORWARD_PIN, 0);
            pins.analogWritePin(RIGHT_MOTOR_REVERSE_PIN, rightPwmSpeed);
        }
    }

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
     * Follows a black line until a black checkpoint is detected.
     * The car uses the middle sensor to stay on the line and the
     * side sensors to correct its path. It stops when all three sensors
     * detect black, which is considered a checkpoint.
     * @param speed The speed of the car, from 0 to 100.
     */
    //% block="follow line until black checkpoint at speed $speed"
    //% speed.min=0 speed.max=100
    //% subcategory="Car Control"
    export function followLineUntilCheckpoint(speed: number): void {
        while (true) {
            const leftSensor = pins.digitalReadPin(IR_LEFT_PIN);
            const middleSensor = pins.digitalReadPin(IR_MIDDLE_PIN);
            const rightSensor = pins.digitalReadPin(IR_RIGHT_PIN);

            // Create a single state variable from the sensor readings.
            // E.g., `001` (binary) becomes `1` (decimal).
            // A value of 1 for the IR sensor means black.
            const sensorState = (leftSensor << 2) | (middleSensor << 1) | rightSensor;

            // Check for the checkpoint first.
            if (sensorState === 7) { // 111 in binary
                moveCar(CarDirection.Stop, 0);
                break;
            }

            // Use a switch statement for a cleaner and more robust logic.
            switch (sensorState) {
                case 2: // 010: Middle sensor on line. Go straight.
                    setWheelsSpeed(WheelDirection.Forward, speed, WheelDirection.Forward, speed);
                    break;
                case 4: // 100: Left sensor on line. Turn right to get back on track.
                    setWheelsSpeed(WheelDirection.Forward, speed, WheelDirection.Forward, 0);
                    break;
                case 1: // 001: Right sensor on line. Turn left to get back on track.
                    setWheelsSpeed(WheelDirection.Forward, 0, WheelDirection.Forward, speed);
                    break;
                case 6: // 110: Left and middle on line. Drifting right, turn right.
                    setWheelsSpeed(WheelDirection.Forward, speed * 0.5, WheelDirection.Forward, speed);
                    break;
                case 3: // 011: Middle and right on line. Drifting left, turn left.
                    setWheelsSpeed(WheelDirection.Forward, speed, WheelDirection.Forward, speed * 0.5);
                    break;
                case 0: // 000: All sensors off line. Spin to find the line.
                default:
                    setWheelsSpeed(WheelDirection.Backward, speed, WheelDirection.Forward, speed);
                    break;
            }
        }
    }

    // --- Sensor Blocks ---

    /**
     * Gets the distance from the ultrasonic sensor.
     * @returns The distance in centimeters.
     */
    //% block="ultrasonic distance cm"
    //% subcategory="Sensors"
    export function ultrasonicDistance(): number {
        pins.digitalWritePin(TRIG_PIN, 0);
        basic.pause(2);
        pins.digitalWritePin(TRIG_PIN, 1);
        basic.pause(10);
        pins.digitalWritePin(TRIG_PIN, 0);

        const duration = pins.pulseIn(ECHO_PIN, PulseValue.High, 25000);
        let distance = duration / 58;

        if (distance > 400) {
            distance = 400; // Cap at max range
        }
        return Math.round(distance);
    }

    /**
     * Reads a value from the specified IR sensor.
     * @param sensor The IR sensor to read from.
     * @param type The type of reading to perform (analog or digital).
     * @returns The sensor reading value.
     */
    //% block="read $sensor IR sensor as $type"
    //% subcategory="Sensors"
    export function readIRSensor(sensor: IRSensor, type: ReadType): number {
        let pin: DigitalPin;
        switch (sensor) {
            case IRSensor.Left:
                pin = IR_LEFT_PIN;
                break;
            case IRSensor.Middle:
                pin = IR_MIDDLE_PIN;
                break;
            case IRSensor.Right:
                pin = IR_RIGHT_PIN;
                break;
        }

        if (type === ReadType.Digital) {
            return pins.digitalReadPin(pin);
        } else {
            return pins.analogReadPin(pin);
        }
    }
}
