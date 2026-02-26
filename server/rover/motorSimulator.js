// ─── Zephyra Motor Simulator ───────────────────────────────────────
// Simulates 8 DC motors (4 left bank, 4 right bank).
// Each motor tracks speed, direction, and operational status.

const MOTOR_COUNT = 8;

function createMotor(id, label, bank) {
    return {
        id,
        label,
        bank, // 'LEFT' or 'RIGHT'
        speed: 0,
        direction: 'STOPPED', // FORWARD, BACKWARD, STOPPED
        status: 'OK', // OK, WARNING, FAULT
    };
}

function createMotors() {
    return [
        createMotor(0, 'L-Front-Upper', 'LEFT'),
        createMotor(1, 'L-Front-Lower', 'LEFT'),
        createMotor(2, 'L-Rear-Upper', 'LEFT'),
        createMotor(3, 'L-Rear-Lower', 'LEFT'),
        createMotor(4, 'R-Front-Upper', 'RIGHT'),
        createMotor(5, 'R-Front-Lower', 'RIGHT'),
        createMotor(6, 'R-Rear-Upper', 'RIGHT'),
        createMotor(7, 'R-Rear-Lower', 'RIGHT'),
    ];
}

let motors = createMotors();

/**
 * Set motor speeds/directions based on a high-level movement command.
 * Uses differential drive logic for turning.
 */
function setMotors(direction, speed = 0) {
    const s = Math.min(255, Math.max(0, speed));

    switch (direction) {
        case 'FORWARD':
            motors.forEach((m) => { m.speed = s; m.direction = 'FORWARD'; });
            break;
        case 'BACKWARD':
            motors.forEach((m) => { m.speed = s; m.direction = 'BACKWARD'; });
            break;
        case 'LEFT':
            // Differential turn: right motors forward, left motors backward (slower)
            motors.forEach((m) => {
                if (m.bank === 'LEFT') { m.speed = Math.round(s * 0.3); m.direction = 'BACKWARD'; }
                else { m.speed = s; m.direction = 'FORWARD'; }
            });
            break;
        case 'RIGHT':
            // Differential turn: left motors forward, right motors backward (slower)
            motors.forEach((m) => {
                if (m.bank === 'RIGHT') { m.speed = Math.round(s * 0.3); m.direction = 'BACKWARD'; }
                else { m.speed = s; m.direction = 'FORWARD'; }
            });
            break;
        default:
            stopAll();
            break;
    }
}

function stopAll() {
    motors.forEach((m) => { m.speed = 0; m.direction = 'STOPPED'; });
}

function getMotors() {
    return motors.map((m) => ({ ...m }));
}

function resetMotors() {
    motors = createMotors();
}

function setMotorFault(motorId) {
    if (motors[motorId]) {
        motors[motorId].status = 'FAULT';
        motors[motorId].speed = 0;
        motors[motorId].direction = 'STOPPED';
    }
}

module.exports = { setMotors, stopAll, getMotors, resetMotors, setMotorFault, MOTOR_COUNT };
