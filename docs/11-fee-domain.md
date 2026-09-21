# 11 - Fee Domain

## 1. Domain Terminology

### Fee Structure
A blueprint defining the scheduled financial obligations for a student group (Department + Academic Year). It contains an aggregate set of fee components and baseline deadlines.

### Fee Component (Fee Head)
An atomic itemized financial charge that contributes to the gross academic fee.
- **Tuition Fee**: Primary instructional charge.
- **Examination Fee**: Charges associated with term evaluations and lab practicals.
- **Library Fee**: Resource access, journal licensing, and book bank charges.
- **Laboratory Fee**: Consumables, instrumentation, and computational facility usage.
- **Development Fee**: Campus infrastructure and co-curricular facilities maintenance.
- **Hostel Fee**: Accommodation and utilities (if applicable).
- **Miscellaneous Fee**: Student welfare, identity cards, insurance.

### Fee Concessions
Reductions applied to the base billing amount:
- **Scholarship**: Academic merit, sports excellence, or economic need-based financial grants. Can be expressed as a percentage of Tuition/Base fee or a fixed monetary grant.
- **Discount**: Institutional concessions such as sibling discounts, staff ward concessions, or early-bird fee payment incentives.

### Late Fine
A financial penalty imposed on payments recorded after the designated `dueDate` plus an optional `graceDays` buffer period.

### Fee Assessment
An individual student ledger account for an academic cycle, capturing the point-in-time calculation of gross fees, applied waivers, penalties, payments collected, and net outstanding liability.
