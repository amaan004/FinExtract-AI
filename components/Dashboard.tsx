import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DocumentFile, TransactionCategory } from '../types';

interface DashboardProps {
  documents: DocumentFile[];
}

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard: React.FC<DashboardProps> = ({ documents }) => {
  const stats = useMemo(() => {
    const processedDocs = documents.filter(d => d.status === 'success' && d.data);
    const totalProcessed = processedDocs.length;
    const totalAmount = processedDocs.reduce((acc, doc) => acc + (doc.data?.amount || 0), 0);
    
    // Group by category
    const catMap = new Map<string, number>();
    Object.values(TransactionCategory).forEach(c => catMap.set(c, 0));
    
    processedDocs.forEach(doc => {
      if (doc.data) {
        const current = catMap.get(doc.data.category) || 0;
        catMap.set(doc.data.category, current + 1); // Count occurrences
      }
    });

    const categoryBreakdown = Array.from(catMap.entries())
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);

    return { totalProcessed, totalAmount, categoryBreakdown };
  }, [documents]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Stat Card 1 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Documents</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-bold text-slate-800">{stats.totalProcessed}</span>
          <span className="ml-2 text-sm text-slate-500">processed</span>
        </div>
        <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-primary-500 h-full rounded-full transition-all duration-500" 
            style={{ width: `${Math.min((stats.totalProcessed / (documents.length || 1)) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Stat Card 2 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Value Extracted</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-bold text-slate-800">
            ${stats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
         <div className="mt-2 text-sm text-slate-400">
           Across all currencies (normalized)
        </div>
      </div>

      {/* Chart Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 md:row-span-2 md:col-start-3 md:row-start-1 h-64 md:h-auto flex flex-col">
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Category Distribution</h3>
        <div className="flex-1 w-full min-h-[180px]">
          {stats.categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#334155', fontSize: '12px' }}
                />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No data to display
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;