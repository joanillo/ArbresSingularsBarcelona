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
        arbres: arbresCopy
      },()=>{
          //comprovació
          console.log(this.state.arbres[1].dist)
      });

    }
    );

  }

/*

  omplir_dades() {
    console.log('omplir_dades')
    this.state.arbres2 = arbres.elements.slice();
    console.log(this.state.arbres2[1].id)
    this.setState({
      arbres2: {
         ...this.state.arbres2,

      }
    });
  }
*/
  calcular_distancia() {
    return 2
  }

  findCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const location = JSON.stringify(position);

        this.setState({ location });
      },
      error => Alert.alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this.findCoordinates}>
          <Text style={styles.welcome}>Find My Coords?</Text>
          <Text>Location: {this.state.location}</Text>
        </TouchableOpacity>
         <FlatList
          data = {arbresJSONFile.elements}
          renderItem={({item}) => <Text style={styles.item}>{item.id} ({this.calcular_distancia()})</Text>}
        />
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