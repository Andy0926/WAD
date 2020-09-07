import React, { Component } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  DatePickerAndroid,
  TimePickerAndroid,
  ToastAndroid,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  AppButton,
} from './UI';
let SQLite = require('react-native-sqlite-storage');
let config = require('./Config');

Date.prototype.formatted = function() {
  let day = this.getDay();
  let date = this.getDate();
  let month = this.getMonth();
  let year = this.getFullYear();
  let daysText = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  let monthsText = [
    'Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec'
  ];

  return `${daysText[day]}, ${monthsText[month]} ${date}, ${year}`;
}

type Props = {};
export default class AddEvent extends Component<Props> {
  static navigationOptions = ({navigation}) => ({
    title: 'Add Event',
  });

  constructor(props) {
    super(props)

    this.state = {
     title: '',
     date: new Date(),
     dateText: '',
     hour: null,
     minute: null,
     timeText: '',
     desc: '',
    };

    this._insert = this._insert.bind(this);

    this.db = SQLite.openDatabase({name: 'eventsdb', createFromLocation : '~db.sqlite'}, this.openDb, this.errorDb);
  }


  openDatePicker = async () => {
      try {
        const {action, year, month, day} = await DatePickerAndroid.open({
          date: this.state.date,
          minDate: new Date(2000, 0, 1),
          maxDate: new Date(2099, 11, 31),
          mode: 'calendar', // try also with `spinner`
        });
        if (action !== DatePickerAndroid.dismissedAction) {
          // Selected year, month (0-11), day
          let selectedDate = new Date(year, month, day);

          this.setState({
            date: selectedDate,
            dateText: selectedDate.formatted(),
          });
        }
      } catch ({code, message}) {
        console.warn('Cannot open date picker', message);
      }
    }

    openTimePicker = async () => {
    try {
      const {action, hour, minute} = await TimePickerAndroid.open({
        hour: this.state.hour,
        minute: this.state.minute,
        is24Hour: false,
        mode: 'clock',  // try also with `spinner`
      });
      if (action !== TimePickerAndroid.dismissedAction) {
        // Selected hour (0-23), minute (0-59)
        this.setState({
          hour: hour,
          minute: minute,
          timeText: `${hour>9 ? hour : '0'+hour}:${minute>9 ? minute : '0'+minute}`,
        });
      }
    } catch ({code, message}) {
      console.warn('Cannot open time picker', message);
    }
  }

  _insert(){
    //SQLITE
   this.db.transaction((tx) => {
     tx.executeSql('INSERT INTO events(title,dateText,timeText,desc) VALUES(?,?,?,?)', [
       this.state.title,
       this.state.dateText,
       this.state.timeText,
       this.state.desc,
     ]);
   });
   ToastAndroid.show('Saved successfully', ToastAndroid.SHORT);

   this.props.navigation.getParam('refresh')();
   this.props.navigation.goBack();



   //WEBAPI
   let url = config.settings.serverPath + '/api/events';

  fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: this.state.title,
      dateText: this.state.dateText,
      timeText: this.state.timeText,
      desc: this.state.desc,
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
    if(responseJson.affected > 0) {
      Alert.alert('Record Saved', 'Record for ' + this.state.title + ' has been saved');
    }
    else {
      Alert.alert('Error saving record');
    }

    this.props.navigation.getParam('refresh2')();
    this.props.navigation.goBack();
  })
  .catch((error) => {
    console.error(error);
  });
  }

  render() {
    return (
      <ScrollView style={styles.container}>
          <Text style={styles.label}>Title: </Text>
          <TextInput
            style={styles.input}
            onChangeText={(title) => {
              this.setState({title});
            }}
            value={this.state.title}
            placeholder='Event Title'
            underlineColorAndroid={'transparent'}
          />


            <Text style={styles.label}>Date: </Text>
          <TouchableWithoutFeedback
            onPress={ this.openDatePicker }
          >
              <View>
                <TextInput
                  style={styles.input}
                  onChangeText={(dateText) => {
                    this.setState({dateText});
                  }}
                  value={this.state.dateText}
                  placeholder='Event Date'
                  editable={false}
                  underlineColorAndroid={'transparent'}
                />
              </View>
         </TouchableWithoutFeedback>


           <Text style={styles.label}>Time: </Text>
          <TouchableWithoutFeedback
                onPress={ this.openTimePicker }
              >
                <View>
                  <TextInput
                    style={styles.input}
                    onChangeText={(timeText) => {
                      this.setState({timeText});
                    }}
                    value={this.state.timeText}
                    placeholder='Event Time'
                    editable={false}
                    underlineColorAndroid={'transparent'}
                  />
                </View>
          </TouchableWithoutFeedback>


          <Text style={styles.label}>Description: </Text>
          <TextInput
            style={styles.input2}
            onChangeText={(desc) => {
              this.setState({desc});
            }}
            value={this.state.desc}
            placeholder='Event Description'
            underlineColorAndroid={'transparent'}
            multiline={true}
          />

          <AppButton style={styles.button}
          title={'Save'}
          theme={'save'}
          onPress={this._insert}
          />

        </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    padding: 20,
    backgroundColor: '#FFF'
  },
  input: {
    fontSize: 20,
    height: 48,
    color: 'black',
    borderBottomWidth: 2,
    borderBottomColor: '#BCC6CC',
    marginBottom: 10,
  },
  input2: {
    fontSize: 20,
    height: 100,
    color: 'black',
    borderWidth: 2,
    borderColor: '#BCC6CC',
    marginTop: 10,
    marginBottom: 10,
    textAlignVertical: 'top',
    borderRadius: 10
  },
  label: {
    fontSize: 20,
    fontWeight:'bold',
    color:'black'
  },
});
