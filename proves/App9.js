import React, { Component } from "react";
import { SafeAreaView, View, FlatList, StyleSheet, Text, TouchableOpacity, Image, Alert } from 'react-native';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';


import * as arbresJSONFile from './assets/arbres.json';

rotationStyle = function(options) {
  return {
    transform: [{ rotate: this.randomDegrees() }],
  }
}

randomDegrees = function() {
  var value = Math.floor(Math.random()*360)+'deg'
  //return value
  return '20deg'
}

function Item(props) {
  return (
    <View style={styles.item1}>
      <View style={styles.item2}>
        <Text style={styles.title}>{props.title} {props.distdir? "(" + props.distdir[0] + "m," + props.distdir[1] + ")" : ""}</Text>
      </View>
      <View  style={styles.item3}>
        <Image style={this.rotationStyle()} source={require('./assets/blue_arrow.png')} />
      </View>
    </View>
  );
}


function SearchLocation(props) {
  return (
    <View style={styles.item1p}>
      <View style={styles.item2p}>
        <Text style={styles.titlepos}>{props.cad}</Text>
      </View>
      <View  style={styles.item3p}>
        <Image style={this.rotationStyle()} source={require('./assets/red_arrow.png')} />
      </View>
    </View>
  );
}

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

  findCoordinates = async() => {
      const { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status !== 'granted') {
          //this.setState({ location: CONST.LATLON });
          return;
      }
      const position = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
      //const location = position;
      this.setState({ position });
      //this.setState({ location: location.coords });
      //console.log(location.coords)

  };


  findCoordinates2 = () => {
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
    //Location.watchHeadingAsync(
    //  headingObject => {
    //    this.setState({ 
    //      heading: Math.floor(headingObject.trueHeading)
    //    });
    //  }
    //);
  };

  actionOnRow(item) {
     console.log('Selected Item :',item);
  }

  actionOnSearchPos() {
     console.log('cercar');
  }

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
        data={arbresCopy}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={ () => this.actionOnRow(item)}>
            <Item title={item.tags.name.replace('arbre singular: ','')} distdir={item.distdir}  heading={this.state.heading} />
          </TouchableOpacity>
        )}
      />

    } else {
      
      flatList =   <FlatList
        data={arbresJSONFile.elements}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={ () => this.actionOnRow(item)}>
            <Item title={item.tags.name.replace('arbre singular: ','')} />
          </TouchableOpacity>
        )}
      />

    }

    return (
      <SafeAreaView style={styles.container}>
        <View>
          <Text style={styles.maintitle}>Arbres singulars de Barcelona</Text>
        </View>
        <TouchableOpacity onPress={ () => this.actionOnSearchPos()}>
          <SearchLocation cad="Activar posició" />
        </TouchableOpacity>

        {flatList}

      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
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
    backgroundColor: '#deb887',
    padding: 10,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  item1: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#deb887',
    padding: 20,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  item2: {
    backgroundColor: 'transparent',
    width: 260,
    marginVertical: -12,

  },
  item3: {
    backgroundColor: 'transparent',
    marginVertical: -12,
    width:10
  },
  item1p: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ff8c00',
    padding: 26, //kkk
    marginVertical: 0,
    marginBottom: 18, //kkk
    marginHorizontal: 16,
  },
  item2p: {
    backgroundColor: 'transparent',
    fontSize: 22,
    fontWeight: "bold",
    width: 260,
    marginVertical: -16, //kkk

  },
  item3p: {
    backgroundColor: 'transparent',
    marginVertical: -12,
    width:10
  },
  item1green: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#228b22',
    padding: 20,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 22,
  },
  searchpos: {
    backgroundColor: '#ff8c00',
    padding: 10,
    marginBottom: 14,
    marginHorizontal: 16,
  },
  titlepos: {
    fontSize: 22,
    fontWeight: "bold"
  },
  maintitle: {
    //backgroundColor: '#ff8c00',
    paddingTop: 10,
    marginVertical: 0,
    marginHorizontal: 16,
    fontSize: 22,
    fontWeight: "bold"
  },

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

