import React, { Component } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  TextInput,
  Text,
  View,
  ScrollView,
  AsyncStorage,
} from 'react-native';
import {
  InputWithLabel,
} from './UI';
import { FloatingAction } from 'react-native-floating-action';
let SQLite = require('react-native-sqlite-storage');
let config = require('./Config');
import CountDown from 'react-native-countdown-component';

const actions = [{
  text: 'Edit',
  color: '#f88379',
  icon: require('./img/edit.png'),
  name: 'edit',
  position: 2
},{
  text: 'Delete',
  color: '#f88379',
  icon: require('./img/delete.png'),
  name: 'delete',
  position: 1
}];

type Props = {};
export default class ViewScreen extends Component<Props> {
  static navigationOptions = ({navigation}) => {
    return {
      title: navigation.getParam('headerTitle')
    };
  };

  constructor(props) {
    super(props)

    this.state = {
      id: this.props.navigation.getParam('id'),
      event: null,
      cd: '',
    };

    this._query = this._query.bind(this);
    this._load = this._load.bind(this);
    this._delete = this._delete.bind(this);

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
      let cd = await AsyncStorage.getItem('cd');
      if (cd !== '') {
        this.setState({cd: cd});
        console.log('read');
      }
    } catch (error) {
      console.log('## ERROR READING ITEM ##: ', error);
    }
  }

  _query() {
    this.db.transaction((tx) => {
      tx.executeSql('SELECT * FROM events WHERE id = ?', [this.state.id], (tx, results) => {
        if(results.rows.length) {
          this.setState({
            event: results.rows.item(0),
          })
        }
      })
    });
  }

  _delete() {


    Alert.alert('Confirm Deletion', 'Delete '+ this.state.event.title +'?', [
      {
        text: 'No',
        onPress: () => {},
      },
      {
        text: 'Yes',

        onPress: () => {
        //SQLITE
          this.db.transaction((tx) => {
            tx.executeSql('DELETE FROM events WHERE id = ?', [this.state.id])
          });

         this.props.navigation.getParam('refresh')();
         this.props.navigation.goBack();


      //WEBAPI
          let url = config.settings.serverPath + '/api/events/' + this.state.id;

          fetch(url, {
            method: 'DELETE',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: this.state.id,
            }),
          })
          .then((response) => {
            if(!response.ok) {
              Alert.alert('Error', response.status.toString());
              throw Error('Error ' + response.status);
            }

            return response.json()
          })
          .then((responseJson) => {
            if(responseJson.affected == 0) {
              Alert.alert('Error deleting record');
            }

            this.props.navigation.getParam('refresh2')();
            this.props.navigation.goBack();
          })
          .catch((error) => {
            console.error(error);
          });
        },
      },
    ], { cancelable: false });
  }

  openDb() {
      console.log('Database opened');
  }

  errorDb(err) {
      console.log('SQL Error: ' + err);
  }

  _load() {
   let url = config.settings.serverPath + '/api/events/' + this.state.id;

   fetch(url)
   .then((response) => {
     if(!response.ok) {
       Alert.alert('Error', response.status.toString());
       throw Error('Error ' + response.status);
     }

     return response.json()
   })
   .then((event) => {
     this.setState({event});
   })
   .catch((error) => {
     console.error(error);
   });
 }

  render() {
    let event = this.state.event;

    return (
      <View style={styles.container}>
        <ScrollView>
          <InputWithLabel style={styles.output}
            label={'Event Title'}
            value={event ? event.title : ''}
            orientation={'vertical'}
            editable={false}
          />
          <InputWithLabel style={styles.output}
            label={'Event Date'}
            value={event ? event.dateText : ''}
            orientation={'vertical'}
            editable={false}
          />
          <InputWithLabel style={styles.output}
            label={'Event Time'}
            value={event ? event.timeText : ''}
            orientation={'vertical'}
            editable={false}
          />
          <InputWithLabel style={styles.output}
            label={'Event Description'}
            value={event ? event.desc : ''}
            multiline={true}
            orientation={'vertical'}
            editable={false}
          />
          <CountDown
              size={30}
              until={this.state.cd}
              onFinish={() => alert('Event #'+ event.id + ': ' + event.title + ' Times Up!')}
              digitStyle={{backgroundColor: '#FFF', borderWidth: 2, borderColor: 'red'}}
              digitTxtStyle={{color: 'red'}}
              timeLabelStyle={{color: 'red', fontWeight: 'bold'}}
              separatorStyle={{color: 'red'}}
              timeToShow={['H', 'M', 'S']}
              timeLabels={{m: null, s: null}}
              showSeparator
          />
        </ScrollView>
        <FloatingAction
          actions={actions}
          color={'#f88379'}
          floatingIcon={(
          <Text style={styles.float}>...</Text>
          )}
          onPressItem={(title) => {
              switch(title) {
                case 'edit':
                  this.props.navigation.navigate('Edit', {
                    id: event ? event.id : 0,
                    headerTitle: event ? event.title : '',
                    refresh: this._query,
                    homeRefresh: this.props.navigation.getParam('refresh'),
                    refresh2: this._load,
                    indexRefresh: this.props.navigation.getParam('refresh2'),
                  });
                  break;

                case 'delete':
                  this._delete();
                  break;
              }
            }
          }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF'
  },
  output: {
    fontSize: 19,
    color: 'black',
    marginTop: 10,
    marginBottom: 10,
    backgroundColor:'rgba(0,0,0,0.1)',
    borderRadius: 10,
  },
  float:{
    color:'white',
    fontSize:25,
    marginBottom:10
  }
});
