import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  Image,
  View,
  TouchableOpacity,
  TouchableHighlight,
  AsyncStorage,
  FlatList,
  Alert,
} from 'react-native';
let SQLite = require('react-native-sqlite-storage');
let config = require('./Config');
let bg0 = require('./img/default.png');
let bg1 = require('./img/bg1.jpg');
let bg2 = require('./img/bg2.jpg');

type Props = {};
export default class HomeScreen extends Component<Props> {
  static navigationOptions = ({navigation}) => ({
    title: 'Event Countdown & Reminder',

    headerRight: <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
    <Image source={require('./img/setting.png')} style={{width: 40, height: 40, marginRight: 10}}/></TouchableOpacity>

  });

  constructor(props) {
    super(props)

    this.state = {
      events:[],
      isFetching: false,
      bg: '',
    };

    this._query = this._query.bind(this);
    this._load = this._load.bind(this);

    this.db = SQLite.openDatabase({name: 'eventsdb', createFromLocation : '~db.sqlite'}, this.openDb, this.errorDb);
  }

  componentDidMount() {
    this._readSettings();
    if(this.db == null)
     this._load();
   else
     this._query();
  }

  async _readSettings() {
    try {
      let bg = await AsyncStorage.getItem('bg');
      if (bg !== '') {
        this.setState({bg: bg});
      }
    } catch (error) {
      console.log('## ERROR READING ITEM ##: ', error);
    }
  }

  getBg(){
    if(this.state.bg == '0')
      return bg0;
    else if(this.state.bg == '1')
      return bg1;
    else if(this.state.bg == '2')
      return bg2;
    else
      return bg0;
  }

  _query() {
     this.db.transaction((tx) => {
 tx.executeSql('SELECT * FROM events ORDER BY title', [], (tx, results) => {
           this.setState({
             events: results.rows.raw(),
           })
       })
     });
   }

   openDb() {
      console.log('Database opened');
  }

  errorDb(err) {
      console.log('SQL Error: ' + err);
  }

  _load() {
    let url = config.settings.serverPath + '/api/events';

    this.setState({isFetching: true});

    fetch(url)
    .then((response) => {
      if(!response.ok) {
        Alert.alert('Error', response.status.toString());
        throw Error('Error ' + response.status);
      }

      return response.json()
    })
    .then((events) => {
      this.setState({events});
      this.setState({isFetching: false});
    })
    .catch((error) => {
      console.log(error)
    });
  }

  render() {
    return (
      <View style={styles.container}>
      <Image style={{height: '100%', width: '100%', position:'absolute'}}
      source={this.getBg()}/>

      <View style={styles.innerFrame}>
        <FlatList
          data={ this.state.events }
          extraData={this.state}
          showsVerticalScrollIndicator={ true }
          renderItem={({item}) =>
            <TouchableHighlight
              underlayColor={'#cccccc'}
              onPress={ () => {
                this.props.navigation.navigate('View', {
                                  id: item.id,
                                  headerTitle: item.title,
                                  refresh: this._query,
                                  refresh2: this._load,
                                })
              }}
              onLongPress={ () => {
                this.props.navigation.navigate('Edit', {
                                  id: item.id,
                                  headerTitle: item.title,
                                  refresh: this._query,
                                  homeRefresh: this._query,
                                  refresh2: this._load,
                                  indexRefresh: this._load,
                                })
              }}
            >
              <View style={styles.item}>
                <Text style={styles.itemTitle}>{ item.title }</Text>
                <Text style={styles.itemDate}>{item.dateText}</Text>
              </View>
            </TouchableHighlight>
          }
          keyExtractor={(item) => {item.id.toString()}}
        />

        <TouchableOpacity
            style={styles.map}
            onPress={ () => {
              this.props.navigation.navigate('Map')
            }}
          >
            <Image source={require('./img/location.png')} style={{width: 40, height: 40, justifyContent: 'center'}}/>
        </TouchableOpacity>

        <TouchableOpacity
            style={styles.btn}
            onPress={ () => {
              this.props.navigation.navigate('Add',{
                refresh: this._query,
                refresh2: this._load,
              })
            }}
          >
            <Text style={styles.plus}>+</Text>
        </TouchableOpacity>
        </View>
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'stretch',
    backgroundColor: '#FFF',
  },
  item: {
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
    borderBottomWidth: 1,
  },
  itemTitle: {
    color:'white',
    fontSize: 21,
    fontWeight: 'bold',
  },
  itemDate: {
    color:'white',
    fontSize: 18,
  },
  map:{
    position:'absolute',
    width:50,
    height:50,
    backgroundColor:'#f88379',
    borderRadius:50,
    bottom:10,
    right:10,
    alignItems:'center',
    justifyContent:'center',
  },
  btn:{
    position:'absolute',
    width:50,
    height:50,
    backgroundColor:'#f88379',
    borderRadius:50,
    bottom:10,
    right:10,
    alignItems:'center',
    justifyContent:'center',
    marginBottom: 75
  },
  plus:{
    color:'black',
    fontSize:40
  },
  innerFrame:{
    flex:1,
    backgroundColor:'rgba(0,0,0,0.5)'
  }
});
