'use client';

import { useState } from 'react';
import { TreePine, Leaf, DollarSign } from 'lucide-react';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';

export default function ROICalculator() {
  const [employeeCount, setEmployeeCount] = useState(100);
  const [cardCostPerEmployee, setCardCostPerEmployee] = useState(50);

  // Derived values
  const treesSaved = Math.round(employeeCount * 0.05);
  const co2Saved = Math.round(employeeCount * 0.8);
  const costSavings = employeeCount * cardCostPerEmployee;

  // Animated display values
  const displayTrees = useAnimatedNumber(treesSaved);
  const displayCo2 = useAnimatedNumber(co2Saved);
  const displayCost = useAnimatedNumber(costSavings);

  return (
    <section className="py-section-mobile md:py-section bg-surface">
      <div className="max-w-container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-stone-900 mb-4">
            See your savings with digital business cards
          </h2>
          <p className="text-stone-500 text-lg max-w-2xl mx-auto">
            Calculate the environmental and financial impact of switching your team to digital cards.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {/* Inputs */}
          <div className="space-y-8">
            {/* Employee count */}
            <div>
              <label className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-stone-700">
                  Number of employees
                </span>
                <span className="text-sm font-semibold text-stone-900 tabular-nums">
                  {employeeCount.toLocaleString()}
                </span>
              </label>
              <input
                type="range"
                min={1}
                max={10000}
                value={employeeCount}
                onChange={(e) => setEmployeeCount(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between mt-1 text-xs text-stone-400">
                <span>1</span>
                <span>10,000</span>
              </div>
            </div>

            {/* Cost per employee */}
            <div>
              <label className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-stone-700">
                  Annual card cost per employee
                </span>
                <span className="text-sm font-semibold text-stone-900 tabular-nums">
                  ${cardCostPerEmployee}
                </span>
              </label>
              <input
                type="range"
                min={5}
                max={200}
                value={cardCostPerEmployee}
                onChange={(e) => setCardCostPerEmployee(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between mt-1 text-xs text-stone-400">
                <span>$5</span>
                <span>$200</span>
              </div>
            </div>
          </div>

          {/* Outputs */}
          <div className="space-y-4">
            <MetricCard
              icon={<TreePine className="w-6 h-6 text-emerald-600" />}
              label="Trees saved annually"
              value={displayTrees.toLocaleString()}
              suffix="trees"
              bg="bg-emerald-50"
            />
            <MetricCard
              icon={<Leaf className="w-6 h-6 text-green-600" />}
              label="CO2 emissions prevented"
              value={displayCo2.toLocaleString()}
              suffix="kg CO2"
              bg="bg-green-50"
            />
            <MetricCard
              icon={<DollarSign className="w-6 h-6 text-stone-700" />}
              label="Annual cost savings"
              value={`$${displayCost.toLocaleString()}`}
              suffix=""
              bg="bg-stone-50"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  icon,
  label,
  value,
  suffix,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix: string;
  bg: string;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-stone-500 mb-1">{label}</p>
          <p className="text-3xl font-black text-stone-900 tabular-nums">
            {value}
            {suffix && (
              <span className="text-sm font-medium text-stone-400 ml-1.5">
                {suffix}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
