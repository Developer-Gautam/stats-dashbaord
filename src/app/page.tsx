"use client";
import React from "react";
import customerTypeData from '../json_data/Customer Type.json';
import ChartCard from "../components/ChartCard";
import BarChart from "../components/BarChart";
import DoughnutChart from "../components/DoughnutChart";
import SummaryTable from "../components/SummaryTable";
import Box from "@mui/material/Box";

function DashboardContent() {
  const sliceData = customerTypeData;

  const quarters: string[] = Array.from(new Set(sliceData.map(row => String(row.closed_fiscal_quarter))));
  const custTypes: string[] = Array.from(new Set(sliceData.map(row => String(row.Cust_Type))));

  const barData = quarters.map(q => {
    const entry: Record<string, string | number> = { quarter: q };
    custTypes.forEach(type => {
      const found = sliceData.find(row => String(row.closed_fiscal_quarter) === q && String(row.Cust_Type) === type);
      entry[type] = found ? Number(found.acv) : 0;
    });
    return entry;
  });

  const doughnutData = custTypes.map(type => ({
    label: type,
    value: sliceData.filter(row => String(row.Cust_Type) === type).reduce((sum, row) => sum + Number(row.acv), 0)
  }));

  const tableColumns = ['Cust Type', ...quarters, 'Total'];
  const tableRows = custTypes.map(type => {
    let total = 0;
    const row: any = { 'Cust Type': type };
    quarters.forEach(q => {
      const found = sliceData.find(row => row.closed_fiscal_quarter === q && row.Cust_Type === type);
      const val = found ? Number(found.acv) : 0;
      row[q] = val;
      total += val;
    });
    row['Total'] = total;
    return row;
  });

  // Add a total row at the end
  const totalRow: any = { 'Cust Type': 'Total' };
  let grandTotal = 0;
  quarters.forEach(q => {
    const sum = tableRows.reduce((acc, row) => acc + (row[q] || 0), 0);
    totalRow[q] = sum;
    grandTotal += sum;
  });
  totalRow['Total'] = grandTotal;
  tableRows.push(totalRow);

  return (
    <Box minHeight="100vh" bgcolor="#f5f6fa" display="flex" flexDirection="column" alignItems="center" justifyContent="flex-start" py={4}>
      <ChartCard title="Won ACV mix by Cust Type">
        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'stretch', md: 'flex-start' }}
          justifyContent="space-between"
          gap={{ xs: 3, md: 6 }}
          width="100%"
        >
          <Box flex={2} minWidth={0} width={{ xs: '100%', md: '0' }}>
            <BarChart data={barData} quarters={quarters} custTypes={custTypes} />
          </Box>
          <Box flex={1} minWidth={0} maxWidth={320} width={{ xs: '100%', md: '320px' }}>
            <DoughnutChart data={doughnutData} width={180} height={180} />
          </Box>
        </Box>
        <Box
          mt={5}
          bgcolor="#f8fafc"
          borderRadius={3}
          boxShadow={1}
          p={{ xs: 1, sm: 2, md: 3 }}
          sx={{
            overflowX: 'auto',
            width: '100%',
            minWidth: 0,
            'table': { minWidth: 600 },
          }}
        >
          <SummaryTable columns={tableColumns} rows={tableRows} />
        </Box>
      </ChartCard>
    </Box>
  );
}

export default function Home() {
  return <DashboardContent />;
}
