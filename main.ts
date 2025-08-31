//% color="#0066CC" icon="\uf1b9" block="AS BIT"
namespace asbit {

    const LEFT_MOTOR_SPEED_PIN = DigitalPin.P16
    const LEFT_MOTOR_DIR_PIN = DigitalPin.P15
    const RIGHT_MOTOR_SPEED_PIN = DigitalPin.P14
    const RIGHT_MOTOR_DIR_PIN = DigitalPin.P13

    /**
     * Move the motors with given speeds
     * @param left speed from -100 to 100
     * @param right speed from -100 to 100
     */
    //% blockId="asbit_move" block="move left %leftSpeed right %rightSpeed"
    //% leftSpeed.min=-100 leftSpeed.max=100
    //% rightSpeed.min=-100 rightSpeed.max=100
    //% weight=100
    export function move(leftSpeed: number, rightSpeed: number): void {
        const leftDir = leftSpeed >= 0 ? 1 : 0
        const rightDir = rightSpeed >= 0 ? 1 : 0

        const scaledLeft = Math.round(Math.abs(leftSpeed) * 10.23)  // 0-1023
        const scaledRight = Math.round(Math.abs(rightSpeed) * 10.23)

        pins.digitalWritePin(LEFT_MOTOR_DIR_PIN, leftDir)
        pins.digitalWritePin(RIGHT_MOTOR_DIR_PIN, rightDir)

        pins.analogWritePin(LEFT_MOTOR_SPEED_PIN, scaledLeft)
        pins.analogWritePin(RIGHT_MOTOR_SPEED_PIN, scaledRight)
    }
}
