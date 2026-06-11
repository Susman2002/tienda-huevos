import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTopSellingProducts, downloadSuppliersReport } from '../api/reports.api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileText, TrendingUp, Calendar, Download, Loader2 } from 'lucide-react';

const COLORS = ['#4f46e5', '#7c3aed', '#2563eb', '#0891b2', '#0d9488'];

const ReportsPage: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  const { data: topProducts, isLoading } = useQuery({
    queryKey: ['top-products'],
    queryFn: getTopSellingProducts,
  });

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      await downloadSuppliersReport(dateFilter.start, dateFilter.end);
    } catch (error) {
      console.error('Error al descargar el reporte', error);
      alert('Error al generar el PDF. Verifica que el backend esté funcionando.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h1>
          <p className="text-gray-500 text-sm">Monitorea el rendimiento de tu tienda</p>
        </div>
      </header>

      {/* --- Sección de Gráfico --- */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-lg font-semibold">Top 5 Productos más vendidos (Semana)</h2>
        </div>

        <div className="h-[300px] w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={150} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                   formatter={(value: any) => [`${value} unidades`, 'Vendido']}
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="totalUnits" radius={[0, 4, 4, 0]}>
                  {topProducts?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* --- Sección de Generación de Reportes PDF --- */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold">Reportes de Pedidos (Proveedores)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Rango de fechas (Opcional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="date" 
                  value={dateFilter.start}
                  onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})}
                  className="p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <input 
                  type="date" 
                  value={dateFilter.end}
                  onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})}
                  className="p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400">
              * Si no seleccionas fechas, se generará el reporte con todos los pedidos.
            </p>
          </div>

          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-emerald-200"
          >
            {isDownloading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {isDownloading ? 'Generando PDF...' : 'Descargar Reporte PDF'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default ReportsPage;