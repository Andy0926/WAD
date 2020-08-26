import {
  createStackNavigator,
} from 'react-navigation';
import HomeScreen from './HomeScreen';
import AddEvent from './AddEvent';
import ViewScreen from './ViewScreen';
import EditScreen from './EditScreen';
import SettingScreen from './SettingScreen';
import MapScreen from './MapScreen';
console.disableYellowBox = true;

export default createStackNavigator({

  Home: {
    screen: HomeScreen,
  },
  Add: {
    screen: AddEvent,
  },
  View: {
    screen: ViewScreen,
  },
  Edit: {
    screen: EditScreen,
  },
  Settings: {
    screen: SettingScreen,
  },
  Map: {
    screen: MapScreen,
  },

}, {

  initialRouteName: 'Home',

  navigationOptions: {

    headerStyle: {
        backgroundColor: '#f88379'
    },

    headerTintColor: 'black',

    headerTitleStyle: {
      fontWeight: 'bold',
    },

  },


});
