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
import * as arbresJSONFile from './assets/arbres.json';


export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      location: null,
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
      //hem d'afegir la clau dist=0 a tots els elements
      //https://stackoverflow.com/questions/39827087/add-key-value-pair-to-all-objects-in-array
      arbresCopy.map(o => (o.dist = 0));
      //i ara he de tornar a fer el setState (gravar)
      this.setState({
        arbres: arbresCopy,
        onload: true
      },()=>{
          //comprovació
          console.log(this.state.arbres[1].dist)
      });

    }
    );

  }

  calcular_distancia(item) {
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

    return distance
  }

  calcular_distancies() {
      console.log('anem a recalcular totes les distàncies')
      console.log(this.state.arbres[0].dist)
      console.log(this.state.arbres[0].lat)
      console.log(this.calcular_distancia(this.state.arbres[0]))

      //hem d'actaulitzar la distància de tots els elements, des de la meva posició fins a l'arbre
      this.state.arbres.map(o => (o.dist = this.calcular_distancia(o)));
      //no cal fer setState
      //suposo que és una mala pràctica perquè em fa el warning:
      //cannot update during and existing state transition (such as render)
      //i és que crido a calcular_distancies() des del render.
      //quan faci el time interval, per cada interval faré el calcular_distancies(), i després el render()

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
  };

  render() {
    //cada vegada que renderitzo he d'actualitzar les distàncies
    let flatList;
    if (this.state.onload && this.state.location) {
      this.calcular_distancies()
      //aquests elements els puc ordenar per distància
      var arbresCopy = this.state.arbres.slice()
      //arbresCopy[index].score += val
      arbresCopy.sort((a,b) => {
          return a.dist - b.dist
      })

      flatList =   <FlatList
                    data = {arbresCopy}
                    renderItem={({item}) => <Text style={styles.item}>{item.tags.name.replace('arbre singular: ','')} ({item.dist} m)</Text>}
                  />


    } else {
      flatList =   <FlatList
                    data = {arbresJSONFile.elements}
                    renderItem={({item}) => <Text style={styles.item}>{item.tags.name.replace('arbre singular: ','')}</Text>}
                  />
    }
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this.findCoordinates}>
          <Text style={styles.welcome}>Find My Coords?</Text>
          <Text>Location: {this.state.location ? this.state.location.coords.latitude: "encara no"}</Text>
        </TouchableOpacity>
         {flatList}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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