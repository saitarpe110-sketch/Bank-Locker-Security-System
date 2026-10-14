
module locker (
    input wire clk,
    input wire reset,
    input wire access_request,
    input wire [15:0] pin,
    output reg unlocked,
    output reg alarm,
    output reg lockout,
    output reg [1:0] failed_attempts
);

parameter [15:0] PIN_CODE = 16'h2580;

always @(posedge clk or posedge reset) begin
    if (reset) begin
        unlocked <= 1'b0;
        alarm <= 1'b0;
        lockout <= 1'b0;
        failed_attempts <= 2'd0;
    end
    else if (access_request && !lockout && !unlocked) begin
        if (pin == PIN_CODE) begin
            unlocked <= 1'b1;
            alarm <= 1'b0;
        end
        else begin
            alarm <= 1'b1;

            if (failed_attempts == 2'd2) begin
                failed_attempts <= 2'd3;
                lockout <= 1'b1;
            end
            else begin
                failed_attempts <= failed_attempts + 1'b1;
            end
        end
    end
end

endmodule
