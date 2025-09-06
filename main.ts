/**
 * AS BIT Robot
 * Final version: safe pin control, correct color logic, fixed IR, ultrasonic, and blocking issues.
 */
//% color=#7B68EE icon="\uf1b9" block="AS BIT"
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

    // === IR Receiver Pin ===
    const IR_RECEIVER_PIN = DigitalPin.P6;

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

    // === Flags for non-blocking activities ===
    let trackingActive = false;
    let avoidanceActive = false;

    // === Default speed and distance for activities ===
    let activitySpeed = 100;
    let activityDistance = 15;

    // === Auto-setup: Sound → PIN9, RGB off, IR on P6 ===
    control.onEvent(1, 1, () => {
        pins.setAudioPin(BUZZER_PIN);
        pins.analogWritePin(RGB_RED, 0);
        pins.analogWritePin(RGB_GREEN, 0);
        pins.analogWritePin(RGB_BLUE, 0);
        ir.setIrPin(IR_RECEIVER_PIN);
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

    export enum Comparison {
        //% block="less than"
        LessThan,
        //% block="greater than"
        GreaterThan,
        //% block="equal to"
        EqualTo
    }
    export enum SingleMotorDirection {
        //% block="left"
        Left,
        //% block="right"
        Right,
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
    //% block.color=#FF4500
    export function CarControlHeader(): void { }

    // === Block 1: Simple Move (with SpinLeft/SpinRight) ===
    //% block="move %direction with (speed) %speed"
    //% speed.min=0 speed.max=100 speed.defl=80
    //% direction.defl=CarDirection.Forward
    //% weight=90 inlineInputMode=inline
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
                pins.analogWritePin(LEFT_MOTOR_FORWARD, 0);
                pins.analogWritePin(LEFT_MOTOR_BACKWARD, 0);
                pins.analogWritePin(RIGHT_MOTOR_FORWARD, pwm);
                pins.analogWritePin(RIGHT_MOTOR_BACKWARD, 0);
                break;
            case CarDirection.Right:
                pins.analogWritePin(LEFT_MOTOR_FORWARD, pwm);
                pins.analogWritePin(LEFT_MOTOR_BACKWARD, 0);
                pins.analogWritePin(RIGHT_MOTOR_FORWARD, 0);
                pins.analogWritePin(RIGHT_MOTOR_BACKWARD, 0);
                break;
            case CarDirection.SpinLeft:
                pins.analogWritePin(LEFT_MOTOR_BACKWARD, pwm);
                pins.analogWritePin(LEFT_MOTOR_FORWARD, 0);
                pins.analogWritePin(RIGHT_MOTOR_FORWARD, pwm);
                pins.analogWritePin(RIGHT_MOTOR_BACKWARD, 0);
                break;
            case CarDirection.SpinRight:
                pins.analogWritePin(LEFT_MOTOR_FORWARD, pwm);
                pins.analogWritePin(LEFT_MOTOR_BACKWARD, 0);
                pins.analogWritePin(RIGHT_MOTOR_BACKWARD, pwm);
                pins.analogWritePin(RIGHT_MOTOR_FORWARD, 0);
                break;
        }
    }

    //% block="move %direction with (speed) %speed for (time) S"
    //% speed.min=0 speed.max=100 speed.defl=80
    //% direction.defl=CarDirection.Forward
    //% time.defl=1
    //% weight=89 inlineInputMode=inline
    export function car_run_for_time(direction: CarDirection, speed: number, time: number): void {
        car_run(direction, speed);
        basic.pause(time * 1000);
        stopCar();
    }

    //% block="Run %direction motor with (speed) %speed"
    //% direction.defl=SingleMotorDirection.Left
    //% speed.min=0 speed.max=100 speed.defl=80
    //% weight=88 inlineInputMode=inline
    export function runSingleMotor(direction: SingleMotorDirection, speed: number): void {
        const pwm = Math.map(speed, 0, 100, 0, 1023);
        if (direction === SingleMotorDirection.Left) {
            pins.analogWritePin(LEFT_MOTOR_FORWARD, pwm);
            pins.analogWritePin(LEFT_MOTOR_BACKWARD, 0);
        } else {
            pins.analogWritePin(RIGHT_MOTOR_FORWARD, pwm);
            pins.analogWritePin(RIGHT_MOTOR_BACKWARD, 0);
        }
    }

    //% block="Car stop"
    //% weight=86 inlineInputMode=inline
    export function car_stop(): void {
        stopCar();
    }

    //% block="Stop all activities"
    //% weight=85
    export function stopAllActivities(): void {
        trackingActive = false;
        avoidanceActive = false;
        stopCar();
    }

    // ---
    //% block="---" blockHidden=true
    //% block="Line Following"
    //% blockHidden=true
    //% block.color=#3CB371
    export function LineFollowingHeader(): void { }

    //% block="Set line follower speed to %speed and turn speed to %turnSpeed"
    //% speed.min=0 speed.max=100 speed.defl=80
    //% turnSpeed.min=0 turnSpeed.max=100 turnSpeed.defl=50
    //% weight=85 inlineInputMode=inline
    export function setLineFollowerSpeeds(speed: number, turnSpeed: number): void {
        lineFollowSpeed = speed;
        lineFollowTurnSpeed = turnSpeed;
    }

    //% block="do line following until %checkpoints checkpoints detected"
    //% checkpoints.min=1 checkpoints.defl=1
    //% weight=84 inlineInputMode=inline
    export function lineFollowUntilCheckpoints(checkpoints: number): void {
        let detectedCheckpoints = 0;
        while (detectedCheckpoints < checkpoints) {
            const l = pins.digitalReadPin(IR_LEFT);
            const m = pins.digitalReadPin(IR_MIDDLE);
            const r = pins.digitalReadPin(IR_RIGHT);
            const state = (l << 2) | (m << 1) | r;

            switch (state) {
                case 1: // 001: Right sensor on line
                case 3: // 011: Middle and right on line
                    car_run(CarDirection.SpinRight, lineFollowTurnSpeed);
                    lastDirection = CarDirection.SpinRight;
                    break;
                case 2: // 010: Middle sensor on line
                    car_run(CarDirection.Forward, lineFollowSpeed);
                    lastDirection = CarDirection.Forward;
                    break;
                case 4: // 100: Left sensor on line
                case 6: // 110: Left and middle on line
                    car_run(CarDirection.SpinLeft, lineFollowTurnSpeed);
                    lastDirection = CarDirection.SpinLeft;
                    break;
                case 5: // 101: Left and right on line (sharp turn or intersection)
                    // Added a more aggressive turn to handle this state effectively
                    car_run(lastDirection, lineFollowTurnSpeed);
                    break;
                case 7: // 111: All three on line (checkpoint)
                    if (checkpoints > 0) { // Only count checkpoints after the first loop iteration
                        detectedCheckpoints++;
                        car_stop();
                        basic.pause(500);
                    }
                    break;
                default: // 000: Off the line
                    // Spin back in the last known direction to find the line again
                    car_run(lastDirection, lineFollowTurnSpeed);
                    break;
            }
            basic.pause(5);
        }
        car_stop();
    }

    //% block="---" blockHidden=true
    //% block="Advanced Line Following with PID"
    //% blockHidden=true
    //% block.color=#3CB371
    export function AdvancedLineFollowingHeader(): void { }

    //% block="Turn %direction until line detected at speed %speed"
    //% direction.defl=CarDirection.SpinLeft
    //% speed.min=0 speed.max=100 speed.defl=50
    //% weight=83
    export function turnUntilLine(direction: CarDirection, speed: number): void {
        while (true) {
            const value = pins.analogReadPin(IR_MIDDLE_ANALOG);
            const isOnLine = value < (blackMid + whiteMid) / 2;
            if (isOnLine) {
                car_stop();
                break;
            }
            car_run(direction, speed);
            basic.pause(10);
        }
    }

    //% block="set %blackOrWhite calibration values left %left middle %middle right %right"
    //% left.defl=100 middle.defl=100 right.defl=100
    //% block.color=#3CB371
    export function setCalibration(blackOrWhite: BlackOrWhite, left: number, middle: number, right: number): void {
        if (blackOrWhite == BlackOrWhite.Black) {
            blackLeft = left; blackMid = middle; blackRight = right;
        } else {
            whiteLeft = left; whiteMid = middle; whiteRight = right;
        }
    }

    //% block="auto-calibrate IR sensors"
    //% weight=80
    //% block.color=#3CB371
    export function autoCalibrate(): void {
        basic.pause(2000);
        whiteLeft = pins.analogReadPin(IR_LEFT_ANALOG);
        whiteMid = pins.analogReadPin(IR_MIDDLE_ANALOG);
        whiteRight = pins.analogReadPin(IR_RIGHT_ANALOG);
        basic.pause(2000);
        blackLeft = pins.analogReadPin(IR_LEFT_ANALOG);
        blackMid = pins.analogReadPin(IR_MIDDLE_ANALOG);
        blackRight = pins.analogReadPin(IR_RIGHT_ANALOG);
        basic.pause(1000);
    }

    //% block="set PID values Kp %p Ki %i Kd %d"
    //% p.defl=0.6 i.defl=0.0 d.defl=8.0
    //% block.color=#3CB371
    export function setPID(p: number, i: number, d: number): void {
        Kp = p; Ki = i; Kd = d;
    }

    //% block="set speed min %min base %base max %max"
    //% min.defl=20 base.defl=50 max.defl=100
    //% block.color=#3CB371
    export function setSpeed(min: number, base: number, max: number): void {
        minSpeed = min; baseSpeed = base; maxSpeed = max;
    }

    //% block="show IR sensor readings"
    //% block.color=#3CB371
    export function showSensorReadings(): void {
        serial.writeLine(`L: ${pins.analogReadPin(IR_LEFT_ANALOG)} M: ${pins.analogReadPin(IR_MIDDLE_ANALOG)} R: ${pins.analogReadPin(IR_RIGHT_ANALOG)}`);
    }

    //% block="follow line with PID until %numCheckpoints checkpoints"
    //% numCheckpoints.defl=1
    //% block.color=#3CB371
    export function followLinePID(numCheckpoints: number): void {
        let checkpoints = 0;
        // Reset PID integral and error on a new run
        integral = 0;
        lastError = 0;
        while (checkpoints < numCheckpoints) {
            const l = normalize(pins.analogReadPin(IR_LEFT_ANALOG), whiteLeft, blackLeft);
            const m = normalize(pins.analogReadPin(IR_MIDDLE_ANALOG), whiteMid, blackMid);
            const r = normalize(pins.analogReadPin(IR_RIGHT_ANALOG), whiteRight, blackRight);
            if (l > 0.8 && m > 0.8 && r > 0.8) {
                // A checkpoint is a solid black line across all three sensors
                checkpoints++;
                // Stop to register the checkpoint
                car_stop();
                basic.pause(500);
                // Reset PID values for a fresh start on the next line segment
                integral = 0;
                lastError = 0;
            }
            if (checkpoints >= numCheckpoints) break;

            const pos = (r - l); // Error based on sensor difference
            const err = pos;
            integral = clamp(integral + err, -100, 100); // Clamp integral to prevent windup
            const deriv = err - lastError;
            const corr = Kp * err + Ki * integral + Kd * deriv;

            let leftMotorSpeed = baseSpeed + corr;
            let rightMotorSpeed = baseSpeed - corr;

            // Clamp speeds to a valid range to prevent overshooting
            leftMotorSpeed = clamp(leftMotorSpeed, minSpeed, maxSpeed);
            rightMotorSpeed = clamp(rightMotorSpeed, minSpeed, maxSpeed);

            driveMotors(leftMotorSpeed, rightMotorSpeed);
            lastError = err;
            basic.pause(10);
        }
        car_stop();
    }

    // === Block Category Headers ===
    //% block="---" blockHidden=true
    //% block="Sensors"
    //% blockHidden=true
    //% block.color=#32CD32
    export function SensorsHeader(): void { }

    //% block="Ultrasonic distance (cm)"
    //% weight=80 inlineInputMode=inline
    export function ultra(): number {
        pins.setPull(ULTRASONIC_TRIG, PinPullMode.PullNone);
        pins.digitalWritePin(ULTRASONIC_TRIG, 0);
        control.waitMicros(2);
        pins.digitalWritePin(ULTRASONIC_TRIG, 1);
        control.waitMicros(10);
        pins.digitalWritePin(ULTRASONIC_TRIG, 0);
        const d = pins.pulseIn(ULTRASONIC_ECHO, PulseValue.High, 30000);
        if (d === 0) {
            return 0;
        }
        const cm = Math.round(d / 58);
        return cm > 0 ? cm : 0;
    }

    //% block="Read %sensor IR sensor as %mode"
    //% weight=78 inlineInputMode=inline
    export function readIR(sensor: IRSensor, mode: ReadMode): number {
        const pin = sensor === IRSensor.Left ? IR_LEFT :
            sensor === IRSensor.Middle ? IR_MIDDLE : IR_RIGHT;
        return mode === ReadMode.Analog ? pins.analogReadPin(pin) : pins.digitalReadPin(pin);
    }

    //% block="---" blockHidden=true
    //% block="Activities"
    //% blockHidden=true
    //% block.color=#FF8C00
    export function ActivitiesHeader(): void { }

    //% block="Set RGB brightness to %brightness"
    //% brightness.min=0 brightness.max=100 brightness.defl=100
    //% weight=76 inlineInputMode=inline
    export function setRgbBrightness(brightness: number): void {
        rgbBrightness = Math.constrain(brightness, 0, 100);
    }

    //% block="Set RGB color to %color"
    //% weight=75 inlineInputMode=inline
    export function setRgbColor(color: Color): void {
        const pwm = Math.map(rgbBrightness, 0, 100, 0, 1023);
        switch (color) {
            case Color.Red:
                pins.analogWritePin(RGB_RED, pwm);
                pins.analogWritePin(RGB_GREEN, 0);
                pins.analogWritePin(RGB_BLUE, 0);
                break;
            case Color.Green:
                pins.analogWritePin(RGB_RED, 0);
                pins.analogWritePin(RGB_GREEN, pwm);
                pins.analogWritePin(RGB_BLUE, 0);
                break;
            case Color.Blue:
                pins.analogWritePin(RGB_RED, 0);
                pins.analogWritePin(RGB_GREEN, 0);
                pins.analogWritePin(RGB_BLUE, pwm);
                break;
            case Color.Yellow:
                pins.analogWritePin(RGB_RED, pwm);
                pins.analogWritePin(RGB_GREEN, pwm);
                pins.analogWritePin(RGB_BLUE, 0);
                break;
            case Color.Purple:
                pins.analogWritePin(RGB_RED, pwm);
                pins.analogWritePin(RGB_GREEN, 0);
                pins.analogWritePin(RGB_BLUE, pwm);
                break;
            case Color.Cyan:
                pins.analogWritePin(RGB_RED, 0);
                pins.analogWritePin(RGB_GREEN, pwm);
                pins.analogWritePin(RGB_BLUE, pwm);
                break;
            case Color.White:
                pins.analogWritePin(RGB_RED, pwm);
                pins.analogWritePin(RGB_GREEN, pwm);
                pins.analogWritePin(RGB_BLUE, pwm);
                break;
            case Color.Off:
                pins.analogWritePin(RGB_RED, 0);
                pins.analogWritePin(RGB_GREEN, 0);
                pins.analogWritePin(RGB_BLUE, 0);
                break;
        }
    }

    /**
     * Set default speed and distance for tracking and obstacle avoidance.
     */
    //% block="Set activity speed to %speed and distance to %distance cm"
    //% speed.min=0 speed.max=100
    //% speed.defl=100
    //% distance.min=5 distance.defl=15
    //% weight=95
    //% inlineInputMode=inline
    export function setActivityDefaults(speed: number, distance: number): void {
        activitySpeed = speed;
        activityDistance = distance;
    }

    /**
     * The robot will follow a user at a specified distance.
     */
    //% block="Tracking mode"
    //% weight=90
    export function startTracking(): void {
        if (trackingActive || avoidanceActive) return;
        trackingActive = true;
        avoidanceActive = false;
        control.runInParallel(() => {
            while (trackingActive) {
                const currentDistance = ultra();
                const difference = currentDistance - activityDistance;
                const tolerance = 2;
                if (difference > tolerance) {
                    car_run(CarDirection.Forward, activitySpeed);
                } else if (difference < -tolerance) {
                    car_run(CarDirection.Backward, activitySpeed);
                } else {
                    car_stop();
                }
                basic.pause(50);
            }
            car_stop();
        });
    }

    /**
     * The robot will run, and if it finds an obstacle, it will spin and keep going.
     */
    //% block="Avoid obstacles"
    //% weight=85
    export function startAvoidObstacles(): void {
        if (avoidanceActive || trackingActive) return;
        avoidanceActive = true;
        trackingActive = false;
        control.runInParallel(() => {
            while (avoidanceActive) {
                const currentDistance = ultra();
                if (currentDistance < activityDistance && currentDistance > 0) {
                    car_stop();
                    basic.pause(100);
                    car_run(CarDirection.SpinLeft, activitySpeed);
                    basic.pause(Math.randomRange(500, 1500));
                } else {
                    car_run(CarDirection.Forward, activitySpeed);
                }
                basic.pause(50);
            }
            car_stop();
        });
    }

    // === IR Remote Control Blocks ===
    //% block="---" blockHidden=true
    //% block="IR Remote Control"
    //% blockHidden=true
    //% block.color=#B8860B
    export function IrHeader(): void { }

    //% block="on IR button %button|pressed"
    //% button.defl=ir.eButton.Power
    //% subcategory="IR Remote Control"
    //% weight=100
    export function onIrButtonPressed(button: ir.eButton, handler: () => void): void {
        ir.onPressEvent(button, handler);
    }
}
