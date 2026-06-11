import api from './axios';

export interface TopProduct {
  productId: string;
  sku: string;
  name: string;
  totalUnits: number;
  totalRevenue: number;
}

export const getTopSellingProducts = async (): Promise<TopProduct[]> => {
  const { data } = await api.get<TopProduct[]>('/reports/top-products');
  return data;
};

export const downloadSuppliersReport = async (startDate?: string, endDate?: string) => {
  const { data } = await api.get('/reports/suppliers-pdf', {
    params: { startDate, endDate },
    responseType: 'blob', // Crítico para manejar archivos binarios
  });
  
  // Crear un link temporal para descargar el archivo
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'reporte-pedidos.pdf');
  document.body.appendChild(link);
  link.click();
  link.remove();
};