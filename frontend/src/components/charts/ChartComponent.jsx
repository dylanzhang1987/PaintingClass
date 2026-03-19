import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const ChartComponent = ({ option, height = '400px', loading = false }) => {
  const chartRef = useRef(null);
  const chartId = useRef(`chart-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (option && !loading && chartRef.current) {
      const chartInstance = echarts.init(chartRef.current);
      chartInstance.setOption(option);
      return () => chartInstance.dispose();
    }
  }, [option, loading]);

  return (
    <div ref={chartRef} style={{ width: '100%', height }}>
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : null}
    </div>
  );
};

export default ChartComponent;
