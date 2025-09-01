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
    const IR_LEFT_ANALOG = AnalogPin.P0;
    const IR_MIDDLE_ANALOG = AnalogPin.P1;
    const IR_RIGHT_ANALOG = AnalogPin.P2;

    const ULTRASONIC_TRIG = DigitalPin.P8;
    const ULTRASONIC_ECHO = DigitalPin.P12;

    // === Buzzer & RGB Pins (P3=Blue, P4=Green, P5=Red) ===
    const BUZZER_PIN = DigitalPin.P9;
    const RGB_RED = DigitalPin.P5;
    const RGB_GREEN = DigitalPin.P4;
    const RGB_BLUE = DigitalPin.P3;

    // === Internal: brightness control ===
    let rgbBrightness = 100; // Default brightness

    // === Global variables for Line Follower speeds ===
    let lineFollowSpeed = 80;
    let lineFollowTurnSpeed = 50;
    let lastDirection: CarDirection = CarDirection.Forward;

    // === PID Line Follower global variables ===
    let blackLeft = 900, blackMid = 900, blackRight = 900;
    let whiteLeft = 100, whiteMid = 100, whiteRight = 100;
    let Kp = 0.6, Ki = 0.0, Kd = 8.0;
    let baseSpeed = 50, minSpeed = 20, maxSpeed = 100;
    let lastError = 0;
    let integral = 0;

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

    export enum BlackOrWhite {
        //% block="black"
        Black,
        //% block="white"
        White
    }

    // --- Helper function to stop the car ---
    function stopCar(): void {
        pins.analogWritePin(LEFT_MOTOR_FORWARD, 0);
        pins.analogWritePin(LEFT_MOTOR_BACKWARD, 0);
        pins.analogWritePin(RIGHT_MOTOR_FORWARD, 0);
        pins.analogWritePin(RIGHT_MOTOR_BACKWARD, 0);
    }

    // --- Helper functions for PID ---
    function normalize(value: number, white: number, black: number): number {
        return Math.constrain((value - white) / (black - white), 0, 1);
    }

    function clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    function driveMotors(left: number, right: number): void {
        const leftPWM = Math.map(Math.abs(left), 0, 100, 0, 1023);
        const rightPWM = Math.map(Math.abs(right), 0, 100, 0, 1023);

        if (left >= 0) {
            pins.analogWritePin(LEFT_MOTOR_FORWARD, leftPWM);
            pins.analogWritePin(LEFT_MOTOR_BACKWARD, 0);
        } else {
            pins.analogWritePin(LEFT_MOTOR_FORWARD, 0);
            pins.analogWritePin(LEFT_MOTOR_BACKWARD, leftPWM);
        }

        if (right >= 0) {
            pins.analogWritePin(RIGHT_MOTOR_FORWARD, rightPWM);
            pins.analogWritePin(RIGHT_MOTOR_BACKWARD, 0);
        } else {
            pins.analogWritePin(RIGHT_MOTOR_FORWARD, 0);
            pins.analogWritePin(RIGHT_MOTOR_BACKWARD, rightPWM);
        }
    }

    // === Block Category Headers ===
    //% block="---" blockHidden=true
    //% block="Car Control"
    //% blockHidden=true
    export function CarControlHeader(): void { }

    // === Block 1: Simple Move (with SpinLeft/SpinRight) ===
    /**
     * Move in direction at speed 0-100
     */
    //% block="Car move %direction at speed %speed"
    //% speed.min=0 speed.max=100
    //% speed.defl=80
    //% direction.defl=CarDirection.Forward
    //% weight=90
    //% inlineInputMode=inline
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
     * Move in direction at speed for a duration in seconds.
     */
    //% block="Car move %direction at speed %speed for %time s"
    //% speed.min=0 speed.max=100
    //% speed.defl=80
    //% direction.defl=CarDirection.Forward
    //% time.defl=1
    //% weight=89
    //% inlineInputMode=inline
    export function car_run_for_time(direction: CarDirection, speed: number, time: number): void {
        car_run(direction, speed);
        basic.pause(time * 1000); // Convert seconds to milliseconds
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
    //% weight=88
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

    // === New Block: Advanced Move with Time (spin turns for Left/Right) ===
    /**
     * Move with custom speeds for a duration in seconds.
     * Left = spin left (left back, right forward)
     * Right = spin right (left forward, right back)
     */
    //% block="Move %direction left speed %leftSpeed right speed %rightSpeed for %time s"
    //% direction.defl=CarDirection.Forward
    //% leftSpeed.min=0 leftSpeed.max=100
    //% rightSpeed.min=0 rightSpeed.max=100
    //% leftSpeed.defl=80 rightSpeed.defl=80
    //% time.defl=1
    //% weight=87
    //% inlineInputMode=inline
    export function moveWithSpeeds_for_time(
        direction: CarDirection,
        leftSpeed: number,
        rightSpeed: number,
        time: number
    ): void {
        moveWithSpeeds(direction, leftSpeed, rightSpeed);
        basic.pause(time * 1000); // Convert seconds to milliseconds
        stopCar();
    }

    /**
     * Stops the car's motors.
     */
    //% block="Car stop"
    //% weight=86
    //% inlineInputMode=inline
    export function car_stop(): void {
        stopCar();
    }

    // === Block Category Headers (simulating the image provided) ===
    //% block="---" blockHidden=true
    //% block="Line Follow"
    //% blockHidden=true
    export function LineFollowHeader(): void { }

    // === New Block: Set Line Follower Speeds ===
    /**
     * Sets the speed and turn speed for the line follower.
     */
    //% block="Set line follower speed to %speed and turn speed to %turnSpeed"
    //% speed.min=0 speed.max=100
    //% speed.defl=80
    //% turnSpeed.min=0 turnSpeed.max=100
    //% turnSpeed.defl=50
    //% weight=85
    //% inlineInputMode=inline
    export function setLineFollowerSpeeds(speed: number, turnSpeed: number): void {
        lineFollowSpeed = speed;
        lineFollowTurnSpeed = turnSpeed;
    }

    // === New Block: Line Follow until Checkpoints ===
    /**
     * Follow a line until a specified number of checkpoints are detected.
     */
    //% block="do line following until %checkpoints checkpoints detected"
    //% checkpoints.min=1
    //% checkpoints.defl=1
    //% weight=84
    //% inlineInputMode=inline
    export function lineFollowUntilCheckpoints(checkpoints: number): void {
        let detectedCheckpoints = 0;
        while (detectedCheckpoints < checkpoints) {
            const leftSensor = pins.digitalReadPin(IR_LEFT);
            const middleSensor = pins.digitalReadPin(IR_MIDDLE);
            const rightSensor = pins.digitalReadPin(IR_RIGHT);

            const sensorState = (leftSensor << 2) | (middleSensor << 1) | rightSensor;

            switch (sensorState) {
                case 1: // 001: Right sensor on line
                    car_run(CarDirection.SpinRight, lineFollowTurnSpeed);
                    lastDirection = CarDirection.SpinRight;
                    break;
                case 2: // 010: Middle sensor on line
                    car_run(CarDirection.Forward, lineFollowSpeed);
                    lastDirection = CarDirection.Forward;
                    break;
                case 3: // 011: Middle and right sensors on line
                    car_run(CarDirection.SpinRight, lineFollowTurnSpeed);
                    lastDirection = CarDirection.SpinRight;
                    break;
                case 4: // 100: Left sensor on line
                    car_run(CarDirection.SpinLeft, lineFollowTurnSpeed);
                    lastDirection = CarDirection.SpinLeft;
                    break;
                case 5: // 101: Both outer sensors on line (corner or turn)
                    // Continue forward slowly
                    moveWithSpeeds(CarDirection.Forward, lineFollowSpeed * 0.5, lineFollowSpeed * 0.5);
                    lastDirection = CarDirection.Forward;
                    break;
                case 6: // 110: Left and middle sensors on line
                    car_run(CarDirection.SpinLeft, lineFollowTurnSpeed);
                    lastDirection = CarDirection.SpinLeft;
                    break;
                case 7: // 111: All three on line (checkpoint)
                    detectedCheckpoints++;
                    car_stop();
                    // A small pause to prevent multiple checkpoint detections in a row.
                    basic.pause(500);
                    break;
                default: // 000: No sensors on line
                    // Use the last known direction to find the line
                    if (lastDirection === CarDirection.SpinRight) {
                         car_run(CarDirection.SpinRight, lineFollowTurnSpeed);
                    } else {
                         car_run(CarDirection.SpinLeft, lineFollowTurnSpeed);
                    }
                    break;
            }
            basic.pause(5); // A small pause to prevent the loop from running too fast.
        }
        car_stop();
    }

    // === Block Category Headers (simulating the image provided) ===
    //% block="---" blockHidden=true
    //% block="Sensors"
    //% blockHidden=true
    export function SensorsHeader(): void { }

    // === Ultrasonic Block ===
    /**
     * Get ultrasonic distance in cm
     */
    //% block="Ultrasonic distance (cm)"
    //% weight=80
    //% inlineInputMode=inline
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

    // === Read IR Block ===
    /**
     * Read IR sensor as analog or digital
     */
    //% block="Read %sensor IR sensor as %mode"
    //% weight=79
    //% inlineInputMode=inline
    export function readIR(sensor: IRSensor, mode: ReadMode): number {
        const pin =
            sensor === IRSensor.Left ? IR_LEFT :
            sensor === IRSensor.Middle ? IR_MIDDLE : IR_RIGHT;

        return mode === ReadMode.Analog
            ? pins.analogReadPin(pin)
            : pins.digitalReadPin(pin);
    }

    // === Block Category Headers (simulating the image provided) ===
    //% block="---" blockHidden=true
    //% block="RGB Control"
    //% blockHidden=true
    export function RGBControlHeader(): void { }

    // === Set RGB Color Block ===
    /**
     * Set the RGB color
     */
    //% block="Set RGB color to %color"
    //% weight=75
    //% inlineInputMode=inline
    export function setRgbColor(color: Color): void {
        switch (color) {
            case Color.Red:
                pins.analogWritePin(RGB_RED, 1023);
                pins.analogWritePin(RGB_GREEN, 0);
                pins.analogWritePin(RGB_BLUE, 0);
                break;
            case Color.Green:
                pins.analogWritePin(RGB_RED, 0);
                pins.analogWritePin(RGB_GREEN, 1023);
                pins.analogWritePin(RGB_BLUE, 0);
                break;
            case Color.Blue:
                pins.analogWritePin(RGB_RED, 0);
                pins.analogWritePin(RGB_GREEN, 0);
                pins.analogWritePin(RGB_BLUE, 1023);
                break;
            case Color.Yellow:
                pins.analogWritePin(RGB_RED, 1023);
                pins.analogWritePin(RGB_GREEN, 1023);
                pins.analogWritePin(RGB_BLUE, 0);
                break;
            case Color.Purple:
                pins.analogWritePin(RGB_RED, 1023);
                pins.analogWritePin(RGB_GREEN, 0);
                pins.analogWritePin(RGB_BLUE, 1023);
                break;
            case Color.Cyan:
                pins.analogWritePin(RGB_RED, 0);
                pins.analogWritePin(RGB_GREEN, 1023);
                pins.analogWritePin(RGB_BLUE, 1023);
                break;
            case Color.White:
                pins.analogWritePin(RGB_RED, 1023);
                pins.analogWritePin(RGB_GREEN, 1023);
                pins.analogWritePin(RGB_BLUE, 1023);
                break;
            case Color.Off:
                pins.analogWritePin(RGB_RED, 0);
                pins.analogWritePin(RGB_GREEN, 0);
                pins.analogWritePin(RGB_BLUE, 0);
                break;
        }
    }

    // === Block Category Headers ===
    //% block="---" blockHidden=true
    //% block="Advanced Line Following"
    //% blockHidden=true
    export function AdvancedLineFollowingHeader(): void { }

    /**
     * Set calibration values for black/white
     */
    //% block="set %blackOrWhite calibration values left %left middle %middle right %right"
    //% left.defl=100 middle.defl=100 right.defl=100
    //% subcategory="Advanced Line Following"
    export function setCalibration(blackOrWhite: BlackOrWhite, left: number, middle: number, right: number): void {
        if (blackOrWhite == BlackOrWhite.Black) {
            blackLeft = left;
            blackMid = middle;
            blackRight = right;
        } else {
            whiteLeft = left;
            whiteMid = middle;
            whiteRight = right;
        }
    }

    /**
     * Set PID constants
     */
    //% block="set PID values Kp %p Ki %i Kd %d"
    //% p.defl=0.6 i.defl=0.0 d.defl=8.0
    //% subcategory="Advanced Line Following"
    export function setPID(p: number, i: number, d: number): void {
        Kp = p;
        Ki = i;
        Kd = d;
    }

    /**
     * Set speed range for PID control
     */
    //% block="set speed min %min base %base max %max"
    //% min.defl=20 base.defl=50 max.defl=100
    //% subcategory="Advanced Line Following"
    export function setSpeed(min: number, base: number, max: number): void {
        minSpeed = min;
        baseSpeed = base;
        maxSpeed = max;
    }

    /**
     * Show IR sensor readings on serial monitor
     */
    //% block="show IR sensor readings"
    //% subcategory="Advanced Line Following"
    export function showSensorReadings(): void {
        const l = pins.analogReadPin(IR_LEFT_ANALOG);
        const m = pins.analogReadPin(IR_MIDDLE_ANALOG);
        const r = pins.analogReadPin(IR_RIGHT_ANALOG);
        serial.writeLine("Left: " + l + " Middle: " + m + " Right: " + r);
    }

    /**
     * Follow line using PID until given number of checkpoints
     */
    //% block="follow line with PID until %numCheckpoints checkpoints"
    //% numCheckpoints.defl=1
    //% subcategory="Advanced Line Following"
    export function followLinePID(numCheckpoints: number): void {
        let checkpointsPassed = 0;
        let onCheckpoint = false;

        while (checkpointsPassed < numCheckpoints) {
            const l = normalize(pins.analogReadPin(IR_LEFT_ANALOG), whiteLeft, blackLeft);
            const m = normalize(pins.analogReadPin(IR_MIDDLE_ANALOG), whiteMid, blackMid);
            const r = normalize(pins.analogReadPin(IR_RIGHT_ANALOG), whiteRight, blackRight);

            // Detect checkpoint: all sensors "black" (>=0.8)
            if (l > 0.8 && m > 0.8 && r > 0.8) {
                if (!onCheckpoint) {
                    checkpointsPassed++;
                    serial.writeLine("Checkpoint " + checkpointsPassed + " detected");
                    onCheckpoint = true;
                }
            } else {
                onCheckpoint = false;
            }

            // If target reached → stop
            if (checkpointsPassed >= numCheckpoints) {
                stopCar();
                break;
            }

            // PID control
            const position = (l * -1 + m * 0 + r * 1) / (l + m + r);
            const error = position;
            integral += error;
            const derivative = error - lastError;
            const correction = Kp * error + Ki * integral + Kd * derivative;

            let leftSpeed = clamp(baseSpeed - correction, minSpeed, maxSpeed);
            let rightSpeed = clamp(baseSpeed + correction, minSpeed, maxSpeed);

            driveMotors(leftSpeed, rightSpeed);
            lastError = error;
            basic.pause(10);
        }
        stopCar();
    }
}
