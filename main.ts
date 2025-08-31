//% color="#0066CC" weight=20 icon="\uf1b9" block="AS BIT"
namespace asbit {

    // --- MOTOR PINS ---
    const LEFT_MOTOR_DIR_PIN = DigitalPin.P15
    const LEFT_MOTOR_SPEED_PIN = DigitalPin.P16
    const RIGHT_MOTOR_DIR_PIN = DigitalPin.P13
    const RIGHT_MOTOR_SPEED_PIN = DigitalPin.P14

    // --- BUZZER ---
    const BUZZER_PIN = DigitalPin.P9

    // --- NEOPIXEL ---
    let strip: neopixel.Strip = null

    // --- MOTOR DIRECTIONS ---
    export enum MotorDir {
        //% block="forward"
        Forward,
        //% block="backward"
        Backward
    }

    // --- RGB COLORS DIGITAL ---
    export enum Colors {
        //% block="red"
        Red,
        //% block="green"
        Green,
        //% block="blue"
        Blue,
        //% block="yellow"
        Yellow,
        //% block="magenta"
        Magenta,
        //% block="cyan"
        Cyan,
        //% block="white"
        White,
        //% block="off"
        Off
    }

    // ---------------- MOTOR CONTROL -----------------
    /**
     * Control both left and right motors with speed and direction
     * @param leftDir Direction of left motor
     * @param leftSpeed Speed of left motor 0-100
     * @param rightDir Direction of right motor
     * @param rightSpeed Speed of right motor 0-100
     */
    //% blockId="asbit_motor_control" block="left motor %leftDir at %leftSpeed \\% | right motor %rightDir at %rightSpeed \\%"
    //% leftSpeed.min=0 leftSpeed.max=100
    //% rightSpeed.min=0 rightSpeed.max=100
    //% weight=100 blockGap=8
    export function motorControl(
        leftDir: MotorDir, leftSpeed: number,
        rightDir: MotorDir, rightSpeed: number
    ): void {
        let l = leftDir == MotorDir.Backward ? -leftSpeed : leftSpeed
        let r = rightDir == MotorDir.Backward ? -rightSpeed : rightSpeed

        pins.digitalWritePin(LEFT_MOTOR_DIR_PIN, l >= 0 ? 1 : 0)
        pins.digitalWritePin(RIGHT_MOTOR_DIR_PIN, r >= 0 ? 1 : 0)
        pins.analogWritePin(LEFT_MOTOR_SPEED_PIN, Math.map(Math.abs(l), 0, 100, 0, 1023))
        pins.analogWritePin(RIGHT_MOTOR_SPEED_PIN, Math.map(Math.abs(r), 0, 100, 0, 1023))
    }

    // ---------------- LINE SENSORS -----------------
    export enum SensorPos {
        //% block="left"
        Left,
        //% block="right"
        Right,
        //% block="middle"
        Middle
    }

    export enum SensorType {
        //% block="digital"
        Digital,
        //% block="analog"
        Analog
    }

    /**
     * Read a line sensor
     */
    //% blockId="asbit_line_sensor" block="read %pos sensor as %type"
    //% weight=90
    export function readLineSensor(pos: SensorPos, type: SensorType): number {
        let pin: AnalogPin | DigitalPin
        switch (pos) {
            case SensorPos.Left: pin = AnalogPin.P13; break
            case SensorPos.Right: pin = AnalogPin.P14; break
            case SensorPos.Middle: pin = AnalogPin.P2; break
        }
        if (type == SensorType.Digital)
            return pins.digitalReadPin(pin)
        else
            return pins.analogReadPin(pin)
    }

    // ---------------- ULTRASONIC -----------------
    /**
     * Returns distance in cm from ultrasonic sensor
     */
    //% blockId="asbit_ultrasonic" block="ultrasonic distance(cm)"
    //% weight=88
    export function ultrasonic(): number {
        pins.setPull(DigitalPin.P16, PinPullMode.PullNone)
        pins.digitalWritePin(DigitalPin.P16, 0)
        control.waitMicros(2)
        pins.digitalWritePin(DigitalPin.P16, 1)
        control.waitMicros(10)
        pins.digitalWritePin(DigitalPin.P16, 0)
        let d = pins.pulseIn(DigitalPin.P15, PulseValue.High, 43200)
        return Math.floor(d / 40)
    }

    // ---------------- RGB LED -----------------
    /**
     * Set onboard RGB LEDs (digital)
     */
    //% blockId="asbit_set_rgb" block="set RGB to %color"
    //% weight=87
    export function setRGB(color: Colors): void {
        pins.digitalWritePin(DigitalPin.P3, 0)
        pins.digitalWritePin(DigitalPin.P4, 0)
        pins.digitalWritePin(DigitalPin.P5, 0)

        switch (color) {
            case Colors.Red: pins.digitalWritePin(DigitalPin.P5, 1); break
            case Colors.Green: pins.digitalWritePin(DigitalPin.P4, 1); break
            case Colors.Blue: pins.digitalWritePin(DigitalPin.P3, 1); break
            case Colors.Yellow: pins.digitalWritePin(DigitalPin.P4, 1); pins.digitalWritePin(DigitalPin.P5, 1); break
            case Colors.Magenta: pins.digitalWritePin(DigitalPin.P3, 1); pins.digitalWritePin(DigitalPin.P5, 1); break
            case Colors.Cyan: pins.digitalWritePin(DigitalPin.P3, 1); pins.digitalWritePin(DigitalPin.P4, 1); break
            case Colors.White: pins.digitalWritePin(DigitalPin.P3, 1); pins.digitalWritePin(DigitalPin.P4, 1); pins.digitalWritePin(DigitalPin.P5, 1); break
            case Colors.Off: break
        }
    }

    // ---------------- MUSIC -----------------
    /**
     * Redirect music to buzzer pin P9
     */
    //% blockId="asbit_set_buzzer" block="set music pin to buzzer"
    //% weight=86
    export function setBuzzer(): void {
        music.setBuiltInSpeakerEnabled(false)
        pins.analogSetPitchPin(BUZZER_PIN)
    }

    // ---------------- NEOPIXEL -----------------
    /**
     * Initialize neopixel on pin6 internally
     */
    export function initNeoPixel(): neopixel.Strip {
        if (!strip) {
            strip = neopixel.create(DigitalPin.P6, 7, NeoPixelMode.RGB)
        }
        return strip
    }
}
