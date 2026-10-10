// State Machine & Simulation Engine for fork() Playground
// Rigorous Linux Process Execution, Copy-On-Write, and Scheduler Model

export function createInitialState(scheduleMode = 'schedule-interactive') {
  return {
    stepIndex: 0,
    scheduleMode,
    isForkExecuted: false,
    isForkFailed: scheduleMode === 'schedule-failure',
    isFinished: false,
    activePid: 4100, // Currently executing process PID
    
    // Explicit answers to core interaction model questions
    lastStepAction: 'Single process (PID 4100) running before fork(). Local variable counter = 10 initialized in user stack.',
    nextStepAction: 'Invoke sys_fork() system call at line 10 to duplicate the process into parent and child.',
    memoryChange: 'Single physical Frame A (0x0A400) mapped exclusive Read/Write to Parent VPN 0x7ffd10.',
    isolationReason: 'Single process exists currently; no isolation needed.',
    physicalBacking: 'Exclusive Private (Frame A)',

    // Parent Process (PID 4100)
    parent: {
      pid: 4100,
      ppid: 4000,
      state: 'RUNNING', // 'RUNNING', 'RUNNABLE', 'BLOCKED', 'EXITED'
      pc: 10,
      retVal: null,
      counter: 10,
      exitCode: null,
      statusMsg: 'Process running in single-process context before fork().',
      nextAction: 'Call sys_fork() syscall'
    },

    // Child Process (PID 4101)
    child: {
      pid: 4101,
      ppid: 4100,
      created: false,
      state: 'UNBORN', // 'UNBORN', 'RUNNABLE', 'RUNNING', 'ZOMBIE', 'REAPED', 'EXITED'
      pc: null,
      retVal: null,
      counter: null,
      exitCode: null,
      statusMsg: 'Process does not exist yet. No task_struct allocated by the kernel.',
      nextAction: 'Awaiting creation via fork()'
    },

    // Virtual Memory & Page Tables
    memory: {
      cowActive: false,
      parentVpn: '0x7ffd10',
      childVpn: '0x7ffd10',
      parentPte: 'Read / Write (Exclusive)',
      childPte: 'Unmapped',
      parentFrame: '0x0A400',
      childFrame: null,
      frameA: {
        id: 'FRAME A',
        addr: '0x0A400',
        val: 10,
        refs: 1,
        cow: false,
        owner: 'parent'
      },
      frameB: {
        id: 'FRAME B',
        addr: '0x0B800',
        val: null,
        active: false,
        refs: 0,
        owner: null
      }
    },

    // Standard Output Stream
    stdout: [
      { proc: 'proc-parent', text: 'Initial counter: 10' }
    ],

    // Chronological Event Trace
    events: [
      {
        id: 1,
        seq: '#01',
        type: 'parent',
        pid: 4100,
        title: 'Program Initialized',
        desc: 'Process PID 4100 running. Stack allocated with counter = 10 at 0x7ffd104c. Line 8 printf() executed.',
        line: 8
      }
    ]
  };
}

// Deep clone state for immutable history and step-back
export function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

// Execute fork() syscall
export function executeForkSyscall(state, forceFailure = false) {
  const next = cloneState(state);
  next.isForkExecuted = true;
  next.stepIndex += 1;

  if (forceFailure || next.scheduleMode === 'schedule-failure') {
    // Fork failure scenario
    next.isForkFailed = true;
    next.parent.pc = 12;
    next.parent.retVal = -1;
    next.parent.statusMsg = 'sys_fork() failed with EAGAIN. Returned -1. No child created.';
    next.parent.nextAction = 'Evaluate branch (pid < 0)';
    next.activePid = 4100;
    next.lastStepAction = 'sys_fork() returned -1 (failure) to Parent. No child task_struct allocated.';
    next.nextStepAction = 'Parent evaluates branch: pid < 0 is TRUE (-1 < 0). Enters error branch.';
    next.memoryChange = 'No memory changes. Child was not created.';
    next.isolationReason = 'Single process still running.';
    next.physicalBacking = 'Exclusive Private (Frame A)';

    next.events.push({
      id: next.events.length + 1,
      seq: `#${String(next.events.length + 1).padStart(2, '0')}`,
      type: 'kernel',
      pid: 4100,
      title: 'sys_fork() Failed',
      desc: 'Kernel resource limit reached (EAGAIN). fork() returns -1 in Parent. No child allocated.',
      line: 12
    });

    return next;
  }

  // Successful fork()
  // 1. Visibly branch parent into parent and child
  // 2. Preserve shared initial variable values
  // 3. Show distinct PIDs (4100 and 4101)
  // 4. Show parent's child-PID return value (4101)
  // 5. Show zero as the child's return value (0)
  // 6. Position both processes after the fork() call (Line 12)
  next.parent.pc = 12;
  next.parent.retVal = 4101; // Parent receives child's PID (> 0)
  next.parent.state = 'RUNNABLE';
  next.parent.counter = 10;
  next.parent.statusMsg = 'fork() returned child PID 4101. Ready to evaluate branch at line 12.';
  next.parent.nextAction = 'Evaluate branch: pid > 0 -> takes else block';

  next.child.created = true;
  next.child.pc = 12; // Child starts right after fork(), NOT at main()!
  next.child.retVal = 0; // Child receives 0
  next.child.state = 'RUNNABLE';
  next.child.counter = 10; // Preserves identical initial counter
  next.child.statusMsg = 'Created by fork(). Received return value 0. Ready to evaluate branch at line 12.';
  next.child.nextAction = 'Evaluate branch: pid == 0 -> takes child block';

  // Memory Copy-On-Write sharing setup:
  // Separate virtual address spaces does NOT mean immediate separate physical copies of every page.
  next.memory.cowActive = true;
  next.memory.parentPte = 'Read-Only (COW)';
  next.memory.childPte = 'Read-Only (COW)';
  next.memory.parentFrame = '0x0A400';
  next.memory.childFrame = '0x0A400'; // Both virtual pages map to the same physical Frame A
  next.memory.frameA.refs = 2;
  next.memory.frameA.cow = true;
  next.memory.frameA.val = 10;
  next.physicalBacking = 'Shared Physical RAM (Frame A, Refs: 2)';

  next.lastStepAction = 'fork() executed: Kernel cloned PID 4100 into Child PID 4101. Parent received 4101; Child received 0. Both positioned at line 12 with counter = 10.';
  next.nextStepAction = 'Both processes are RUNNABLE. Linux does not guarantee scheduling order. Choose which process runs next: Parent (4100) or Child (4101).';
  next.memoryChange = 'Zero eager copying: Parent and Child virtual pages (0x7ffd10) both point to physical Frame A (0x0A400). PTEs marked Read-Only (COW). Refs = 2.';
  next.isolationReason = 'Processes have independent virtual address spaces, but share physical RAM read-only until a write occurs.';

  // Trace Events
  const eLen = next.events.length;
  next.events.push({
    id: eLen + 1,
    seq: `#${String(eLen + 1).padStart(2, '0')}`,
    type: 'kernel',
    pid: 4100,
    title: 'sys_fork() System Call',
    desc: 'Kernel allocates new task_struct (PID 4101, PPID 4100). Duplicates CPU registers and page table references.',
    line: 10
  });

  next.events.push({
    id: eLen + 2,
    seq: `#${String(eLen + 2).padStart(2, '0')}`,
    type: 'cow',
    pid: null,
    title: 'COW Mappings Established',
    desc: 'Physical Frame 0x0A400 shared read-only by both processes. Reference count = 2. Zero physical memory copied.',
    line: 10
  });

  next.events.push({
    id: eLen + 3,
    seq: `#${String(eLen + 3).padStart(2, '0')}`,
    type: 'parent',
    pid: 4100,
    title: 'Parent fork() Return',
    desc: 'PID 4100 receives child PID 4101 from fork(). Positioned after fork() at line 12.',
    line: 12
  });

  next.events.push({
    id: eLen + 4,
    seq: `#${String(eLen + 4).padStart(2, '0')}`,
    type: 'child',
    pid: 4101,
    title: 'Child fork() Return',
    desc: 'PID 4101 receives return value 0 from fork(). Positioned after fork() at line 12.',
    line: 12
  });

  return next;
}

// Step single instruction for Parent
export function stepParentProcess(state) {
  if (state.parent.state === 'EXITED' || state.parent.state === 'BLOCKED') {
    return state;
  }
  const next = cloneState(state);
  next.stepIndex += 1;
  next.activePid = 4100;
  next.parent.state = 'RUNNING';
  if (next.child.created && next.child.state === 'RUNNING') {
    next.child.state = 'RUNNABLE';
  }

  const pc = next.parent.pc;

  // Failure execution path
  if (next.isForkFailed) {
    if (pc === 12) {
      next.parent.pc = 13;
      next.parent.statusMsg = 'pid < 0 is TRUE (-1 < 0). Entering error branch.';
      next.parent.nextAction = 'fprintf(stderr, "fork failed")';
      next.lastStepAction = 'PID 4100 evaluated pid < 0 as TRUE (-1 < 0). Entered error branch at line 13.';
      next.nextStepAction = 'PID 4100 will print error message to stderr.';
      next.memoryChange = 'No memory modifications.';
      next.isolationReason = 'Single process running.';
      next.events.push({
        id: next.events.length + 1,
        seq: `#${String(next.events.length + 1).padStart(2, '0')}`,
        type: 'parent',
        pid: 4100,
        title: 'Error Branch Taken',
        desc: 'PID 4100 evaluated pid < 0 as TRUE (-1 < 0).',
        line: 13
      });
    } else if (pc === 13) {
      next.parent.pc = 14;
      next.stdout.push({ proc: 'proc-error', text: 'fork failed' });
      next.parent.statusMsg = 'Wrote error message to stderr.';
      next.parent.nextAction = 'return 1 (exit failure)';
      next.lastStepAction = 'PID 4100 printed "fork failed" to standard error.';
      next.nextStepAction = 'PID 4100 will terminate with exit code 1.';
      next.memoryChange = 'No memory modifications.';
      next.isolationReason = 'Single process running.';
      next.events.push({
        id: next.events.length + 1,
        seq: `#${String(next.events.length + 1).padStart(2, '0')}`,
        type: 'parent',
        pid: 4100,
        title: 'fprintf(stderr)',
        desc: 'PID 4100 printed "fork failed" to standard error.',
        line: 13
      });
    } else if (pc === 14) {
      next.parent.pc = 25;
      next.parent.state = 'EXITED';
      next.parent.exitCode = 1;
      next.parent.statusMsg = 'Process terminated with status 1.';
      next.parent.nextAction = 'None (Terminated)';
      next.isFinished = true;
      next.lastStepAction = 'PID 4100 exited with return 1. Simulation complete.';
      next.nextStepAction = 'None (Program finished).';
      next.memoryChange = 'Process address space unmapped.';
      next.isolationReason = 'Process terminated.';
      next.events.push({
        id: next.events.length + 1,
        seq: `#${String(next.events.length + 1).padStart(2, '0')}`,
        type: 'parent',
        pid: 4100,
        title: 'Exit Failure',
        desc: 'PID 4100 terminated with return 1.',
        line: 14
      });
    }
    return next;
  }

  // Normal post-fork execution path for Parent:
  // Step 1: Branch evaluation from Line 12
  if (pc === 12) {
    // Evaluating if (pid < 0) [false] and else if (pid == 0) [false]
    // Directly lands on target instruction: line 20 (counter += 100;)
    next.parent.pc = 20;
    next.parent.statusMsg = 'pid = 4101 (> 0). Evaluated branch condition -> entered else block at line 20.';
    next.parent.nextAction = 'Execute write: counter += 100;';
    next.lastStepAction = 'Parent (PID 4100) evaluated fork() return (4101 > 0). Satisfied else branch; positioned at line 20.';
    next.nextStepAction = 'Parent will execute counter += 100 write. If memory is still COW-shared, this will trigger a page fault.';
    next.memoryChange = 'CPU register comparison only. Physical memory unchanged.';
    next.isolationReason = 'Processes have independent CPU register state. Parent evaluated its return value (4101).';

    next.events.push({
      id: next.events.length + 1,
      seq: `#${String(next.events.length + 1).padStart(2, '0')}`,
      type: 'parent',
      pid: 4100,
      title: 'Branch Evaluated (else)',
      desc: 'PID 4100 evaluates pid == 4101 (> 0). Takes else branch at line 20.',
      line: 20
    });
  } else if (pc === 20) {
    // Step 2: Parent writes counter += 100
    next.parent.counter = 110;
    next.parent.pc = 21;
    next.parent.nextAction = 'printf("Parent [PID %d]: counter = %d", ...) at line 21';

    // Check COW state: if still sharing Frame A with child
    if (next.memory.cowActive && next.memory.frameA.refs === 2) {
      // Parent writes before child: Parent triggers COW!
      // Kernel allocates Frame B for Parent
      next.memory.frameB.active = true;
      next.memory.frameB.addr = '0x0B800';
      next.memory.frameB.val = 110;
      next.memory.frameB.refs = 1;
      next.memory.frameB.owner = 'parent';
      next.memory.parentFrame = '0x0B800';
      next.memory.parentPte = 'Read / Write (Private)';

      // Child stays on Frame A with initial val 10
      next.memory.frameA.refs = 1;
      next.memory.frameA.cow = false;
      next.memory.childPte = 'Read / Write (Exclusive)';
      next.memory.cowActive = false;
      next.physicalBacking = 'Private Physical Frames (Parent: Frame B, Child: Frame A)';

      next.lastStepAction = 'Parent (PID 4100) executed counter += 100 (110). MMU trapped write on COW page -> kernel allocated Frame B (0x0B800) for Parent.';
      next.nextStepAction = 'Parent will execute printf() at line 21.';
      next.memoryChange = 'COW Page Fault (#PF): Private Frame B (0x0B800) allocated for Parent. counter = 110. Child remains on Frame A (10).';
      next.isolationReason = 'Copy-On-Write broke memory sharing: Parent writes to its private physical frame. Child Frame A was never touched.';

      next.events.push({
        id: next.events.length + 1,
        seq: `#${String(next.events.length + 1).padStart(2, '0')}`,
        type: 'cow',
        pid: 4100,
        title: 'COW Page Fault on Parent',
        desc: 'PID 4100 wrote to Read-Only COW page. Kernel trapped #PF, allocated Frame 0x0B800 for Parent, wrote 110. Child counter remains 10.',
        line: 20
      });
    } else {
      // Child already broke COW earlier, so Parent has its own exclusive frame
      if (next.memory.parentFrame === '0x0A400') {
        next.memory.frameA.val = 110;
      } else {
        next.memory.frameB.val = 110;
      }
      next.lastStepAction = 'Parent (PID 4100) updated counter += 100 to 110 in its private physical frame.';
      next.nextStepAction = 'Parent will execute printf() at line 21.';
      next.memoryChange = `Parent wrote 110 to private physical frame (${next.memory.parentFrame}).`;
      next.isolationReason = 'Processes have separate physical frames. Modifying Parent RAM cannot affect Child RAM.';

      next.events.push({
        id: next.events.length + 1,
        seq: `#${String(next.events.length + 1).padStart(2, '0')}`,
        type: 'parent',
        pid: 4100,
        title: 'Parent Modified counter',
        desc: 'PID 4100 updated counter += 100 to 110 in private physical frame.',
        line: 20
      });
    }

    next.parent.statusMsg = 'Updated private counter to 110. Child variable remains completely isolated.';
  } else if (pc === 21) {
    // Step 3: Printf
    next.parent.pc = 22;
    next.stdout.push({
      proc: 'proc-parent',
      text: `Parent [PID 4100]: counter = ${next.parent.counter}`
    });
    next.parent.statusMsg = 'Printed Parent output to stdout. About to invoke wait(NULL).';
    next.parent.nextAction = 'Call wait(NULL) to synchronize with child termination';
    next.lastStepAction = `Parent printed: "Parent [PID 4100]: counter = ${next.parent.counter}" to stdout.`;
    next.nextStepAction = 'Parent will invoke wait(NULL) at line 22 to synchronize with child process.';
    next.memoryChange = 'Stdout I/O stream write. User memory unchanged.';
    next.isolationReason = 'Processes remain isolated.';

    next.events.push({
      id: next.events.length + 1,
      seq: `#${String(next.events.length + 1).padStart(2, '0')}`,
      type: 'parent',
      pid: 4100,
      title: 'printf() Output',
      desc: `PID 4100 printed: "Parent [PID 4100]: counter = ${next.parent.counter}".`,
      line: 21
    });
  } else if (pc === 22) {
    // Step 4: Calling wait(NULL)
    if (next.child.state === 'RUNNING' || next.child.state === 'RUNNABLE') {
      // Child is still active! Parent becomes BLOCKED
      next.parent.state = 'BLOCKED';
      next.parent.statusMsg = 'Blocked in wait(NULL) waiting for Child (PID 4101) to terminate.';
      next.parent.nextAction = 'Awaiting child exit (SIGCHLD)';
      next.activePid = 4101; // Scheduler must switch to child
      next.lastStepAction = 'Parent called wait(NULL). Child 4101 is still running -> Parent state transitions to BLOCKED.';
      next.nextStepAction = 'Child (PID 4101) is scheduled next. Child must execute and exit before Parent can resume.';
      next.memoryChange = 'Task state updated to BLOCKED in kernel task_struct.';
      next.isolationReason = 'Parent execution halted by kernel scheduler.';

      next.events.push({
        id: next.events.length + 1,
        seq: `#${String(next.events.length + 1).padStart(2, '0')}`,
        type: 'kernel',
        pid: 4100,
        title: 'Parent BLOCKED in wait()',
        desc: 'PID 4100 calls wait(NULL). Child 4101 is still running -> Parent transitions to BLOCKED state.',
        line: 22
      });
    } else if (next.child.state === 'ZOMBIE') {
      // Child already terminated and is waiting in ZOMBIE state!
      next.child.state = 'REAPED';
      next.child.statusMsg = 'Child task_struct reaped by parent wait(). Exit status collected.';
      next.child.nextAction = 'None (Reaped)';
      next.parent.pc = 23;
      next.parent.statusMsg = 'Child 4101 reaped successfully. wait() returned 4101.';
      next.parent.nextAction = 'return 0 (exit parent)';
      next.lastStepAction = 'Parent called wait(NULL): collected exit status of Zombie Child (PID 4101). Child task_struct freed.';
      next.nextStepAction = 'Parent will return 0 and terminate at line 23.';
      next.memoryChange = 'Kernel freed Child task_struct and PID entry.';
      next.isolationReason = 'Child completely reaped; Parent continuing.';

      next.events.push({
        id: next.events.length + 1,
        seq: `#${String(next.events.length + 1).padStart(2, '0')}`,
        type: 'kernel',
        pid: 4100,
        title: 'Zombie Child Reaped',
        desc: 'PID 4100 collects exit status for Child 4101. Zombie state cleared, task_struct freed.',
        line: 22
      });
    } else if (next.child.state === 'REAPED' || next.child.state === 'EXITED') {
      next.parent.pc = 23;
      next.parent.statusMsg = 'wait() complete.';
      next.parent.nextAction = 'return 0 (exit)';
    }
  } else if (pc === 23) {
    // Step 5: Exit
    next.parent.pc = 25;
    next.parent.state = 'EXITED';
    next.parent.exitCode = 0;
    next.parent.statusMsg = 'Parent process exited cleanly (return 0).';
    next.parent.nextAction = 'None (Terminated)';
    if (next.child.state === 'REAPED' || next.child.state === 'EXITED') {
      next.isFinished = true;
      next.lastStepAction = 'Parent process exited cleanly (return 0). Both processes finished execution.';
      next.nextStepAction = 'Simulation Complete.';
    } else {
      next.lastStepAction = 'Parent process exited cleanly (return 0). Child process remains.';
      next.nextStepAction = 'Step remaining active child process.';
    }
    next.memoryChange = 'Parent address space destroyed.';
    next.isolationReason = 'Parent terminated.';

    next.events.push({
      id: next.events.length + 1,
      seq: `#${String(next.events.length + 1).padStart(2, '0')}`,
      type: 'parent',
      pid: 4100,
      title: 'Parent Exited',
      desc: 'PID 4100 terminated with return 0.',
      line: 23
    });
  }

  return next;
}

// Step single instruction for Child
export function stepChildProcess(state) {
  if (!state.child.created || state.child.state === 'EXITED' || state.child.state === 'ZOMBIE' || state.child.state === 'REAPED') {
    return state;
  }
  const next = cloneState(state);
  next.stepIndex += 1;
  next.activePid = 4101;
  next.child.state = 'RUNNING';
  if (next.parent.state === 'RUNNING') {
    next.parent.state = 'RUNNABLE';
  }

  const pc = next.child.pc;

  // Step 1: Branch evaluation from Line 12
  if (pc === 12) {
    // Evaluating if (pid < 0) [false] and else if (pid == 0) [true]
    // Directly lands on target instruction: line 16 (counter += 5;)
    next.child.pc = 16;
    next.child.statusMsg = 'pid = 0. Evaluated branch condition -> entered child branch at line 16.';
    next.child.nextAction = 'Execute write: counter += 5;';
    next.lastStepAction = 'Child (PID 4101) evaluated fork() return (0 == 0). Satisfied child branch; positioned at line 16.';
    next.nextStepAction = 'Child will execute counter += 5 write. If memory is still COW-shared, this will trigger a page fault.';
    next.memoryChange = 'CPU register comparison only. Physical memory unchanged.';
    next.isolationReason = 'Processes have independent CPU register state. Child evaluated its return value (0).';

    next.events.push({
      id: next.events.length + 1,
      seq: `#${String(next.events.length + 1).padStart(2, '0')}`,
      type: 'child',
      pid: 4101,
      title: 'Branch Evaluated (pid == 0)',
      desc: 'PID 4101 evaluates pid == 0 as TRUE. Enters child block at line 16.',
      line: 16
    });
  } else if (pc === 16) {
    // Step 2: Child writes counter += 5 -> Triggers Copy-On-Write!
    next.child.counter = 15;
    next.child.pc = 17;
    next.child.nextAction = 'printf("Child  [PID %d]: counter = %d", ...) at line 17';

    if (next.memory.cowActive && next.memory.frameA.refs === 2) {
      // Allocate Frame B for Child
      next.memory.frameB.active = true;
      next.memory.frameB.addr = '0x0B800';
      next.memory.frameB.val = 15;
      next.memory.frameB.refs = 1;
      next.memory.frameB.owner = 'child';
      next.memory.childFrame = '0x0B800';
      next.memory.childPte = 'Read / Write (Private)';

      // Decrement Frame A refs, restore exclusive write to parent
      next.memory.frameA.refs = 1;
      next.memory.frameA.cow = false;
      next.memory.parentPte = 'Read / Write (Exclusive)';
      next.memory.cowActive = false;
      next.physicalBacking = 'Private Physical Frames (Parent: Frame A, Child: Frame B)';

      next.lastStepAction = 'Child (PID 4101) executed counter += 5 (15). MMU trapped write on COW page -> kernel allocated Frame B (0x0B800) for Child.';
      next.nextStepAction = 'Child will execute printf() at line 17.';
      next.memoryChange = 'COW Page Fault (#PF): Private Frame B (0x0B800) allocated for Child. counter = 15. Parent remains on Frame A (10).';
      next.isolationReason = 'Copy-On-Write broke memory sharing: Child writes to its private physical frame. Parent Frame A was never touched.';

      next.events.push({
        id: next.events.length + 1,
        seq: `#${String(next.events.length + 1).padStart(2, '0')}`,
        type: 'cow',
        pid: 4101,
        title: 'COW Page Fault on Child',
        desc: 'PID 4101 wrote to Read-Only COW page. MMU trapped #PF, allocated Frame 0x0B800 for Child, wrote 15. Parent counter remains 10.',
        line: 16
      });
    } else {
      // Frame B already allocated or exclusive
      if (next.memory.childFrame === '0x0B800') {
        next.memory.frameB.val = 15;
      } else {
        next.memory.frameA.val = 15;
      }
      next.lastStepAction = 'Child (PID 4101) updated counter += 5 to 15 in its private physical frame.';
      next.nextStepAction = 'Child will execute printf() at line 17.';
      next.memoryChange = `Child wrote 15 to private physical frame (${next.memory.childFrame}).`;
      next.isolationReason = 'Processes have separate physical frames. Modifying Child RAM cannot affect Parent RAM.';
    }

    next.child.statusMsg = 'Wrote counter += 5 (15). Stored in private frame. Parent counter remains unchanged.';
    next.events.push({
      id: next.events.length + 1,
      seq: `#${String(next.events.length + 1).padStart(2, '0')}`,
      type: 'child',
      pid: 4101,
      title: 'Child Modified counter',
      desc: 'PID 4101 updated counter to 15 in private frame. Parent counter is unaffected.',
      line: 16
    });
  } else if (pc === 17) {
    // Step 3: Printf
    next.child.pc = 18;
    next.stdout.push({
      proc: 'proc-child',
      text: `Child  [PID 4101]: counter = ${next.child.counter}`
    });
    next.child.statusMsg = 'Printed Child output to stdout. Ready to terminate.';
    next.child.nextAction = 'return 0 (exit child)';
    next.lastStepAction = `Child printed: "Child  [PID 4101]: counter = ${next.child.counter}" to stdout.`;
    next.nextStepAction = 'Child will return 0 and terminate at line 18.';
    next.memoryChange = 'Stdout I/O stream write. User memory unchanged.';
    next.isolationReason = 'Processes remain isolated.';

    next.events.push({
      id: next.events.length + 1,
      seq: `#${String(next.events.length + 1).padStart(2, '0')}`,
      type: 'child',
      pid: 4101,
      title: 'printf() Output',
      desc: `PID 4101 printed: "Child [PID 4101]: counter = ${next.child.counter}".`,
      line: 17
    });
  } else if (pc === 18) {
    // Step 4: Child Exit (return 0)
    next.child.pc = 25;
    next.child.exitCode = 0;
    next.child.nextAction = 'None (Terminated)';

    // Check parent wait() status
    if (next.parent.state === 'BLOCKED') {
      // Parent was waiting! Immediately unblock and reap child
      next.parent.state = 'RUNNING';
      next.parent.pc = 23;
      next.parent.statusMsg = 'Child exited. Parent unblocked from wait(NULL).';
      next.parent.nextAction = 'return 0 (exit parent)';
      next.child.state = 'REAPED';
      next.child.statusMsg = 'Child exited (0) and was reaped immediately by waiting parent.';
      next.activePid = 4100;
      next.lastStepAction = 'Child called exit(0). Parent was BLOCKED in wait() -> Parent unblocked immediately and reaped Child.';
      next.nextStepAction = 'Parent (PID 4100) is unblocked and will execute return 0 at line 23.';
      next.memoryChange = 'Child task_struct reaped and freed immediately.';
      next.isolationReason = 'Child terminated; Parent unblocked.';

      next.events.push({
        id: next.events.length + 1,
        seq: `#${String(next.events.length + 1).padStart(2, '0')}`,
        type: 'kernel',
        pid: 4101,
        title: 'Child Exit & Immediate Reap',
        desc: 'PID 4101 calls exit(0). Parent 4100 was BLOCKED in wait() -> Parent unblocks, Child reaped.',
        line: 18
      });
    } else {
      // Parent has not reached wait() yet! Child becomes a ZOMBIE
      next.child.state = 'ZOMBIE';
      next.child.statusMsg = 'Process terminated with exit(0). In ZOMBIE state awaiting parent wait().';
      next.activePid = 4100;
      next.lastStepAction = 'Child exited with code 0. Parent has not called wait() -> Child enters ZOMBIE state.';
      next.nextStepAction = 'Parent (PID 4100) is scheduled. Parent must call wait() to reap zombie child.';
      next.memoryChange = 'Child user memory released; kernel task_struct retained as ZOMBIE until parent calls wait().';
      next.isolationReason = 'Child is a zombie process awaiting wait() by parent.';

      next.events.push({
        id: next.events.length + 1,
        seq: `#${String(next.events.length + 1).padStart(2, '0')}`,
        type: 'kernel',
        pid: 4101,
        title: 'Child Enters ZOMBIE State',
        desc: 'PID 4101 exited with code 0. Parent has not yet called wait() -> Child enters ZOMBIE state.',
        line: 18
      });
    }
  }

  return next;
}

// Master step dispatcher based on active schedule
export function stepSimulator(state) {
  if (state.isFinished) return state;

  if (!state.isForkExecuted) {
    return executeForkSyscall(state, state.scheduleMode === 'schedule-failure');
  }

  if (state.isForkFailed) {
    return stepParentProcess(state);
  }

  const parentCanRun = state.parent.state === 'RUNNING' || state.parent.state === 'RUNNABLE';
  const childCanRun = state.child.state === 'RUNNING' || state.child.state === 'RUNNABLE';

  if (!parentCanRun && !childCanRun) {
    const next = cloneState(state);
    next.isFinished = true;
    return next;
  }

  if (state.scheduleMode === 'schedule-child-first') {
    if (childCanRun) {
      return stepChildProcess(state);
    } else if (parentCanRun) {
      return stepParentProcess(state);
    }
  } else if (state.scheduleMode === 'schedule-parent-first') {
    if (state.parent.state === 'BLOCKED') {
      return stepChildProcess(state);
    }
    if (parentCanRun) {
      return stepParentProcess(state);
    } else if (childCanRun) {
      return stepChildProcess(state);
    }
  } else {
    // Interactive / Interleaved:
    // If one process is blocked or terminated, step the only runnable process
    if (parentCanRun && !childCanRun) {
      return stepParentProcess(state);
    }
    if (childCanRun && !parentCanRun) {
      return stepChildProcess(state);
    }
    // If both can run, alternate or step active
    if (state.activePid === 4101 && childCanRun) {
      return stepChildProcess(state);
    } else if (parentCanRun) {
      return stepParentProcess(state);
    } else if (childCanRun) {
      return stepChildProcess(state);
    }
  }

  return state;
}
