basic.showString("AS BIT")

// -------- CAR CONTROL TEST --------
basic.forever(function () {
    // Move forward at 50%
    asbit.move(asbit.MotorDir.Forward, 50)
    basic.pause(1000)

    // Move backward at 50%
    asbit.move(asbit.MotorDir.Backward, 50)
    basic.pause(1000)

    // Spin left at 50%
    asbit.move(asbit.MotorDir.SpinLeft, 50)
    basic.pause(1000)

    // Spin right at 50%
    asbit.move(asbit.MotorDir.SpinRight, 50)
    basic.pause(1000)

    // Stop
    asbit.move(asbit.MotorDir.Stop, 0)
    basic.pause(500)
})

// -------- INDIVIDUAL MOTOR CONTROL TEST --------
basic.forever(function () {
    asbit.motorControl(asbit.MotorDir.Forward, 70, asbit.MotorDir.Backward, 30)
    basic.pause(1000)
    asbit.motorControl(asbit.MotorDir.Backward, 50, asbit.MotorDir.Forward, 50)
    basic.pause(1000)
})

// -------- IR SENSORS TEST --------
basic.forever(function () {
    let left = asbit.readIRAnalog(asbit.IRSensor.Left)
    let middle = asbit.readIRAnalog(asbit.IRSensor.Middle)
    let right = asbit.readIRAnalog(asbit.IRSensor.Right)
    serial.writeLine("IR Analog L:" + left + " M:" + middle + " R:" + right)
    basic.pause(1000)

    let dleft = asbit.readIRDigital(asbit.IRSensor.Left)
    let dmiddle = asbit.readIRDigital(asbit.IRSensor.Middle)
    let dright = asbit.readIRDigital(asbit.IRSensor.Right)
    serial.writeLine("IR Digital L:" + dleft + " M:" + dmiddle + " R:" + dright)
    basic.pause(1000)
})

// -------- ULTRASONIC TEST --------
basic.forever(function () {
    let dist = asbit.ultrasonic()
    serial.writeLine("Distance: " + dist + " cm")
    basic.pause(1000)
})

// -------- DIGITAL RGB LED TEST --------
basic.forever(function () {
    asbit.setRGB(asbit.RGBColors.Red)
    basic.pause(500)
    asbit.setRGB(asbit.RGBColors.Green)
    basic.pause(500)
    asbit.setRGB(asbit.RGBColors.Blue)
    basic.pause(500)
    asbit.setRGB(asbit.RGBColors.Yellow)
    basic.pause(500)
    asbit.setRGB(asbit.RGBColors.Magenta)
    basic.pause(500)
    asbit.setRGB(asbit.RGBColors.Cyan)
    basic.pause(500)
    asbit.setRGB(asbit.RGBColors.White)
    basic.pause(500)
    asbit.setRGB(asbit.RGBColors.Off)
    basic.pause(500)
})

// -------- NEOPIXEL TEST --------
asbit.initNeoPixel()

basic.forever(function () {
    // Set each LED individually
    for (let i = 0; i < 7; i++) {
        asbit.setNeoPixelSingle(i, asbit.NeoPixelColor.Red)
        basic.pause(200)
    }

    // Set all LEDs to green
    asbit.setNeoPixelAll(asbit.NeoPixelColor.Green)
    basic.pause(1000)

    // Animation: Rainbow
    asbit.neoPixelAnimation(asbit.NeoPixelMode.Rainbow)
    basic.pause(2000)

    // Animation: Pulse
    asbit.neoPixelAnimation(asbit.NeoPixelMode.Pulse)
    basic.pause(2000)

    // Animation: Sparkle
    asbit.neoPixelAnimation(asbit.NeoPixelMode.Sparkle)
    basic.pause(2000)

    // Animation: Color wipe
    asbit.neoPixelAnimation(asbit.NeoPixelMode.ColorWipe)
    basic.pause(2000)

    // Animation: Scan
    asbit.neoPixelAnimation(asbit.NeoPixelMode.Scan)
    basic.pause(2000)

    // Turn off
    asbit.neoPixelAnimation(asbit.NeoPixelMode.Off)
    basic.pause(1000)
})
