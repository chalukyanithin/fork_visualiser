// UI Rendering, DOM Updates, and Visual Synchronization
import { C_SOURCE_LINES } from './code.js';

export class SimulatorUI {
  constructor() {
    this.elements = {
      // Header controls
      btnReset: document.getElementById('btn-reset'),
      btnStepBack: document.getElementById('btn-step-back'),
      btnStep: document.getElementById('btn-step'),
      btnRun: document.getElementById('btn-run'),
      btnPause: document.getElementById('btn-pause'),
      selectSchedule: document.getElementById('select-schedule'),
      selectSpeed: document.getElementById('select-speed'),

      // Status banner (Answers core debugger questions)
      statusBanner: document.getElementById('status-banner'),
      statusProcBadge: document.getElementById('status-proc-badge'),
      statusProcText: document.getElementById('status-proc-text'),
      statusPcBadge: document.getElementById('status-pc-badge'),
      statusPcText: document.getElementById('status-pc-text'),
      statusRetBadge: document.getElementById('status-ret-badge'),
      statusRetText: document.getElementById('status-ret-text'),
      statusMemBadge: document.getElementById('status-mem-badge'),
      statusMemText: document.getElementById('status-mem-text'),
      statusText: document.getElementById('status-text'),
      statusNextText: document.getElementById('status-next-text'),

      // Source panel
      codeViewport: document.getElementById('code-viewport'),
      consoleOutput: document.getElementById('console-output'),
      btnClearConsole: document.getElementById('btn-clear-console'),

      // Process lanes & scheduling
      schedulerActiveBadge: document.getElementById('scheduler-active-badge'),
      schedulerDecisionBox: document.getElementById('scheduler-decision-box'),
      schedExplanation: document.getElementById('sched-explanation'),
      btnStepParent: document.getElementById('btn-step-parent'),
      btnStepChild: document.getElementById('btn-step-child'),
      schedParentTarget: document.getElementById('sched-parent-target'),
      schedChildTarget: document.getElementById('sched-child-target'),
      laneParent: document.getElementById('lane-parent'),
      laneChild: document.getElementById('lane-child'),
      forkJunction: document.getElementById('fork-junction'),
      parentPid: document.getElementById('parent-pid'),
      parentPpid: document.getElementById('parent-ppid'),
      childPid: document.getElementById('child-pid'),
      childPpid: document.getElementById('child-ppid'),
      parentStateBadge: document.getElementById('parent-state-badge'),
      childStateBadge: document.getElementById('child-state-badge'),
      parentRetVal: document.getElementById('parent-ret-val'),
      parentRetText: document.getElementById('parent-ret-text'),
      childRetVal: document.getElementById('child-ret-val'),
      childRetText: document.getElementById('child-ret-text'),
      parentPcText: document.getElementById('parent-pc-text'),
      childPcText: document.getElementById('child-pc-text'),
      parentPcHint: document.getElementById('parent-pc-hint'),
      childPcHint: document.getElementById('child-pc-hint'),
      parentCounterVal: document.getElementById('parent-counter-val'),
      childCounterVal: document.getElementById('child-counter-val'),
      parentCounterDelta: document.getElementById('parent-counter-delta'),
      childCounterDelta: document.getElementById('child-counter-delta'),
      parentNextAction: document.getElementById('parent-next-action'),
      childNextAction: document.getElementById('child-next-action'),
      parentStatusLine: document.getElementById('parent-status-line'),
      childStatusLine: document.getElementById('child-status-line'),

      // Variable diff & isolation
      diffParentVal: document.getElementById('diff-parent-val'),
      diffChildVal: document.getElementById('diff-child-val'),
      diffStatusBadge: document.getElementById('diff-status-badge'),
      comparatorIcon: document.getElementById('comparator-icon'),
      comparatorDesc: document.getElementById('comparator-desc'),
      diffIsolationText: document.getElementById('diff-isolation-text'),

      // Memory & COW
      cowStatusPill: document.getElementById('cow-status-pill'),
      vpageParent: document.getElementById('vpage-parent'),
      vpageChild: document.getElementById('vpage-child'),
      vpageParentPerm: document.getElementById('vpage-parent-perm'),
      vpageChildPerm: document.getElementById('vpage-child-perm'),
      pointerParent: document.getElementById('pointer-parent'),
      pointerChild: document.getElementById('pointer-child'),
      pframeA: document.getElementById('pframe-a'),
      pframeB: document.getElementById('pframe-b'),
      pframeAVal: document.getElementById('pframe-a-val'),
      pframeBVal: document.getElementById('pframe-b-val'),
      pframeARefs: document.getElementById('pframe-a-refs'),
      pframeBRefs: document.getElementById('pframe-b-refs'),
      pframeACow: document.getElementById('pframe-a-cow'),
      pframeBCow: document.getElementById('pframe-b-cow'),
      memBackingBadge: document.getElementById('mem-backing-badge'),
      memTransitionText: document.getElementById('mem-transition-text'),
      memBackingText: document.getElementById('mem-backing-text'),
      memCowActionText: document.getElementById('mem-cow-action-text'),

      // Execution trace
      traceCounter: document.getElementById('trace-counter'),
      traceList: document.getElementById('trace-list'),
      traceContainer: document.getElementById('trace-container')
    };

    this.activeFilter = 'all';
    this.initSourceCode();
  }

  // Render initial source code lines
  initSourceCode() {
    const container = this.elements.codeViewport;
    if (!container) return;
    if (container.querySelectorAll('.code-line').length === C_SOURCE_LINES.length) {
      return;
    }
    container.innerHTML = '';

    C_SOURCE_LINES.forEach((lineObj) => {
      const lineEl = document.createElement('div');
      lineEl.className = 'code-line';
      lineEl.id = `code-line-${lineObj.line}`;
      lineEl.dataset.line = lineObj.line;

      const numSpan = document.createElement('span');
      numSpan.className = 'line-num';
      numSpan.textContent = lineObj.line;

      const pcSpan = document.createElement('span');
      pcSpan.className = 'line-pc-gutter';
      pcSpan.id = `pc-gutter-${lineObj.line}`;

      const contentSpan = document.createElement('span');
      contentSpan.className = 'line-content';

      if (lineObj.tokens && lineObj.tokens.length > 0) {
        lineObj.tokens.forEach((t) => {
          const tokSpan = document.createElement('span');
          if (t.type) {
            tokSpan.className = `syn-${t.type}`;
          }
          tokSpan.textContent = t.text;
          contentSpan.appendChild(tokSpan);
        });
      } else {
        contentSpan.textContent = lineObj.text;
      }

      lineEl.appendChild(numSpan);
      lineEl.appendChild(pcSpan);
      lineEl.appendChild(contentSpan);
      container.appendChild(lineEl);
    });
  }

  // Main render sync
  render(state, canStepBack = false) {
    this.renderHeaderControls(state, canStepBack);
    this.renderStatusBanner(state);
    this.renderSourcePointers(state);
    this.renderConsole(state);
    this.renderProcessLanes(state);
    this.renderVariablesDiff(state);
    this.renderMemoryCOW(state);
    this.renderTraceLog(state);
  }

  renderHeaderControls(state, canStepBack) {
    this.elements.btnStepBack.disabled = !canStepBack;
    this.elements.btnStep.disabled = state.isFinished;
    this.elements.btnRun.disabled = state.isFinished;
  }

  renderStatusBanner(state) {
    // 1. Which process is running & PID?
    if (!state.isForkExecuted) {
      this.elements.statusProcText.textContent = 'PID 4100 (Single Process)';
      this.elements.statusProcText.className = 'badge-val badge-val-parent';
    } else if (state.isForkFailed) {
      this.elements.statusProcText.textContent = 'PID 4100 (Fork Failed)';
      this.elements.statusProcText.className = 'badge-val badge-val-error';
    } else if (state.isFinished) {
      this.elements.statusProcText.textContent = 'Terminated (All Complete)';
      this.elements.statusProcText.className = 'badge-val badge-val-neutral';
    } else if (state.parent.state === 'BLOCKED') {
      this.elements.statusProcText.textContent = 'PID 4101 Child (Parent Blocked in wait)';
      this.elements.statusProcText.className = 'badge-val badge-val-child';
    } else if (state.activePid === 4101) {
      this.elements.statusProcText.textContent = 'PID 4101 [CHILD] Running';
      this.elements.statusProcText.className = 'badge-val badge-val-child';
    } else {
      this.elements.statusProcText.textContent = 'PID 4100 [PARENT] Running';
      this.elements.statusProcText.className = 'badge-val badge-val-parent';
    }

    // 2. What source line is executing?
    if (!state.isForkExecuted) {
      this.elements.statusPcText.textContent = 'Line 10: pid_t pid = fork();';
    } else if (state.activePid === 4101 && state.child.pc) {
      this.elements.statusPcText.textContent = `Line ${state.child.pc}: ${this.getLineSummary(state.child.pc)}`;
    } else if (state.parent.pc) {
      this.elements.statusPcText.textContent = `Line ${state.parent.pc}: ${this.getLineSummary(state.parent.pc)}`;
    } else {
      this.elements.statusPcText.textContent = '—';
    }

    // 3. What value did fork() return to this process?
    if (!state.isForkExecuted) {
      this.elements.statusRetText.textContent = 'uncalled';
    } else if (state.isForkFailed) {
      this.elements.statusRetText.textContent = '-1 (sys_fork error)';
    } else if (state.activePid === 4101) {
      this.elements.statusRetText.textContent = '0 (child return)';
    } else {
      this.elements.statusRetText.textContent = '4101 (child PID)';
    }

    // 4. Physical memory backing status
    this.elements.statusMemText.textContent = state.physicalBacking;

    // 5. State explanation & What happens next
    this.elements.statusText.innerHTML = state.lastStepAction;
    this.elements.statusNextText.innerHTML = state.nextStepAction;
  }

  renderSourcePointers(state) {
    document.querySelectorAll('.code-line').forEach((line) => {
      line.classList.remove('active-parent', 'active-child', 'active-both');
    });
    document.querySelectorAll('.line-pc-gutter').forEach((gutter) => {
      gutter.innerHTML = '';
    });

    const parentPc = state.parent.state !== 'EXITED' ? state.parent.pc : null;
    const childPc = (state.child.created && state.child.state !== 'EXITED' && state.child.state !== 'REAPED') ? state.child.pc : null;

    if (parentPc && parentPc === childPc) {
      const lineEl = document.getElementById(`code-line-${parentPc}`);
      const gutterEl = document.getElementById(`pc-gutter-${parentPc}`);
      if (lineEl && gutterEl) {
        lineEl.classList.add('active-both');
        gutterEl.innerHTML = `
          <span class="pc-icon pc-icon-p" title="Parent Instruction Pointer (PID 4100)">P</span>
          <span class="pc-icon pc-icon-c" title="Child Instruction Pointer (PID 4101)">C</span>
        `;
        lineEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else {
      if (parentPc) {
        const lineEl = document.getElementById(`code-line-${parentPc}`);
        const gutterEl = document.getElementById(`pc-gutter-${parentPc}`);
        if (lineEl && gutterEl) {
          lineEl.classList.add('active-parent');
          gutterEl.innerHTML = `<span class="pc-icon pc-icon-p" title="Parent Instruction Pointer (PID 4100)">P</span>`;
          if (state.activePid === 4100) {
            lineEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }
      if (childPc) {
        const lineEl = document.getElementById(`code-line-${childPc}`);
        const gutterEl = document.getElementById(`pc-gutter-${childPc}`);
        if (lineEl && gutterEl) {
          lineEl.classList.add('active-child');
          gutterEl.innerHTML = `<span class="pc-icon pc-icon-c" title="Child Instruction Pointer (PID 4101)">C</span>`;
          if (state.activePid === 4101) {
            lineEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }
    }
  }

  renderConsole(state) {
    const outEl = this.elements.consoleOutput;
    if (!state.stdout || state.stdout.length === 0) {
      outEl.innerHTML = '<div class="console-empty">[Process standard output stream will appear here]</div>';
      return;
    }

    outEl.innerHTML = state.stdout.map(item => `
      <div class="console-line ${item.proc}">
        <span class="console-prefix">&gt; </span>${this.escapeHtml(item.text)}
      </div>
    `).join('');
    outEl.scrollTop = outEl.scrollHeight;
  }

  renderProcessLanes(state) {
    const parentRunnable = state.parent.state === 'RUNNING' || state.parent.state === 'RUNNABLE';
    const childRunnable = state.child.created && (state.child.state === 'RUNNING' || state.child.state === 'RUNNABLE');

    // Scheduler top badge
    if (state.isFinished) {
      this.elements.schedulerActiveBadge.textContent = 'All Finished';
      this.elements.schedulerActiveBadge.className = 'state-badge badge-neutral';
    } else if (state.parent.state === 'BLOCKED') {
      this.elements.schedulerActiveBadge.textContent = 'PID 4100 Blocked in wait()';
      this.elements.schedulerActiveBadge.className = 'state-badge badge-blocked';
    } else if (state.activePid === 4101 && childRunnable) {
      this.elements.schedulerActiveBadge.textContent = 'PID 4101 (Child) Active';
      this.elements.schedulerActiveBadge.className = 'state-badge badge-runnable';
    } else {
      this.elements.schedulerActiveBadge.textContent = 'PID 4100 (Parent) Active';
      this.elements.schedulerActiveBadge.className = 'state-badge badge-running';
    }

    // Scheduler choice buttons & non-deterministic notice
    this.elements.btnStepParent.disabled = !parentRunnable;
    this.elements.btnStepChild.disabled = !childRunnable;

    if (!state.isForkExecuted) {
      this.elements.schedExplanation.textContent = 'Single Process Context: PID 4100 is executing before fork().';
      this.elements.schedParentTarget.textContent = 'Line 10: fork()';
      this.elements.schedChildTarget.textContent = 'Unborn';
    } else if (parentRunnable && childRunnable) {
      this.elements.schedExplanation.textContent = 'Linux CFS: Scheduling is non-deterministic. Linux does not guarantee whether Parent or Child runs first. You choose:';
      this.elements.schedParentTarget.textContent = `Line ${state.parent.pc}: ${this.getLineSummary(state.parent.pc)}`;
      this.elements.schedChildTarget.textContent = `Line ${state.child.pc}: ${this.getLineSummary(state.child.pc)}`;
    } else if (state.parent.state === 'BLOCKED') {
      this.elements.schedExplanation.textContent = 'Parent is BLOCKED in wait(NULL). Kernel scheduler runs Child (PID 4101) exclusively.';
      this.elements.schedParentTarget.textContent = 'Blocked in wait()';
      this.elements.schedChildTarget.textContent = childRunnable ? `Line ${state.child.pc}: ${this.getLineSummary(state.child.pc)}` : 'Terminated';
    } else if (state.child.state === 'ZOMBIE') {
      this.elements.schedExplanation.textContent = 'Child terminated as ZOMBIE. Kernel scheduler runs Parent (PID 4100) to collect exit status via wait().';
      this.elements.schedParentTarget.textContent = `Line ${state.parent.pc}: ${this.getLineSummary(state.parent.pc)}`;
      this.elements.schedChildTarget.textContent = 'ZOMBIE';
    } else if (state.isFinished) {
      this.elements.schedExplanation.textContent = 'Execution finished: both Parent and Child have completed their paths.';
      this.elements.schedParentTarget.textContent = 'Exited (0)';
      this.elements.schedChildTarget.textContent = 'Reaped / Exited (0)';
    } else {
      this.elements.schedExplanation.textContent = 'Kernel scheduler active on remaining runnable process.';
      this.elements.schedParentTarget.textContent = parentRunnable ? `Line ${state.parent.pc}: ${this.getLineSummary(state.parent.pc)}` : 'Exited';
      this.elements.schedChildTarget.textContent = childRunnable ? `Line ${state.child.pc}: ${this.getLineSummary(state.child.pc)}` : 'Terminated';
    }

    // PARENT LANE
    this.elements.parentStateBadge.textContent = state.parent.state;
    this.elements.parentStateBadge.className = `state-badge ${this.getStateBadgeClass(state.parent.state)}`;

    if (state.parent.retVal !== null) {
      this.elements.parentRetText.textContent = state.parent.retVal;
    } else {
      this.elements.parentRetText.textContent = 'uncalled';
    }

    this.elements.parentPcText.textContent = state.parent.state === 'EXITED'
      ? `Terminated (exit ${state.parent.exitCode})`
      : `Line ${state.parent.pc}: ${this.getLineSummary(state.parent.pc)}`;

    this.elements.parentCounterVal.textContent = state.parent.counter;
    this.elements.parentNextAction.innerHTML = `<strong>Next:</strong> ${this.escapeHtml(state.parent.nextAction)}`;
    this.elements.parentStatusLine.textContent = state.parent.statusMsg;

    // Active visual highlight on lane
    const isParentActive = (state.activePid === 4100 || !state.child.created) && parentRunnable;
    if (isParentActive) {
      this.elements.laneParent.classList.add('lane-active');
    } else {
      this.elements.laneParent.classList.remove('lane-active');
    }

    // CHILD LANE
    if (!state.child.created) {
      this.elements.laneChild.classList.add('lane-unborn');
      this.elements.laneChild.classList.remove('lane-active');
      this.elements.childStateBadge.textContent = 'NOT CREATED';
      this.elements.childStateBadge.className = 'state-badge badge-unborn';
      this.elements.childRetText.textContent = '—';
      this.elements.childPcText.textContent = '—';
      this.elements.childCounterVal.textContent = '—';
      this.elements.childNextAction.innerHTML = `<strong>Next:</strong> Awaiting creation via fork()`;
      this.elements.childStatusLine.textContent = state.child.statusMsg;
      this.elements.forkJunction.classList.remove('fork-active');
    } else {
      this.elements.laneChild.classList.remove('lane-unborn');
      this.elements.forkJunction.classList.add('fork-active');
      this.elements.childStateBadge.textContent = state.child.state;
      this.elements.childStateBadge.className = `state-badge ${this.getStateBadgeClass(state.child.state)}`;
      this.elements.childRetText.textContent = state.child.retVal;
      this.elements.childPcText.textContent = state.child.state === 'EXITED' || state.child.state === 'REAPED'
        ? `Reaped / Exited (0)`
        : `Line ${state.child.pc}: ${this.getLineSummary(state.child.pc)}`;
      this.elements.childCounterVal.textContent = state.child.counter;
      this.elements.childNextAction.innerHTML = `<strong>Next:</strong> ${this.escapeHtml(state.child.nextAction)}`;
      this.elements.childStatusLine.textContent = state.child.statusMsg;

      const isChildActive = state.activePid === 4101 && childRunnable;
      if (isChildActive) {
        this.elements.laneChild.classList.add('lane-active');
      } else {
        this.elements.laneChild.classList.remove('lane-active');
      }
    }
  }

  renderVariablesDiff(state) {
    this.elements.diffParentVal.textContent = state.parent.counter;
    if (state.child.created) {
      this.elements.diffChildVal.textContent = state.child.counter;
      if (state.parent.counter !== state.child.counter) {
        this.elements.comparatorIcon.textContent = '≠';
        this.elements.comparatorIcon.style.color = '#f0883e';
        this.elements.comparatorDesc.textContent = 'Independent';
        this.elements.diffStatusBadge.textContent = 'Diverged Memory';
        this.elements.diffStatusBadge.style.color = '#ffa657';
      } else {
        this.elements.comparatorIcon.textContent = '≡';
        this.elements.comparatorIcon.style.color = '#3fb950';
        this.elements.comparatorDesc.textContent = 'Shared COW';
        this.elements.diffStatusBadge.textContent = 'COW Shared (val: 10)';
        this.elements.diffStatusBadge.style.color = '#d29922';
      }
    } else {
      this.elements.diffChildVal.textContent = '—';
      this.elements.comparatorIcon.textContent = '—';
      this.elements.comparatorIcon.style.color = '#8b949e';
      this.elements.comparatorDesc.textContent = 'Pre-fork';
      this.elements.diffStatusBadge.textContent = 'Single Process';
      this.elements.diffStatusBadge.style.color = '#8b949e';
    }

    // Answer: Why did the other process's variable remain unchanged?
    this.elements.diffIsolationText.innerHTML = state.isolationReason;
  }

  renderMemoryCOW(state) {
    const mem = state.memory;
    this.elements.vpageParentPerm.textContent = `PTE: ${mem.parentPte}`;
    
    if (state.child.created) {
      this.elements.vpageChild.classList.remove('card-disabled');
      this.elements.vpageChildPerm.textContent = `PTE: ${mem.childPte}`;
      this.elements.pointerChild.style.display = 'block';
    } else {
      this.elements.vpageChild.classList.add('card-disabled');
      this.elements.vpageChildPerm.textContent = 'PTE: Unmapped';
      this.elements.pointerChild.style.display = 'none';
    }

    // Physical Frame A
    this.elements.pframeAVal.innerHTML = `<code>val: ${mem.frameA.val}</code>`;
    this.elements.pframeARefs.textContent = `Refs: ${mem.frameA.refs}`;
    this.elements.pframeACow.textContent = mem.frameA.cow ? 'Shared COW' : 'Exclusive';
    if (mem.frameA.cow) {
      this.elements.pframeA.classList.add('pframe-shared');
      this.elements.pframeA.classList.remove('pframe-exclusive');
    } else {
      this.elements.pframeA.classList.remove('pframe-shared');
      this.elements.pframeA.classList.add('pframe-exclusive');
    }

    // Physical Frame B
    if (mem.frameB.active) {
      this.elements.pframeB.classList.remove('card-inactive');
      this.elements.pframeBVal.innerHTML = `<code>val: ${mem.frameB.val}</code>`;
      this.elements.pframeBRefs.textContent = `Refs: ${mem.frameB.refs}`;
      this.elements.pframeBCow.textContent = `Private (${mem.frameB.owner || 'Process'})`;
      this.elements.cowStatusPill.textContent = 'COW Broken: 2 Private Frames';
      this.elements.cowStatusPill.className = 'state-badge badge-runnable';
    } else {
      this.elements.pframeB.classList.add('card-inactive');
      this.elements.pframeBVal.innerHTML = `<code>[Unallocated]</code>`;
      this.elements.pframeBRefs.textContent = `Refs: 0`;
      this.elements.pframeBCow.textContent = 'Unallocated';
      if (mem.cowActive) {
        this.elements.cowStatusPill.textContent = 'COW Active: Sharing Frame A';
        this.elements.cowStatusPill.className = 'state-badge badge-zombie';
      } else {
        this.elements.cowStatusPill.textContent = 'Pre-fork: Single VMA';
        this.elements.cowStatusPill.className = 'state-badge badge-neutral';
      }
    }

    // Memory Inspector Box Readouts
    this.elements.memBackingBadge.textContent = mem.frameA.cow ? 'Shared Physical RAM (COW)' : 'Private RAM Frames';
    this.elements.memTransitionText.innerHTML = state.memoryChange;
    this.elements.memBackingText.innerHTML = state.physicalBacking;
    
    if (mem.cowActive) {
      this.elements.memCowActionText.innerHTML = `
        <strong>COW Protection Active:</strong> Both processes read Frame A (0x0A400). When either process attempts to write, the MMU hardware triggers a Page Fault (#PF), allowing the kernel to duplicate only the modified 4 KiB frame.
      `;
    } else if (mem.frameB.active) {
      this.elements.memCowActionText.innerHTML = `
        <strong>COW Broken by Write:</strong> Faulting process was granted newly allocated Frame B (0x0B800) with Read/Write permissions. The non-writing process remains on Frame A with exclusive ownership restored.
      `;
    } else {
      this.elements.memCowActionText.innerHTML = `
        <strong>Pre-fork:</strong> Exactly one process has mapped memory. Executing fork() will establish Copy-On-Write sharing without copying physical memory.
      `;
    }
  }

  renderTraceLog(state) {
    this.elements.traceCounter.textContent = `${state.events.length} event${state.events.length === 1 ? '' : 's'}`;
    
    const filteredEvents = state.events.filter(e => {
      if (this.activeFilter === 'all') return true;
      if (this.activeFilter === 'parent') return e.type === 'parent';
      if (this.activeFilter === 'child') return e.type === 'child';
      if (this.activeFilter === 'kernel') return e.type === 'kernel';
      if (this.activeFilter === 'cow') return e.type === 'cow';
      return true;
    });

    this.elements.traceList.innerHTML = filteredEvents.map(e => `
      <div class="trace-entry" data-event-id="${e.id}" data-line="${e.line || ''}">
        <span class="trace-seq">${e.seq}</span>
        <span class="trace-badge ${this.getTraceBadgeClass(e.type)}">${e.pid ? `PID ${e.pid}` : 'KERNEL'}</span>
        <span class="trace-msg"><strong>${e.title}:</strong> ${e.desc}</span>
      </div>
    `).join('');

    this.elements.traceContainer.scrollTop = this.elements.traceContainer.scrollHeight;
  }

  getStateBadgeClass(state) {
    switch (state) {
      case 'RUNNING': return 'badge-running';
      case 'RUNNABLE': return 'badge-runnable';
      case 'BLOCKED': return 'badge-blocked';
      case 'ZOMBIE': return 'badge-zombie';
      case 'REAPED': return 'badge-reaped';
      case 'EXITED': return 'badge-reaped';
      case 'UNBORN': return 'badge-unborn';
      default: return 'badge-neutral';
    }
  }

  getTraceBadgeClass(type) {
    switch (type) {
      case 'parent': return 'badge-proc-parent';
      case 'child': return 'badge-proc-child';
      case 'cow': return 'badge-proc-cow';
      default: return 'badge-proc-kernel';
    }
  }

  getLineSummary(line) {
    const l = C_SOURCE_LINES.find(x => x.line === line);
    return l ? l.text.trim() : '';
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
