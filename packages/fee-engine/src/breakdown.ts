import type { ComponentBreakdown, FeeComponentInput } from '@repo/types';
import { roundMoney } from '@repo/shared';

export function calculateComponentBreakdown(
  components: FeeComponentInput[]
): ComponentBreakdown {
  const breakdown: ComponentBreakdown = {
    tuition: 0,
    examination: 0,
    library: 0,
    laboratory: 0,
    development: 0,
    hostel: 0,
    miscellaneous: 0,
  };

  for (const component of components) {
    const amount = roundMoney(component.amount);
    switch (component.type) {
      case 'TUITION':
        breakdown.tuition += amount;
        break;
      case 'EXAMINATION':
        breakdown.examination += amount;
        break;
      case 'LIBRARY':
        breakdown.library += amount;
        break;
      case 'LABORATORY':
        breakdown.laboratory += amount;
        break;
      case 'DEVELOPMENT':
        breakdown.development += amount;
        break;
      case 'HOSTEL':
        breakdown.hostel += amount;
        break;
      case 'MISCELLANEOUS':
        breakdown.miscellaneous += amount;
        break;
    }
  }

  // Ensure 2 decimal rounding on all breakdown values
  return {
    tuition: roundMoney(breakdown.tuition),
    examination: roundMoney(breakdown.examination),
    library: roundMoney(breakdown.library),
    laboratory: roundMoney(breakdown.laboratory),
    development: roundMoney(breakdown.development),
    hostel: roundMoney(breakdown.hostel),
    miscellaneous: roundMoney(breakdown.miscellaneous),
  };
}
