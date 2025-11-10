/**
 * AS BIT Robot
 * Complete version with Simple & PID line following + Fight Mode
 */
//% color=#7B68EE icon="\uf1b9" block="AS BIT"
namespace asbit {

    // === Motor Pins ===
    const LEFT_MOTOR_FORWARD = AnalogPin.P15;
    const LEFT_MOTOR_BACKWARD = AnalogPin.P16;
    const RIGHT_MOTOR_FORWARD = AnalogPin.P13;
    const RIGHT_MOTOR_BACKWARD = AnalogPin.P14;

    // === Sensor Pins ===
    const IR_LEFT = AnalogPin.P0;
    const IR_MIDDLE = AnalogPin.P1;
    const IR_RIGHT = AnalogPin.P2;
    const ULTRASONIC_TRIG = DigitalPin.P8;
    const ULTRASONIC_ECHO = DigitalPin.P12;

    // === RGB Pins ===
    const RGB_RED = AnalogPin.P5;
    const RGB_GREEN = AnalogPin.P9;
    const RGB_BLUE = AnalogPin.P11;

    // === Global Variables ===
    let lastDirection: CarDirection = CarDirection.Forward;
    let rgbBrightness = 100;

    // === PID Variables ===
    let blackLeft = 900, blackMid = 900, blackRight = 900;
    let whiteLeft = 100, whiteMid = 100, whiteRight = 100;
    let Kp = 0.6, Ki = 0.0, Kd = 8.0;
    let baseSpeed = 50, minSpeed = 20, maxSpeed = 100;
    let lastError = 0;
    let integral = 0;

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

    // === Motor Functions ===
    function stopCar(): void {
        pins.analogWritePin(LEFT_MOTOR_FORWARD, 0);
        pins.analogWritePin(LEFT_MOTOR_BACKWARD, 0);
        pins.analogWritePin(RIGHT_MOTOR_FORWARD, 0);
        pins.analogWritePin(RIGHT_MOTOR_BACKWARD, 0);
    }

    function driveMotors(left: number, right: number): void {
        if (left >= 0) {
            pins.analogWritePin(LEFT_MOTOR_FORWARD, left);
            pins.analogWritePin(LEFT_MOTOR_BACKWARD, 0);
        } else {
            pins.analogWritePin(LEFT_MOTOR_FORWARD, 0);
            pins.analogWritePin(LEFT_MOTOR_BACKWARD, -left);
        }

        if (right >= 0) {
            pins.analogWritePin(RIGHT_MOTOR_FORWARD, right);
            pins.analogWritePin(RIGHT_MOTOR_BACKWARD, 0);
        } else {
            pins.analogWritePin(RIGHT_MOTOR_FORWARD, 0);
            pins.analogWritePin(RIGHT_MOTOR_BACKWARD, -right);
        }
    }

    // === Car Control ===
    //% block="move %direction with speed %speed"
    //% speed.min=0 speed.max=100 speed.defl=80
    //% direction.defl=CarDirection.Forward
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
                pins.analogWritePin(LEFT_MOTOR_FORWARD, 0);
                pins.analogWritePin(LEFT_MOTOR_BACKWARD, pwm);
                pins.analogWritePin(RIGHT_MOTOR_FORWARD, pwm);
                pins.analogWritePin(RIGHT_MOTOR_BACKWARD, 0);
                break;
            case CarDirection.SpinRight:
                pins.analogWritePin(LEFT_MOTOR_FORWARD, pwm);
                pins.analogWritePin(LEFT_MOTOR_BACKWARD, 0);
                pins.analogWritePin(RIGHT_MOTOR_FORWARD, 0);
                pins.analogWritePin(RIGHT_MOTOR_BACKWARD, pwm);
                break;
        }
    }

    //% block="Stop Car"
    export function car_stop(): void {
        stopCar();
    }

    // === Sensor Read ===
    //% block="Read %sensor IR as %mode"
    export function readIR(sensor: IRSensor, mode: ReadMode): number {
        let pin = IR_LEFT;
        switch (sensor) {
            case IRSensor.Left: pin = IR_LEFT; break;
            case IRSensor.Middle: pin = IR_MIDDLE; break;
            case IRSensor.Right: pin = IR_RIGHT; break;
        }
        if (mode === ReadMode.Analog) {
            return pins.analogReadPin(pin);
        } else {
            return pins.digitalReadPin(pin);
        }
    }

    //% block="Ultrasonic distance (cm)"
    export function ultra(): number {
        pins.digitalWritePin(ULTRASONIC_TRIG, 0);
        control.waitMicros(2);
        pins.digitalWritePin(ULTRASONIC_TRIG, 1);
        control.waitMicros(10);
        pins.digitalWritePin(ULTRASONIC_TRIG, 0);
        const d = pins.pulseIn(ULTRASONIC_ECHO, PulseValue.High, 30000);
        if (d === 0) return 0;
        return Math.round(d / 58);
    }

    // === RGB Control ===
    //% block="Set RGB color to %color"
    export function setRgbColor(color: Color): void {
        const pwm = Math.map(rgbBrightness, 0, 100, 0, 1023);
        switch (color) {
            case Color.Red:
                pins.analogWritePin(RGB_RED, pwm); pins.analogWritePin(RGB_GREEN, 0); pins.analogWritePin(RGB_BLUE, 0); break;
            case Color.Green:
                pins.analogWritePin(RGB_RED, 0); pins.analogWritePin(RGB_GREEN, pwm); pins.analogWritePin(RGB_BLUE, 0); break;
            case Color.Blue:
                pins.analogWritePin(RGB_RED, 0); pins.analogWritePin(RGB_GREEN, 0); pins.analogWritePin(RGB_BLUE, pwm); break;
            case Color.Yellow:
                pins.analogWritePin(RGB_RED, pwm); pins.analogWritePin(RGB_GREEN, pwm); pins.analogWritePin(RGB_BLUE, 0); break;
            case Color.Purple:
                pins.analogWritePin(RGB_RED, pwm); pins.analogWritePin(RGB_GREEN, 0); pins.analogWritePin(RGB_BLUE, pwm); break;
            case Color.Cyan:
                pins.analogWritePin(RGB_RED, 0); pins.analogWritePin(RGB_GREEN, pwm); pins.analogWritePin(RGB_BLUE, pwm); break;
            case Color.White:
                pins.analogWritePin(RGB_RED, pwm); pins.analogWritePin(RGB_GREEN, pwm); pins.analogWritePin(RGB_BLUE, pwm); break;
            case Color.Off:
                pins.analogWritePin(RGB_RED, 0); pins.analogWritePin(RGB_GREEN, 0); pins.analogWritePin(RGB_BLUE, 0); break;
        }
    }

    // === Simple Line Following ===
    //% block="Follow line (Simple Mode) until %checkpoints checkpoints"
    export function lineFollowSimple(checkpoints: number): void {
        let detected = 0;
        while (detected < checkpoints) {
            const l = pins.digitalReadPin(IR_LEFT);
            const m = pins.digitalReadPin(IR_MIDDLE);
            const r = pins.digitalReadPin(IR_RIGHT);
            const state = (l << 2) | (m << 1) | r;
            switch (state) {
                case 1: case 3: car_run(CarDirection.SpinRight, 60); lastDirection = CarDirection.SpinRight; break;
                case 2: car_run(CarDirection.Forward, 80); lastDirection = CarDirection.Forward; break;
                case 4: case 6: car_run(CarDirection.SpinLeft, 60); lastDirection = CarDirection.SpinLeft; break;
                case 5: car_run(lastDirection, 60); break;
                case 7:
                    detected++; car_stop(); basic.pause(500); break;
                default: car_run(lastDirection, 60); break;
            }
            basic.pause(5);
        }
        car_stop();
    }

    // === Advanced Line Following (PID) ===
    function normalize(value: number, white: number, black: number): number {
        return Math.constrain((value - white) / (black - white), 0, 1);
    }

    function clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    //% block="Follow line with PID until %numCheckpoints checkpoints"
    export function followLinePID(numCheckpoints: number): void {
        let checkpoints = 0;
        integral = 0;
        lastError = 0;
        while (checkpoints < numCheckpoints) {
            const l = normalize(pins.analogReadPin(IR_LEFT), whiteLeft, blackLeft);
            const m = normalize(pins.analogReadPin(IR_MIDDLE), whiteMid, blackMid);
            const r = normalize(pins.analogReadPin(IR_RIGHT), whiteRight, blackRight);

            if (l > 0.8 && m > 0.8 && r > 0.8) {
                checkpoints++;
                car_stop();
                basic.pause(500);
                integral = 0; lastError = 0;
            }
            if (checkpoints >= numCheckpoints) break;

            const err = r - l;
            integral = clamp(integral + err, -100, 100);
            const deriv = err - lastError;
            const corr = Kp * err + Ki * integral + Kd * deriv;

            let leftMotorSpeed = clamp(baseSpeed + corr, minSpeed, maxSpeed);
            let rightMotorSpeed = clamp(baseSpeed - corr, minSpeed, maxSpeed);
            driveMotors(leftMotorSpeed, rightMotorSpeed);

            lastError = err;
            basic.pause(10);
        }
        car_stop();
    }

    //% block="Set PID Kp %p Ki %i Kd %d"
    export function setPID(p: number, i: number, d: number): void {
        Kp = p; Ki = i; Kd = d;
    }

    //% block="Set speed min %min base %base max %max"
    export function setSpeed(min: number, base: number, max: number): void {
        minSpeed = min; baseSpeed = base; maxSpeed = max;
    }

    // === Fight Mode ===
    //% block="Start Fight Mode"
    export function fightMode(): void {
        control.runInParallel(() => {
            while (true) {
                const dist = ultra();
                if (dist > 0 && dist < 15) {
                    car_run(CarDirection.Forward, 80);
                } else {
                    car_run(CarDirection.SpinLeft, 50);
                }
                basic.pause(50);
            }
        });
    }
}
