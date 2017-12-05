import * as React from "react";

import Resize from "components/resize";

import "./style.css";

interface State {
  top: number;
  left: number;
  width: number;
  height: number | string;
  rotate: number;
}

const Resizable = (
  {
    directions = ["n", "ne", "e", "se", "s", "sw", "w", "nw"],
    canRotate = true
  } = {}
) => (WrappedComponent: any) => {
  class ResizableComponent extends React.Component<any, State> {
    constructor(props: any) {
      super(props);
      const { top, left, width, height, rotate } = props.cmpData.style;
      this.state = {
        top,
        left,
        width,
        height,
        rotate
      };
    }

    componentWillReceiveProps(nextProps: any) {
      const { top, left, width, height, rotate } = nextProps.cmpData.style;
      this.setState(() => ({
        top,
        left,
        width,
        height,
        rotate
      }));
    }

    handleRotate = (deg: number) => {
      // setState
      this.setState({ rotate: deg });
    };

    handleRotateStop = () => {
      // updateCmp
    };

    handleScale = (position: {}) => {
      // setState
      // console.log(position, 'position')
      this.setState({ ...position });
    };

    handleScaleStop = () => {
      // updateCmp
    };

    render() {
      const { top, left, width, height, rotate } = this.state;
      const wrapperStyle = {
        top,
        left,
        width,
        height,
        transform: `rotate(${rotate}deg)`
      };
      return [
        <WrappedComponent
          key="cmp"
          data={{
            ...this.props.cmpData,
            style: { ...this.props.cmpData.style, ...wrapperStyle }
          }}
        />,
        <Resize
          key="resize"
          style={wrapperStyle}
          directions={directions}
          canRotate={true}
          rotate={rotate}
          onScale={this.handleScale}
          onScaleStop={this.handleScaleStop}
          onRotate={this.handleRotate}
          onRotateStop={this.handleRotateStop}
        />
      ];
    }
  }

  return ResizableComponent;
};

export default Resizable;
