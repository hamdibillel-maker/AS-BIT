//% color=#33AA33 icon="\uf1b9" block="AS BIT"
namespace asbit {

    const LEFT_MOTOR_SPEED_PIN = AnalogPin.P16
    const LEFT_MOTOR_DIR_PIN = DigitalPin.P15
    const RIGHT_MOTOR_SPEED_PIN = AnalogPin.P14
    const RIGHT_MOTOR_DIR_PIN = DigitalPin.P13

    // Directions
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

    // Internal helper
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
     * Shows letter on LED display.
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
     * Control each motor separately with speed (-100 to 100).
     * Positive = forward, Negative = backward.
     */
    //% blockId=asbit_motor_control block="set left motor %leftSpeed \\% and right motor %rightSpeed \\%"
    //% leftSpeed.min=-100 leftSpeed.max=100
    //% rightSpeed.min=-100 rightSpeed.max=100
    //% group="Motor Control"
    export function motorControl(leftSpeed: number, rightSpeed: number): void {
        driveMotors(leftSpeed, rightSpeed)
        basic.showString("M")
    }
}
