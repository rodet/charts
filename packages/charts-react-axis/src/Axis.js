import React, { PropTypes } from 'react';
import Tick from './Tick';

/* eslint-disable react/display-name */
const calcLabels = (max, min, tickCount) => {
  return Array.from(Array(tickCount + 1)).map((_, i) => {
    return i * (max - min) / tickCount + min;
  });
};

const renderTickWith = (height, interval, labels, length, type, animation) => (_, i) => {
  const tickProps = type === 'bottom'
    ? {
      dy: 0.71,
      offset: `translate(${interval * i}, 0)`,
      path: `M0,0 L0,-${length}`,
      x: 0.5,
      y: 9,
      animation: `dashoffset 0.4s linear ${0.3 + i / 20}s forwards`,
    }
    : {
      dy: 0.32,
      offset: `translate(0, ${height - (interval * i)})`,
      path: `M0,0 L${length},0`,
      x: -9,
      y: 0.5,
      animation: `dashoffset 0.4s linear ${i / 10}s forwards`,
    };

  if (animation === false) {
    tickProps.animation = 'dashoffset forwards';
  } else if (typeof animation === 'function') {
    tickProps.animation = animation(i);
  }

  return (
    <Tick
      key={i}
      label={labels[i].toString()}
      length={length}
      {...tickProps}
    />
  );
};
/* eslint-enable react/display-name */

const Axis = (props, context) => {
  const {
    max,
    min,
    text,
    tickCount,
    type,
    animation,
  } = props;
  const { chart } = context;
  const length = type === 'bottom'
    ? chart.height
    : chart.width;
  const totalTicks = text
    ? text.length - 1
    : tickCount;
  const interval =  type === 'bottom'
    ? chart.width / totalTicks
    : chart.height / totalTicks;
  const labels = text
    ? text
    : calcLabels(max, min, tickCount);
  const transform = type === 'bottom'
    ? `translate(0,${chart.height})`
    : '';

  const renderTick = renderTickWith(chart.height, interval, labels, length, type, animation);

  return (
    <g
      className="axis axis--x"
      fill="none"
      fontSize="10"
      fontFamily="sans-serif"
      textAnchor="middle"
      transform={transform}>
      {Array.from(Array(totalTicks + 1)).map(renderTick)}
    </g>
  );
};

Axis.propTypes = {
  max: PropTypes.number,
  min: PropTypes.number,
  text: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  tickCount: PropTypes.number,
  type: PropTypes.string.isRequired,
  animation: PropTypes.any, // eslint-disable-line react/forbid-prop-types
};

Axis.contextTypes = {
  chart: PropTypes.object,
};

Axis.defaultProps = {
  min: 0,
  type: 'bottom',
};

export default Axis;
