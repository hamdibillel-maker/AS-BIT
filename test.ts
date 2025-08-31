// Demo program for AS BIT extension

basic.showString("AS BIT")

input.onButtonPressed(Button.A, function () {
    asbit.move(asbit.Motors.Forward, 80)
})

input.onButtonPressed(Button.B, function () {
    asbit.move(asbit.Motors.Backward, 80)
})

input.onButtonPressed(Button.AB, function () {
    asbit.setRGBDigital(asbit.RGB_Colors.Red)
    asbit.playTone(440, 500)
})

basic.forever(function () {
    if (input.logoIsPressed()) {
        asbit.move(asbit.Motors.Stop, 0)
        asbit.setRGBDigital(asbit.RGB_Colors.Off)
    }
})
