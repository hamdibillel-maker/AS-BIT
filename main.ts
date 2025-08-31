//% color="#00A9E0" weight=100 icon="\uf1b9"
namespace LineRobot {
    //% block="say hello"
    export function sayHello(): void {
        basic.showString("Hello")
    }

    export enum Motors {
        Left,
        Right
    }

    //% block="run %motor motor at %speed"
    //% speed.min=-100 speed.max=100
    export function runMotor(motor: Motors, speed: number): void {
        serial.writeLine("Motor " + motor + " speed " + speed)
    }

    //% block="stop motor %motor"
    export function stopMotor(motor: Motors): void {
        serial.writeLine("Stop motor " + motor)
    }

    let strip = neopixel.create(DigitalPin.P6, 4, NeoPixelMode.RGB)

    //% block="set NeoPixel color %color"
    export function setNeoPixelColor(color: number): void {
        strip.showColor(color)
    }

    //% block="clear NeoPixels"
    export function clearNeoPixels(): void {
        strip.clear()
        strip.show()
    }

    //% block="play tone %freq Hz for %ms ms"
    export function playTone(freq: number, ms: number): void {
        music.playTone(freq, ms)
    }

    let kp = 0
    let ki = 0
    let kd = 0

    //% block="enable line follower PID with Kp %p Ki %i Kd %d"
    export function enableLineFollowerPID(p: number, i: number, d: number): void {
        kp = p
        ki = i
        kd = d
        serial.writeLine("PID enabled: " + kp + "," + ki + "," + kd)
    }

    //% block="start line following"
    export function startLineFollowing(): void {
        serial.writeLine("Line following started")
    }

    //% block="stop line following"
    export function stopLineFollowing(): void {
        serial.writeLine("Line following stopped")
    }

    //% block="process Bluetooth command %cmd"
    export function processBluetoothCommand(cmd: string): void {
        serial.writeLine("BT Command: " + cmd)
    }
}
