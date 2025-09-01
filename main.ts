/**
 * AS BIT Robot
 * Final version: two RGB blocks, safe pin control, correct color logic.
 */
//% color=#8E44AD icon="\uf1b9" block="AS BIT"
namespace asbit {
    // === Motor Pins ===
    const LEFT_MOTOR_FORWARD = DigitalPin.P15;
    const LEFT_MOTOR_BACKWARD = DigitalPin.P16;
    const RIGHT_MOTOR_FORWARD = DigitalPin.P13;
    const RIGHT_MOTOR_BACKWARD = DigitalPin.P14;

    // === Sensor Pins ===
    const IR_LEFT = DigitalPin.P0;
    const IR_MIDDLE = DigitalPin.P1;
    const IR_RIGHT = DigitalPin.P2;

    const ULTRASONIC_TRIG = DigitalPin.P8;
    const ULTRASONIC_ECHO = DigitalPin.P12;

    // === Buzzer & RGB Pins (P3=Blue, P4=Green, P5=Red) ===
    const BUZZER_PIN = DigitalPin.P9;
    const RGB_RED = DigitalPin.P5;
    const RGB_GREEN = DigitalPin.P4;
    const RGB_BLUE = DigitalPin.P3;

    // === Internal: brightness control ===
    let rgbBrightness = 100; // Default brightness

    // === Auto-setup: Sound → PIN9, RGB off by default ===
    control.onEvent(1, 1, () => {
        pins.setAudioPin(BUZZER_PIN);
        // Turn off all RGB pins at start
        pins.analogWritePin(RGB_RED, 0);
        pins.analogWritePin(RGB_GREEN, 0);
        pins.analogWritePin(RGB_BLUE, 0);
    });

    // === Enums ===
    export enum CarDirection {
        Forward,
        Backward,
        Left,
        Right,
        SpinLeft,
        SpinRight
    }

    export enum IRSensor {
        Left,
        Middle,
        Right
    }

    export enum ReadMode {
        Analog,
        Digital
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
    
    // --- Helper function to stop the car ---
    function stopCar(): void {
        pins.analogWritePin(LEFT_MOTOR_FORWARD, 0);
        pins.analogWritePin(LEFT_MOTOR_BACKWARD, 0);
        pins.analogWritePin(RIGHT_MOTOR_FORWARD, 0);
        pins.analogWritePin(RIGHT_MOTOR_BACKWARD, 0);
    }

    // === New Block: Stop ===
    /**
     * Stops the car's motors.
     */
    //% block="Car stop"
    //% weight=95
    //% subcategory="Car Control"
    export function car_stop(): void {
        stopCar();
    }

    // === Block 1: Simple Move (with SpinLeft/SpinRight) ===
    /**
     * Move in direction at speed 0-100
     */
    //% block="Car move %direction at speed %speed"
    //% speed.min=0 speed.max=100
    //% speed.defl=80
    //% direction.defl=CarDirection.Forward
    //% weight=90
    //% subcategory="Car Control"
    export function car_run(direction: CarDirection, speed: number = 80): void {
        const pwm = Math.map(speed, 0, 100, 0, 1023);

        switch (direction) {
            case CarDirection.Forward:
                pins.analogWritePin(LEFT_MOTOR_FORWARD, pwm);
                pins.analogWritePin(LEFT_MOTOR_BACKWARD, 0);
                pins.analogWritePin(RIGHT_MOTOR_FORWARD, pwm);
                pins.analogWritePin(RIGHT_MOTOR_BACKWARD, 0);
                break;

            case CarDirection.Backward:
                pins.analogWritePin(LEFT_MOTOR_FORWARD, 0);
                pins.analogWritePin(LEFT_MOTOR_BACKWARD, pwm);
                pins.analogWritePin(RIGHT_MOTOR_FORWARD, 0);
                pins.analogWritePin(RIGHT_MOTOR_BACKWARD, pwm);
                break;

            case CarDirection.Left:
                // Pivot left: only right wheel moves
                pins.analogWritePin(LEFT_MOTOR_FORWARD, 0);
                pins.analogWritePin(LEFT_MOTOR_BACKWARD, 0);
                pins.analogWritePin(RIGHT_MOTOR_FORWARD, pwm);
                pins.analogWritePin(RIGHT_MOTOR_BACKWARD, 0);
                break;

            case CarDirection.Right:
                // Pivot right: only left wheel moves
                pins.analogWritePin(LEFT_MOTOR_FORWARD, pwm);
                pins.analogWritePin(LEFT_MOTOR_BACKWARD, 0);
                pins.analogWritePin(RIGHT_MOTOR_FORWARD, 0);
                pins.analogWritePin(RIGHT_MOTOR_BACKWARD, 0);
                break;

            case CarDirection.SpinLeft:
                // Spin in place left
                pins.analogWritePin(LEFT_MOTOR_BACKWARD, pwm);
                pins.analogWritePin(LEFT_MOTOR_FORWARD, 0);
                pins.analogWritePin(RIGHT_MOTOR_FORWARD, pwm);
                pins.analogWritePin(RIGHT_MOTOR_BACKWARD, 0);
                break;

            case CarDirection.SpinRight:
                // Spin in place right
                pins.analogWritePin(LEFT_MOTOR_FORWARD, pwm);
                pins.analogWritePin(LEFT_MOTOR_BACKWARD, 0);
                pins.analogWritePin(RIGHT_MOTOR_BACKWARD, pwm);
                pins.analogWritePin(RIGHT_MOTOR_FORWARD, 0);
                break;
        }
    }

    // === New Block: Simple Move with Time ===
    /**
     * Move in direction at speed for a duration in milliseconds.
     */
    //% block="Car move %direction at speed %speed for %time ms"
    //% speed.min=0 speed.max=100
    //% speed.defl=80
    //% direction.defl=CarDirection.Forward
    //% time.defl=1000
    //% weight=88
    //% subcategory="Car Control"
    export function car_run_for_time(direction: CarDirection, speed: number, time: number): void {
        car_run(direction, speed);
        basic.pause(time);
        stopCar();
    }


    // === Block 2: Advanced Move (spin turns for Left/Right) ===
    /**
     * Move in direction with custom left and right speeds (0-100)
     * Left = spin left (left back, right forward)
     * Right = spin right (left forward, right back)
     */
    //% block="Move %direction left speed %leftSpeed right speed %rightSpeed"
    //% direction.defl=CarDirection.Forward
    //% leftSpeed.min=0 leftSpeed.max=100
    //% rightSpeed.min=0 rightSpeed.max=100
    //% leftSpeed.defl=80 rightSpeed.defl=80
    //% inlineInputMode=inline
    //% weight=89
    //% subcategory="Car Control"
    export function moveWithSpeeds(
        direction: CarDirection,
        leftSpeed: number,
        rightSpeed: number
    ): void {
        const leftPwm = Math.map(leftSpeed, 0, 100, 0, 1023);
        const rightPwm = Math.map(rightSpeed, 0, 100, 0, 1023);

        switch (direction) {
            case CarDirection.Forward:
                pins.analogWritePin(LEFT_MOTOR_FORWARD, leftPwm);
                pins.analogWritePin(LEFT_MOTOR_BACKWARD, 0);
                pins.analogWritePin(RIGHT_MOTOR_FORWARD, rightPwm);
                pins.analogWritePin(RIGHT_MOTOR_BACKWARD, 0);
                break;

            case CarDirection.Backward:
                pins.analogWritePin(LEFT_MOTOR_FORWARD, 0);
                pins.analogWritePin(LEFT_MOTOR_BACKWARD, leftPwm);
                pins.analogWritePin(RIGHT_MOTOR_FORWARD, 0);
                pins.analogWritePin(RIGHT_MOTOR_BACKWARD, rightPwm);
                break;

            case CarDirection.Left:
                // Spin left: left backward, right forward
                pins.analogWritePin(LEFT_MOTOR_FORWARD, 0);
                pins.analogWritePin(LEFT_MOTOR_BACKWARD, leftPwm);
                pins.analogWritePin(RIGHT_MOTOR_FORWARD, rightPwm);
                pins.analogWritePin(RIGHT_MOTOR_BACKWARD, 0);
                break;

            case CarDirection.Right:
                // Spin right: left forward, right backward
                pins.analogWritePin(LEFT_MOTOR_FORWARD, leftPwm);
                pins.analogWritePin(LEFT_MOTOR_BACKWARD, 0);
                pins.analogWritePin(RIGHT_MOTOR_FORWARD, 0);
                pins.analogWritePin(RIGHT_MOTOR_BACKWARD, rightPwm);
                break;
        }
    }

    // === New Block: Advanced Move with Time ===
    /**
     * Move with custom speeds for a duration in milliseconds.
     */
    //% block="Move %direction left speed %leftSpeed right speed %rightSpeed for %time ms"
    //% direction.defl=CarDirection.Forward
    //% leftSpeed.min=0 leftSpeed.max=100
    //% rightSpeed.min=0 rightSpeed.max=100
    //% leftSpeed.defl=80 rightSpeed.defl=80
    //% time.defl=1000
    //% weight=87
    //% subcategory="Car Control"
    export function moveWithSpeeds_for_time(
        direction: CarDirection,
        leftSpeed: number,
        rightSpeed: number,
        time: number
    ): void {
        moveWithSpeeds(direction, leftSpeed, rightSpeed);
        basic.pause(time);
        stopCar();
    }


    // === Sensors Blocks ===

    /**
     * Get ultrasonic distance in cm
     */
    //% block="Ultrasonic distance (cm)"
    //% weight=80
    //% subcategory="Sensors"
    export function ultra(): number {
        pins.setPull(ULTRASONIC_TRIG, PinPullMode.PullNone);
        pins.analogWritePin(ULTRASONIC_TRIG, 0);
        control.waitMicros(2);
        pins.analogWritePin(ULTRASONIC_TRIG, 1023);
        control.waitMicros(10);
        pins.analogWritePin(ULTRASONIC_TRIG, 0);

        const d = pins.pulseIn(ULTRASONIC_ECHO, PulseValue.High, 30000);
        const cm = Math.round(d / 58);
        return cm > 0 ? cm : 0;
    }

    /**
     * Read IR sensor as analog or digital
     */
    //% block="Read %sensor IR sensor as %mode"
    //% weight=79
    //% subcategory="Sensors"
    export function readIR(sensor: IRSensor, mode: ReadMode): number {
        const pin = 
            sensor === IRSensor.Left ? IR_LEFT :
            sensor === IRSensor.Middle ? IR_MIDDLE : IR_RIGHT;

        return mode === ReadMode.Analog
            ? pins.analogReadPin(pin)
            : pins.digitalReadPin(pin);
    }

    // === RGB Control (Two Blocks) ===

    /**
     * Set RGB brightness (0-100)
     * Default is 100, so RGB works without this block
     */
    //% block="Set RGB brightness %brightness"
    //% brightness.min=0 brightness.max=100
    //% brightness.defl=100
    //% weight=71
    //% subcategory="RGB Control"
    export function setRGBBrightness(brightness: number): void {
        rgbBrightness = Math.max(0, Math.min(100, brightness)); // clamp 0-100
    }

    /**
     * Set RGB color (uses current brightness)
     */
    //% block="Set RGB to %color"
    //% weight=70
    //% subcategory="RGB Control"
    export function setRGB(color: Color): void {
        const level = Math.map(rgbBrightness, 0, 100, 0, 1023);

        // Always turn all off first
        pins.analogWritePin(RGB_RED, 0);
        pins.analogWritePin(RGB_GREEN, 0);
        pins.analogWritePin(RGB_BLUE, 0);

        switch (color) {
            case Color.Red:
                pins.analogWritePin(RGB_RED, level);
                pins.analogWritePin(RGB_GREEN, 0);
                pins.analogWritePin(RGB_BLUE, 0);
                break;
            case Color.Green:
                pins.analogWritePin(RGB_RED, 0);
                pins.analogWritePin(RGB_GREEN, level);
                pins.analogWritePin(RGB_BLUE, 0);
                break;
            case Color.Blue:
                pins.analogWritePin(RGB_RED, 0);
                pins.analogWritePin(RGB_GREEN, 0);
                pins.analogWritePin(RGB_BLUE, level);
                break;
            case Color.Yellow:
                pins.analogWritePin(RGB_RED, level);
                pins.analogWritePin(RGB_GREEN, level);
                pins.analogWritePin(RGB_BLUE, 0);
                break;
            case Color.Purple:
                pins.analogWritePin(RGB_RED, level);
                pins.analogWritePin(RGB_GREEN, 0);
                pins.analogWritePin(RGB_BLUE, level);
                break;
            case Color.Cyan:
                pins.analogWritePin(RGB_RED, 0);
                pins.analogWritePin(RGB_GREEN, level);
                pins.analogWritePin(RGB_BLUE, level);
                break;
            case Color.White:
                pins.analogWritePin(RGB_RED, level);
                pins.analogWritePin(RGB_GREEN, level);
                pins.analogWritePin(RGB_BLUE, level);
                break;
            case Color.Off:
            default:
                // All already off
                break;
        }
    }
}
