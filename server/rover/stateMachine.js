// ─── FAB_05 v2 — Delivery State Machine ──────────────────────────
// 9-state deterministic FSM for autonomous delivery missions.

const STATES = {
  IDLE: 'IDLE',
  NAVIGATING: 'NAVIGATING',
  ARRIVED: 'ARRIVED',
  WAITING_FOR_USER: 'WAITING_FOR_USER',
  DELIVERY_WINDOW: 'DELIVERY_WINDOW',
  RETURNING_HOME: 'RETURNING_HOME',
  MANUAL_CONTROL: 'MANUAL_CONTROL',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR',
};

const COMMANDS = {
  START_MISSION: 'START_MISSION',
  ARRIVE: 'ARRIVE',
  NOTIFY_USER: 'NOTIFY_USER',
  OPEN_COMPARTMENT: 'OPEN_COMPARTMENT',
  CLOSE_COMPARTMENT: 'CLOSE_COMPARTMENT',
  TIMEOUT: 'TIMEOUT',
  RETURN: 'RETURN',
  MANUAL_OVERRIDE: 'MANUAL_OVERRIDE',
  MANUAL_MOVE: 'MANUAL_MOVE',
  STOP: 'STOP',
  RESET: 'RESET',
  ERROR: 'ERROR',
};

// Transition table: { [currentState]: { [command]: nextState } }
const TRANSITIONS = {
  [STATES.IDLE]: {
    [COMMANDS.START_MISSION]: STATES.NAVIGATING,
    [COMMANDS.MANUAL_OVERRIDE]: STATES.MANUAL_CONTROL,
  },
  [STATES.NAVIGATING]: {
    [COMMANDS.ARRIVE]: STATES.ARRIVED,
    [COMMANDS.MANUAL_OVERRIDE]: STATES.MANUAL_CONTROL,
  },
  [STATES.ARRIVED]: {
    [COMMANDS.NOTIFY_USER]: STATES.WAITING_FOR_USER,
    [COMMANDS.MANUAL_OVERRIDE]: STATES.MANUAL_CONTROL,
  },
  [STATES.WAITING_FOR_USER]: {
    [COMMANDS.OPEN_COMPARTMENT]: STATES.DELIVERY_WINDOW,
    [COMMANDS.TIMEOUT]: STATES.RETURNING_HOME,
    [COMMANDS.RETURN]: STATES.RETURNING_HOME,
    [COMMANDS.MANUAL_OVERRIDE]: STATES.MANUAL_CONTROL,
  },
  [STATES.DELIVERY_WINDOW]: {
    [COMMANDS.CLOSE_COMPARTMENT]: STATES.COMPLETED,
    [COMMANDS.MANUAL_OVERRIDE]: STATES.MANUAL_CONTROL,
  },
  [STATES.RETURNING_HOME]: {
    [COMMANDS.ARRIVE]: STATES.IDLE,
    [COMMANDS.MANUAL_OVERRIDE]: STATES.MANUAL_CONTROL,
  },
  [STATES.MANUAL_CONTROL]: {
    [COMMANDS.STOP]: STATES.IDLE,
    [COMMANDS.MANUAL_MOVE]: STATES.MANUAL_CONTROL, // stay in manual
  },
  [STATES.COMPLETED]: {
    [COMMANDS.RESET]: STATES.IDLE,
  },
  [STATES.ERROR]: {
    [COMMANDS.RESET]: STATES.IDLE,
  },
};

/**
 * Attempt a state transition.
 */
function transition(currentState, command) {
  if (command === COMMANDS.ERROR) {
    return { valid: true, newState: STATES.ERROR };
  }

  const stateTransitions = TRANSITIONS[currentState];
  if (!stateTransitions) {
    return { valid: false, newState: currentState, error: `Unknown state: ${currentState}` };
  }

  const nextState = stateTransitions[command];
  if (!nextState) {
    return { valid: false, newState: currentState, error: `Invalid transition: ${currentState} → ${command}` };
  }

  return { valid: true, newState: nextState };
}

function getValidCommands(state) {
  const commands = Object.keys(TRANSITIONS[state] || {});
  commands.push(COMMANDS.ERROR);
  return commands;
}

module.exports = { STATES, COMMANDS, TRANSITIONS, transition, getValidCommands };

