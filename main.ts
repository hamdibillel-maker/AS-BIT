//% color=#00CC66 icon="\uf1b9" block="AS BIT"
namespace asbit {

    const LEFT_MOTOR_SPEED_PIN = AnalogPin.P16
    const LEFT_MOTOR_DIR_PIN = DigitalPin.P15
    const RIGHT_MOTOR_SPEED_PIN = AnalogPin.P14
    const RIGHT_MOTOR_DIR_PIN = DigitalPin.P13

    /**
     * Move the motors with given speeds
     * @param leftSpeed speed from -100 to 100
     * @param rightSpeed speed from -100 to 100
     */
    //% blockId=asbit_move block="move left %leftSpeed right %rightSpeed"
    //% leftSpeed.min=-100 leftSpeed.max=100
    //% rightSpeed.min=-100 rightSpeed.max=100
    export function move(leftSpeed: number, rightSpeed: number): void {
        const leftDir = leftSpeed >= 0 ? 1 : 0
        const rightDir = rightSpeed >= 0 ? 1 : 0

        const scaledLeft = Math.map(Math.abs(leftSpeed), 0, 100, 0, 1023)
        const scaledRight = Math.map(Math.abs(rightSpeed), 0, 100, 0, 1023)

        pins.digitalWritePin(LEFT_MOTOR_DIR_PIN, leftDir)
        pins.digitalWritePin(RIGHT_MOTOR_DIR_PIN, rightDir)

        pins.analogWritePin(LEFT_MOTOR_SPEED_PIN, scaledLeft)
        pins.analogWritePin(RIGHT_MOTOR_SPEED_PIN, scaledRight)

        basic.showString("L" + leftSpeed + " R" + rightSpeed)
    }
}
