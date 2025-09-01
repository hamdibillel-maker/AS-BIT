// This file is used to test the functions in the AS BIT extension.
// It is recommended to use the serial console for detailed output.

// === Test Sequence ===
// The test program will show an icon, then pause to give you time
// to place the robot in position for the next test.

basic.showString("Test Start");

// === Test 1: Car Movement ===
// The robot will move forward, backward, left, and right.
basic.showLeds(`
    . . # . .
    . # . # .
    # # # # #
    . # . # .
    . . # . .
`);
basic.pause(1000);
asbit.car_run(asbit.CarDirection.Forward, 50);
basic.pause(1000);
asbit.car_stop();
basic.pause(500);

asbit.car_run(asbit.CarDirection.Backward, 50);
basic.pause(1000);
asbit.car_stop();
basic.pause(500);

asbit.car_run(asbit.CarDirection.SpinLeft, 50);
basic.pause(1000);
asbit.car_stop();
basic.pause(500);

asbit.car_run(asbit.CarDirection.SpinRight, 50);
basic.pause(1000);
asbit.car_stop();
basic.pause(500);

// === Test 2: Ultrasonic Sensor and Obstacle Avoidance ===
// The robot will move forward, and if it detects an obstacle, it will stop and show a sad face.
// You will need to manually move an object in front of the ultrasonic sensor to test this.
basic.showString("Test Ultra");
basic.showIcon(IconNames.Happy);
asbit.avoidObstacles(50, 20); // Avoid obstacles closer than 20cm

// This part of the code will not be reached as the loop in avoidObstacles is infinite.
// For a complete test sequence, you would need to stop this loop, for example, using a radio signal or button press.
// This is an example of a simple test.
