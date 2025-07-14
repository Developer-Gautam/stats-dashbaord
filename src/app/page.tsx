"use client";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchSlices, fetchSliceData } from "../store/slices/dataSlice";
import ChartCard from "../components/ChartCard";
import BarChart from "../components/BarChart";
import DoughnutChart from "../components/DoughnutChart";
import SummaryTable from "../components/SummaryTable";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

function getSliceConfig(sliceName: string, data: any[]): any | null {
  // Heuristic: If data has 'closed_fiscal_quarter', treat as time series (bar chart + doughnut)
  if (!Array.isArray(data) || data.length === 0) return null;
  const sample = data[0];
  if (sample.closed_fiscal_quarter) {
    // Find unique quarters and category key
    const quarters = Array.from(new Set(data.map(row => String(row.closed_fiscal_quarter))));
    // Find the first non-count/acv/quarter key for category
    const catKey = Object.keys(sample).find(
      k => !["count", "acv", "closed_fiscal_quarter", "query_key"].includes(k)
    );
    if (!catKey) return null;
    const categories = Array.from(new Set(data.map(row => String(row[catKey]))));
    const barData = quarters.map(q => {
      const entry: { [key: string]: any } = { quarter: q };
      categories.forEach(type => {
        const found = data.find(row => String(row.closed_fiscal_quarter) === q && String(row[catKey]) === type);
        entry[type] = found ? Number(found.acv) : 0;
      });
      return entry;
    });
    const doughnutData = categories.map(type => ({
      label: type,
      value: data.filter(row => String(row[catKey]) === type).reduce((sum, row) => sum + Number(row.acv), 0)
    }));
    const tableColumns = [catKey, ...quarters, "Total"];
    const tableRows = categories.map(type => {
      let total = 0;
      const row: { [key: string]: any } = { [catKey]: type };
      quarters.forEach(q => {
        const found = data.find(row => String(row.closed_fiscal_quarter) === q && String(row[catKey]) === type);
        const val = found ? Number(found.acv) : 0;
        row[q] = val;
        total += val;
      });
      row["Total"] = total;
      return row;
    });
    // Add total row
    const totalRow: { [key: string]: any } = { [catKey]: "Total" };
    let grandTotal = 0;
    quarters.forEach(q => {
      const sum = tableRows.reduce((acc, row) => acc + (row[q] || 0), 0);
      totalRow[q] = sum;
      grandTotal += sum;
    });
    totalRow["Total"] = grandTotal;
    tableRows.push(totalRow);
    return {
      type: "timeseries",
      barData,
      doughnutData,
      tableColumns,
      tableRows,
      quarters,
      categories,
      catKey
    };
  } else {
    // Fallback: simple doughnut
    const catKey = Object.keys(sample).find(k => !["count", "acv", "query_key"].includes(k));
    if (!catKey) return null;
    const categories = Array.from(new Set(data.map(row => String(row[catKey]))));
    const doughnutData = categories.map(type => ({
      label: type,
      value: data.filter(row => String(row[catKey]) === type).reduce((sum, row) => sum + Number(row.acv), 0)
    }));
    return {
      type: "categorical",
      doughnutData,
      categories,
      catKey
    };
  }
}

function DashboardContent() {
  const dispatch = useAppDispatch();
  const { slices, data, loading, error } = useAppSelector((state) => state.data);

  useEffect(() => {
    dispatch(fetchSlices());
  }, [dispatch]);

  useEffect(() => {
    if (slices.length) {
      slices.forEach((slice: string) => {
        if (!data[slice]) dispatch(fetchSliceData(slice));
      });
    }
  }, [slices, dispatch]);

  if (loading && (!slices.length || Object.keys(data).length < slices.length)) {
    return (
      <Box minHeight="80vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // Icon selection based on slice name
  const getIcon = (slice: string) => {
    if (/customer/i.test(slice)) return <span role="img" aria-label="Customer">👥</span>;
    if (/industry/i.test(slice)) return <span role="img" aria-label="Industry">🏭</span>;
    if (/team/i.test(slice)) return <span role="img" aria-label="Team">👨‍👩‍👧‍👦</span>;
    if (/acv/i.test(slice)) return <span role="img" aria-label="ACV">💰</span>;
    return <span role="img" aria-label="Data">📊</span>;
  };
  // Chip color based on type
  const getChip = (type: string) => {
    if (type === "timeseries") return { label: "Time Series", color: '#4285F4' };
    if (type === "categorical") return { label: "Categorical", color: '#FB8C00' };
    return { label: "Other", color: '#aaa' };
  };

  return (
    <Box minHeight="100vh" bgcolor="#f5f6fa" py={4}>
      <Box maxWidth="1600px" mx="auto" px={{ xs: 1, md: 3 }}>
        <Box mb={3} textAlign="center">
          <span style={{ fontWeight: 800, fontSize: 36, letterSpacing: 0.6, color: '#232a3d', lineHeight: 1.1, fontFamily: 'Inter, sans-serif' }}>
            Data Dashboard
          </span>
          <br />
          <span style={{ color: '#7a869a', fontWeight: 500, fontSize: 18 }}>Interactive summary of your business data slices</span>
        </Box>
        <Box display="flex" justifyContent="center">
          <Box width="100%">
            <Box
              display="grid"
              gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}
              gap={{ xs: 2, md: 4 }}
              sx={{
                width: '100%',
                maxWidth: 1100,
                mx: 'auto',
                overflowX: 'hidden',
                alignItems: 'stretch',
                justifyContent: 'center',
              }}
            >
              {slices.map((slice: string) => {
                const sliceData = data[slice];
                const config = getSliceConfig(slice, sliceData);
                if (!config) return null;
                const icon = getIcon(slice);
                const chip = getChip(config.type);
                const subtitle = `${sliceData?.length || 0} records`;
                return (
                  <Box key={slice} sx={{
                    animation: 'fadeIn 0.7s',
                    '@keyframes fadeIn': { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'none' } },
                    minWidth: 0,
                    width: '100%',
                    maxWidth: '100vw',
                    display: 'flex',
                  }}>
                    <ChartCard
                      title={slice.replace(/_/g, ' ')}
                      subtitle={subtitle}
                      icon={icon}
                      chipLabel={chip.label}
                    >
                      {config.type === "timeseries" && (
                        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'flex-start' }} justifyContent="space-between" gap={{ xs: 2, md: 4 }} width="100%" minWidth={0}>
                          <Box flex={2} minWidth={0} width="100%" maxWidth={480} sx={{ overflowX: 'auto' }}>
                            <BarChart data={config.barData} quarters={config.quarters} custTypes={config.categories} />
                          </Box>
                          <Box flex={1} minWidth={0} maxWidth={320} width={{ xs: '100%', md: '320px' }} sx={{ mx: 'auto' }}>
                            <DoughnutChart data={config.doughnutData} width={180} height={180} />
                          </Box>
                        </Box>
                      )}
                      {config.type === "timeseries" && (
                        <Box mt={4} bgcolor="#f8fafc" borderRadius={3} boxShadow={1} p={{ xs: 1, sm: 2, md: 3 }} sx={{ overflowX: 'auto', width: '100%', minWidth: 0, 'table': { minWidth: 480, width: '100%' } }}>
                          <SummaryTable columns={config.tableColumns} rows={config.tableRows} />
                        </Box>
                      )}
                      {config.type === "categorical" && (
                        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center" width="100%" minWidth={0} sx={{ overflowX: 'auto' }}>
                          <DoughnutChart data={config.doughnutData} width={180} height={180} />
                        </Box>
                      )}
                    </ChartCard>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function Home() {
  return <DashboardContent />;
}
