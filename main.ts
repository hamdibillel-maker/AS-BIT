//% color="#00A9E0" weight=100 icon="\uf1b9"
namespace LineRobot {

    // ---------------------------
    // ENUMS
    // ---------------------------
    export enum Motors {
        Left,
        Right
    }

    // ---------------------------
    // MOTOR CONTROL
    // ---------------------------

    //% block="run %motor motor at %speed"
    //% speed.min=-100 speed.max=100
    export function runMotor(motor: Motors, speed: number): void {
        // TODO: Replace with actual motor driver logic
        serial.writeLine("Motor " + motor + " speed " + speed)
    }

    //% block="stop motor %motor"
    export function stopMotor(motor: Motors): void {
        // TODO: Replace with actual motor stop logic
        serial.writeLine("Stop motor " + motor)
    }

    //% block="stop all motors"
    export function stopAllMotors(): void {
        // TODO: Replace with actual logic
        serial.writeLine("Stop all motors")
    }

    // ---------------------------
    // NEOPIXEL CONTROL
    // ---------------------------
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

    // ---------------------------
    // BUZZER CONTROL
    // ---------------------------

    //% block="play tone %freq Hz for %ms ms"
    export function playTone(freq: number, ms: number): void {
        music.playTone(freq, ms)
    }

    // ---------------------------
    // LINE FOLLOWING (PID STUB)
    // ---------------------------
    let kp = 0
    let ki = 0
    let kd = 0

    //% block="enable line follower PID with Kp %p Ki %i Kd %d"
    export function enableLineFollowerPID(p: number, i: number, d: number): void {
        kp = p
        ki = i
        kd = d
        serial.writeLine("PID enabled: Kp=" + kp + " Ki=" + ki + " Kd=" + kd)
    }

    //% block="start line following"
    export function startLineFollowing(): void {
        // TODO: Add real sensor + motor control here
        serial.writeLine("Line following started with PID")
    }

    //% block="stop line following"
    export function stopLineFollowing(): void {
        // TODO: Add real stop logic
        serial.writeLine("Line following stopped")
    }

    // ---------------------------
    // BLUETOOTH REMOTE (STUB)
    // ---------------------------

    //% block="process Bluetooth command %cmd"
    export function processBluetoothCommand(cmd: string): void {
        // TODO: Add your own command mapping logic
        serial.writeLine("BT Command received: " + cmd)
    }
}
