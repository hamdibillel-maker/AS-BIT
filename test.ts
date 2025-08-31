// Tests the basic functionality of the AS BIT extension blocks.

// This test script is run in the simulator to ensure the blocks function as expected.
basic.forever(function () {
    // Test the motor control blocks.
    asbit.move(asbit.Direction.Forward, 50);
    basic.pause(2000); // Wait for 2 seconds
    asbit.stop();
    basic.pause(1000); // Wait for 1 second

    asbit.move(asbit.Direction.Left, 75);
    basic.pause(2000); // Wait for 2 seconds
    asbit.stop();
    basic.pause(1000); // Wait for 1 second

    // Test the sensor reading block.
    // The simulator will show "0" since there's no real sensor, but this
    // verifies the block's existence and ability to return a value.
    let leftSensorValue = asbit.readSensor(asbit.Sensor.Left);
    let rightSensorValue = asbit.readSensor(asbit.Sensor.Right);
    
    serial.writeLine("Left Sensor value: " + leftSensorValue);
    serial.writeLine("Right Sensor value: " + rightSensorValue);

    basic.pause(2000); // Wait for 2 seconds
});
