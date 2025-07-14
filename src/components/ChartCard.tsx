import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  chipLabel?: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, icon, chipLabel, children }) => (
  <Paper
    elevation={4}
    sx={{
      minWidth: 350,
      maxWidth: 640,
      m: 2,
      p: { xs: 2.5, md: 4 },
      borderRadius: 5,
      border: '1.5px solid #e3e9f7',
      boxShadow: '0 8px 32px 0 rgba(60,72,100,0.10)',
      background: 'linear-gradient(135deg, #f9fafc 0%, #f1f6ff 100%)',
      position: 'relative',
      overflow: 'visible',
      transition: 'box-shadow 0.3s, transform 0.3s',
      '&:hover': {
        boxShadow: '0 12px 32px 0 rgba(60,72,100,0.16)',
        transform: 'translateY(-2px) scale(1.025)',
      },
    }}
  >
    <Box display="flex" alignItems="center" mb={subtitle ? 0.5 : 2}>
      {icon && (
        <Avatar sx={{ bgcolor: '#e3e9f7', color: '#4285F4', mr: 2, width: 42, height: 42, boxShadow: 2 }}>
          {icon}
        </Avatar>
      )}
      <Box flex={1}>
        <Typography variant="h6" fontWeight={700} letterSpacing={0.2} sx={{ mb: 0.2, color: '#222', lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {chipLabel && (
        <Chip label={chipLabel} size="small" sx={{ ml: 1, bgcolor: '#e3e9f7', color: '#4285F4', fontWeight: 600 }} />
      )}
    </Box>
    <Box mt={subtitle ? 2 : 0}>{children}</Box>
  </Paper>
);

export default ChartCard;
