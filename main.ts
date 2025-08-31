// Define the namespace for the AS BIT extension.
// The block defines the name that appears in the MakeCode block category.
// The color and icon properties customize the category's appearance.
//% color="#FF9900" icon="\uf1b6" block="AS BIT"
namespace asbit {
    
    // Motor pin definitions based on assumptions.
    const LEFT_MOTOR_SPEED = DigitalPin.P8;
    const LEFT_MOTOR_DIR = DigitalPin.P12;
    const RIGHT_MOTOR_SPEED = DigitalPin.P13;
    const RIGHT_MOTOR_DIR = DigitalPin.P14;

    // An enumeration for motor directions, which will create a dropdown menu.
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

    /**
     * Moves the robot in a specified direction.
     * @param dir The direction to move.
     * @param speed The motor speed from 0 (off) to 100 (full speed).
     */
    //% blockId="asbit_motor_control" block="move %dir at speed %speed"
    //% speed.min=0 speed.max=100
    //% weight=100 blockGap=8
    export function move(dir: Direction, speed: number): void {
        let leftSpeed = 0;
        let rightSpeed = 0;

        // Convert speed from 0-100 to 0-1023 for analogWritePin.
        const motorSpeed = Math.map(speed, 0, 100, 0, 1023);

        if (dir === Direction.Forward) {
            pins.digitalWritePin(LEFT_MOTOR_DIR, 1);
            pins.digitalWritePin(RIGHT_MOTOR_DIR, 1);
            leftSpeed = motorSpeed;
            rightSpeed = motorSpeed;
        } else if (dir === Direction.Backward) {
            pins.digitalWritePin(LEFT_MOTOR_DIR, 0);
            pins.digitalWritePin(RIGHT_MOTOR_DIR, 0);
            leftSpeed = motorSpeed;
            rightSpeed = motorSpeed;
        } else if (dir === Direction.Left) {
            pins.digitalWritePin(LEFT_MOTOR_DIR, 0); // Reverse left motor
            pins.digitalWritePin(RIGHT_MOTOR_DIR, 1); // Forward right motor
            leftSpeed = motorSpeed;
            rightSpeed = motorSpeed;
        } else if (dir === Direction.Right) {
            pins.digitalWritePin(LEFT_MOTOR_DIR, 1); // Forward left motor
            pins.digitalWritePin(RIGHT_MOTOR_DIR, 0); // Reverse right motor
            leftSpeed = motorSpeed;
            rightSpeed = motorSpeed;
        }
        
        pins.analogWritePin(LEFT_MOTOR_SPEED, leftSpeed);
        pins.analogWritePin(RIGHT_MOTOR_SPEED, rightSpeed);
    }

    /**
     * Stops all motors on the robot.
     */
    //% blockId="asbit_stop_motors" block="stop all motors"
    //% weight=90
    export function stop(): void {
        pins.digitalWritePin(LEFT_MOTOR_DIR, 0);
        pins.digitalWritePin(RIGHT_MOTOR_DIR, 0);
        pins.analogWritePin(LEFT_MOTOR_SPEED, 0);
        pins.analogWritePin(RIGHT_MOTOR_SPEED, 0);
    }
    
    // An enumeration for the robot's sensors.
    export enum Sensor {
        //% block="left sensor"
        Left,
        //% block="right sensor"
        Right
    }

    /**
     * Reads the value from a specified sensor.
     * @param sensor The sensor to read.
     */
    //% blockId="asbit_read_sensor" block="read %sensor value"
    //% weight=80
    export function readSensor(sensor: Sensor): number {
        if (sensor === Sensor.Left) {
            return pins.analogReadPin(AnalogPin.P0);
        } else {
            return pins.analogReadPin(AnalogPin.P1);
        }
    }
}
