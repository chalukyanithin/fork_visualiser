# fork() Playground

An interactive, debugger-grade visualization of the Linux `fork()` system call, virtual memory duplication, Copy-On-Write (COW), and non-deterministic process scheduling.

---

## 🎯 The Central Progression

Executing `process_fork.c` follows an unmistakable linear systems progression:

```
ONE PROCESS (PID 4100)
     ↓
CALL sys_fork() SYSCALL
     ↓
CREATE CHILD (PID 4101) & TWO RETURN VALUES (4101 in Parent, 0 in Child)
     ↓
TWO EXECUTION PATHS (Branch Evaluation at Line 12)
     ↓
INDEPENDENT VARIABLE CHANGES
     ↓
COPY-ON-WRITE (COW) PAGE FAULT ON DEMAND
     ↓
CHILD EXIT / wait() & ZOMBIE REAPING
```

At every simulated instruction, the playground keeps the **source code highlight**, **process state**, **CPU return registers**, **stack variable inspector**, **physical memory page tables**, and **kernel execution trace** completely synchronized.

---

## 🧠 How It Works (Systems Mental Model)

### 1. One Call, Two Return Values

```c
pid_t pid = fork();
```

`fork()` is called **once** by the parent process, but returns **twice**:
- **In the Parent:** Returns the **PID of the newly created child** (`4101`). The parent receives the child PID so it can track, signal, and synchronize with it using `wait()` or `waitpid()`.
- **In the Child:** Returns **`0`**. The child receives `0` as an unambiguous success indicator (it can find its own PID at any time by calling `getpid()`).
- **On Failure:** Returns **`-1`** in the parent (e.g. if the system-wide process limit `EAGAIN` or `ENOMEM` is reached); no child process is spawned.

> **Crucial Rule:** The child does **not** restart at `main()`. When the kernel clones the parent's `task_struct`, it duplicates the CPU instruction pointer (`RIP`/`EIP`). Both processes resume execution immediately at the instruction following the `fork()` syscall (Line 12).

---

### 2. Virtual Memory Isolation vs. Copy-On-Write (COW)

A common misconception is that `fork()` instantly duplicates all physical RAM allocated to the process. In modern operating systems, this would be prohibitively slow and wasteful.

> **Core Kernel Principle:**  
> **Separate virtual address spaces does NOT mean immediate separate physical copies of every page.**

```
[Parent VPN: 0x7ffd10] ───┐
                          ├─► [Physical Frame A: 0x0A400] (Refs: 2, Read-Only COW)
[Child  VPN: 0x7ffd10] ───┘
```

#### Step 1: Eager Sharing at `fork()`
When `fork()` executes:
1. The kernel allocates a new page table for the child and duplicates the parent's Page Table Entries (PTEs).
2. Both parent and child virtual pages (`0x7ffd10`) point to the **exact same physical RAM frame** (`Frame A: 0x0A400`).
3. The kernel marks both processes' PTEs as **Read-Only / COW** and increments the physical frame reference count to `2`.
4. Zero bytes of physical heap, data, or stack RAM are copied.

#### Step 2: Hardware Page Fault on Write (`counter += 5` or `counter += 100`)
```
Child attempts write to virtual address 0x7ffd104c
               │
               ▼
   MMU detects write to Read-Only page
               │
               ▼
   Hardware Page Fault (#PF) Trapped by Kernel (do_wp_page)
               │
               ▼
   Kernel allocates private Physical Frame B (0x0B800)
   Copies original 4 KiB page data from Frame A to Frame B
   Remaps Child PTE to Read/Write -> Frame B
   Decrements Frame A reference count to 1
               │
               ▼
   Kernel restarts the faulting write instruction transparently
```

After the COW transition:
- **Child:** Maps virtual `0x7ffd10` &rarr; private physical **Frame B (`0x0B800`)**, containing `counter = 15`.
- **Parent:** Maps virtual `0x7ffd10` &rarr; exclusive physical **Frame A (`0x0A400`)**, containing `counter = 10`.
- **Isolation:** Both processes continue to use the exact same virtual address (`0x7ffd104c`), yet modifying memory in one process never modifies the other.

---

### 3. Non-Deterministic Scheduling (Linux CFS)

POSIX and the Linux kernel make **no guarantee** about execution order after a `fork()`. Whether the parent or the child executes first depends on current CPU load, scheduler slices, and kernel heuristics.

The playground lets you test both valid kernel interleavings:

#### Schedule Path A: Parent Executes First
1. Parent branches to `else` block, writes `counter += 100` (COW fault allocates private frame for Parent).
2. Parent prints `counter = 110` to `stdout`.
3. Parent executes `wait(NULL)`. Because Child is still running, the kernel transitions Parent state to **`BLOCKED`**.
4. The scheduler switches to Child. Child runs, writes `counter = 15`, prints to `stdout`, and calls `exit(0)`.
5. Upon Child exit, Parent is immediately **unblocked** and reaps the child.

#### Schedule Path B: Child Executes First
1. Child branches to `else if (pid == 0)`, writes `counter += 5` (COW fault allocates private frame for Child).
2. Child prints `counter = 15` to `stdout`.
3. Child terminates with `exit(0)`.
4. Because the Parent has not called `wait(NULL)` yet, Child enters the **`ZOMBIE`** state.
5. The kernel switches to Parent. Parent runs, modifies `counter = 110`, prints to `stdout`, and calls `wait(NULL)`.
6. `wait()` immediately reaps the waiting Zombie Child, collects its exit status code (`0`), and cleans up its kernel `task_struct`.

---

### 4. Process Lifecycle & The Zombie State

When a child process terminates before its parent:
- Its virtual memory, open file descriptors, and user stack are freed immediately.
- However, its entry in the kernel process table (`task_struct`) and its PID remain allocated in the **`ZOMBIE`** state (`TASK_DEAD`/`EXIT_ZOMBIE`).
- **Why?** The kernel must preserve the child's termination status code so the parent can inspect it via `wait(&status)`.
- If the parent never calls `wait()`, zombie processes persist until the parent terminates (at which point `init`/`systemd` adopts and reaps them).

---

## 🔍 The 8 Debugger Invariants

At every single step, the user interface explicitly answers:

| Question | Where It Is Visible |
|---|---|
| **Which process is running?** | Status banner active badge, scheduler pill, and highlighted active lane (`lane-active`). |
| **What source line is executing?** | Synchronized C source line highlight + `P` (Parent) and `C` (Child) gutter icons. |
| **What is the current process ID?** | Lane identity header (PID `4100` vs PID `4101`). |
| **What value did `fork()` return?** | Lane return badge: Parent receives `4101`, Child receives `0`. |
| **What happens next?** | Status bar *What Happens Next* strip + lane footer next-action field. |
| **What changed in memory?** | Memory State Inspector box detailing allocations and reference counts. |
| **Is the physical page shared or private?** | Page Table Entry (PTE) tags and Physical Frame reference badges (`Refs: 2 (COW)` vs `Refs: 1`). |
| **Why did the other process's variable remain unchanged?** | Dedicated Memory Isolation Verification box explaining virtual address mapping separation. |

---

## 🖥️ UI Architecture

The workbench is divided into 4 synchronized debugger panes:

- **Area A — C Source (`process_fork.c`):** Live syntax-highlighted code with dual instruction pointers (`P` and `C`) and connected process `stdout` stream.
- **Area B — Process Execution Lanes:** Parent and child task contexts side-by-side with direct scheduler step controls (`Step Parent (4100)` and `Step Child (4101)`).
- **Area C — Virtual Memory & COW Inspector:** Shows the exact relationship between virtual pages (`VPN 0x7ffd10`) and physical RAM frames (`0x0A400` vs `0x0B800`).
- **Area D — Execution Trace:** Chronological system call log with filters for Kernel, COW, Parent, and Child events.

---

## 🚀 Running Locally

```bash
# Start the local server
npm start
# or
node server.js
```

Navigate to: **`http://localhost:3000`**

### Keyboard Shortcuts
- **`Space`** or **`→`**: Step next simulated instruction
- **`P`**: Step Parent process (PID 4100)
- **`C`**: Step Child process (PID 4101)
- **`←`**: Step backward one event
- **`R`**: Reset simulation
