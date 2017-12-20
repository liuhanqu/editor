import * as React from 'react';

import { addEventsToDocument, removeEventsFromDocument } from 'utils/event';
import { calcRotateDeg, getSizeAndPositions, calcRect } from 'utils/resize';
import { throttle } from 'utils/throttle';

import './style.css';

const directionMap = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
const WAIT = 20;

interface Point {
  x: number;
  y: number;
}
interface ResizeProps {
  rotate: number;
  directions: string[];
  canRotate: boolean;
  onRotateStart?: Function;
  onRotate: Function;
  onRotateStop: Function;
  onScaleStart?: () => {};
  onScale: Function;
  onScaleStop: Function;
  // offsetParent: Element
}

interface ResizeState {
  scaling: boolean;
  direction: string;
  start?: Point;
  center?: Point;
  ref?: Point;
  width?: number;
  height?: number;
}

class Resize extends React.Component<any, ResizeState> {
  throttleRotate: (evt: MouseEvent) => void;
  throttleScale: (evt: MouseEvent) => void;

  resizeNode: HTMLElement;

  static defaultProps = {
    directions: directionMap,
  };

  constructor(props: ResizeProps) {
    super(props);
    this.state = {
      scaling: false,
      direction: '',
    };
    this.throttleRotate = throttle(this.handleRotate, WAIT);
    this.throttleScale = throttle(this.handleScale, WAIT);
  }

  handleRotateStart: React.MouseEventHandler<HTMLElement> = evt => {
    evt.stopPropagation();
    if (this.props.onRotateStart) {
      this.props.onRotateStart();
    }

    addEventsToDocument({
      mousemove: this.throttleRotate,
      mouseup: this.handleRotateStop,
    });
  };

  handleRotate: React.MouseEventHandler<HTMLElement> = evt => {
    const deg = calcRotateDeg(evt, this);

    if (this.props.onRotate) {
      this.props.onRotate(deg);
    }
  };

  handleRotateStop = () => {
    if (this.props.onRotateStop) {
      this.props.onRotateStop();
    }

    removeEventsFromDocument({
      mousemove: this.throttleRotate,
      mouseup: this.handleRotateStop,
    });
  };

  handleScaleStart: React.MouseEventHandler<HTMLElement> = evt => {
    evt.stopPropagation();
    if (this.props.onScaleStart) {
      this.props.onScaleStart();
    }
    const direction = (evt.target as HTMLElement).getAttribute('data-direction') as string;

    // { start, center , ref, width, height }
    const positions = getSizeAndPositions(evt, this);

    this.setState({
      scaling: true,
      direction,
      ...positions,
    });

    addEventsToDocument({
      mousemove: this.throttleScale,
      mouseup: this.handleScaleStop,
    });
  };

  handleScale: React.MouseEventHandler<HTMLElement> = evt => {
    const position = calcRect(evt, this);

    if (this.props.onScale) {
      this.props.onScale(position);
    }
  };

  handleScaleStop = () => {
    if (this.props.onScaleStop) {
      this.props.onScaleStop();
    }
    this.setState({
      direction: '',
      width: NaN,
      height: NaN,
    });

    removeEventsFromDocument({
      mousemove: this.throttleScale,
      mouseup: this.handleScaleStop,
    });
  };

  renderDots(directions: string[], rotate: number) {
    const n = Math.round((rotate % 360) / 45);
    const cursors = directionMap.map((direction, i) => directionMap[(i + n) % 8] + '-resize');
    return directionMap.map((direction: string, idx: number) => {
      if (directions.indexOf(direction) === -1) {
        return null;
      }
      return (
        <span
          key={direction}
          className={`dot dot-${direction}`}
          style={{ cursor: cursors[idx] }}
          data-direction={direction}
          onMouseDown={this.handleScaleStart}
        />
      );
    });
  }

  render() {
    const { directions, canRotate, rotate, style } = this.props;
    return (
      <div
        className="operate"
        style={style}
        ref={node => {
          this.resizeNode = node as HTMLElement;
        }}>
        {canRotate ? (
          <span className="rotate" onMouseDown={this.handleRotateStart}>
            <i className="icon icon-rotate" />
          </span>
        ) : null}
        {this.renderDots(directions, rotate)}
      </div>
    );
  }
}

export default Resize;
