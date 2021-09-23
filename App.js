import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import { init, addItem, fetchItems, deleteItem } from './database/db';

init()
.then(()=>{
  console.log('db was created');
}).catch((err)=>{
  console.log('there was an error creating db '+err);
})

export default function App() {

  //location states
  const [location, setLocation] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  //const [mapRegion, setMapRegion] = useState(0);
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [latdelta, setLonDelta] = useState( 0.0922);
  const [landelta, setLanSelta] = useState(0.0421);
  const [prevMarkers, setPrevMarkers] = useState(false);

  // db states
  const [itemList, setItemList] = useState([]);

// fetching initial location
  useEffect(() => {
    (async () => {
      const foreGround = await Location.requestForegroundPermissionsAsync();
      const backGround = await Location.requestBackgroundPermissionsAsync();
      if (foreGround !== "granted" && backGround !== "granted") {
        setErrorMsg("Permission to access location was denied");
      }

      let location = await Location.getCurrentPositionAsync({});
      //setLocation(location);
      setLat(location.coords.latitude);
      setLng(location.coords.longitude);
  
      // setMapRegion({
      //   longitude: lon,
      //   latitude: lat,
      //   longitudeDelta: 0.0922,
      //   latitudeDelta: 0.0421
      // });

    })();
  }, []);

  // CALLING FETCH ITEMS FROM USE EFFECT TO ALWAYS HAVE THEM UPDATED
  useEffect(() => {
      getItems();
    }, []);

  // FETCH ITEMS FROM DB
  const getItems = async () => {
    try {
    const dbResult = await fetchItems();
    console.log('From db '+ JSON.stringify(dbResult.rows._array))
    setItemList(dbResult.rows._array)
    } 
    catch(err) {
      console.log(err);
    }
    finally {
      console.log("Done reading");
    }
  }

  // ADDING ITEM TO DATABASE
  const saveItemToDb = async (lat, lng) => {
    try {
      console.log('saving to db: ' + lat + ' ' + lng)
      const dbResult = await addItem(lat, lng);
    }
    catch(err){
      console.log("Error " + err)
    }
  };

  //Choosing location on the map
  const selectLocationHandler=(par)=>{
    console.log("Select Location handler ");
    //console.log(par);
    console.log("LAT="+par.nativeEvent.coordinate.latitude);
    console.log("LNG="+par.nativeEvent.coordinate.longitude);

    //Getting values of latitude and longitude of par.nativeEvent.coordinate
    var {latitude, longitude}=par.nativeEvent.coordinate;
    //console.log(latitude, longitude)
    //Making a new object: coords:{latitude:theValueOfLatitude, longitude:theValueOfLongitude} which is proper for 
    //text elements in the UI part
    setLocation({coords:par.nativeEvent.coordinate});
    setLat(latitude);
    setLng(longitude);
    saveItemToDb(lat, lng) // inserting data to db
    getItems(); // fetching data
    //setMapRegion({ latitude: latitude, longitude: longitude, latitudeDelta: 0.1, longitudeDelta: 0 });
  }

  // Showing previous markers
  const showPrevMarkersHandler = () => {
    if(prevMarkers) {
      setPrevMarkers(false);
    } else {
      setPrevMarkers(true);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headertxt}>Save A Location</Text>
      </View>
      <ShowMarkers showPrevMarkers={showPrevMarkersHandler} showMarkers={prevMarkers} selectLocation={selectLocationHandler} 
      lat = {lat} lng={lng} itemList={itemList} latdelta={latdelta} landelta={landelta}/>
       <View style={styles.flatlistwrapper}>
         <FlatList 
            style = {styles.flatlist}
            keyExtractor={(item) => item.id.toString()}
            data={itemList} 
            renderItem={itemData => 
              <TouchableOpacity style = {styles.listitem}activeOpacity = {0.3} onLongPress={()=>{deleteItem(itemData.item.id);
                getItems();}}>
              <View style = {styles.list} >
              <Text style={styles.listid}>{itemData.item.id}.</Text>
              <Text style={styles.title}>LATITUDE: </Text><Text style={styles.listtext}>{itemData.item.lat}</Text>
              <Text style={styles.title}>LONGITUDE: </Text><Text style={styles.listtext}>{itemData.item.lng}</Text>
              </View> 
              </TouchableOpacity>
          }/>
       </View>
    </View>
  );
}

const ShowMarkers=(props)=>{
  if (props.showMarkers === true){
    return(
      <View style={styles.mapwrapper}>
        <TouchableOpacity style = {styles.btn} activeOpacity = {0.3} onPress={props.showPrevMarkers}>
        <Text style={styles.btntxt}>BACK TO YOUR LOCATION</Text>
        </TouchableOpacity>
        <MapView 
        region={{
        longitude: props.lng,
        latitude: props.lat,
        longitudeDelta: props.latdelta,
        latitudeDelta: props.landelta}} 
        style = {styles.map} onLongPress={props.selectLocation}>
        {props.itemList.map(marker => (
          <Marker 
            key = {marker.id}
            coordinate={{
            longitude: parseFloat(marker.lng) ? parseFloat(marker.lng) : 0,
            latitude: parseFloat(marker.lat) ? parseFloat(marker.lat) : 0}}
            title={'Prev marker'}/>
          ))}
       </MapView>
      </View>)
   }
   else{ 
      return (
      <View  style={styles.mapwrapper}>
      <TouchableOpacity style = {styles.btn} activeOpacity = {0.3} onPress={props.showPrevMarkers}>
      <Text style={styles.btntxt}>GET PREV LOCATIONS</Text>
      </TouchableOpacity>
      <MapView region={{
      longitude: props.lng,
      latitude: props.lat,
      longitudeDelta: props.latdelta,
      latitudeDelta: props.landelta}} 
      style = {styles.map} onLongPress={props.selectLocation}>
      <Marker coordinate={{
      longitude: props.lng ? props.lng : 0,
      latitude: props.lat ? props.lat : 0}}></Marker>
      </MapView>
      </View>)
   }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
  },

  header :{
    backgroundColor: '#2b1391',
    width: '100%',
    height: '10%',
    paddingTop: 30,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },

  headertxt:{
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20
  },

  mapwrapper: {
    height: '50%',
    marginBottom: 25
  },

  btn: {
    backgroundColor: '#f2a618',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },

  btntxt: {
    color: 'white',
    fontWeight: 'bold'
  },

  map: {
    width: '100%',
    height: '100%'
  },

  flatlistwrapper : {
    height: '40%',
    width: '100%',
    padding: 10,
    justifyContent: 'center'
  },

  flatlist: {
    height: '30%',
  },

  list : {
    //flexDirection: "row",
    //alignItems: 'center'
  },

  listitem: {
    padding: 10,
    borderWidth: .5,
    borderColor: '#2b1391',
    borderRadius: 5,
    width: '100%',
    marginBottom: 5
  },

  listid: {
    color: '#2b1391',
    fontSize: 15,
    fontWeight: 'bold'
  },

  listtext: {
    fontSize: 12,

  },

  title: {
    color: "#2b1391",
    marginTop: 5,
  }

});
