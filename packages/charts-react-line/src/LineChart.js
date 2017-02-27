import React, { PropTypes } from 'react';
import * as shape from 'd3-shape';
import { extent } from 'd3-array';
import { palettes } from '@ibm-design/charts-colors';
import Chart from '@ibm-design/charts-react-chart';
import Colors from 'ibm-design-colors/ibm-colors';
import Line from './Line';
import Legend from './Legend';

export default class LineChart extends React.PureComponent {
  static propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    lines: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    legend: PropTypes.shape({
      title: PropTypes.string,
      labels: PropTypes.array,
      width: PropTypes.number,
    }),
    width: PropTypes.number,
    height: PropTypes.number,
    margin: PropTypes.shape({
      top: PropTypes.number,
      right: PropTypes.number,
      bottom: PropTypes.number,
      left: PropTypes.number,
    }),
    x: PropTypes.func,
    y: PropTypes.func,
    scaleX: PropTypes.func,
    scaleY: PropTypes.func,
    // eslint-disable-next-line react/forbid-prop-types
    domainX: PropTypes.array,
    // eslint-disable-next-line react/forbid-prop-types
    domainY: PropTypes.array,
    // eslint-disable-next-line react/forbid-prop-types
    strokes: PropTypes.array,
  }

  static contextTypes = {
    chart: PropTypes.any,
  }

  static defaultProps = {
    lines: [],
    width: 960,
    height: 500,
    legend: {
      labels: [],
      width: 200,
    },
    margin: {
      top: 20,
      right: 20,
      bottom: 30,
      left: 50,
    },
    strokes: palettes.qualitative,
  }

  componentWillMount() {
    const {
      width,
      height,
      margin,
      x,
      y,
      scaleX,
      scaleY,
      domainX,
      domainY,
    } = this.props;

    this.width = width - margin.left - margin.right;
    this.height = height - margin.top - margin.bottom;

    this.x = scaleX()
      .rangeRound([0, this.width])
      .domain(domainX);

    this.y = scaleY()
      .rangeRound([this.height, 0])
      .domain(domainY);

    this.line = shape.line()
      .x((d) => this.x(x(d)))
      .y((d) => this.y(y(d)));


    this.setState({ ranges: this.getRange(this.props.lines) });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.lines !== this.props.lines) {
      this.setState({ ranges: this.getRange(this.props.lines) });
    }
  }

  getRange = lines => {
    const xArrays = lines.map(line =>
      line.map(obj => obj[Object.keys(obj)[0]])
    );
    const yArrays = lines.map(line =>
      line.map(obj => obj[Object.keys(obj)[1]])
    );
    const flatten = arr => arr
      .reduce((acc, val) => acc.concat(Array.isArray(val)
        ? flatten(val)
        : val), []
      );

    const xRange = extent(flatten(xArrays));
    const yRange = extent(flatten(yArrays));
    return [
      {
        min: xRange[0],
        max: xRange[1],
        tickCount: this.props.grid[0].tickCount
          ? this.props.grid[0].tickCount
          : 5,
      },
      {
        min: yRange[0],
        max: yRange[1],
        tickCount: this.props.grid[1].tickCount
          ? this.props.grid[1].tickCount
          : 5,
      },
    ]
  }

  render() {
    const { line, props } = this;
    const { grid, height, legend, margin, strokes, width } = props;
    const isLegendVisible = !!legend.labels.length;
    const legendWidth = isLegendVisible ? (legend.width || 200) : 0;
    const lines = this.props.lines.map((data, index) =>
      <Line
        line = {line}
        data = {data}
        key={index}
        stroke={strokes[index % strokes.length]}
      />
    );

    return (
      <div style={{width}}>
        {isLegendVisible &&
          <Legend
            labels={legend.labels}
            width={legendWidth}
            title={legend.title}
          />
        }
        <Chart
          height={height}
          margin={margin}
          width={width - legendWidth}
          x={
            grid[0].text || (grid[0].min && grid[0].max)
              ? grid[0]
              : this.state.ranges[0]
          }
          y={
            grid[1].text || (grid[1].min && grid[1].max)
              ? grid[1]
              : this.state.ranges[1]
          }
        >
          {lines}
        </Chart>
      </div>
    );
  }
}
