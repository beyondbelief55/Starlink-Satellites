
import React, {Component} from 'react';
import {feature} from 'topojson-client'
import axios from 'axios';
import { geoKavrayskiy7 } from 'd3-geo-projection';
import { geoGraticule, geoPath } from 'd3-geo';
import { select as d3Select } from 'd3-selection';
import * as d3Scale from 'd3-scale';
import { schemeCategory10  } from 'd3-scale-chromatic';
import { timeFormat as d3TimeFormat } from 'd3-time-format';
import {Spin} from "antd";


import { WORLD_MAP_URL,SAT_API_KEY, SATELLITE_POSITION_URL } from "../constants";

const width = 960;
const height = 600;

class WorldMap extends Component {
    constructor(){
        super();
        this.state = {
            //map: null,
            //color: d3Scale.scaleOrdinal(schemeCategory10),
            isLoading: false,
            isDrawing: false
        }
        this.color = d3Scale.scaleOrdinal(schemeCategory10);
        this.map = null;
        this.refMap = React.createRef();
        this.refTrack = React.createRef();
    }
    componentDidMount() {
        //generateMap
        axios.get(WORLD_MAP_URL)
            .then( res => {
                //console.log(res);
                const {data} = res;
                const land = feature (data, data.objects.countries).features;
                this.generateMap(land);
            })
            .catch (e => {
                console.log ("errr", e.message)
            })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.satData !== this.props.satData ){
            //get observer data
            const { observerLat, observerLong, duration, observerElevation } = this.props.observerData;

            //const startTime = duration[0] * 60,
            const endTime = duration[1] * 60;
            this.setState ({isLoading:true});
            //get urls
            const urls = this.props.satData.map( sat => {
                const { satid } = sat;
                const url = `${SATELLITE_POSITION_URL}/${satid}/${observerLat}/${observerLong}/${observerElevation}/${endTime}/&apiKey=${SAT_API_KEY}`;
                return axios.get(url);
            });

            //this.setState(() => ({ isLoad: true }));

            //fetch satallite pass
            axios.all(urls)
                .then(
                    axios.spread( (...args) => { // put all urls gathered for selected sat into args
                        return args.map( item => item.data)
                    })
                )
                .then(res => {
                    this.setState({
                        isLoading: false,
                        isDrawing: true

                    });

                    if(!prevState.isDrawing) {
                        this.track(res);
                    } else {
                        const oHint = document.getElementsByClassName('hint')[0];
                        oHint.innerHTML = 'Please wait for these satellite animation to finish before selection new ones!'
                    }

                })
                .catch(e => {
                    console.log('error in fetch satellite position ->', e.message);
                    //alert('error in fetch satellite position' + e);
                })

        }
    }




    track (data){
        console.log('2 -> ', data)

        if (!data[0].hasOwnProperty('positions')){
            throw new Error ('no position data');
            return;
        }
        const len = data[0].positions.length;
        const { duration: [startTime, endTime] } = this.props.observerData;
        const { context2 } = this.map;
        let now = new Date();

        let i = startTime;
        let timer = setInterval(() => {
            // how much time passed from the start?
            //let timePassed = Date.now() - now;

            if(i === startTime){
                //now.setSeconds(now.getSeconds() + duration[0] * 60);
                //now.setSeconds(now.getSeconds() + startTime * 60);
                now = new Date (now.getTime() + startTime *1000); //getTime get mS and get currentTime + startTime
            }
            let ct = new Date();
            ct.setSeconds(ct.getSeconds() + startTime); // add start time to currentTIme
            let timePassed = (ct - now);
            let time = new Date(now.getTime() + 60 * timePassed); // the time to draw
            context2.clearRect(0, 0, width, height);

            context2.font = "bold 14px sans-serif";
            context2.fillStyle = "#333";
            context2.textAlign = "center";
            context2.fillText(d3TimeFormat(time), width / 2, 10);

            if (i >= len) {
                clearInterval(timer); // finish the animation after 2 seconds
                this.setState({isDrawing:false});
                const oHint = document.getElementsByClassName('hint');
                oHint.innerHTML = ''
                return;

            }

            // draw the animation at the moment timePassed
            data.forEach(sat => {
                const { info, positions} = sat;
                // console.log('1111 -> ', info, positions);
                this.drawSat(info, positions[i]);
            })

            i += 60;
        }, 1000)
    }
    drawSat (sat, pos) {
        const { satlongitude, satlatitude } = pos;
        if(!satlongitude || !satlatitude ) return;
        const { satname } = sat;
        const nameWithNumber = satname.match(/\d+/g).join('');
        const { projection, context2 } = this.map;
        const xy = projection([satlongitude, satlatitude]);
        context2.fillStyle = this.color(nameWithNumber);
        context2.beginPath();
        context2.arc(xy[0], xy[1], 4, 0, 2*Math.PI);
        context2.fill();
        context2.font = "bold 11px sans-serif";
        context2.textAlign = "center";
        context2.fillText(nameWithNumber, xy[0], xy[1]+14);
    }





    render() {
        const { isLoading } = this.state;
        return (
            <div className="map-box">
                {
                    isLoading ?
                        <div className="spinner">
                            <Spin tip="Loading..." size="large" />
                        </div>
                        :
                        null
                }
                <canvas className="map" ref={this.refMap} />
                <canvas className="track" ref={this.refTrack} />
                <div className = "hint"> </div>
            </div>
        );

    }

    generateMap(land){
        const projection = geoKavrayskiy7()
            .scale(170)
            .translate([width / 2, height / 2])
            .precision(.1);

        const graticule = geoGraticule(); // graticules are for drawing lon and lat lines

        const canvas = d3Select(this.refMap.current)
            .attr("width", width)
            .attr("height", height);
        const canvas2 = d3Select(this.refTrack.current)
            .attr("width", width)
            .attr("height", height);

        let context = canvas.node().getContext("2d");
        let context2 = canvas2.node().getContext("2d");
        let path = geoPath()
            .projection(projection)
            .context(context);

        land.forEach(ele => {
            context.fillStyle = '#B3EEEF';
            context.strokeStyle = '#000';
            context.globalAlpha = 0.7;
            context.beginPath();
            path(ele);
            context.fill();
            context.stroke();

            context.strokeStyle = 'rgba(220, 220, 220, 0.1)';
            context.beginPath();
            path(graticule());
            context.lineWidth = 0.15;
            context.stroke();

            context.beginPath();
            context.lineWidth = 0.5;
            path(graticule.outline());
            context.stroke();
        })

        // this.setState({
        //    map: {
        //       projection: projection,
        //      graticule: graticule,
        //     context: context,
        //      context2: context2
        //  }
        //})

        this.map = {
            projection:projection,
            graticule: graticule,
            context: context,
            context2: context2
        }

    }


}

export default WorldMap;
