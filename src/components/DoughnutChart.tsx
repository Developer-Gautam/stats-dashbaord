import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';

interface DoughnutChartProps {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
}


const getColorPalette = (n: number) => {
  if ((d3 as any).schemeTableau10 && n <= 10) return (d3 as any).schemeTableau10;
  return Array.from({ length: n }, (_, i) => d3.interpolateRainbow(i / n));
};

const DoughnutChart: React.FC<DoughnutChartProps & { colors: string[] }> = ({ data, width = 180, height = 180, colors }) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const theme = useTheme();
  const COLORS = colors;
  useEffect(() => {
    if (!ref.current) return;
    let tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any> | undefined;
    d3.select(ref.current).selectAll('*').remove();
    const radius = Math.min(width, height) / 2;
    // Remove any previous <g> to avoid nested groups
    d3.select(ref.current).select('g').remove();
    const svg = d3.select(ref.current)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);
    const color = (i: number) => COLORS[i % COLORS.length];
    const pie = d3.pie<{ label: string; value: number }>().value(d => d.value);
    const arc = d3.arc<d3.PieArcDatum<{ label: string; value: number }>>()
      .innerRadius(radius * 0.65)
      .outerRadius(radius - 5);
    const arcGroups = svg.selectAll<SVGGElement, d3.PieArcDatum<{ label: string; value: number }>>('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    // --- Tooltip setup ---
    tooltip = d3.select('body')
      .append('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('background', '#fff')
      .style('pointer-events', 'none')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)')
      .style('font-size', '14px')
      .style('color', theme.palette.text.primary)
      .style('opacity', 0);

    arcGroups.append<SVGPathElement>('path')
      .attr('d', arc)
      .attr('fill', (_d, i) => color(i))
      .style('filter', 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))')
      .style('cursor', 'pointer')
      .on('mousemove', function(event, d) {
        tooltip
          .style('opacity', 1)
          .html(
            `<strong>${d.data.label}</strong><br/>Value: $${d.data.value.toLocaleString()}<br/>Percent: ${((d.data.value / d3.sum(data, d => d.value)) * 100).toFixed(1)}%`
          )
          .style('left', (event.pageX + 12) + 'px')
          .style('top', (event.pageY - 28) + 'px');
        d3.select(this).attr('stroke', theme.palette.primary.main).attr('stroke-width', 2);
      })
      .on('mouseleave', function() {
        tooltip.style('opacity', 0);
        d3.select(this).attr('stroke', null).attr('stroke-width', null);
      })
      .transition()
      .duration(900)
      .attrTween('d', (d: d3.PieArcDatum<{ label: string; value: number }>) => {
        const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return (t: number) => arc(i(t))!;
      });
    // Center total (formatted as $X.XXK)
    const totalValue = data.reduce((sum, d) => sum + d.value, 0);
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .style('font-size', 14)
      .style('font-weight', 600)
      .style('fill', theme.palette.text.secondary)
      .text('Total');
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .style('font-size', 16)
      .style('font-weight', 700)
      .style('fill', theme.palette.text.primary)
      .text(`$${(totalValue/1000).toFixed(2)}K`);

    // Add segment values as $X.XXK positioned on arcs (single line, smaller and lighter)
    arcGroups.append('text')
      .attr('transform', function(d) { return `translate(${arc.centroid(d)})`; })
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .style('font-size', 11)
      .style('font-weight', 500)
      .style('fill', theme.palette.text.secondary)
      .text(d => `$${(d.data.value/1000).toFixed(2)}K`);

    // Remove the second line of text for raw value and percent for clarity


    // Clean up tooltip on unmount
    return () => { if (tooltip) tooltip.remove(); };
  }, [data, width, height, theme]);
  return (
    <div style={{ width: '100%', maxWidth: 240, margin: '0 auto' }}>
      <div
        style={{
          aspectRatio: '1 / 1',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <svg
          ref={ref}
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
        ></svg>
      </div>

    </div>
  );
};

// Legend rendering
const Legend: React.FC<{ labels: string[]; colors: string[] }> = ({ labels, colors }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18, justifyContent: 'center' }}>
    {labels.map((label, i) => (
      <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ display: 'inline-block', width: 18, height: 18, borderRadius: 6, background: colors[i % colors.length], border: '1.5px solid #e3e9f7', marginRight: 5 }} />
        <span style={{ fontSize: 14, color: '#444', fontWeight: 500 }}>{label}</span>
      </span>
    ))}
  </div>
);


const DoughnutChartWithLegend: React.FC<DoughnutChartProps> = (props) => {
  const colors = getColorPalette(props.data.length);
  return (
    <div>
      <DoughnutChart {...props} colors={colors} />
      <Legend labels={props.data.map(d => d.label)} colors={colors} />
    </div>
  );
};

export default DoughnutChartWithLegend;
