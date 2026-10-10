// ==========================================================================
// fork() Playground — Standalone Universal Bundle
// Works in all environments: HTTP servers, static CDN deployments, and file:///
// Zero dependencies, fully self-contained.
// ==========================================================================

(function() {
  'use strict';

  // --- C SOURCE DEFINITIONS ---
  const C_SOURCE_LINES = [
    { line: 1, text: '#include <stdio.h>', tokens: [{ type: 'kwd', text: '#include' }, { type: 'str', text: ' <stdio.h>' }] },
    { line: 2, text: '#include <unistd.h>', tokens: [{ type: 'kwd', text: '#include' }, { type: 'str', text: ' <unistd.h>' }] },
    { line: 3, text: '#include <sys/types.h>', tokens: [{ type: 'kwd', text: '#include' }, { type: 'str', text: ' <sys/types.h>' }] },
    { line: 4, text: '#include <sys/wait.h>', tokens: [{ type: 'kwd', text: '#include' }, { type: 'str', text: ' <sys/wait.h>' }] },
    { line: 5, text: '', tokens: [] },
    { line: 6, text: 'int main(void) {', tokens: [{ type: 'type', text: 'int' }, { text: ' ' }, { type: 'func', text: 'main' }, { text: '(void) {' }] },
    { line: 7, text: '    int counter = 10;', tokens: [{ text: '    ' }, { type: 'type', text: 'int' }, { text: ' counter = ' }, { type: 'num', text: '10' }, { text: ';' }] },
    { line: 8, text: '    printf("Initial counter: %d\\n", counter);', tokens: [{ text: '    ' }, { type: 'func', text: 'printf' }, { text: '(' }, { type: 'str', text: '"Initial counter: %d\\n"' }, { text: ', counter);' }] },
    { line: 9, text: '', tokens: [] },
    { line: 10, text: '    pid_t pid = fork();', isForkCall: true, tokens: [{ text: '    ' }, { type: 'type', text: 'pid_t' }, { text: ' pid = ' }, { type: 'func', text: 'fork' }, { text: '();' }] },
    { line: 11, text: '', tokens: [] },
    { line: 12, text: '    if (pid < 0) {', isBranchCheck: true, tokens: [{ text: '    ' }, { type: 'kwd', text: 'if' }, { text: ' (pid < ' }, { type: 'num', text: '0' }, { text: ') {' }] },
    { line: 13, text: '        fprintf(stderr, "fork failed\\n");', tokens: [{ text: '        ' }, { type: 'func', text: 'fprintf' }, { text: '(stderr, ' }, { type: 'str', text: '"fork failed\\n"' }, { text: ');' }] },
    { line: 14, text: '        return 1;', tokens: [{ text: '        ' }, { type: 'kwd', text: 'return' }, { text: ' ' }, { type: 'num', text: '1' }, { text: ';' }] },
    { line: 15, text: '    } else if (pid == 0) {', isChildBranch: true, tokens: [{ text: '    } ' }, { type: 'kwd', text: 'else if' }, { text: ' (pid == ' }, { type: 'num', text: '0' }, { text: ') {' }] },
    { line: 16, text: '        counter += 5;', isChildWrite: true, tokens: [{ text: '        counter += ' }, { type: 'num', text: '5' }, { text: ';' }] },
    { line: 17, text: '        printf("Child  [PID %d]: counter = %d\\n", getpid(), counter);', tokens: [{ text: '        ' }, { type: 'func', text: 'printf' }, { text: '(' }, { type: 'str', text: '"Child  [PID %d]: counter = %d\\n"' }, { text: ', ' }, { type: 'func', text: 'getpid' }, { text: '(), counter);' }] },
    { line: 18, text: '        return 0;', tokens: [{ text: '        ' }, { type: 'kwd', text: 'return' }, { text: ' ' }, { type: 'num', text: '0' }, { text: ';' }] },
    { line: 19, text: '    } else {', isParentBranch: true, tokens: [{ text: '    } ' }, { type: 'kwd', text: 'else' }, { text: ' {' }] },
    { line: 20, text: '        counter += 100;', isParentWrite: true, tokens: [{ text: '        counter += ' }, { type: 'num', text: '100' }, { text: ';' }] },
    { line: 21, text: '        printf("Parent [PID %d]: counter = %d\\n", getpid(), counter);', tokens: [{ text: '        ' }, { type: 'func', text: 'printf' }, { text: '(' }, { type: 'str', text: '"Parent [PID %d]: counter = %d\\n"' }, { text: ', ' }, { type: 'func', text: 'getpid' }, { text: '(), counter);' }] },
    { line: 22, text: '        wait(NULL);', isWaitCall: true, tokens: [{ text: '        ' }, { type: 'func', text: 'wait' }, { text: '(NULL);' }] },
    { line: 23, text: '        return 0;', tokens: [{ text: '        ' }, { type: 'kwd', text: 'return' }, { text: ' ' }, { type: 'num', text: '0' }, { text: ';' }] },
    { line: 24, text: '    }', tokens: [{ text: '    }' }] },
    { line: 25, text: '}', tokens: [{ text: '}' }] }
  ];

  // --- STATE & SIMULATION ENGINE ---
  function createInitialState(scheduleMode = 'schedule-interactive') {
    return {
      stepIndex: 0,
      scheduleMode,
      isForkExecuted: false,
      isForkFailed: scheduleMode === 'schedule-failure',
      isFinished: false,
      activePid: 4100,
      lastStepAction: 'Single process (PID 4100) running before fork(). Local variable counter = 10 initialized in user stack.',
      nextStepAction: 'Invoke sys_fork() system call at line 10 to duplicate the process into parent and child.',
      memoryChange: 'Single physical Frame A (0x0A400) mapped exclusive Read/Write to Parent VPN 0x7ffd10.',
      isolationReason: 'Single process exists currently; no isolation needed.',
      physicalBacking: 'Exclusive Private (Frame A)',
      parent: {
        pid: 4100,
        ppid: 4000,
        state: 'RUNNING',
        pc: 10,
        retVal: null,
        counter: 10,
        exitCode: null,
        statusMsg: 'Process running in single-process context before fork().',
        nextAction: 'Call sys_fork() syscall'
      },
      child: {
        pid: 4101,
        ppid: 4100,
        created: false,
        state: 'UNBORN',
        pc: null,
        retVal: null,
        counter: null,
        exitCode: null,
        statusMsg: 'Process does not exist yet. No task_struct allocated by the kernel.',
        nextAction: 'Awaiting creation via fork()'
      },
      memory: {
        cowActive: false,
        parentVpn: '0x7ffd10',
        childVpn: '0x7ffd10',
        parentPte: 'Read / Write (Exclusive)',
        childPte: 'Unmapped',
        parentFrame: '0x0A400',
        childFrame: null,
        frameA: { id: 'FRAME A', addr: '0x0A400', val: 10, refs: 1, cow: false, owner: 'parent' },
        frameB: { id: 'FRAME B', addr: '0x0B800', val: null, active: false, refs: 0, owner: null }
      },
      stdout: [
        { proc: 'proc-parent', text: 'Initial counter: 10' }
      ],
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

  function cloneState(state) {
    return JSON.parse(JSON.stringify(state));
  }

  function executeForkSyscall(state, forceFailure = false) {
    const next = cloneState(state);
    next.isForkExecuted = true;
    next.stepIndex += 1;

    if (forceFailure || next.scheduleMode === 'schedule-failure') {
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
    next.parent.pc = 12;
    next.parent.retVal = 4101;
    next.parent.state = 'RUNNABLE';
    next.parent.counter = 10;
    next.parent.statusMsg = 'fork() returned child PID 4101. Ready to evaluate branch at line 12.';
    next.parent.nextAction = 'Evaluate branch: pid > 0 -> takes else block';

    next.child.created = true;
    next.child.pc = 12;
    next.child.retVal = 0;
    next.child.state = 'RUNNABLE';
    next.child.counter = 10;
    next.child.statusMsg = 'Created by fork(). Received return value 0. Ready to evaluate branch at line 12.';
    next.child.nextAction = 'Evaluate branch: pid == 0 -> takes child block';

    next.memory.cowActive = true;
    next.memory.parentPte = 'Read-Only (COW)';
    next.memory.childPte = 'Read-Only (COW)';
    next.memory.parentFrame = '0x0A400';
    next.memory.childFrame = '0x0A400';
    next.memory.frameA.refs = 2;
    next.memory.frameA.cow = true;
    next.memory.frameA.val = 10;
    next.physicalBacking = 'Shared Physical RAM (Frame A, Refs: 2)';

    next.lastStepAction = 'fork() executed: Kernel cloned PID 4100 into Child PID 4101. Parent received 4101; Child received 0. Both positioned at line 12 with counter = 10.';
    next.nextStepAction = 'Both processes are RUNNABLE. Linux does not guarantee scheduling order. Choose which process runs next: Parent (4100) or Child (4101).';
    next.memoryChange = 'Zero eager copying: Parent and Child virtual pages (0x7ffd10) both point to physical Frame A (0x0A400). PTEs marked Read-Only (COW). Refs = 2.';
    next.isolationReason = 'Processes have independent virtual address spaces, but share physical RAM read-only until a write occurs.';

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

  function stepParentProcess(state) {
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

    if (pc === 12) {
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
      next.parent.counter = 110;
      next.parent.pc = 21;
      next.parent.nextAction = 'printf("Parent [PID %d]: counter = %d", ...) at line 21';

      if (next.memory.cowActive && next.memory.frameA.refs === 2) {
        next.memory.frameB.active = true;
        next.memory.frameB.addr = '0x0B800';
        next.memory.frameB.val = 110;
        next.memory.frameB.refs = 1;
        next.memory.frameB.owner = 'parent';
        next.memory.parentFrame = '0x0B800';
        next.memory.parentPte = 'Read / Write (Private)';

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
      if (next.child.state === 'RUNNING' || next.child.state === 'RUNNABLE') {
        next.parent.state = 'BLOCKED';
        next.parent.statusMsg = 'Blocked in wait(NULL) waiting for Child (PID 4101) to terminate.';
        next.parent.nextAction = 'Awaiting child exit (SIGCHLD)';
        next.activePid = 4101;
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

  function stepChildProcess(state) {
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

    if (pc === 12) {
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
      next.child.counter = 15;
      next.child.pc = 17;
      next.child.nextAction = 'printf("Child  [PID %d]: counter = %d", ...) at line 17';

      if (next.memory.cowActive && next.memory.frameA.refs === 2) {
        next.memory.frameB.active = true;
        next.memory.frameB.addr = '0x0B800';
        next.memory.frameB.val = 15;
        next.memory.frameB.refs = 1;
        next.memory.frameB.owner = 'child';
        next.memory.childFrame = '0x0B800';
        next.memory.childPte = 'Read / Write (Private)';

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
      next.child.pc = 25;
      next.child.exitCode = 0;
      next.child.nextAction = 'None (Terminated)';

      if (next.parent.state === 'BLOCKED') {
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

  function stepSimulator(state) {
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
      if (parentCanRun && !childCanRun) {
        return stepParentProcess(state);
      }
      if (childCanRun && !parentCanRun) {
        return stepChildProcess(state);
      }
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

  // --- UI RENDERER ---
  class SimulatorUI {
    constructor() {
      this.elements = {
        btnReset: document.getElementById('btn-reset'),
        btnStepBack: document.getElementById('btn-step-back'),
        btnStep: document.getElementById('btn-step'),
        btnRun: document.getElementById('btn-run'),
        btnPause: document.getElementById('btn-pause'),
        selectSchedule: document.getElementById('select-schedule'),
        selectSpeed: document.getElementById('select-speed'),

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

        codeViewport: document.getElementById('code-viewport'),
        consoleOutput: document.getElementById('console-output'),
        btnClearConsole: document.getElementById('btn-clear-console'),

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

        diffParentVal: document.getElementById('diff-parent-val'),
        diffChildVal: document.getElementById('diff-child-val'),
        diffStatusBadge: document.getElementById('diff-status-badge'),
        comparatorIcon: document.getElementById('comparator-icon'),
        comparatorDesc: document.getElementById('comparator-desc'),
        diffIsolationText: document.getElementById('diff-isolation-text'),

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

        traceCounter: document.getElementById('trace-counter'),
        traceList: document.getElementById('trace-list'),
        traceContainer: document.getElementById('trace-container')
      };

      this.activeFilter = 'all';
      this.initSourceCode();
    }

    initSourceCode() {
      const container = this.elements.codeViewport;
      if (!container) return;
      // If code-lines already exist (pre-rendered in HTML), do not re-create DOM nodes unnecessarily
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
      if (this.elements.btnStepBack) this.elements.btnStepBack.disabled = !canStepBack;
      if (this.elements.btnStep) this.elements.btnStep.disabled = state.isFinished;
      if (this.elements.btnRun) this.elements.btnRun.disabled = state.isFinished;
    }

    renderStatusBanner(state) {
      if (!this.elements.statusProcText) return;

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

      if (!state.isForkExecuted) {
        this.elements.statusPcText.textContent = 'Line 10: pid_t pid = fork();';
      } else if (state.activePid === 4101 && state.child.pc) {
        this.elements.statusPcText.textContent = `Line ${state.child.pc}: ${this.getLineSummary(state.child.pc)}`;
      } else if (state.parent.pc) {
        this.elements.statusPcText.textContent = `Line ${state.parent.pc}: ${this.getLineSummary(state.parent.pc)}`;
      } else {
        this.elements.statusPcText.textContent = '—';
      }

      if (!state.isForkExecuted) {
        this.elements.statusRetText.textContent = 'uncalled';
      } else if (state.isForkFailed) {
        this.elements.statusRetText.textContent = '-1 (sys_fork error)';
      } else if (state.activePid === 4101) {
        this.elements.statusRetText.textContent = '0 (child return)';
      } else {
        this.elements.statusRetText.textContent = '4101 (child PID)';
      }

      this.elements.statusMemText.textContent = state.physicalBacking;
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
          try { lineEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (_) {}
        }
      } else {
        if (parentPc) {
          const lineEl = document.getElementById(`code-line-${parentPc}`);
          const gutterEl = document.getElementById(`pc-gutter-${parentPc}`);
          if (lineEl && gutterEl) {
            lineEl.classList.add('active-parent');
            gutterEl.innerHTML = `<span class="pc-icon pc-icon-p" title="Parent Instruction Pointer (PID 4100)">P</span>`;
            if (state.activePid === 4100) {
              try { lineEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (_) {}
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
              try { lineEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (_) {}
            }
          }
        }
      }
    }

    renderConsole(state) {
      const outEl = this.elements.consoleOutput;
      if (!outEl) return;
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

      if (this.elements.schedulerActiveBadge) {
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
      }

      if (this.elements.btnStepParent) this.elements.btnStepParent.disabled = !parentRunnable;
      if (this.elements.btnStepChild) this.elements.btnStepChild.disabled = !childRunnable;

      if (this.elements.schedExplanation) {
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
      }

      // PARENT LANE
      if (this.elements.parentStateBadge) {
        this.elements.parentStateBadge.textContent = state.parent.state;
        this.elements.parentStateBadge.className = `state-badge ${this.getStateBadgeClass(state.parent.state)}`;
      }
      if (this.elements.parentRetText) {
        this.elements.parentRetText.textContent = state.parent.retVal !== null ? state.parent.retVal : 'uncalled';
      }
      if (this.elements.parentPcText) {
        this.elements.parentPcText.textContent = state.parent.state === 'EXITED'
          ? `Terminated (exit ${state.parent.exitCode})`
          : `Line ${state.parent.pc}: ${this.getLineSummary(state.parent.pc)}`;
      }
      if (this.elements.parentCounterVal) this.elements.parentCounterVal.textContent = state.parent.counter;
      if (this.elements.parentNextAction) this.elements.parentNextAction.innerHTML = `<strong>Next:</strong> ${this.escapeHtml(state.parent.nextAction)}`;
      if (this.elements.parentStatusLine) this.elements.parentStatusLine.textContent = state.parent.statusMsg;

      const isParentActive = (state.activePid === 4100 || !state.child.created) && parentRunnable;
      if (this.elements.laneParent) {
        if (isParentActive) {
          this.elements.laneParent.classList.add('lane-active');
        } else {
          this.elements.laneParent.classList.remove('lane-active');
        }
      }

      // CHILD LANE
      if (this.elements.laneChild) {
        if (!state.child.created) {
          this.elements.laneChild.classList.add('lane-unborn');
          this.elements.laneChild.classList.remove('lane-active');
          if (this.elements.childStateBadge) {
            this.elements.childStateBadge.textContent = 'NOT CREATED';
            this.elements.childStateBadge.className = 'state-badge badge-unborn';
          }
          if (this.elements.childRetText) this.elements.childRetText.textContent = '—';
          if (this.elements.childPcText) this.elements.childPcText.textContent = '—';
          if (this.elements.childCounterVal) this.elements.childCounterVal.textContent = '—';
          if (this.elements.childNextAction) this.elements.childNextAction.innerHTML = `<strong>Next:</strong> Awaiting creation via fork()`;
          if (this.elements.childStatusLine) this.elements.childStatusLine.textContent = state.child.statusMsg;
          if (this.elements.forkJunction) this.elements.forkJunction.classList.remove('fork-active');
        } else {
          this.elements.laneChild.classList.remove('lane-unborn');
          if (this.elements.forkJunction) this.elements.forkJunction.classList.add('fork-active');
          if (this.elements.childStateBadge) {
            this.elements.childStateBadge.textContent = state.child.state;
            this.elements.childStateBadge.className = `state-badge ${this.getStateBadgeClass(state.child.state)}`;
          }
          if (this.elements.childRetText) this.elements.childRetText.textContent = state.child.retVal;
          if (this.elements.childPcText) {
            this.elements.childPcText.textContent = state.child.state === 'EXITED' || state.child.state === 'REAPED'
              ? `Reaped / Exited (0)`
              : `Line ${state.child.pc}: ${this.getLineSummary(state.child.pc)}`;
          }
          if (this.elements.childCounterVal) this.elements.childCounterVal.textContent = state.child.counter;
          if (this.elements.childNextAction) this.elements.childNextAction.innerHTML = `<strong>Next:</strong> ${this.escapeHtml(state.child.nextAction)}`;
          if (this.elements.childStatusLine) this.elements.childStatusLine.textContent = state.child.statusMsg;

          const isChildActive = state.activePid === 4101 && childRunnable;
          if (isChildActive) {
            this.elements.laneChild.classList.add('lane-active');
          } else {
            this.elements.laneChild.classList.remove('lane-active');
          }
        }
      }
    }

    renderVariablesDiff(state) {
      if (this.elements.diffParentVal) this.elements.diffParentVal.textContent = state.parent.counter;
      if (this.elements.diffChildVal) {
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
      }
      if (this.elements.diffIsolationText) {
        this.elements.diffIsolationText.innerHTML = state.isolationReason;
      }
    }

    renderMemoryCOW(state) {
      const mem = state.memory;
      if (this.elements.vpageParentPerm) this.elements.vpageParentPerm.textContent = `PTE: ${mem.parentPte}`;
      
      if (this.elements.vpageChild) {
        if (state.child.created) {
          this.elements.vpageChild.classList.remove('card-disabled');
          this.elements.vpageChildPerm.textContent = `PTE: ${mem.childPte}`;
          this.elements.pointerChild.style.display = 'block';
        } else {
          this.elements.vpageChild.classList.add('card-disabled');
          this.elements.vpageChildPerm.textContent = 'PTE: Unmapped';
          this.elements.pointerChild.style.display = 'none';
        }
      }

      if (this.elements.pframeAVal) {
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
      }

      if (this.elements.pframeB) {
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
      }

      if (this.elements.memBackingBadge) {
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
    }

    renderTraceLog(state) {
      if (!this.elements.traceCounter || !this.elements.traceList) return;
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

  // --- APPLICATION CONTROLLER ---
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
      const scheduleMode = this.ui.elements.selectSchedule ? this.ui.elements.selectSchedule.value : 'schedule-interactive';
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

      if (this.ui.elements.btnRun) this.ui.elements.btnRun.style.display = 'none';
      if (this.ui.elements.btnPause) this.ui.elements.btnPause.style.display = 'inline-flex';

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
      if (this.ui.elements.btnRun) this.ui.elements.btnRun.style.display = 'inline-flex';
      if (this.ui.elements.btnPause) this.ui.elements.btnPause.style.display = 'none';
    }

    bindEvents() {
      const el = this.ui.elements;

      if (el.btnReset) el.btnReset.addEventListener('click', () => this.resetSimulation());
      if (el.btnStepBack) el.btnStepBack.addEventListener('click', () => this.stepBack());
      if (el.btnStep) el.btnStep.addEventListener('click', () => {
        this.stopAutoRun();
        this.step();
      });
      if (el.btnRun) el.btnRun.addEventListener('click', () => this.startAutoRun());
      if (el.btnPause) el.btnPause.addEventListener('click', () => this.stopAutoRun());

      if (el.selectSchedule) el.selectSchedule.addEventListener('change', () => this.resetSimulation());

      if (el.selectSpeed) {
        el.selectSpeed.addEventListener('change', (e) => {
          this.speedMs = parseInt(e.target.value, 10);
          if (this.runTimer) {
            this.stopAutoRun();
            this.startAutoRun();
          }
        });
      }

      if (el.btnStepParent) el.btnStepParent.addEventListener('click', () => this.stepParent());
      if (el.btnStepChild) el.btnStepChild.addEventListener('click', () => this.stepChild());

      if (el.btnClearConsole) {
        el.btnClearConsole.addEventListener('click', () => {
          const current = this.getCurrentState();
          current.stdout = [];
          this.ui.renderConsole(current);
        });
      }

      document.querySelectorAll('.filter-chip').forEach((chip) => {
        chip.addEventListener('click', (e) => {
          document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
          e.target.classList.add('active');
          this.ui.activeFilter = e.target.dataset.filter;
          this.ui.renderTraceLog(this.getCurrentState());
        });
      });

      if (el.traceList) {
        el.traceList.addEventListener('click', (e) => {
          const entry = e.target.closest('.trace-entry');
          if (!entry) return;

          document.querySelectorAll('.trace-entry').forEach(t => t.classList.remove('active-trace'));
          entry.classList.add('active-trace');

          const line = entry.dataset.line;
          if (line) {
            const lineEl = document.getElementById(`code-line-${line}`);
            if (lineEl) {
              try { lineEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (_) {}
              lineEl.style.outline = '1px solid #79c0ff';
              setTimeout(() => { lineEl.style.outline = 'none'; }, 1000);
            }
          }
        });
      }

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

  // --- BOOTSTRAP (ROBUST READY STATE CHECK) ---
  function startPlayground() {
    if (!window.forkPlayground) {
      window.forkPlayground = new ForkPlaygroundApp();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startPlayground);
  } else {
    // Already loaded or interactive: start immediately!
    startPlayground();
  }
})();
