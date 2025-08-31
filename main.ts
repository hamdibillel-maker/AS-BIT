// Define the namespace for the AS BIT extension.
// The block defines the name that appears in the MakeCode block category.
// The color and icon properties customize the category's appearance.
//% color="#FF9900" icon="\uf1b9" block="AS BIT"
namespace asbit {

    // --- PINOUT DEFINITIONS BASED ON YOUR ROBOT'S SCHEMATIC ---
    const BUZZER_PIN = DigitalPin.P9;
    const NEOPIXEL_PIN = DigitalPin.P6;
    const RGB_RED_PIN = DigitalPin.P5;
    const RGB_GREEN_PIN = DigitalPin.P4;
    const RGB_BLUE_PIN = DigitalPin.P3;
    const LEFT_MOTOR_SPEED_PIN = DigitalPin.P16;
    const LEFT_MOTOR_DIR_PIN = DigitalPin.P15;
    const RIGHT_MOTOR_SPEED_PIN = DigitalPin.P14;
    const RIGHT_MOTOR_DIR_PIN = DigitalPin.P13;

    // --- INTERNAL HELPERS ---
    
    // Internal function to control motors
    function setMotors(leftSpeed: number, rightSpeed: number): void {
        const leftDir = leftSpeed > 0 ? 1 : 0;
        const rightDir = rightSpeed > 0 ? 1 : 0;
        
        pins.digitalWritePin(LEFT_MOTOR_DIR_PIN, leftDir);
        pins.digitalWritePin(RIGHT_MOTOR_DIR_PIN, rightDir);

        pins.analogWritePin(LEFT_MOTOR_SPEED_PIN, Math.abs(leftSpeed));
        pins.analogWritePin(RIGHT_MOTOR_SPEED_PIN, Math.abs(rightSpeed));
    }

    /**
     * Starts the Bluetooth control loop for the AS BIT robot.
     * This block should be placed inside the forever loop.
     * It handles commands for movement, RGB, NeoPixel, and sound.
     */
    //% blockId="asbit_start_bluetooth_control" block="start Bluetooth control"
    //% weight=100 blockGap=8
    export function startBluetoothControl(): void {
        bluetooth.startUartService();
        bluetooth.onDataReceived(bluetooth.serialReadLine, function () {
            const command = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine));
            const parts = command.split(":");
            const mainCommand = parts[0];

            // Handle movement commands
            const speed = 1000; // Default speed for movement
            if (mainCommand === "forward") {
                setMotors(speed, speed);
            } else if (mainCommand === "backward") {
                setMotors(-speed, -speed);
            } else if (mainCommand === "left") {
                setMotors(-speed, speed);
            } else if (mainCommand === "right") {
                setMotors(speed, -speed);
            } else if (mainCommand === "stop") {
                setMotors(0, 0);
            }
            
            // Handle other commands with arguments
            if (parts.length > 1) {
                const args = parts[1].split(",");

                // Handle RGB command: rgb:R,G,B
                if (mainCommand === "rgb") {
                    const r = parseInt(args[0]);
                    const g = parseInt(args[1]);
                    const b = parseInt(args[2]);

                    pins.analogWritePin(RGB_RED_PIN, r);
                    pins.analogWritePin(RGB_GREEN_PIN, g);
                    pins.analogWritePin(RGB_BLUE_PIN, b);
                }
                
                // Handle NeoPixel command: neopixel:R,G,B
                if (mainCommand === "neopixel") {
                    const r = parseInt(args[0]);
                    const g = parseInt(args[1]);
                    const b = parseInt(args[2]);
                    
                    let strip = neopixel.create(NEOPIXEL_PIN, 1, NeoPixelMode.RGB);
                    strip.showColor(neopixel.rgb(r, g, b));
                }

                // Handle Buzzer command: buzzer:frequency
                if (mainCommand === "buzzer") {
                    const frequency = parseInt(args[0]);
                    music.playTone(frequency, music.beat(BeatFraction.Whole));
                }
            }
        });
    }

}
