// This is a test program to demonstrate the functionality of the
// "AS BIT" extension blocks.

// Import the ASBIT extension functions.
// This is automatically done in MakeCode once the extension is added.

// We will test the car control, RGB LED, and ultrasonic sensor blocks.
basic.forever(function () {
    // Test the car control blocks.
    // Move the car forward at a medium speed (50%).
    ASBIT.moveCar(ASBIT.CarDirection.Forward, 50);
    basic.pause(2000); // Wait for 2 seconds.

    // Stop the car.
    ASBIT.moveCar(ASBIT.CarDirection.Stop, 0);
    basic.pause(500); // Wait for half a second.

    // Test the RGB LED block.
    // Set the digital RGB LED to a unique color, for example, Magenta.
    ASBIT.setDigitalRGB(ASBIT.RGBColors.Magenta);
    basic.pause(1000); // Wait for 1 second.

    // Set the LED to another color.
    ASBIT.setDigitalRGB(ASBIT.RGBColors.Cyan);
    basic.pause(1000); // Wait for 1 second.
    
    // Turn the RGB LED off.
    ASBIT.setDigitalRGB(ASBIT.RGBColors.Off);
    basic.pause(500); // Wait for half a second.

    // Test the ultrasonic sensor block.
    // Get the distance in centimeters and display it on the Micro:bit's LED matrix.
    const distance = ASBIT.ultrasonicDistance();
    basic.showNumber(distance);
    basic.pause(1000); // Wait for a second.

    // Test the line follower block.
    // The car will follow a black line and stop when all three sensors
    // detect a black surface, indicating a checkpoint.
    basic.showString("Line Following...");
    ASBIT.followLineUntilCheckpoint(30);
    basic.showString("Checkpoint!");
    
    basic.pause(2000); // Wait for 2 seconds before repeating the loop.
})
