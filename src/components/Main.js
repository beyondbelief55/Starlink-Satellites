
import React, {Component} from 'react';
import axios from 'axios';
import { NEARBY_SATELLITE, SAT_API_KEY, STARLINK_CATEGORY } from '../constants';
import SatSetting from './SatSetting';
import SatelliteList from './SatelliteList';
import WorldMap from './WorldMap';

class Main extends Component {
    constructor(){
        super();
        this.state = {
            satInfo: null,
            satList: null,
            setting: null,
            isLoadingList: false
        }
    }
    render() {
        const { isLoadingList, satInfo, satList, setting } = this.state;
        return (
            <div className="main">
                <div className="left-side">
                    <SatSetting onShow={this.showNearbySatellite}/>
                    <SatelliteList isLoad={isLoadingList}
                                   satInfo={satInfo}
                                   onShowMap={this.showMap} />
                </div>
                <div className="right-side">
                    <WorldMap satData={satList} observerData={setting} />
                </div>
            </div>
        );
    }

    showMap = (selected) => {
        this.setState(preState => ({
            ...preState,
            satList: [...selected]
        }))
    }

    showNearbySatellite = (setting) => {
        this.setState({
            isLoadingList: true,
            setting: setting
        })
        this.fetchSatellite(setting);
    }

    fetchSatellite = (setting) => {
        const { observerLat, observerLong, observerElevation, satAlt } = setting;
        const url = `${NEARBY_SATELLITE}/${observerLat}/${observerLong}/${observerElevation}/${satAlt}/${STARLINK_CATEGORY}&apiKey=${SAT_API_KEY}`;
        axios.get(url)
            .then(response => {
                this.setState({
                    satInfo: response.data,
                    isLoadingList: false
                })
            })
            .catch(err => {
                console.log('fetch satellite failed -> ', err.message);
            })
    }
}
export default Main;
