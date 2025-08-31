// Demo: press A to go forward, B to stop
input.onButtonPressed(Button.A, function () {
    asbit.move(80, 80)
})

input.onButtonPressed(Button.B, function () {
    asbit.move(0, 0)
})
