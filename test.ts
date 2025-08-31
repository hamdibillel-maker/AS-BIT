input.onButtonPressed(Button.A, function () {
    asbit.move(asbit.MotorDir.Forward, 80)
    asbit.setRGB(asbit.RGBColors.Green)
})

input.onButtonPressed(Button.B, function () {
    asbit.move(asbit.MotorDir.Stop, 0)
    asbit.setRGB(asbit.RGBColors.Red)
})

basic.forever(function () {
    let d = asbit.ultrasonic()
    basic.showNumber(d)
})
