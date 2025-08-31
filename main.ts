//% color=#FA5500 icon="\uf1b9" block="AS BIT"
namespace asbit {

    // ---------------- PINS ----------------
    const LEFT_MOTOR_SPEED_PIN = AnalogPin.P16
    const LEFT_MOTOR_DIR_PIN = DigitalPin.P15
    const RIGHT_MOTOR_SPEED_PIN = AnalogPin.P14
    const RIGHT_MOTOR_DIR_PIN = DigitalPin.P13

    const TRIG_PIN = DigitalPin.P8
    const ECHO_PIN = DigitalPin.P12

    const RGB_RED_PIN = DigitalPin.P5
    const RGB_GREEN_PIN = DigitalPin.P4
    const RGB_BLUE_PIN = DigitalPin.P3

    const IR_LEFT = AnalogPin.P0
    const IR_MIDDLE = AnalogPin.P1
    const IR_RIGHT = AnalogPin.P2

    const BUZZER_PIN = DigitalPin.P9
    pins.analogSetPitchPin(BUZZER_PIN)

    // ---------------- MOTOR ----------------
    export enum MotorDir {
        //% block="forward"
        Forward,
        //% block="backward"
        Backward
    }

    // Tall single-line motor control block
    //% blockId=asbit_motor_control block="left motor %leftDir at %leftSpeed \\% | right motor %rightDir at %rightSpeed \\%"
    //% leftSpeed.min=0 leftSpeed.max=100
    //% rightSpeed.min=0 rightSpeed.max=100
    //% group="Car Control"
    export function motorControl(
        leftDir: MotorDir, leftSpeed: number,
        rightDir: MotorDir, rightSpeed: number
    ): void {
        let l = leftDir == MotorDir.Backward ? -leftSpeed : leftSpeed
        let r = rightDir == MotorDir.Backward ? -rightSpeed : rightSpeed

        pins.digitalWritePin(LEFT_MOTOR_DIR_PIN, l >= 0 ? 1 : 0)
        pins.digitalWritePin(RIGHT_MOTOR_DIR_PIN, r >= 0 ? 1 : 0)
        pins.analogWritePin(LEFT_MOTOR_SPEED_PIN, Math.map(Math.abs(l), 0, 100, 0, 1023))
        pins.analogWritePin(RIGHT_MOTOR_SPEED_PIN, Math.map(Math.abs(r), 0, 100, 0, 1023))
    }

    // ---------------- CAR MOVEMENT ----------------
    export enum MotorMove {
        Forward,
        Backward,
        Left,
        Right,
        SpinLeft,
        SpinRight,
        Stop
    }

    //% blockId=asbit_move block="move %dir at %speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Car Control"
    export function move(dir: MotorMove, speed: number): void {
        let left = 0
        let right = 0
        let displayText = ""
        switch (dir) {
            case MotorMove.Forward: left = speed; right = speed; displayText = "F"; break
            case MotorMove.Backward: left = -speed; right = -speed; displayText = "B"; break
            case MotorMove.Left: left = 0; right = speed; displayText = "L"; break
            case MotorMove.Right: left = speed; right = 0; displayText = "R"; break
            case MotorMove.SpinLeft: left = -speed; right = speed; displayText = "SL"; break
            case MotorMove.SpinRight: left = speed; right = -speed; displayText = "SR"; break
            case MotorMove.Stop: left = 0; right = 0; displayText = "S"; break
        }
        pins.digitalWritePin(LEFT_MOTOR_DIR_PIN, left >= 0 ? 1 : 0)
        pins.digitalWritePin(RIGHT_MOTOR_DIR_PIN, right >= 0 ? 1 : 0)
        pins.analogWritePin(LEFT_MOTOR_SPEED_PIN, Math.map(Math.abs(left), 0, 100, 0, 1023))
        pins.analogWritePin(RIGHT_MOTOR_SPEED_PIN, Math.map(Math.abs(right), 0, 100, 0, 1023))
        basic.showString(displayText)
    }

    // ---------------- IR SENSORS ----------------
    export enum IRSensor {
        Left,
        Middle,
        Right
    }

    // Analog read
    //% blockId=asbit_read_ir_analog block="read %sensor IR analog"
    //% group="Sensors"
    export function readIRAnalog(sensor: IRSensor): number {
        switch (sensor) {
            case IRSensor.Left: return pins.analogReadPin(IR_LEFT)
            case IRSensor.Middle: return pins.analogReadPin(IR_MIDDLE)
            case IRSensor.Right: return pins.analogReadPin(IR_RIGHT)
        }
        return 0
    }

    // Digital read (threshold)
    //% blockId=asbit_read_ir_digital block="read %sensor IR digital"
    //% group="Sensors"
    export function readIRDigital(sensor: IRSensor): number {
        let val = 0
        switch(sensor){
            case IRSensor.Left: val = pins.analogReadPin(IR_LEFT); break
            case IRSensor.Middle: val = pins.analogReadPin(IR_MIDDLE); break
            case IRSensor.Right: val = pins.analogReadPin(IR_RIGHT); break
        }
        return val > 512 ? 1 : 0
    }

    // ---------------- ULTRASONIC ----------------
    //% blockId=asbit_ultrasonic block="ultrasonic distance (cm)"
    //% group="Sensors"
    export function ultrasonic(): number {
        pins.digitalWritePin(TRIG_PIN, 0)
        control.waitMicros(2)
        pins.digitalWritePin(TRIG_PIN, 1)
        control.waitMicros(10)
        pins.digitalWritePin(TRIG_PIN, 0)
        let d = pins.pulseIn(ECHO_PIN, PulseValue.High, 25000)
        return Math.idiv(d, 58)
    }

    // ---------------- DIGITAL RGB LED ----------------
    export enum RGBColors {
        Red,
        Green,
        Blue,
        Yellow,
        Cyan,
        Magenta,
        White,
        Off
    }

    //% blockId=asbit_rgb block="set RGB color to %color"
    //% group="RGB Control"
    export function setRGB(color: RGBColors) {
        pins.digitalWritePin(RGB_RED_PIN, 0)
        pins.digitalWritePin(RGB_GREEN_PIN, 0)
        pins.digitalWritePin(RGB_BLUE_PIN, 0)
        switch (color) {
            case RGBColors.Red: pins.digitalWritePin(RGB_RED_PIN, 1); break
            case RGBColors.Green: pins.digitalWritePin(RGB_GREEN_PIN, 1); break
            case RGBColors.Blue: pins.digitalWritePin(RGB_BLUE_PIN, 1); break
            case RGBColors.Yellow: pins.digitalWritePin(RGB_RED_PIN, 1); pins.digitalWritePin(RGB_GREEN_PIN, 1); break
            case RGBColors.Cyan: pins.digitalWritePin(RGB_GREEN_PIN, 1); pins.digitalWritePin(RGB_BLUE_PIN, 1); break
            case RGBColors.Magenta: pins.digitalWritePin(RGB_RED_PIN, 1); pins.digitalWritePin(RGB_BLUE_PIN, 1); break
            case RGBColors.White: pins.digitalWritePin(RGB_RED_PIN, 1); pins.digitalWritePin(RGB_GREEN_PIN, 1); pins.digitalWritePin(RGB_BLUE_PIN, 1); break
            case RGBColors.Off: break
        }
    }

    // ---------------- BUZZER / MUSIC ----------------
    // Redirect music to buzzer pin automatically
    // Music blocks now work on P9
}
