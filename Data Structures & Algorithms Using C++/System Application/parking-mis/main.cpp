// =============================================================================
// Smart Parking Management System (Kigali City)
// Data Structures & Algorithms project - C++ (in-memory only, OOP design)
//
// Build : g++ -std=c++17 -Wall -Wextra -O2 main.cpp -o parking
// Run   : ./parking
//
// See README.md for full documentation, complexity analysis and test cases.
// =============================================================================

#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <unordered_map>
#include <queue>
#include <memory>
#include <limits>
#include <ctime>
#include <cmath>
#include <algorithm>
#include <sstream>

// -----------------------------------------------------------------------------
// Domain enums and helpers
// -----------------------------------------------------------------------------

enum class VehicleType { Motorcycle, Car, Truck };

static std::string typeToString(VehicleType t) {
    switch (t) {
        case VehicleType::Motorcycle: return "Motorcycle";
        case VehicleType::Car:        return "Car";
        case VehicleType::Truck:      return "Truck";
    }
    return "Unknown";
}

// -----------------------------------------------------------------------------
// OOP: Vehicle inheritance hierarchy (abstraction, inheritance, polymorphism)
//
// Abstract base class `Vehicle` defines the common interface. Concrete vehicle
// classes override the polymorphic methods. This satisfies the OOP requirement
// while keeping a clean separation between behaviour and the storage logic.
// -----------------------------------------------------------------------------

class Vehicle {
protected:
    std::string plate;   // encapsulated state
public:
    explicit Vehicle(std::string p) : plate(std::move(p)) {}
    virtual ~Vehicle() = default;

    const std::string& getPlate() const { return plate; }

    virtual VehicleType type() const = 0;       // pure virtual -> abstract
    virtual std::string typeName() const = 0;   // polymorphic label
};

class Motorcycle : public Vehicle {
public:
    explicit Motorcycle(std::string p) : Vehicle(std::move(p)) {}
    VehicleType type() const override { return VehicleType::Motorcycle; }
    std::string typeName() const override { return "Motorcycle"; }
};

class Car : public Vehicle {
public:
    explicit Car(std::string p) : Vehicle(std::move(p)) {}
    VehicleType type() const override { return VehicleType::Car; }
    std::string typeName() const override { return "Car"; }
};

class Truck : public Vehicle {
public:
    explicit Truck(std::string p) : Vehicle(std::move(p)) {}
    VehicleType type() const override { return VehicleType::Truck; }
    std::string typeName() const override { return "Truck"; }
};

// Factory: build the correct polymorphic Vehicle from a type code.
static std::unique_ptr<Vehicle> makeVehicle(VehicleType t, const std::string& plate) {
    switch (t) {
        case VehicleType::Motorcycle: return std::make_unique<Motorcycle>(plate);
        case VehicleType::Car:        return std::make_unique<Car>(plate);
        case VehicleType::Truck:      return std::make_unique<Truck>(plate);
    }
    return nullptr;
}

// -----------------------------------------------------------------------------
// Data records
// -----------------------------------------------------------------------------

enum class SlotStatus { Available, Occupied };

struct ParkingSlot {
    int slotId = 0;                 // unique
    VehicleType supported{};        // vehicle type this slot accepts
    std::string zone;               // location/zone
    SlotStatus status = SlotStatus::Available;
};

// A vehicle that is currently parked (active parking session).
struct ActiveParking {
    std::unique_ptr<Vehicle> vehicle;
    int slotId = 0;
    std::time_t entryTime = 0;
};

// A completed transaction stored in history. The fee/rate are frozen here so
// later price updates never change historical records (Task 3 requirement).
struct ParkingRecord {
    std::string plate;
    VehicleType type{};
    int slotId = 0;
    std::time_t entryTime = 0;
    std::time_t exitTime = 0;
    long long billedHours = 0;
    double rateApplied = 0.0;   // rate active at the moment of exit
    double fee = 0.0;
};

// -----------------------------------------------------------------------------
// Time helpers
// -----------------------------------------------------------------------------

static std::string formatTime(std::time_t t) {
    std::tm tmv{};
#if defined(_WIN32)
    localtime_s(&tmv, &t);
#else
    localtime_r(&t, &tmv);
#endif
    char buf[32];
    std::strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M", &tmv);
    return std::string(buf);
}

static std::string dateOnly(std::time_t t) {
    return formatTime(t).substr(0, 10);
}

// -----------------------------------------------------------------------------
// Input validation utilities (kept separate from core logic on purpose).
// Every reader loops until valid input is supplied; none of them ever crash.
// -----------------------------------------------------------------------------

namespace io {

    static void clearLine() {
        std::cin.clear();
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
    }

    // Read a full line of text, trimmed. Returns false on EOF.
    static bool readLine(const std::string& prompt, std::string& out) {
        std::cout << prompt;
        if (!std::getline(std::cin, out)) return false;
        // trim
        size_t a = out.find_first_not_of(" \t\r\n");
        size_t b = out.find_last_not_of(" \t\r\n");
        out = (a == std::string::npos) ? "" : out.substr(a, b - a + 1);
        return true;
    }

    // Non-empty string reader.
    static std::string readNonEmpty(const std::string& prompt) {
        std::string s;
        while (true) {
            if (!readLine(prompt, s)) { clearLine(); continue; }
            if (s.empty()) {
                std::cout << "  [!] Input cannot be empty. Please try again.\n";
                continue;
            }
            return s;
        }
    }

    // Integer in [lo, hi]. Rejects text, symbols, out-of-range and overflow.
    static long long readInt(const std::string& prompt, long long lo, long long hi) {
        std::string s;
        while (true) {
            if (!readLine(prompt, s)) { clearLine(); continue; }
            if (s.empty()) {
                std::cout << "  [!] Invalid input. Please enter a valid number.\n";
                continue;
            }
            try {
                size_t pos = 0;
                long long v = std::stoll(s, &pos);
                if (pos != s.size()) {                      // trailing garbage
                    std::cout << "  [!] Invalid input. Please enter a valid number.\n";
                    continue;
                }
                if (v < lo || v > hi) {
                    std::cout << "  [!] Value must be between " << lo
                              << " and " << hi << ".\n";
                    continue;
                }
                return v;
            } catch (const std::exception&) {               // non-numeric / overflow
                std::cout << "  [!] Invalid input. Please enter a valid number.\n";
            }
        }
    }

    // Positive double (price). Rejects text, negatives, zero and overflow.
    static double readPositiveDouble(const std::string& prompt) {
        std::string s;
        while (true) {
            if (!readLine(prompt, s)) { clearLine(); continue; }
            if (s.empty()) {
                std::cout << "  [!] Invalid input. Please enter a valid number.\n";
                continue;
            }
            try {
                size_t pos = 0;
                double v = std::stod(s, &pos);
                if (pos != s.size()) {
                    std::cout << "  [!] Invalid input. Please enter a valid number.\n";
                    continue;
                }
                if (!(v > 0.0) || std::isinf(v) || std::isnan(v)) {
                    std::cout << "  [!] Price must be a positive number.\n";
                    continue;
                }
                if (v > 1e9) {
                    std::cout << "  [!] Price is unrealistically large. Try again.\n";
                    continue;
                }
                return v;
            } catch (const std::exception&) {
                std::cout << "  [!] Invalid input. Please enter a valid number.\n";
            }
        }
    }

    // Vehicle type chooser.
    static VehicleType readVehicleType(const std::string& prompt) {
        std::cout << prompt << "\n    1) Motorcycle\n    2) Car\n    3) Truck\n";
        long long c = readInt("  Choose vehicle type [1-3]: ", 1, 3);
        switch (c) {
            case 1: return VehicleType::Motorcycle;
            case 2: return VehicleType::Car;
            default: return VehicleType::Truck;
        }
    }

    static int daysInMonth(int year, int month) {
        static const int d[] = {31,28,31,30,31,30,31,31,30,31,30,31};
        if (month == 2) {
            bool leap = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
            return leap ? 29 : 28;
        }
        return d[month - 1];
    }

    // Read & validate a date-time in format "YYYY-MM-DD HH:MM".
    // Enforces: real calendar date, sane year range, not in the future.
    static std::time_t readDateTime(const std::string& label) {
        std::string s;
        std::time_t now = std::time(nullptr);
        while (true) {
            if (!readLine("  Enter " + label + " (YYYY-MM-DD HH:MM): ", s)) {
                clearLine();
                continue;
            }
            int Y, Mo, D, H, Mi;
            char dash1, dash2, colon;
            std::istringstream ss(s);
            ss >> Y >> dash1 >> Mo >> dash2 >> D >> H >> colon >> Mi;
            if (ss.fail() || dash1 != '-' || dash2 != '-' || colon != ':') {
                std::cout << "  [!] Invalid format. Use e.g. 2025-06-10 08:30\n";
                continue;
            }
            std::string rest;
            if (ss >> rest) {  // extra trailing characters
                std::cout << "  [!] Invalid format. Use e.g. 2025-06-10 08:30\n";
                continue;
            }
            if (Y < 2000 || Y > 2100) {
                std::cout << "  [!] Year must be between 2000 and 2100.\n";
                continue;
            }
            if (Mo < 1 || Mo > 12) {
                std::cout << "  [!] Month must be between 1 and 12.\n";
                continue;
            }
            if (D < 1 || D > daysInMonth(Y, Mo)) {
                std::cout << "  [!] Day is invalid for the given month.\n";
                continue;
            }
            if (H < 0 || H > 23 || Mi < 0 || Mi > 59) {
                std::cout << "  [!] Time must be 00:00 - 23:59.\n";
                continue;
            }
            std::tm tmv{};
            tmv.tm_year = Y - 1900;
            tmv.tm_mon  = Mo - 1;
            tmv.tm_mday = D;
            tmv.tm_hour = H;
            tmv.tm_min  = Mi;
            tmv.tm_isdst = -1;
            std::time_t t = std::mktime(&tmv);
            if (t == (std::time_t)(-1)) {
                std::cout << "  [!] Could not interpret that date/time.\n";
                continue;
            }
            if (t > now) {
                std::cout << "  [!] " << label
                          << " cannot be in the future. Current time is "
                          << formatTime(now) << ".\n";
                continue;
            }
            return t;
        }
    }
}

// -----------------------------------------------------------------------------
// Core system class (encapsulation of all state + operations)
//
// Data structures used:
//   slots        : unordered_map<int, ParkingSlot>            -> O(1) lookup by ID
//   freeByType   : unordered_map<VehicleType, queue<int>>     -> O(1) slot allocation
//   activeByPlate: unordered_map<string, ActiveParking>       -> O(1) uniqueness + exit
//   history      : vector<ParkingRecord>                      -> append + traversal
//   tariffs      : unordered_map<VehicleType, double>         -> current active prices
// -----------------------------------------------------------------------------

class ParkingSystem {
    std::unordered_map<int, ParkingSlot> slots;
    std::unordered_map<int, std::queue<int>> freeByType;     // key: int(VehicleType)
    std::unordered_map<std::string, ActiveParking> activeByPlate;
    std::vector<ParkingRecord> history;
    std::unordered_map<int, double> tariffs;                 // key: int(VehicleType)

    static int key(VehicleType t) { return static_cast<int>(t); }

public:
    ParkingSystem() {
        // Default starting tariffs (RWF per hour). Truck is not specified in the
        // brief, so a sensible default of 2000 is used (documented in README).
        tariffs[key(VehicleType::Motorcycle)] = 500.0;
        tariffs[key(VehicleType::Car)]        = 1000.0;
        tariffs[key(VehicleType::Truck)]      = 2000.0;
    }

    // ----- Task 1: slot configuration ----------------------------------------
    bool addSlot(int id, VehicleType type, const std::string& zone) {
        if (slots.count(id)) {
            std::cout << "  [!] Slot ID " << id << " already exists. Must be unique.\n";
            return false;
        }
        ParkingSlot s;
        s.slotId = id;
        s.supported = type;
        s.zone = zone;
        s.status = SlotStatus::Available;
        slots[id] = s;
        freeByType[key(type)].push(id);
        std::cout << "  [+] Slot " << id << " (" << typeToString(type)
                  << ", zone " << zone << ") configured and Available.\n";
        return true;
    }

    void listSlots() const {
        if (slots.empty()) { std::cout << "  (no slots configured yet)\n"; return; }
        std::cout << "\n  " << std::left
                  << std::setw(8)  << "SlotID"
                  << std::setw(14) << "Type"
                  << std::setw(12) << "Zone"
                  << std::setw(12) << "Status" << "\n";
        std::cout << "  ------------------------------------------------\n";
        // Traversal (sorted by id for readable output).
        std::vector<int> ids;
        ids.reserve(slots.size());
        for (const auto& kv : slots) ids.push_back(kv.first);
        std::sort(ids.begin(), ids.end());
        for (int id : ids) {
            const ParkingSlot& s = slots.at(id);
            std::cout << "  " << std::left
                      << std::setw(8)  << s.slotId
                      << std::setw(14) << typeToString(s.supported)
                      << std::setw(12) << s.zone
                      << std::setw(12)
                      << (s.status == SlotStatus::Available ? "Available" : "Occupied")
                      << "\n";
        }
    }

    // ----- Task 2: vehicle entry ----------------------------------------------
    void registerEntry(const std::string& plate, VehicleType type,
                       std::time_t entryTime) {
        if (activeByPlate.count(plate)) {
            std::cout << "  [!] Vehicle " << plate
                      << " is already parked. A vehicle cannot be parked twice.\n";
            return;
        }
        // Find next available slot of the matching type (skip stale entries).
        std::queue<int>& q = freeByType[key(type)];
        int chosen = -1;
        while (!q.empty()) {
            int cand = q.front(); q.pop();
            auto it = slots.find(cand);
            if (it != slots.end() && it->second.status == SlotStatus::Available) {
                chosen = cand;
                break;
            }
        }
        if (chosen == -1) {
            std::cout << "  [!] No available " << typeToString(type)
                      << " slot right now. Entry cannot be completed.\n";
            return;
        }
        slots[chosen].status = SlotStatus::Occupied;
        ActiveParking ap;
        ap.vehicle = makeVehicle(type, plate);
        ap.slotId = chosen;
        ap.entryTime = entryTime;
        activeByPlate[plate] = std::move(ap);
        std::cout << "  [+] " << typeToString(type) << " " << plate
                  << " parked at slot " << chosen
                  << " (entry " << formatTime(entryTime) << ").\n";
    }

    // ----- Task 3 helper: ceil duration to whole hours -----------------------
    static long long billedHours(std::time_t entry, std::time_t exit) {
        double secs = std::difftime(exit, entry);
        if (secs <= 0) return 0;
        return static_cast<long long>(std::ceil(secs / 3600.0));
    }

    // ----- Task 3 & 4: exit, fee calculation, history -------------------------
    void registerExit(const std::string& plate, std::time_t exitTime) {
        auto it = activeByPlate.find(plate);
        if (it == activeByPlate.end()) {
            std::cout << "  [!] No active parking found for plate " << plate << ".\n";
            return;
        }
        ActiveParking& ap = it->second;
        if (exitTime <= ap.entryTime) {
            std::cout << "  [!] Exit time (" << formatTime(exitTime)
                      << ") must be after entry time (" << formatTime(ap.entryTime)
                      << "). Exit aborted.\n";
            return;
        }
        VehicleType type = ap.vehicle->type();
        long long hours = billedHours(ap.entryTime, exitTime);
        double rate = tariffs[key(type)];          // current active price
        double fee = hours * rate;

        // Release the slot.
        slots[ap.slotId].status = SlotStatus::Available;
        freeByType[key(type)].push(ap.slotId);

        // Freeze the transaction into history.
        ParkingRecord rec;
        rec.plate = plate;
        rec.type = type;
        rec.slotId = ap.slotId;
        rec.entryTime = ap.entryTime;
        rec.exitTime = exitTime;
        rec.billedHours = hours;
        rec.rateApplied = rate;
        rec.fee = fee;
        history.push_back(rec);

        std::cout << "\n  ===== PARKING RECEIPT =====\n";
        std::cout << "  Plate     : " << plate << "\n";
        std::cout << "  Type      : " << typeToString(type) << "\n";
        std::cout << "  Slot      : " << ap.slotId << " (released)\n";
        std::cout << "  Entry     : " << formatTime(ap.entryTime) << "\n";
        std::cout << "  Exit      : " << formatTime(exitTime) << "\n";
        std::cout << "  Billed hrs: " << hours << " (partial hours rounded up)\n";
        std::cout << "  Rate/hr   : " << std::fixed << std::setprecision(0)
                  << rate << " RWF\n";
        std::cout << "  TOTAL FEE : " << std::fixed << std::setprecision(0)
                  << fee << " RWF\n";
        std::cout << "  ===========================\n";

        activeByPlate.erase(it);
    }

    // ----- Task 3: price update -----------------------------------------------
    void updatePrice(VehicleType type, double newRate) {
        double old = tariffs[key(type)];
        tariffs[key(type)] = newRate;
        std::cout << "  [+] " << typeToString(type) << " rate updated from "
                  << std::fixed << std::setprecision(0) << old << " to "
                  << newRate << " RWF/hr.\n";
        std::cout << "      (Completed records in history keep their old price.)\n";
    }

    void showTariffs() const {
        std::cout << "\n  Current hourly tariffs (RWF):\n";
        std::cout << "    Motorcycle : " << std::fixed << std::setprecision(0)
                  << tariffs.at(key(VehicleType::Motorcycle)) << "\n";
        std::cout << "    Car        : "
                  << tariffs.at(key(VehicleType::Car)) << "\n";
        std::cout << "    Truck      : "
                  << tariffs.at(key(VehicleType::Truck)) << "\n";
    }

    // ----- Task 5: reports -----------------------------------------------------
    void reportAvailableSlots() const {
        std::cout << "\n  -- Available Slots --\n";
        std::vector<int> ids;
        for (const auto& kv : slots)
            if (kv.second.status == SlotStatus::Available) ids.push_back(kv.first);
        std::sort(ids.begin(), ids.end());
        if (ids.empty()) { std::cout << "  (none)\n"; return; }
        for (int id : ids) {
            const ParkingSlot& s = slots.at(id);
            std::cout << "    Slot " << s.slotId << " | " << typeToString(s.supported)
                      << " | zone " << s.zone << "\n";
        }
    }

    void reportParkedVehicles() const {
        std::cout << "\n  -- Currently Parked Vehicles --\n";
        if (activeByPlate.empty()) { std::cout << "  (none)\n"; return; }
        for (const auto& kv : activeByPlate) {
            const ActiveParking& ap = kv.second;
            std::cout << "    " << kv.first << " | " << ap.vehicle->typeName()
                      << " | slot " << ap.slotId
                      << " | since " << formatTime(ap.entryTime) << "\n";
        }
    }

    void reportHistory() const {
        std::cout << "\n  -- Vehicle History (completed transactions) --\n";
        if (history.empty()) { std::cout << "  (none)\n"; return; }
        for (const ParkingRecord& r : history) {
            std::cout << "    " << r.plate << " | " << typeToString(r.type)
                      << " | slot " << r.slotId
                      << " | " << formatTime(r.entryTime)
                      << " -> " << formatTime(r.exitTime)
                      << " | " << r.billedHours << "h @ "
                      << std::fixed << std::setprecision(0) << r.rateApplied
                      << " = " << r.fee << " RWF\n";
        }
    }

    void reportDailyRevenue() const {
        std::cout << "\n  -- Daily Revenue (by exit date) --\n";
        if (history.empty()) { std::cout << "  (none)\n"; return; }
        std::unordered_map<std::string, double> perDay;
        for (const ParkingRecord& r : history) perDay[dateOnly(r.exitTime)] += r.fee;
        std::vector<std::string> days;
        for (const auto& kv : perDay) days.push_back(kv.first);
        std::sort(days.begin(), days.end());
        double total = 0;
        for (const std::string& d : days) {
            std::cout << "    " << d << " : " << std::fixed << std::setprecision(0)
                      << perDay[d] << " RWF\n";
            total += perDay[d];
        }
        std::cout << "    ----------------------------\n";
        std::cout << "    TOTAL  : " << std::fixed << std::setprecision(0)
                  << total << " RWF\n";
    }

    bool hasSlots() const { return !slots.empty(); }
};

// -----------------------------------------------------------------------------
// Menu-driven console interface
// -----------------------------------------------------------------------------

static void reportsMenu(ParkingSystem& sys) {
    while (true) {
        std::cout << "\n  --- Reports ---\n"
                  << "    1) Available slots\n"
                  << "    2) Parked vehicles\n"
                  << "    3) Vehicle history\n"
                  << "    4) Daily revenue\n"
                  << "    0) Back\n";
        long long c = io::readInt("  Choose [0-4]: ", 0, 4);
        switch (c) {
            case 1: sys.reportAvailableSlots(); break;
            case 2: sys.reportParkedVehicles(); break;
            case 3: sys.reportHistory(); break;
            case 4: sys.reportDailyRevenue(); break;
            case 0: return;
        }
    }
}

int main() {
    ParkingSystem sys;
    std::cout << "==================================================\n"
              << " Smart Parking Management System - Kigali City\n"
              << "==================================================\n";
    sys.showTariffs();

    while (true) {
        std::cout << "\n========== MAIN MENU ==========\n"
                  << " 1) Configure parking slot\n"
                  << " 2) List parking slots\n"
                  << " 3) Register vehicle entry\n"
                  << " 4) Vehicle exit & payment\n"
                  << " 5) Update parking prices\n"
                  << " 6) View current tariffs\n"
                  << " 7) Reports\n"
                  << " 0) Exit program\n";
        long long choice = io::readInt(" Choose an option [0-7]: ", 0, 7);

        switch (choice) {
            case 1: {
                long long id = io::readInt("  Enter unique Slot ID (1-999999): ", 1, 999999);
                VehicleType t = io::readVehicleType("  Supported vehicle type:");
                std::string zone = io::readNonEmpty("  Enter zone (e.g. A, B, North): ");
                sys.addSlot(static_cast<int>(id), t, zone);
                break;
            }
            case 2:
                sys.listSlots();
                break;
            case 3: {
                if (!sys.hasSlots()) {
                    std::cout << "  [!] No slots configured. Add a slot first (option 1).\n";
                    break;
                }
                std::string plate = io::readNonEmpty("  Enter vehicle plate number: ");
                VehicleType t = io::readVehicleType("  Vehicle type:");
                std::time_t entry = io::readDateTime("entry time");
                sys.registerEntry(plate, t, entry);
                break;
            }
            case 4: {
                std::string plate = io::readNonEmpty("  Enter plate of exiting vehicle: ");
                std::time_t exitT = io::readDateTime("exit time");
                sys.registerExit(plate, exitT);
                break;
            }
            case 5: {
                VehicleType t = io::readVehicleType("  Which vehicle type to reprice?");
                double rate = io::readPositiveDouble("  Enter new hourly rate (RWF): ");
                sys.updatePrice(t, rate);
                break;
            }
            case 6:
                sys.showTariffs();
                break;
            case 7:
                reportsMenu(sys);
                break;
            case 0:
                std::cout << "  Goodbye.\n";
                return 0;
        }
    }
}
