// Demo: A = forward, B = stop
input.onButtonPressed(Button.A, function () {
    asbit.move(80, 80)   // both motors forward
})
input.onButtonPressed(Button.B, function () {
    asbit.move(0, 0)     // stop
})
