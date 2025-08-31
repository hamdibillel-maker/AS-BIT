//% color=#0066CC icon="\uf1b9" block="AS BIT"
namespace asbit {

    const LEFT_MOTOR_SPEED_PIN = AnalogPin.P16
    const LEFT_MOTOR_DIR_PIN = DigitalPin.P15
    const RIGHT_MOTOR_SPEED_PIN = AnalogPin.P14
    const RIGHT_MOTOR_DIR_PIN = DigitalPin.P13

    // Define possible directions
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

    /**
     * Move the robot in a direction at a speed (0–100).
     * Shows the direction on the LED display.
     * @param dir The direction
     * @param speed Speed from 0 to 100
     */
    //% blockId=asbit_move block="move %dir at speed %speed"
    //% speed.min=0 speed.max=100
    export function move(dir: MotorDir, speed: number): void {
        let leftSpeed = 0
        let rightSpeed = 0
        let displayText = ""

        switch (dir) {
            case MotorDir.Forward:
                leftSpeed = speed
                rightSpeed = speed
                displayText = "F"
                break
            case MotorDir.Backward:
                leftSpeed = -speed
                rightSpeed = -speed
                displayText = "B"
                break
            case MotorDir.Left:
                leftSpeed = 0
                rightSpeed = speed
                displayText = "L"
                break
            case MotorDir.Right:
                leftSpeed = speed
                rightSpeed = 0
                displayText = "R"
                break
            case MotorDir.SpinLeft:
                leftSpeed = -speed
                rightSpeed = speed
                displayText = "SL"
                break
            case MotorDir.SpinRight:
                leftSpeed = speed
                rightSpeed = -speed
                displayText = "SR"
                break
            case MotorDir.Stop:
                leftSpeed = 0
                rightSpeed = 0
                displayText = "S"
                break
        }

        // Convert to direction & PWM
        const leftDir = leftSpeed >= 0 ? 1 : 0
        const rightDir = rightSpeed >= 0 ? 1 : 0

        const scaledLeft = Math.map(Math.abs(leftSpeed), 0, 100, 0, 1023)
        const scaledRight = Math.map(Math.abs(rightSpeed), 0, 100, 0, 1023)

        pins.digitalWritePin(LEFT_MOTOR_DIR_PIN, leftDir)
        pins.digitalWritePin(RIGHT_MOTOR_DIR_PIN, rightDir)

        pins.analogWritePin(LEFT_MOTOR_SPEED_PIN, scaledLeft)
        pins.analogWritePin(RIGHT_MOTOR_SPEED_PIN, scaledRight)

        // Show direction on micro:bit display
        basic.showString(displayText)
    }
}
