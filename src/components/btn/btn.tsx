import * as React from "react";

export default class Btn extends React.Component<any, any> {
  render() {
    return <div style={{...this.props.data.style, position: 'absolute'}}>btn text</div>;
  }
}
