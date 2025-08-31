//% color=#FF6600 icon="\uf1b9" block="anwar"
namespace asbit {

    const LEFT_MOTOR_SPEED_PIN = AnalogPin.P16
    const LEFT_MOTOR_DIR_PIN = DigitalPin.P15
    const RIGHT_MOTOR_SPEED_PIN = AnalogPin.P14
    const RIGHT_MOTOR_DIR_PIN = DigitalPin.P13

    const TRIG_PIN = DigitalPin.P8
    const ECHO_PIN = DigitalPin.P12

    const RGB_RED_PIN = DigitalPin.P5
    const RGB_GREEN_PIN = DigitalPin.P4
    const RGB_BLUE_PIN = DigitalPin.P3

    // -------- MOTOR CONTROL --------
    export enum MotorDir {
        //% block="forward"
        Forward,
        //% block="backward"
        Backward,
        //% block="left"
        Left,
        //% block="right"
        Right,
        //% block="spin left"
        SpinLeft,
        //% block="spin right"
        SpinRight,
        //% block="stop"
        Stop
    }

    function driveMotors(leftSpeed: number, rightSpeed: number) {
        const leftDir = leftSpeed >= 0 ? 1 : 0
        const rightDir = rightSpeed >= 0 ? 1 : 0

        const scaledLeft = Math.map(Math.abs(leftSpeed), 0, 100, 0, 1023)
        const scaledRight = Math.map(Math.abs(rightSpeed), 0, 100, 0, 1023)

        pins.digitalWritePin(LEFT_MOTOR_DIR_PIN, leftDir)
        pins.digitalWritePin(RIGHT_MOTOR_DIR_PIN, rightDir)

        pins.analogWritePin(LEFT_MOTOR_SPEED_PIN, scaledLeft)
        pins.analogWritePin(RIGHT_MOTOR_SPEED_PIN, scaledRight)
    }

    /**
     * Move the robot in a direction with the same speed.
     */
    //% blockId=asbit_move block="move %dir at speed %speed"
    //% speed.min=0 speed.max=100
    //% group="Car Control"
    export function move(dir: MotorDir, speed: number): void {
        let leftSpeed = 0
        let rightSpeed = 0
        let displayText = ""

        switch (dir) {
            case MotorDir.Forward:
                leftSpeed = speed; rightSpeed = speed; displayText = "F"; break
            case MotorDir.Backward:
                leftSpeed = -speed; rightSpeed = -speed; displayText = "B"; break
            case MotorDir.Left:
                leftSpeed = 0; rightSpeed = speed; displayText = "L"; break
            case MotorDir.Right:
                leftSpeed = speed; rightSpeed = 0; displayText = "R"; break
            case MotorDir.SpinLeft:
                leftSpeed = -speed; rightSpeed = speed; displayText = "SL"; break
            case MotorDir.SpinRight:
                leftSpeed = speed; rightSpeed = -speed; displayText = "SR"; break
            case MotorDir.Stop:
                leftSpeed = 0; rightSpeed = 0; displayText = "S"; break
        }

        driveMotors(leftSpeed, rightSpeed)
        basic.showString(displayText)
    }

    /**
     * Control each motor separately (-100 to 100).
     */
    //% blockId=asbit_motor_control block="set left motor %leftSpeed \\% and right motor %rightSpeed \\%"
    //% leftSpeed.min=-100 leftSpeed.max=100
    //% rightSpeed.min=-100 rightSpeed.max=100
    //% group="Motor Control"
    export function motorControl(leftSpeed: number, rightSpeed: number): void {
        driveMotors(leftSpeed, rightSpeed)
    }

    // -------- ULTRASONIC SENSOR --------
    /**
     * Get distance from ultrasonic sensor in cm.
     */
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

    // -------- RGB CONTROL (Digital Only) --------
    export enum RGBColors {
        //% block="red"
        Red,
        //% block="green"
        Green,
        //% block="blue"
        Blue,
        //% block="yellow"
        Yellow,
        //% block="cyan"
        Cyan,
        //% block="magenta"
        Magenta,
        //% block="white"
        White,
        //% block="off"
        Off
    }

    /**
     * Set RGB LED color using digital outputs only.
     */
    //% blockId=asbit_rgb block="set RGB color to %color"
    //% group="RGB Control"
    export function setRGB(color: RGBColors): void {
        pins.digitalWritePin(RGB_RED_PIN, 0)
        pins.digitalWritePin(RGB_GREEN_PIN, 0)
        pins.digitalWritePin(RGB_BLUE_PIN, 0)

        switch (color) {
            case RGBColors.Red: pins.digitalWritePin(RGB_RED_PIN, 1); break
            case RGBColors.Green: pins.digitalWritePin(RGB_GREEN_PIN, 1); break
            case RGBColors.Blue: pins.digitalWritePin(RGB_BLUE_PIN, 1); break
            case RGBColors.Yellow:
                pins.digitalWritePin(RGB_RED_PIN, 1)
                pins.digitalWritePin(RGB_GREEN_PIN, 1)
                break
            case RGBColors.Cyan:
                pins.digitalWritePin(RGB_GREEN_PIN, 1)
                pins.digitalWritePin(RGB_BLUE_PIN, 1)
                break
            case RGBColors.Magenta:
                pins.digitalWritePin(RGB_RED_PIN, 1)
                pins.digitalWritePin(RGB_BLUE_PIN, 1)
                break
            case RGBColors.White:
                pins.digitalWritePin(RGB_RED_PIN, 1)
                pins.digitalWritePin(RGB_GREEN_PIN, 1)
                pins.digitalWritePin(RGB_BLUE_PIN, 1)
                break
            case RGBColors.Off: break
        }
    }
}
