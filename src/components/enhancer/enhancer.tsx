import * as React from "react";

import Draggable from "../draggable";
import reseizable from '../resizable'
import Btn from "../btn";

const cmpMap: any = {
  btn: reseizable()(Btn)
  // btn: Btn
};

class EditComponent extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    const { top, left, width, height } = this.props.cmpData.style;
    this.state = {
      top,
      left,
      width,
      height
    };
  }
  handleDrag = () => {
    // snap --吸附
  };

  handleDragStop = ({ tx, ty }: { tx: number; ty: number }) => {
    // updateCmp
    const { top, left } = this.props.cmpData.style;
    this.props.updateCmp({
      style: {
        top: top + ty,
        left: left + tx
      }
    });
  };

  render() {
    const { cmpData, updateCmp } = this.props;
    const Cmp = cmpMap[cmpData["type"]];

    return (
      <Draggable
        onDrag={this.handleDrag}
        onStop={this.handleDragStop}
        position={{ x: 0, y: 0 }}
      >
        <div className="drag-wrapper" style={this.props.style}>
          <Cmp cmpData={cmpData} updateCmp={updateCmp} />
        </div>
      </Draggable>
    );
  }
}

export default EditComponent;
