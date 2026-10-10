// Application Entry Point & Event Wiring
import {
  createInitialState,
  executeForkSyscall,
  stepSimulator,
  stepParentProcess,
  stepChildProcess,
  cloneState
} from './state.js';
import { SimulatorUI } from './ui.js';

class ForkPlaygroundApp {
  constructor() {
    this.ui = new SimulatorUI();
    this.history = [];
    this.runTimer = null;
    this.speedMs = 650;

    this.init();
  }

  init() {
    this.resetSimulation();
    this.bindEvents();
  }

  getCurrentState() {
    return this.history[this.history.length - 1];
  }

  pushState(newState) {
    this.history.push(newState);
    this.render();
  }

  render() {
    const currentState = this.getCurrentState();
    const canStepBack = this.history.length > 1;
    this.ui.render(currentState, canStepBack);
  }

  resetSimulation() {
    this.stopAutoRun();
    const scheduleMode = this.ui.elements.selectSchedule.value;
    const initialState = createInitialState(scheduleMode);
    this.history = [initialState];
    this.render();
  }

  stepBack() {
    if (this.history.length > 1) {
      this.stopAutoRun();
      this.history.pop();
      this.render();
    }
  }

  step() {
    const current = this.getCurrentState();
    if (current.isFinished) {
      this.stopAutoRun();
      return;
    }
    const nextState = stepSimulator(current);
    if (nextState !== current) {
      this.pushState(nextState);
    }
  }

  stepParent() {
    this.stopAutoRun();
    const current = this.getCurrentState();
    if (!current.isForkExecuted) {
      const next = executeForkSyscall(current, current.scheduleMode === 'schedule-failure');
      this.pushState(next);
      return;
    }
    const parentCanRun = current.parent.state === 'RUNNING' || current.parent.state === 'RUNNABLE';
    if (parentCanRun) {
      const next = stepParentProcess(current);
      this.pushState(next);
    }
  }

  stepChild() {
    this.stopAutoRun();
    const current = this.getCurrentState();
    const childCanRun = current.child.created && (current.child.state === 'RUNNING' || current.child.state === 'RUNNABLE');
    if (childCanRun) {
      const next = stepChildProcess(current);
      this.pushState(next);
    }
  }

  startAutoRun() {
    const current = this.getCurrentState();
    if (current.isFinished) return;

    this.ui.elements.btnRun.style.display = 'none';
    this.ui.elements.btnPause.style.display = 'inline-flex';

    this.runTimer = setInterval(() => {
      const state = this.getCurrentState();
      if (state.isFinished) {
        this.stopAutoRun();
        return;
      }
      this.step();
    }, this.speedMs);
  }

  stopAutoRun() {
    if (this.runTimer) {
      clearInterval(this.runTimer);
      this.runTimer = null;
    }
    this.ui.elements.btnRun.style.display = 'inline-flex';
    this.ui.elements.btnPause.style.display = 'none';
  }

  bindEvents() {
    const el = this.ui.elements;

    // Header toolbar buttons
    el.btnReset.addEventListener('click', () => this.resetSimulation());
    el.btnStepBack.addEventListener('click', () => this.stepBack());
    el.btnStep.addEventListener('click', () => {
      this.stopAutoRun();
      this.step();
    });
    el.btnRun.addEventListener('click', () => this.startAutoRun());
    el.btnPause.addEventListener('click', () => this.stopAutoRun());

    // Schedule dropdown change
    el.selectSchedule.addEventListener('change', () => this.resetSimulation());

    // Speed dropdown change
    el.selectSpeed.addEventListener('change', (e) => {
      this.speedMs = parseInt(e.target.value, 10);
      if (this.runTimer) {
        this.stopAutoRun();
        this.startAutoRun();
      }
    });

    // Lane direct process stepping buttons (User selects which process runs next)
    el.btnStepParent.addEventListener('click', () => this.stepParent());
    el.btnStepChild.addEventListener('click', () => this.stepChild());

    // Console clear
    el.btnClearConsole.addEventListener('click', () => {
      const current = this.getCurrentState();
      current.stdout = [];
      this.ui.renderConsole(current);
    });

    // Trace list filter chips
    document.querySelectorAll('.filter-chip').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        this.ui.activeFilter = e.target.dataset.filter;
        this.ui.renderTraceLog(this.getCurrentState());
      });
    });

    // Trace item click to jump/highlight source line
    el.traceList.addEventListener('click', (e) => {
      const entry = e.target.closest('.trace-entry');
      if (!entry) return;

      document.querySelectorAll('.trace-entry').forEach(t => t.classList.remove('active-trace'));
      entry.classList.add('active-trace');

      const line = entry.dataset.line;
      if (line) {
        const lineEl = document.getElementById(`code-line-${line}`);
        if (lineEl) {
          lineEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          lineEl.style.outline = '1px solid #79c0ff';
          setTimeout(() => { lineEl.style.outline = 'none'; }, 1000);
        }
      }
    });

    // Keyboard Shortcuts (Standard debugger experience)
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      if (e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        this.stopAutoRun();
        this.step();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.stepBack();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        this.resetSimulation();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        this.stepParent();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        this.stepChild();
      }
    });
  }
}

// Bootstrap app (Robust readyState check for any deployment or caching condition)
function bootstrap() {
  if (!window.forkPlayground) {
    window.forkPlayground = new ForkPlaygroundApp();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

