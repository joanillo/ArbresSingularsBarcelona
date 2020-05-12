import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
  TouchableOpacity
} from "react-native";
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

import * as arbresJSONFile from './assets/arbres.json';

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      location: null,
      heading: null, //brúixola
      onload: false,
      arbres: Array(arbresJSONFile.elements.length).fill(null)
    };
   }

  componentDidMount() {
    this.setState({
      arbres: arbresJSONFile.elements
    },()=>{
      //console.log(this.state.arbres[0].id)
      var arbresCopy = this.state.arbres.slice()
      //hem d'afegir la clau distdir=0 a tots els elements
      //https://stackoverflow.com/questions/39827087/add-key-value-pair-to-all-objects-in-array
      arbresCopy.map(o => (o.distdir = [0,0]));
      //i ara he de tornar a fer el setState (gravar)
      this.setState({
        arbres: arbresCopy,
        onload: true
      },()=>{
          //comprovació
          //console.log(this.state.arbres[1].distdir[0])
          this.interval = setInterval(() => {
            this.findCoordinates()
            this.calcularDistancies() //només ho puc fer si conec la posició
            //this.render()
            this.setState({ state: this.state }); //forçar a renderitzar
          }, 5000);
      });

    }
    );

  }


  calcularDistancia(item) {
    var latRad1 = this.state.location.coords.latitude * (Math.PI/180);
    var lonRad1 = this.state.location.coords.longitude * (Math.PI/180);
    var latRad2 = item.lat * (Math.PI/180);
    var lonRad2 = item.lon * (Math.PI/180);

    var R = 6373000.0 //metres (és el radi de la Terra)
    var dlon = lonRad2 - lonRad1
    var dlat = latRad2 - latRad1
    var a = Math.pow(Math.sin(dlat / 2),2) + Math.cos(latRad1) * Math.cos(latRad2) * Math.pow(Math.sin(dlon / 2),2)
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    var distance = Math.floor(R * c)

    var ax = Math.cos(latRad1) * Math.cos(latRad1) * Math.pow(Math.sin(dlon / 2),2)
    var cx = 2 * Math.atan2(Math.sqrt(ax), Math.sqrt(1 - ax))
    var distancex = Math.floor(R * cx)

    var ay = Math.pow(Math.sin(dlat / 2),2)
    var cy = 2 * Math.atan2(Math.sqrt(ay), Math.sqrt(1 - ay))
    var distancey = Math.floor(R * cy)

    var theta=Math.atan(distancey/distancex)*360/6.28
    //console.log("theta: " + theta)
    if ((latRad2>latRad1) && (lonRad2<lonRad1)) {
      theta = 180-theta  
    } else if  ((latRad2<latRad1) && (lonRad2<lonRad1)) {
      theta = 180+theta  
    } else if  ((latRad2<latRad1) && (lonRad2>lonRad1)) {
      theta = 360-theta  
    } else if  ((latRad2==latRad1) && (lonRad2<lonRad1)) {
      theta = 180  
    } else if  ((latRad2<latRad1) && (lonRad2==lonRad1)) {
      theta = 270
    }

    //console.log(Math.floor(theta/30))
    //console.log(Math.floor(theta))

    var distdir = [distance,Math.floor(theta)]
    return distdir
    //return Math.floor(Math.random() * 100);
  }

  calcularDistancies() {
    if (this.state.location) {
      //hem d'actaulitzar la distància de tots els elements, des de la meva posició fins a l'arbre

      this.state.arbres.map(o => (o.distdir = this.calcularDistancia(o)));
      //no cal fer setState
    }
  }

  findCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
      position => {
        //const location = JSON.stringify(position);
        //console.log(position.coords.latitude)
        const location = position;
        this.setState({ location });
      },
      error => Alert.alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

    //brúixola
    //tema de la calibració: https://android.stackexchange.com/questions/30329/how-does-compass-calibration-work/30341#30341
    Location.watchHeadingAsync(
      headingObject => {
        this.setState({ 
          heading: Math.floor(headingObject.trueHeading)
        });
      }
    );
  };



  render() {
    //cada vegada que renderitzo he d'actualitzar les distàncies
    let flatList;
    if (this.state.onload && this.state.location) {
      //aquests elements els puc ordenar per distància
      var arbresCopy = this.state.arbres.slice()
      //arbresCopy[index].score += val
      arbresCopy.sort((a,b) => {
          return a.distdir[0] - b.distdir[0]
      })

      flatList =   <FlatList
                    data = {arbresCopy}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({item}) => <Text style={styles.item}>{item.tags.name.replace('arbre singular: ','')} ({item.distdir[0]} m, {item.distdir[1]}, {item.distdir[1]+this.state.heading})</Text>}
                  />


    } else {
      flatList =   <FlatList
                    data = {arbresJSONFile.elements}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({item}) => <Text style={styles.item}>{item.tags.name.replace('arbre singular: ','')}</Text>}
                  />
    }

    

    return (
        <View style={styles.container}>
            <Text>Location: {this.state.location ? this.state.location.coords.latitude.toString(): ""}</Text>
            <Text>Heading: {this.state.heading ? this.state.heading.toString(): ""}</Text>
           {flatList}
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  }
});

// == OVERPASS TURBO QUERY ======================
/*
[out:json];
{{geocodeArea:"Barcelona"}}->.boundaryarea;
(
  node["name"~"arbre singular"](area.boundaryarea);
);
out body;
{{style:

node[natural=tree] {
  icon-image: url('https://img.icons8.com/cotton/2x/tree.png');
  icon-width: 25;
  icon-height: 25; 
}

}}
*/

