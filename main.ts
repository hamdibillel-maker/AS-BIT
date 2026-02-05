/**
 * Custom blocks for Micro:bit Robot Controller
 * Motor Pins: Left (P0, P1), Right (P2, P8)
 * IR Pins: Left (P16), Right (P12)
 * Sonar: Trig (P13), Echo (P14)
 */

//% color="#249ed1" icon="\uf1b9" block="AS BIT"
//% weight=100
namespace RobotControl {

    // Internal state for Activities
    let _activitySpeed = 50
    let _activityTurnSpeed = 50
    let _activityDistance = 30

    export enum Direction {
        //% block="forward"
        Forward,
        //% block="backward"
        Backward,
        //% block="left"
        Left,
        //% block="right"
        Right
    }

    export enum MotorSide {
        //% block="left"
        Left,
        //% block="right"
        Right
    }

    export enum IRSensor {
        //% block="left"
        Left,
        //% block="right"
        Right
    }

    /**
     * Control the car direction with speed (0-100)
     */
    //% block="move car %dir with speed %speed%"
    //% speed.min=0 speed.max=100
    //% color="#249ed1"
    //% weight=100
    export function moveCar(dir: Direction, speed: number): void {
        let mappedSpeed = Math.map(speed, 0, 100, 0, 1023)
        if (dir == Direction.Forward) {
            pins.analogWritePin(AnalogPin.P0, mappedSpeed)
            pins.analogWritePin(AnalogPin.P1, 0)
            pins.analogWritePin(AnalogPin.P2, mappedSpeed)
            pins.analogWritePin(AnalogPin.P8, 0)
        } else if (dir == Direction.Backward) {
            pins.analogWritePin(AnalogPin.P0, 0)
            pins.analogWritePin(AnalogPin.P1, mappedSpeed)
            pins.analogWritePin(AnalogPin.P2, 0)
            pins.analogWritePin(AnalogPin.P8, mappedSpeed)
        } else if (dir == Direction.Left) {
            pins.analogWritePin(AnalogPin.P0, 0)
            pins.analogWritePin(AnalogPin.P1, mappedSpeed + 50)
            pins.analogWritePin(AnalogPin.P2, mappedSpeed)
            pins.analogWritePin(AnalogPin.P8, 0)
        } else if (dir == Direction.Right) {
            pins.analogWritePin(AnalogPin.P0, mappedSpeed)
            pins.analogWritePin(AnalogPin.P1, 0)
            pins.analogWritePin(AnalogPin.P2, 0)
            pins.analogWritePin(AnalogPin.P8, mappedSpeed + 50)
        }
    }

    /**
     * Move car for specific time in seconds
     */
    //% block="move car %dir with speed %speed% for %sec seconds"
    //% speed.min=0 speed.max=100
    //% color="#249ed1"
    //% weight=95
    export function moveWithTime(dir: Direction, speed: number, sec: number): void {
        moveCar(dir, speed)
        basic.pause(sec * 1000)
        stop()
    }

    /**
     * Move specific motor forward or backward
     */
    //% block="move %side motor %dir with speed %speed"
    //% speed.min=0 speed.max=100
    //% color="#249ed1"
    //% weight=90
    export function individualMotor(side: MotorSide, dir: Direction, speed: number): void {
        let mappedSpeed = Math.map(speed, 0, 100, 0, 1023)
        if (side == MotorSide.Left) {
            if (dir == Direction.Forward) {
                pins.analogWritePin(AnalogPin.P0, mappedSpeed)
                pins.analogWritePin(AnalogPin.P1, 0)
            } else {
                pins.analogWritePin(AnalogPin.P0, 0)
                pins.analogWritePin(AnalogPin.P1, mappedSpeed)
            }
        } else {
            if (dir == Direction.Forward) {
                pins.analogWritePin(AnalogPin.P2, mappedSpeed)
                pins.analogWritePin(AnalogPin.P8, 0)
            } else {
                pins.analogWritePin(AnalogPin.P2, 0)
                pins.analogWritePin(AnalogPin.P8, mappedSpeed)
            }
        }
    }

    /**
     * Stop the car
     */
    //% block="stop car"
    //% color="#249ed1"
    //% weight=70
    export function stop(): void {
        pins.analogWritePin(AnalogPin.P0, 0)
        pins.analogWritePin(AnalogPin.P1, 0)
        pins.analogWritePin(AnalogPin.P2, 0)
        pins.analogWritePin(AnalogPin.P8, 0)
    }

    /**
     * Read IR Sensor value
     */
    //% block="read %side IR sensor"
    //% color="#249ed1"
    //% weight=60
    export function readIR(side: IRSensor): number {
        if (side == IRSensor.Left) {
            return pins.digitalReadPin(DigitalPin.P16)
        } else {
            return pins.digitalReadPin(DigitalPin.P12)
        }
    }

    /**
     * Read Ultrasonic distance (No extension required)
     */
    //% block="read ultrasonic distance (cm)"
    //% color="#249ed1"
    //% weight=50
    export function readUltrasonic(): number {
        // Send a 10 microsecond pulse to Trigger pin (P13)
        pins.digitalWritePin(DigitalPin.P13, 0)
        control.waitMicros(2)
        pins.digitalWritePin(DigitalPin.P13, 1)
        control.waitMicros(10)
        pins.digitalWritePin(DigitalPin.P13, 0)

        // Read the pulse duration from Echo pin (P14)
        let duration = pins.pulseIn(DigitalPin.P14, PulseValue.High)
        let distance = Math.idiv(duration, 58)
        
        if (distance <= 0 || distance > 500) return 0
        return distance
    }

    /**
     * Setup the global settings for Activities
     */
    //% block="set activities: speed %speed turn %turn distance %dist cm"
    //% subcategory="Activities"
    //% speed.min=0 speed.max=100 turn.min=0 turn.max=100 dist.min=0 dist.max=200
    //% color="#249ed1"
    //% weight=50
    export function setActivityConfig(speed: number, turn: number, dist: number): void {
        _activitySpeed = speed
        _activityTurnSpeed = turn
        _activityDistance = dist
    }

    /**
     * Execute line following logic
     */
    //% block="start line following mode"
    //% subcategory="Activities"
    //% color="#249ed1"
    //% weight=40
    export function lineFollowActivity(): void {
        let L = pins.digitalReadPin(DigitalPin.P16)
        let R = pins.digitalReadPin(DigitalPin.P12)
        if (L == 0 && R == 0) {
            moveCar(Direction.Forward, _activitySpeed)
        } else if (L == 1 && R == 0) {
            moveCar(Direction.Left, _activityTurnSpeed)
        } else if (L == 0 && R == 1) {
            moveCar(Direction.Right, _activityTurnSpeed)
        } else {
            stop()
        }
    }

    /**
     * Obstacle Avoidance Mode
     */
    //% block="run avoid mode"
    //% subcategory="Activities"
    //% color="#249ed1"
    //% weight=30
    export function avoidActivity(): void {
        if (readUltrasonic() < _activityDistance) {
            moveCar(Direction.Left, _activityTurnSpeed)
            basic.showIcon(IconNames.Confused)
        } else {
            moveCar(Direction.Forward, _activitySpeed)
            basic.showIcon(IconNames.Happy)
        }
    }

    /**
     * Follow Mode
     */
    //% block="run follow mode"
    //% subcategory="Activities"
    //% color="#249ed1"
    //% weight=20
    export function followActivity(): void {
        if (readUltrasonic() < _activityDistance) {
            moveCar(Direction.Forward, _activitySpeed)
            basic.showIcon(IconNames.Happy)
        } else {
            stop()
            basic.showIcon(IconNames.Sad)
        }
    }

    /**
     * Fight Mode
     */
    //% block="run fight mode"
    //% subcategory="Activities"
    //% color="#249ed1"
    //% weight=10
    export function fightActivity(): void {
        if (readUltrasonic() < _activityDistance) {
            moveCar(Direction.Forward, _activitySpeed)
            basic.showIcon(IconNames.Angry)
        } else {
            moveCar(Direction.Left, _activityTurnSpeed)
            basic.pause(200)
            stop()
            basic.pause(200)
        }
    }
}
