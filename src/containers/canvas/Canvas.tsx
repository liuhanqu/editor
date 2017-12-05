import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { AnyAction } from 'redux';

import { updateCmp } from '../../actions/cmp';

import EditComponent from 'components/enhancer';

import './style.css';

class Canvas extends React.Component<any, any> {
  renderCmps(cmps: ICmps) {
    const { ids } = cmps;
    if (ids.length === 0) {
      return null;
    }
    return ids.map(id => {
      const cmpData = cmps[id];
      return <EditComponent key={id} cmpData={cmpData} updateCmp={this.props.updateCmp} />;
    });
  }

  render() {
    const { cmps } = this.props;
    return (
      <div className="canvas-wrapper">
        <div className="canvas">{this.renderCmps(cmps)}</div>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    cmps: state.cmp,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
  updateCmp(data: any) {
    dispatch(updateCmp(data));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Canvas);
