import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => (
  <Paper
    elevation={3}
    sx={{
      minWidth: 350,
      m: 2,
      p: 3,
      borderRadius: 4,
      transition: 'box-shadow 0.3s, transform 0.3s',
      boxShadow: 3,
      '&:hover': {
        boxShadow: 10,
        transform: 'scale(1.025)',
      },
      background: theme => theme.palette.background.paper,
    }}
  >
    <Typography variant="h6" gutterBottom fontWeight={700} mb={2}>
      {title}
    </Typography>
    {children}
  </Paper>
);

export default ChartCard;
