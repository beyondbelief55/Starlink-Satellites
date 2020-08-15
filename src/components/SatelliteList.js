import React, {Component} from 'react';
import {Button, Spin, List, Avatar, Checkbox} from 'antd';
import satellite from '../assets/images/satellite.svg';
class SatelliteList extends Component {
    state = {
        selected: []
    }
    onChange = e => {
        console.log(e.target);
        const {dataInfo, checked} = e.target;
        //
        const {selected } = this.state;
        const list = this.addOrRemove(dataInfo, checked, selected)
        // set state
        this.setState ({selected:list})
    }
    addOrRemove = (item, status, list) => {
        const found = list.some (entry => entry.satid === item.satid)
        if (status && !found){
            list.push(item);
        }
        if (!status && found) {
            list = list.filter(entry => entry.satid !== item.satid)
        }
        return list;
    }
    showMap = () => {
        //const {selected} = this.state;
        this.props.onShowMap(this.state.selected);
    }
    render() {
        //console.log(this.state.selected)
        const {selected} = this.state;
        const {satInfo} = this.props;
        const { isLoad } = this.props;
        const satlist = satInfo ? satInfo.above : [];
        return (
            <div className="sat-list-box">
                <Button className="sat-list-btn" size="large"
                        onClick={this.showMap}
                        disabled = {selected.length == 0}
                >
                    Track on the map
                </Button>
                <hr/>
                {
                    isLoad ?
                        <div className="spin-box">
                            <Spin tip="Loading...." size ="large" />

                        </div>

                        :
                        <List itemLayout="horizontal"
                              className = "sat-list"
                              dataSource={satlist}
                              renderItem= { item =>(
                                  <List.Item actions={[<Checkbox dataInfo={item} onChange={this.onChange}/>]}
                                  >
                                      <List.Item.Meta
                                          avatar={<Avatar size={50} src={satellite} />}
                                          title = {<p>{item.satname}</p>}
                                          description={`Launch Date : ${item.launchDate}`}

                                      />
                                  </List.Item>

                              )}
                        />
                }

            </div>
        );
    }
}

export default SatelliteList;
