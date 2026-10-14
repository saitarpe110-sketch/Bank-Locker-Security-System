
`timescale 1ns/1ps

module locker_tb;

reg clk;
reg reset;
reg access_request;
reg [15:0] pin;

wire unlocked;
wire alarm;
wire lockout;
wire [1:0] failed_attempts;

locker uut (
    .clk(clk),
    .reset(reset),
    .access_request(access_request),
    .pin(pin),
    .unlocked(unlocked),
    .alarm(alarm),
    .lockout(lockout),
    .failed_attempts(failed_attempts)
);

always #5 clk = ~clk;

task try_pin;
    input [15:0] entered_pin;
    begin
        @(negedge clk);
        pin = entered_pin;
        access_request = 1'b1;

        @(negedge clk);
        access_request = 1'b0;

        #1;
        $display(
            "Time=%0t PIN=%h | Unlocked=%b | Alarm=%b | Lockout=%b | Failed=%d",
            $time, entered_pin, unlocked, alarm, lockout,
            failed_attempts
        );
    end
endtask

task reset_system;
    begin
        @(negedge clk);
        reset = 1'b1;
        access_request = 1'b0;
        pin = 16'h0000;

        @(negedge clk);
        reset = 1'b0;
        #1;

        $display("\n--- SYSTEM RESET ---");
    end
endtask

initial begin
    clk = 0;
    reset = 0;
    access_request = 0;
    pin = 0;

    $display("BANK LOCKER SECURITY SYSTEM");
    $display("----------------------------");

    reset_system();

    $display("\nTEST 1: CORRECT PIN");
    try_pin(16'h2580);

    if (unlocked)
        $display("PASS: Locker unlocked successfully.");
    else
        $display("FAIL: Locker did not unlock.");

    reset_system();

    $display("\nTEST 2: THREE INCORRECT ATTEMPTS");
    try_pin(16'h1111);
    try_pin(16'h2222);
    try_pin(16'h3333);

    if (lockout && alarm && !unlocked)
        $display("PASS: Security lockout activated.");
    else
        $display("FAIL: Lockout test failed.");

    reset_system();

    $display("\nTEST 3: SYSTEM RESET");
    if (!lockout && !unlocked && failed_attempts == 0)
        $display("PASS: System reset successfully.");
    else
        $display("FAIL: Reset test failed.");

    $display("\nSIMULATION COMPLETED.");
    $finish;
end

endmodule
