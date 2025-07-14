import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";

interface Row {
  [key: string]: string | number;
}

interface SummaryTableProps {
  columns: string[];
  rows: Row[];
  title?: string;
}

function formatK(value: number) {
  return `$${(value / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}K`;
}

const SummaryTable: React.FC<SummaryTableProps> = ({ columns, rows, title }) => (
  <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2, mt: 2 }}>
    {title && <Typography variant="h6" sx={{ p: 2, pb: 0 }}>{title}</Typography>}
    <Table size="small">
      <TableHead>
        <TableRow>
          {columns.map(col => (
            <TableCell key={col} sx={{ fontWeight: 700, background: '#f7f7fa' }}>{col}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, idx) => (
          <TableRow key={idx}>
            {columns.map((col, colIdx) => (
              <TableCell key={col} align={typeof row[col] === 'number' ? 'right' : 'left'} sx={{ fontWeight: row["total"] ? 700 : 400 }}>
                {typeof row[col] === 'number' && colIdx !== 0 ? formatK(row[col] as number) : row[col]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default SummaryTable;
