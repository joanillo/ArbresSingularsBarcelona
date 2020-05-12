import React from 'react';
import { SafeAreaView, View, FlatList, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import Constants from 'expo-constants';

const DATA = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'First Item',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d74',
    title: '4rt Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d75',
    title: '5è Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d76',
    title: '6è Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d77',
    title: '7è Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d78',
    title: '8è Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d79',
    title: '9è Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d80',
    title: '10è Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d81',
    title: '11è Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d82',
    title: '12è Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d83',
    title: '13è Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d84',
    title: '14è Item',
  },
];

function actionOnRow(item) {
   console.log('Selected Item :',item);
}

function actionOnSearchPos() {
   console.log('cercar');
}

function Item({ title }) {
  return (
    <View style={styles.item1}>
      <View style={styles.item2}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View  style={styles.item3}>
        <Image source={require('./assets/fletxa.png')} />
      </View>
    </View>
  );
}

function SearchLocation({ cad }) {
  return (
    <View style={styles.searchpos}>
      <Text style={styles.titlepos}>{cad}</Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.maintitle}>Arbres singulars de Barcelona</Text>
      </View>
      <TouchableOpacity onPress={ () => actionOnSearchPos()}>
        <SearchLocation cad="Activar posició" />
      </TouchableOpacity>
      <FlatList
        data={DATA}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={ () => actionOnRow(item)}>
            <Item title={item.title} />
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
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
    backgroundColor: '#deb887',
    width: 260,
    marginVertical: -12,

  },
  item3: {
    backgroundColor: '#deb887',
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

