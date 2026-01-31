import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { LegendProps } from 'recharts';
import styles from './analytics.module.css';

interface GroupData {
  groupKey: string | null;
  totalQuantitySold: number;
  totalRevenue: number;
  numberOfSales: number;
}

interface SalesByGroupPieChartProps {
  data: GroupData[];
  groupBy: 'product' | 'lotId' | 'company';
  showRevenue: boolean;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#0088fe', '#00c49f', '#ffbb28', '#ff8042'];

const MAX_LABEL_LENGTH = 12;

function truncateLabel(str: string, max = MAX_LABEL_LENGTH): string {
  if (!str || str.length <= max) return str;
  return str.slice(0, max) + '...';
}

export function SalesByGroupPieChart({ data, groupBy, showRevenue }: SalesByGroupPieChartProps) {
  const chartData = data
    .map((item) => ({
      name: item.groupKey || 'Unknown',
      revenue: item.totalRevenue,
      quantity: item.totalQuantitySold,
    }))
    .sort((a, b) => (showRevenue ? b.revenue - a.revenue : b.quantity - a.quantity))
    .slice(0, 10);

  const pieData = chartData.map((item) => ({
    name: truncateLabel(item.name),
    value: showRevenue ? item.revenue : item.quantity,
    fullName: item.name,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTitle = () => {
    const baseTitle = (() => {
      switch (groupBy) {
        case 'product':
          return 'Sales by Product';
        case 'lotId':
          return 'Sales by Lot ID';
        case 'company':
          return 'Sales by Company';
        default:
          return 'Sales by Group';
      }
    })();
    return `${baseTitle} - ${showRevenue ? 'Revenue' : 'Quantity'} Distribution`;
  };

  const formatTooltip = (value: number) => {
    if (showRevenue) {
      return formatCurrency(value);
    }
    return value;
  };

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>{getTitle()}</h3>
      </div>
      <div className={styles.pieChartContent}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 36, right: 36, bottom: 36, left: 36 }}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => {
                if (!percent || percent < 0.08) return ''; // Hide labels for small slices to reduce clutter
                return `${name}: ${(percent * 100).toFixed(0)}%`;
              }}
              outerRadius={115}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | undefined, name: string | undefined, props: any) => {
                if (value === undefined) return '';
                const formattedValue = formatTooltip(value);
                const fullName = props?.payload?.fullName || name || '';
                return [formattedValue, fullName];
              }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '8px',
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '28px', display: 'flex', flexWrap: 'wrap', gap: '8px 16px', justifyContent: 'center' }}
              content={(props: LegendProps) => {
                const { payload } = props;
                return (
                  <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', justifyContent: 'center', listStyle: 'none', padding: 0, margin: 0 }}>
                    {payload?.map((entry, index) => {
                      const fullName = pieData.find((d) => d.name === entry.value)?.fullName ?? entry.value;
                      return (
                        <li
                          key={`legend-${index}`}
                          title={fullName}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            cursor: 'default',
                          }}
                        >
                          <span
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 2,
                              backgroundColor: entry.color,
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
                            {entry.value}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

