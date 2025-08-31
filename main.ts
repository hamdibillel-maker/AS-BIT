//% color=#FF6600 icon="\uf1b9" block="AS BIT"
namespace asbit {

    // ---------------- PINS ----------------
    const LEFT_MOTOR_SPEED_PIN = AnalogPin.P16
    const LEFT_MOTOR_DIR_PIN = DigitalPin.P15
    const RIGHT_MOTOR_SPEED_PIN = AnalogPin.P14
    const RIGHT_MOTOR_DIR_PIN = DigitalPin.P13

    const TRIG_PIN = DigitalPin.P8
    const ECHO_PIN = DigitalPin.P12

    const RGB_RED_PIN = DigitalPin.P5
    const RGB_GREEN_PIN = DigitalPin.P4
    const RGB_BLUE_PIN = DigitalPin.P3

    const IR_LEFT = AnalogPin.P0
    const IR_MIDDLE = AnalogPin.P1
    const IR_RIGHT = AnalogPin.P2

    const NEOPIXEL_PIN = DigitalPin.P6
    const NEOPIXEL_LEN = 7
    let strip: neopixel.Strip = null

    // ---------------- MOTOR ----------------
    export enum MotorDir {
        //% block="forward"
        Forward,
        //% block="backward"
        Backward
    }

    /**
     * Tall block: control both motors speed & direction
     */
    //% blockId=asbit_motor_control_full block="left motor %leftDir at %leftSpeed \\% right motor %rightDir at %rightSpeed \\%"
    //% leftSpeed.min=0 leftSpeed.max=100
    //% rightSpeed.min=0 rightSpeed.max=100
    //% group="Car Control"
    export function motorControlFull(
        leftDir: MotorDir, leftSpeed: number,
        rightDir: MotorDir, rightSpeed: number
    ): void {
        let l = leftDir == MotorDir.Backward ? -leftSpeed : leftSpeed
        let r = rightDir == MotorDir.Backward ? -rightSpeed : rightSpeed

        const leftPinDir = l >= 0 ? 1 : 0
        const rightPinDir = r >= 0 ? 1 : 0

        pins.digitalWritePin(LEFT_MOTOR_DIR_PIN, leftPinDir)
        pins.digitalWritePin(RIGHT_MOTOR_DIR_PIN, rightPinDir)
        pins.analogWritePin(LEFT_MOTOR_SPEED_PIN, Math.map(Math.abs(l), 0, 100, 0, 1023))
        pins.analogWritePin(RIGHT_MOTOR_SPEED_PIN, Math.map(Math.abs(r), 0, 100, 0, 1023))
    }

    // ---------------- CAR CONTROL ----------------
    export enum MotorMove {
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
     * Move robot in a direction at given percentage speed.
     */
    //% blockId=asbit_move block="move %dir at %speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Car Control"
    export function move(dir: MotorMove, speed: number): void {
        let left = 0
        let right = 0
        let displayText = ""
        switch(dir){
            case MotorMove.Forward: left=speed; right=speed; displayText="F"; break
            case MotorMove.Backward: left=-speed; right=-speed; displayText="B"; break
            case MotorMove.Left: left=0; right=speed; displayText="L"; break
            case MotorMove.Right: left=speed; right=0; displayText="R"; break
            case MotorMove.SpinLeft: left=-speed; right=speed; displayText="SL"; break
            case MotorMove.SpinRight: left=speed; right=-speed; displayText="SR"; break
            case MotorMove.Stop: left=0; right=0; displayText="S"; break
        }
        pins.digitalWritePin(LEFT_MOTOR_DIR_PIN, left>=0?1:0)
        pins.digitalWritePin(RIGHT_MOTOR_DIR_PIN, right>=0?1:0)
        pins.analogWritePin(LEFT_MOTOR_SPEED_PIN, Math.map(Math.abs(left),0,100,0,1023))
        pins.analogWritePin(RIGHT_MOTOR_SPEED_PIN, Math.map(Math.abs(right),0,100,0,1023))
        basic.showString(displayText)
    }

    // ---------------- IR SENSORS ----------------
    export enum IRSensor {
        //% block="left"
        Left,
        //% block="middle"
        Middle,
        //% block="right"
        Right
    }

    //% blockId=asbit_read_ir_analog block="read %sensor IR analog"
    //% group="Sensors"
    export function readIRAnalog(sensor:IRSensor):number{
        switch(sensor){
            case IRSensor.Left: return pins.analogReadPin(IR_LEFT)
            case IRSensor.Middle: return pins.analogReadPin(IR_MIDDLE)
            case IRSensor.Right: return pins.analogReadPin(IR_RIGHT)
        }
        return 0
    }

    //% blockId=asbit_read_ir_digital block="read %sensor IR digital"
    //% group="Sensors"
    export function readIRDigital(sensor:IRSensor):number{
        switch(sensor){
            case IRSensor.Left: return pins.digitalReadPin(<DigitalPin><number>IR_LEFT)
            case IRSensor.Middle: return pins.digitalReadPin(<DigitalPin><number>IR_MIDDLE)
            case IRSensor.Right: return pins.digitalReadPin(<DigitalPin><number>IR_RIGHT)
        }
        return 0
    }

    // ---------------- ULTRASONIC ----------------
    //% blockId=asbit_ultrasonic block="ultrasonic distance (cm)"
    //% group="Sensors"
    export function ultrasonic():number{
        pins.digitalWritePin(TRIG_PIN,0)
        control.waitMicros(2)
        pins.digitalWritePin(TRIG_PIN,1)
        control.waitMicros(10)
        pins.digitalWritePin(TRIG_PIN,0)
        let d=pins.pulseIn(ECHO_PIN,PulseValue.High,25000)
        return Math.idiv(d,58)
    }

    // ---------------- DIGITAL RGB LED ----------------
    export enum RGBColors {
        //% block="red"
        Red,
        //% block="green"
        Green,
        //% block="blue"
        Blue,
        //% block="yellow"
        Yellow,
        //% block="cyan"
        Cyan,
        //% block="magenta"
        Magenta,
        //% block="white"
        White,
        //% block="off"
        Off
    }

    //% blockId=asbit_rgb block="set RGB color to %color"
    //% group="RGB Control"
    export function setRGB(color: RGBColors){
        pins.digitalWritePin(RGB_RED_PIN,0)
        pins.digitalWritePin(RGB_GREEN_PIN,0)
        pins.digitalWritePin(RGB_BLUE_PIN,0)
        switch(color){
            case RGBColors.Red: pins.digitalWritePin(RGB_RED_PIN,1); break
            case RGBColors.Green: pins.digitalWritePin(RGB_GREEN_PIN,1); break
            case RGBColors.Blue: pins.digitalWritePin(RGB_BLUE_PIN,1); break
            case RGBColors.Yellow: pins.digitalWritePin(RGB_RED_PIN,1); pins.digitalWritePin(RGB_GREEN_PIN,1); break
            case RGBColors.Cyan: pins.digitalWritePin(RGB_GREEN_PIN,1); pins.digitalWritePin(RGB_BLUE_PIN,1); break
            case RGBColors.Magenta: pins.digitalWritePin(RGB_RED_PIN,1); pins.digitalWritePin(RGB_BLUE_PIN,1); break
            case RGBColors.White: pins.digitalWritePin(RGB_RED_PIN,1); pins.digitalWritePin(RGB_GREEN_PIN,1); pins.digitalWritePin(RGB_BLUE_PIN,1); break
            case RGBColors.Off: break
        }
    }

    // ---------------- NEOPIXEL ----------------
    export enum NeoPixelColor {
        //% block="red"
        Red,
        //% block="green"
        Green,
        //% block="blue"
        Blue,
        //% block="yellow"
        Yellow,
        //% block="cyan"
        Cyan,
        //% block="magenta"
        Magenta,
        //% block="white"
        White,
        //% block="off"
        Off
    }

    export enum NeoPixelMode {
        //% block="off"
        Off,
        //% block="color wipe"
        ColorWipe,
        //% block="rainbow"
        Rainbow,
        //% block="pulse"
        Pulse,
        //% block="sparkle"
        Sparkle,
        //% block="scan"
        Scan
    }

    //% blockId=asbit_neopixel_init block="initialize NeoPixel"
    //% group="NeoPixel"
    export function initNeoPixel():void{
        if (!strip) {
            strip = neopixel.create(NEOPIXEL_PIN, NEOPIXEL_LEN, NeoPixelMode.RGB)
        }
    }

    //% blockId=asbit_neopixel_set_single block="set NeoPixel LED %index color to %color"
    //% index.min=0 index.max=6
    //% group="NeoPixel"
    export function setNeoPixelSingle(index:number, color:NeoPixelColor){
        if(!strip) initNeoPixel()
        switch(color){
            case NeoPixelColor.Red: strip.setPixelColor(index, neopixel.colors(NeoPixelColors.Red)); break
            case NeoPixelColor.Green: strip.setPixelColor(index, neopixel.colors(NeoPixelColors.Green)); break
            case NeoPixelColor.Blue: strip.setPixelColor(index, neopixel.colors(NeoPixelColors.Blue)); break
            case NeoPixelColor.Yellow: strip.setPixelColor(index, neopixel.colors(NeoPixelColors.Yellow)); break
            case NeoPixelColor.Cyan: strip.setPixelColor(index, neopixel.colors(NeoPixelColors.Cyan)); break
            case NeoPixelColor.Magenta: strip.setPixelColor(index, neopixel.colors(NeoPixelColors.Magenta)); break
            case NeoPixelColor.White: strip.setPixelColor(index, neopixel.colors(NeoPixelColors.White)); break
            case NeoPixelColor.Off: strip.setPixelColor(index, neopixel.colors(NeoPixelColors.Black)); break
        }
        strip.show()
    }

    //% blockId=asbit_neopixel_set_all block="set all NeoPixels to %color"
    //% group="NeoPixel"
    export function setNeoPixelAll(color:NeoPixelColor){
        if(!strip) initNeoPixel()
        switch(color){
            case NeoPixelColor.Red: strip.showColor(neopixel.colors(NeoPixelColors.Red)); break
            case NeoPixelColor.Green: strip.showColor(neopixel.colors(NeoPixelColors.Green)); break
            case NeoPixelColor.Blue: strip.showColor(neopixel.colors(NeoPixelColors.Blue)); break
            case NeoPixelColor.Yellow: strip.showColor(neopixel.colors(NeoPixelColors.Yellow)); break
            case NeoPixelColor.Cyan: strip.showColor(neopixel.colors(NeoPixelColors.Cyan)); break
            case NeoPixelColor.Magenta: strip.showColor(neopixel.colors(NeoPixelColors.Magenta)); break
            case NeoPixelColor.White: strip.showColor(neopixel.colors(NeoPixelColors.White)); break
            case NeoPixelColor.Off: strip.clear(); strip.show(); break
        }
    }

    //% blockId=asbit_neopixel_animation block="NeoPixel animation %mode"
    //% group="NeoPixel"
    export function neoPixelAnimation(mode:NeoPixelMode){
        if(!strip) initNeoPixel()
        switch(mode){
            case NeoPixelMode.Off: strip.clear(); strip.show(); break
            case NeoPixelMode.Rainbow: strip.showRainbow(1,360); break
            case NeoPixelMode.Pulse:
                for(let b=0;b<255;b+=15){
                    strip.setBrightness(b)
                    strip.showColor(neopixel.colors(NeoPixelColors.White))
                    basic.pause(50)
                }
                for(let b=255;b>0;b-=15){
                    strip.setBrightness(b)
                    strip.showColor(neopixel.colors(NeoPixelColors.White))
                    basic.pause(50)
                }
                break
            case NeoPixelMode.Sparkle:
                for(let i=0;i<strip.length();i++){
                    strip.setPixelColor(Math.randomRange(0,strip.length()-1), neopixel.colors(NeoPixelColors.White))
                    strip.show()
                    basic.pause(100)
                }
                break
            case NeoPixelMode.ColorWipe:
                for(let i=0;i<strip
