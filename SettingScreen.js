import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Picker,
  ToastAndroid,
  AsyncStorage,
} from 'react-native';

type Props = {};
export default class SettingScreen extends Component<Props>{
  static navigationOptions =  ({navigation}) => ({
    title: 'Settings',
  });

  constructor(props){
    super(props)

    this.state = {
      bg: '',
      cd: '',
   };
 }

  componentDidMount() {
   this._readSettings();
 }

   async _saveSetting(key, value) {
   try {
     await AsyncStorage.setItem(key, value);
   } catch (error) {
     console.log('## ERROR SAVING ITEMS ##: ', error);
   }
  }

  async _readSettings() {
   try {
      let bg = await AsyncStorage.getItem('bg');
      if (bg !== null) {
          this.setState({bg: bg});
        }
      let cd = await AsyncStorage.getItem('cd');
      if (cd !== null) {
          this.setState({cd: cd});
        }
       } catch (error) {
         console.log('## ERROR READING ITEMS ##: ', error);
        }
  }

  render(){
    return(
      <View style={styles.container}>

       <Text style={styles.label}>Wallpaper: </Text>
       <Picker style={styles.picker}
            mode={'dialog'}
            prompt={'Wallpaper'}
            selectedValue={this.state.bg}
            onValueChange={
              (itemValue, itemIndex) => {
                if(itemValue !== ""){
                this.setState({bg: itemValue});
                this._saveSetting('bg', itemValue);
                ToastAndroid.show('Changing of wallpaper occurred after restarting the application',ToastAndroid.LONG)
              }
                }}
        >
              <Picker.Item label="-Select Wallpaper-" value="" />
              <Picker.Item label="Default" value="0" />
              <Picker.Item label="Mind" value="1" />
              <Picker.Item label="Peace" value="2" />

        </Picker>



         <Text style={styles.label}>Countdown Timer: </Text>
         <TextInput
           style={styles.countdown}
           onValueChange={(itemValue,itemIndex) => {
             if(itemValue !== ""){
             this.setState({cd: itemValue});
             this._saveSetting('cd', itemValue)
           }
           }}
           value={this.state.cd}
           placeholder='Set Countdown Time in Seconds'
           underlineColorAndroid={'transparent'}
           keyboardType={'numeric'}
         />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    padding: 20,
    backgroundColor: '#FFF'
  },
  label:{
    fontSize: 20,
    fontWeight:'bold',
    color:'black'
  },
  picker:{
    color:'gray',
    marginBottom: 100
  },
  countdown:{
    fontSize: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e4e2',
  }
});
