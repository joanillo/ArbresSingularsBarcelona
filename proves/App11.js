import React, { Component } from "react";
//import React, { PureComponent } from 'react';
import { SafeAreaView, View, FlatList, StyleSheet, Text, TouchableOpacity, Image, AsyncStorage, Alert } from 'react-native';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';


import * as arbresJSONFile from './assets/arbres.json';

rotationStyle = function(direction,heading) {
  //console.log('---')
  //console.log(direction)
  //console.log(heading)
  if (heading < direction) {
    graus = (360 + heading - direction) + 'deg'
  } else {
    graus = (heading - direction) + 'deg'
  }
  return {
    transform: [{ rotate: graus }],
  }
}

function Item(props) {

  if (props.heading >= 0) {
    image = <Image style={this.rotationStyle(props.distdir[1], props.heading)} source={require('./assets/blue_arrow.png')} />
  } else {
    image = <Image source={require('./assets/empty_arrow.png')} />
  }

  let styleColor = styles.item1red
  if (props.color) {
    styleColor = props.color=='red' ? styles.item1red : styles.item1green
  } else {

    styleColor = styles.item1red
  }


  return (
    <View style={styleColor}>
      <View style={styles.item2}>
        <Text style={styles.title}>{props.title} {props.distdir? "(" + props.distdir[0] + "m)" : ""}</Text>
      </View>
      <View  style={styles.item3}>
        {image}
      </View>
    </View>
  );
}


function SearchLocation(props) {
  return (
    <View style={styles.item1p}>
      <View style={styles.item2p}>
        <Text style={props.styleText}>{props.cad}</Text>
      </View>
    </View>
  );
}

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      location: null,
      locationOld: null,
      onload: false,
      permit_location: false, //si vull activar automàtic a l'inici, posar true.
      searching_location: false,
      heading: -1, //el heading és la direcció a la qual avanço, i es calcula com a diferència entre dues posicions consecutives
      contolHeading: 0,
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
      arbresCopy.map(o => (o.distdir = [0,0])); //distància, direcció
      arbresCopy.map(o => (o.color = "red")); //color
      //arbresCopy.map(o => function() {o.distdir = [0,0];o.color = "red";}); //no funciona
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

  calculaHeading() {
    //en qualsevol cas que no es pugui calcular l'angle (bàsicament perquè estem quiets), retorna -1
    if (this.state.location && this.state.locationOld) {
      //console.log('---')
      //console.log(this.state.locationOld.coords.latitude)
      //console.log(this.state.location.coords.latitude)

      var latRad1 = this.state.locationOld.coords.latitude * (Math.PI/180);
      var lonRad1 = this.state.locationOld.coords.longitude * (Math.PI/180);
      var latRad2 = this.state.location.coords.latitude * (Math.PI/180);
      var lonRad2 = this.state.location.coords.longitude * (Math.PI/180);

      //paràmetre 3: 3*5=15 segons. Quan la velocitat és petita (caminant), sovint no hi ha canvi de coordenades, 
      //i això feia que heading=-1.
      //El que es vol evitar és que desapareixi la brúixola quan realment estic caminant.
      if (latRad1==latRad2 && lonRad1==lonRad2 && this.state.contolHeading>=3) {
        return -1
      } else if (latRad1==latRad2 && lonRad1==lonRad2) {
        this.setState({ contolHeading: this.state.contolHeading + 1 });
        return this.state.heading
      } else {
        this.setState({ contolHeading: 0 });

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
        if (theta > 0) {
          //console.log(theta.toFixed(2))
          return theta.toFixed(2)
        } else {
          return -1
        }
      }

    } else {
      return -1
    }
  }

  findCoordinates = async() => {
      if (!this.state.permit_location)
        return;

      const { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status !== 'granted') {
          return;
      }
      
      //guardo la posició actual:
      this.setState({ locationOld: this.state.location });

      const position = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
      const location = position; //així! (?)
      //console.log(location)
      if (location) {
        this.setState({ location });
        this.setState({ searching_location:false });
      } else {
        this.setState({ searching_location:true });
      }

      const heading = this.calculaHeading()
      this.setState({ heading:heading });

  };


  actionLongOnRow(item,index) {
      //TODO: el index no el necessitem per a res
      //console.log(index)
      //console.log(item.id)
      //console.log('Selected Item :',item);
      var arbresCopy = this.state.arbres.slice()

      //https://stackoverflow.com/questions/46862976/how-to-filter-array-of-objects-in-react-native
      //https://stackoverflow.com/questions/37585309/replacing-objects-in-array
      datafound = arbresCopy.filter((it) => it.id == item.id).map((keys) => (keys));
      if (datafound[0].color == 'red') {
        datafound[0].color='green'
      } else {
        datafound[0].color='red'    
      }
      //substituïm
      arbresCopy.map(obj => datafound.find(o => o.id === obj.id) || obj);

      //arbresCopy[index].color = "green"

      this.setState({
        arbres: arbresCopy
      })
      

  }

  actionOnSearchPos() {
     console.log('cercar');
     this.setState({ permit_location: true, searching_location: true });
  }

  render() {
    let styleTitleSecondary = styles.titlepos
    //cada vegada que renderitzo he d'actualitzar les distàncies
    let flatList;
    if (this.state.onload && this.state.location) {
      styleTitleSecondary = styles.titlepos2
      //aquests elements els puc ordenar per distància
      var arbresCopy = this.state.arbres.slice()
      //arbresCopy[index].score += val
      arbresCopy.sort((a,b) => {
          return a.distdir[0] - b.distdir[0]
      })

      flatList =   <FlatList
        data={arbresCopy}
        keyExtractor={(item, index) => item.id.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity onLongPress={ () => this.actionLongOnRow(item,index)}>
            <Item title={item.tags.name.replace('arbre singular: ','')} distdir={item.distdir} color={item.color} />
          </TouchableOpacity>
        )}
      />

      if (this.state.heading >=0 ) {

        flatList =   <FlatList
          data={arbresCopy}
        keyExtractor={(item, index) => item.id.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity onLongPress={ () => this.actionLongOnRow(item,index)}>
              <Item title={item.tags.name.replace('arbre singular: ','')} distdir={item.distdir} color={item.color} heading={this.state.heading}  />
            </TouchableOpacity>
          )}
        />
        cad_title = "(" + this.state.location.coords.latitude.toFixed(5) + "," + this.state.location.coords.longitude.toFixed(5) + ") " + this.state.heading + "º"
      } else {
        cad_title = "(" + this.state.location.coords.latitude.toFixed(5) + "," + this.state.location.coords.longitude.toFixed(5) + ")"        
      }
    } else {
      
      flatList =   <FlatList
        data={arbresJSONFile.elements}
        keyExtractor={(item, index) => item.id.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity onLongPress={ () => this.actionLongOnRow(item,index)}>
            <Item title={item.tags.name.replace('arbre singular: ','')} />
          </TouchableOpacity>
        )}
      />

      if (!this.state.searching_location) {
        cad_title = "Activar posició"
      } else {
        cad_title = "cercant..."
      }

    }

    return (
      <SafeAreaView style={styles.container}>
        <View>
          <Text style={styles.maintitle}>Arbres singulars de Barcelona</Text>
        </View>
        <TouchableOpacity onPress={ () => this.actionOnSearchPos()}>
          <SearchLocation styleText={styleTitleSecondary} cad={cad_title} />
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


  item1red: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ff8a8a',
    padding: 20,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  item1green: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#67ff67',
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
  titlepos2: {
    fontSize: 18,
    //fontWeight: "bold"
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

