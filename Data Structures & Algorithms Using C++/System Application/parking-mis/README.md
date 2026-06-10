# Smart Parking Management System — Kigali City

A console-based **Smart Parking Management System** written in **C++ (C++17)** using
**in-memory data structures only** (no database). It demonstrates Data Structures &
Algorithms (DSA) and Object-Oriented Programming (OOP) design with robust input
validation.

---

## 1. How to compile & run

```bash
g++ -std=c++17 -Wall -Wextra -O2 main.cpp -o parking
./parking
```

No external libraries are required (standard library only).

---

## 2. Default parking rates (tariffs)

| Vehicle type | Default rate (RWF / hour) |
|--------------|---------------------------|
| Motorcycle   | 500                       |
| Car          | 1,000                     |
| Truck        | 2,000 *(not given in brief; sensible default, editable at runtime)* |

- Fees are calculated **only at exit**.
- **Partial hours are billed as full hours** (rounded up). E.g. 15 min → 1 hour,
  1 h 20 min → 2 hours.
- Prices can be changed while running (menu option 5). **Completed transactions
  keep the price that was active at their exit time** — updates never rewrite history.

---

## 3. Menu options

```
1) Configure parking slot      -> add a unique slot (ID, type, zone)
2) List parking slots          -> view all slots and their status
3) Register vehicle entry      -> park a vehicle, auto-allocate a matching slot
4) Vehicle exit & payment      -> release slot, compute fee, print receipt, log history
5) Update parking prices       -> change the active hourly rate of a vehicle type
6) View current tariffs        -> show active rates
7) Reports                     -> available slots / parked vehicles / history / daily revenue
0) Exit program
```

Date-time inputs use the format `YYYY-MM-DD HH:MM` (e.g. `2025-06-10 08:30`).

---

## 4. Project explanation & architecture

The program maps the 5 required tasks to clearly separated components:

- **Task 1 – Slot configuration:** `ParkingSlot` records (unique `slotId`, supported
  `VehicleType`, `zone`, `status`).
- **Task 2 – Vehicle entry:** unique plate, auto slot allocation, "no slot" handled
  gracefully, a vehicle cannot park twice at once.
- **Task 3 – Duration & fee:** `ceil(duration)` to whole hours × current rate; runtime
  price updates that do not affect history.
- **Task 4 – Exit & update:** release slot, print receipt, store frozen transaction.
- **Task 5 – Reports:** available slots, parked vehicles, history, daily revenue.

### OOP principles
- **Encapsulation:** all state lives privately inside the `ParkingSystem` class; the
  `Vehicle` plate is protected.
- **Abstraction:** abstract base class `Vehicle` exposes a clean interface.
- **Inheritance:** `Motorcycle`, `Car`, `Truck` derive from `Vehicle`.
- **Polymorphism:** `type()` / `typeName()` are virtual and resolved at runtime
  (objects held via `std::unique_ptr<Vehicle>`).

### Data structures used (and justification)

| Structure | Type | Purpose | Why |
|-----------|------|---------|-----|
| `slots` | `unordered_map<int, ParkingSlot>` | all slots keyed by Slot ID | O(1) lookup/update; enforces uniqueness |
| `freeByType` | `unordered_map<int, queue<int>>` | free slots per vehicle type | O(1) fair (FIFO) slot allocation |
| `activeByPlate` | `unordered_map<string, ActiveParking>` | currently parked vehicles | O(1) duplicate check & exit lookup; enforces unique plate |
| `history` | `vector<ParkingRecord>` | completed transactions | O(1) append, easy traversal for reports |
| `tariffs` | `unordered_map<int, double>` | active prices per type | O(1) rate lookup/update |

Insertion, deletion, update and traversal are all implemented (add/remove slots
& vehicles, price/status updates, and report traversals).

---

## 5. Validation rules implemented

- **Wrong data types** (text/symbols where numbers expected) → `Invalid input. Please enter a valid number.` and re-prompt.
- **Empty input** for plate/zone/required fields → rejected and re-prompted.
- **Invalid menu choice / out of range** → re-prompted with allowed range.
- **Negative or zero prices** → rejected (must be positive).
- **Unrealistically large price** (> 1e9) → rejected.
- **Duplicate Slot ID** → rejected (uniqueness).
- **Duplicate active plate** (vehicle already parked) → rejected.
- **Invalid date/time format** → rejected with example.
- **Invalid calendar date** (month 1–12, real day count incl. leap years) → rejected.
- **Year out of range** (`< 2000` or `> 2100`) → rejected (too far future/past).
- **Date/time in the future** vs system clock → rejected.
- **Exit time ≤ entry time** → rejected, exit aborted.
- **No matching slot available** → graceful message, no crash.
- **Exit/lookup for non-existent plate** → graceful message.
- **Numeric overflow** in parsing → caught and rejected.

The program **never crashes on bad input** — every reader loops until valid data
is supplied.

---

## 6. Sample test cases

### Valid flow
1. `1` add slot → ID `1`, type `Car`, zone `A`.
2. `3` entry → plate `RAB123C`, `Car`, `2025-06-10 08:00`.
3. `4` exit → `RAB123C`, `2025-06-10 09:20` → **2 h × 1000 = 2000 RWF**.
4. `7` → `4` daily revenue → `2025-06-10 : 2000 RWF`.

### Price-update-does-not-affect-history
1. Complete a Car parking at rate 1000 (fee logged as 1000/hr).
2. `5` update Car rate to `1500`.
3. `7` → `3` history still shows the old `1000` rate for the completed record.

### Invalid input tests
- Menu choice `abc` → re-prompted.
- Duplicate Slot ID `1` → `Slot ID 1 already exists`.
- Park `RAB123C` twice → `vehicle cannot be parked twice`.
- Entry time `2090-01-01 10:00` → future/too-far rejected.
- Exit before entry (`07:00` < `08:00`) → exit aborted.
- Price `-5`, `0`, `xyz` → rejected until a positive number is given.
- Exit unknown plate `NOPLATE` → `No active parking found`.

---

## 7. Time & space complexity

Let `S` = slots, `V` = active vehicles, `H` = history records.

| Operation | Time | Space |
|-----------|------|-------|
| Add slot | O(1) avg | O(1) |
| Allocate slot on entry | O(1) amortised (queue pop, skipping stale entries) | O(1) |
| Register entry | O(1) avg | O(1) |
| Vehicle exit + fee | O(1) avg | O(1) |
| Update price | O(1) | O(1) |
| List slots | O(S log S) (sorted output) | O(S) |
| Report parked vehicles | O(V) | O(1) |
| Report history | O(H) | O(1) |
| Daily revenue | O(H + D log D), D = distinct days | O(D) |

Overall space: **O(S + V + H)**.
