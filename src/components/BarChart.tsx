import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';

interface BarChartProps {
  data: { [key: string]: number | string }[];
  quarters: string[];
  custTypes: string[];
  width?: number;
  height?: number;
}

const getColorPalette = (n: number) => {
  // Use d3.schemeTableau10, fallback to d3.interpolateRainbow
  if ((d3 as any).schemeTableau10 && n <= 10) return (d3 as any).schemeTableau10;
  return Array.from({ length: n }, (_, i) => d3.interpolateRainbow(i / n));
};

type D3StackDatum = [number, number] & { data?: { quarter?: string }; quarter?: string };

const BarChart: React.FC<BarChartProps & { colors: string[] }> = ({ data, quarters, custTypes, width, height = 220, colors }) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = React.useState<number>(width || 260);
  const theme = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new window.ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentRect) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    d3.select(ref.current).selectAll('*').remove();
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const w = containerWidth - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;
    const svg = d3.select(ref.current)
      .attr('width', containerWidth || 260)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // ... rest of D3 code remains unchanged ...

    // Tooltip handlers are now attached to rects above
    return () => { d3.select('body').selectAll('.bar-tooltip').remove(); };
  }, [data, containerWidth, height, theme]);

  useEffect(() => {
    if (!ref.current) return;
    d3.select(ref.current).selectAll('*').remove();
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const w = containerWidth - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;
    const svg = d3.select(ref.current)
      .attr('width', width || 260)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare data for d3.stack (all values must be numbers except for 'quarter')
    const stackData = data.map(row => {
      const out: { [key: string]: number | string } = { quarter: row.quarter };
      custTypes.forEach(type => {
        out[type] = typeof row[type] === 'number' ? (row[type] as number) : Number(row[type]);
      });
      return out;
    });

    // Stack data
    const stack = d3.stack<{ [key: string]: number | string }, string>().keys(custTypes);
    const stackedData = stack(stackData as { [key: string]: number }[]);

    const x = d3.scaleBand()
      .domain(quarters)
      .range([0, w])
      .padding(0.15);
    const y = d3.scaleLinear()
      .domain([0, d3.max(stackData, d => custTypes.reduce((sum, t) => sum + (typeof d[t] === 'number' ? (d[t] as number) : Number(d[t])), 0)) || 0])
      .nice()
      .range([h, 0]);

    // Y axis
    svg.append('g')
      .call(d3.axisLeft(y).tickSize(-w).tickPadding(8).tickFormat((d, i) => i === 0 ? `$${(Number(d)/1000).toFixed(2)}K` : ''))
      .selectAll('line')
      .attr('stroke', '#eee');

    // X axis
    svg.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x));

    // Bars
    svg.selectAll('g.layer')
      .data(stackedData)
      .enter().append('g')
      .attr('class', 'layer')
      .attr('fill', (d, i) => colors[i % colors.length])
      .selectAll('rect')
      .data((d, i) => d.map((item, idx) => ({
        ...item,
        quarter: quarters[idx],
        type: custTypes[i],
        value: item[1] - item[0],
        percent: ((item[1] - item[0]) / (d3.sum(custTypes.map(t => typeof data[idx][t] === 'number' ? data[idx][t] as number : Number(data[idx][t])), v => v) || 1)) * 100
      })))
      .enter().append('rect')
      .attr('x', d => x(d.quarter) || 0)
      .attr('y', d => y(d[1]))
      .attr('height', d => y(d[0]) - y(d[1]))
      .attr('width', x.bandwidth())
      .attr('rx', 5)
      .style('filter', 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))')
      .on('mousemove', function(event, d) {
        tooltip
          .style('opacity', 1)
          .html(`
            <div style="min-width: 160px">
              <strong>${d.type}</strong><br/>
              Quarter: ${d.quarter}<br/>
              Value: $${(d.value).toLocaleString(undefined, { maximumFractionDigits: 2 })} (${(d.value/1000).toFixed(2)}K)<br/>
              Percent: ${d.percent.toFixed(1)}%
            </div>
          `)
          .style('left', (event.pageX + 12) + 'px')
          .style('top', (event.pageY - 28) + 'px');
        d3.select(this).attr('stroke', theme.palette.primary.main).attr('stroke-width', 2);
      })
      .on('mouseleave', function() {
        tooltip.style('opacity', 0);
        d3.select(this).attr('stroke', null).attr('stroke-width', null);
      });


    // Tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'bar-tooltip')
      .style('position', 'absolute')
      .style('background', theme.palette.background.paper)
      .style('color', theme.palette.text.primary)
      .style('padding', '6px 12px')
      .style('border-radius', '8px')
      .style('box-shadow', theme.shadows[3])
      .style('pointer-events', 'none')
      .style('opacity', 0);

    // Tooltip handlers are now attached to rects above
    return () => { tooltip.remove(); };
  }, [data, width, height, theme]);
  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <svg ref={ref} style={{ width: '100%', height: height, minHeight: height }} />
    </div>
  );

};

// Legend rendering
const Legend: React.FC<{ custTypes: string[], colors: string[] }> = ({ custTypes, colors }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
    {custTypes.map((type, i) => (
      <span key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ display: 'inline-block', width: 18, height: 18, borderRadius: 6, background: colors[i % colors.length], border: '1.5px solid #e3e9f7', marginRight: 5 }} />
        <span style={{ fontSize: 14, color: '#444', fontWeight: 500 }}>{type}</span>
      </span>
    ))}
  </div>
);

const BarChartWithLegend: React.FC<BarChartProps> = (props) => {
  const colors = getColorPalette(props.custTypes.length);
  return (
    <div>
      <BarChart {...props} colors={colors} />
      <Legend custTypes={props.custTypes} colors={colors} />
    </div>
  );
};

export default BarChartWithLegend;
