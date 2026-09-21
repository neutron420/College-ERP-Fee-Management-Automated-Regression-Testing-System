# 13 - Business Rules

## 1. Mathematical Precedence Order
All fee calculations must execute according to the following strict precedence sequence:

$$\text{Base Fee} \longrightarrow \text{Scholarships} \longrightarrow \text{Discounts} \longrightarrow \text{Late Fines} \longrightarrow \text{Net Payable}$$

1. **Rule BR-1: Base Fee Aggregation**
   - The Base Fee is the exact arithmetic sum of all assigned fee components:
     $$\text{Base Fee} = \sum_{i=1}^{n} \text{ComponentAmount}_i$$
   - Negative component amounts are disallowed.

2. **Rule BR-2: Scholarship Priority**
   - Scholarships take precedence over discounts.
   - For percentage scholarships:
     $$\text{Scholarship Value} = \text{Base Fee} \times \frac{\text{Percentage}}{100}$$
   - Total scholarships cannot exceed the Base Fee:
     $$\text{Total Scholarships} = \min(\text{Base Fee}, \sum \text{ScholarshipAmounts})$$

3. **Rule BR-3: Discount Allocation**
   - Discounts are applied against the post-scholarship remaining balance:
     $$\text{Remaining Balance}_1 = \text{Base Fee} - \text{Total Scholarships}$$
   - For percentage discounts:
     $$\text{Discount Value} = \text{Remaining Balance}_1 \times \frac{\text{Percentage}}{100}$$
   - Total discounts cannot exceed the remaining balance:
     $$\text{Total Discounts} = \min(\text{Remaining Balance}_1, \sum \text{DiscountAmounts})$$

4. **Rule BR-4: Late Fine Calculation**
   - If $\text{CalculationDate} \le (\text{DueDate} + \text{GraceDays})$, $\text{LateFine} = 0$.
   - If $\text{CalculationDate} > (\text{DueDate} + \text{GraceDays})$:
     $$\text{OverdueDays} = \lfloor (\text{CalculationDate} - \text{DueDate}) / 1 \text{ day} \rfloor$$
     $$\text{LateFine} = \text{OverdueDays} \times \text{FinePerDay}$$

5. **Rule BR-5: Net Payable Formula**
   - Net Payable is calculated as:
     $$\text{Net Payable} = \max(0, \text{Base Fee} - \text{Total Scholarships} - \text{Total Discounts} + \text{Late Fine})$$

6. **Rule BR-6: Payments and Refunds**
   - Only payments with status `SUCCESS` are credited.
   - Only refunds with status `PROCESSED` are deducted from collections.
   - $\text{Net Paid} = \text{Gross Successful Payments} - \text{Processed Refunds}$.
   - $\text{Outstanding Balance} = \max(0, \text{Net Payable} - \text{Net Paid})$.

7. **Rule BR-7: Ledger Status Mapping**
   - If $\text{Net Paid} = 0$, status is `UNPAID` (or `OVERDUE` if past Due Date).
   - If $0 < \text{Net Paid} < \text{Net Payable}$, status is `PARTIALLY_PAID`.
   - If $\text{Net Paid} \ge \text{Net Payable}$, status is `PAID`.
