//% color="#00A9E0" weight=100 icon="\uf1b9"
namespace LineRobot {
    export enum Motors {
        Left,
        Right
    }

    //% block="run %motor motor at %speed"
    //% speed.min=-100 speed.max=100
    export function runMotor(motor: Motors, speed: number): void {
        // TODO: Add motor control logic here
        serial.writeLine("Motor " + motor + " speed " + speed)
    }

    //% block="stop motor %motor"
    export function stopMotor(motor: Motors): void {
        // TODO: Add stop logic here
        serial.writeLine("Stop motor " + motor)
    }

    //% block="set NeoPixel color %color"
    export function setNeoPixelColor(color: number): void {
        // TODO: Add NeoPixel logic
        serial.writeLine("NeoPixel color: " + color)
    }
}
