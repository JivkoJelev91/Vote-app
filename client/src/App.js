import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import  axios  from 'axios';
import Pusher from 'pusher-js';

var CanvasJSReact = require('./canvasjs.react');
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      os: "",
      votes: 0,
      totalVotes: 0,
    };
  }

  componentDidMount(){
    axios.get('http://localhost:4242/poll')
      .then((res) => {
          const votes = res.data.votes;
          const totalVotes = votes.length;

          const votesCounts = 
          votes.reduce(
            (acc, vote) => (
            (acc[vote.os] = (acc[vote.os] || 0) + parseInt(vote.points)), acc), {});

          this.chartCanvas(votesCounts);
      })
      .catch(err => console.log(err));
  }

  chartCanvas(votesCounts){
    let dataPoints = [
      {label: 'Windows', y:votesCounts.Windows},
      {label: 'Macos', y:votesCounts.Macos},
      {label: 'Linux', y:votesCounts.Linux},
      {label: 'Other', y:votesCounts.Other},
    ];

    const chartContainer = document.querySelector('#chartContainer');

    if(chartContainer){
      const chart =  new CanvasJS.Chart('chartContainer',{
        animationEnabled: true,
            theme: 'theme1',
            title: {
              text: 'OS Results'
            },
            data:[
              {
                type: 'column',
                dataPoints: dataPoints
              }
            ]
      })
      chart.render();
  
      Pusher.logToConsole = true;
  
      var pusher = new Pusher('7bbbd7b9f04578359a2d', {
        cluster: 'eu',
        forceTLS: true
      });
  
      var channel = pusher.subscribe('os-poll');
      channel.bind('os-vote', function(data) {
        dataPoints = dataPoints.map(x => {
          if(x.label == data.os){
            x.y += data.points;
            return x;
          }else{
            return x;
          }
        });
        chart.render();
      });
    }
  }

  submitForm = (e) =>{
    e.preventDefault();
    const os = this.state.os;
    axios.post('http://localhost:4242/poll', {'os': os})
      .then(res => console.log(res))
      .catch(err => console.log(err));
  }

  setOs = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value
    });
  }

  render() {
    return (
      <div className="App">
          <div className="container">
            <h1>OS Vote</h1>
            <p>Vote for your favorite OS to develop on</p>
            <form id="vote-form" onSubmit={this.submitForm} onChange={this.setOs}>
                <p>
                  <input type="radio" name="os" id="windows" value="Windows"/>
                  <label htmlFor="windows">Windows</label>
                </p>
                <p>
                  <input type="radio" name="os" id="macos" value="Macos"/>
                  <label htmlFor="macos">Macos</label>
                </p>
                <p>
                  <input type="radio" name="os" id="linux" value="Linux"/>
                  <label htmlFor="linux">Linux</label>
                </p>
                <p>
                  <input type="radio" name="os" id="other" value="Other"/>
                  <label htmlFor="other">Something else</label>
                </p>
                <input type="submit" value="Vote" className="btn" />
            </form>
            <br /> <br />
            <div id="chartContainer">
            </div>
          </div>
      </div>
    );
  }
}

export default App;
