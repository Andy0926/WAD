import React, { Component } from 'react';
import {
    Platform,
    View,
    Text,
    TextInput,
    TouchableNativeFeedback,
    StyleSheet,
} from 'react-native';

class InputWithLabel extends Component<Props> {
    constructor(props) {
        super(props);

        this.orientation = this.props.orientation ? (this.props.orientation == 'horizontal' ? 'row' : 'column') : 'column';
    }

    render() {
        return (
            <View style={[inputStyles.container, {flexDirection: this.orientation}]}>
                <Text style={inputStyles.label}>
                    {this.props.label ? this.props.label : ''}
                </Text>
                <TextInput style={[inputStyles.input, this.props.style]}
                    placeholder={this.props.placeholder ? this.props.placeholder : ''}
                    value={this.props.value}
                    onChangeText={this.props.onChangeText}
                    multiline={this.props.multiline ? this.props.multiline : false}
                    keyboardType={this.props.keyboardType ? this.props.keyboardType : 'default'}
                    secureTextEntry={this.props.secureTextEntry ? this.props.secureTextEntry : false}
                    selectTextOnFocus={this.props.selectTextOnFocus ? this.props.selectTextOnFocus : false}
                    editable={this.props.editable !== null ? this.props.editable : true}
                />
            </View>
        )
    }
}

const inputStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    label: {
        flex: 1,
        color:'black',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 3,
        textAlignVertical: 'center',
    },
    input: {
        flex: 3,
        fontSize: 20,
    },
});



class AppButton extends Component {
    constructor(props) {
        super(props);

        if(props.theme) {
            switch(props.theme) {
                case 'update':
                    this.backgroundColor = 'firebrick';
                    break;
                case 'maps':
                    this.backgroundColor = 'springgreen';
                    break;
                case 'save':
                default:
                    this.backgroundColor = 'dodgerblue';
            }
        }
        else {
            this.backgroundColor = '#87CEFA';
        }
    }

    render() {
        return (
            <TouchableNativeFeedback
                onPress={this.props.onPress}
                onLongPress={this.props.onLongPress}
                background={Platform.OS === 'android' ? TouchableNativeFeedback.SelectableBackground() : ''}>
                <View style={[buttonStyles.button, this.props.style, {backgroundColor: this.backgroundColor}]}>
                    <Text style={buttonStyles.buttonText}>{this.props.title}</Text>
                </View>
            </TouchableNativeFeedback>
        )
    }
}

const buttonStyles = StyleSheet.create({
    button: {
        marginTop: 50,
        marginLeft: 100,
        marginRight: 100,
        alignItems: 'center',
        borderRadius: 10,
    },
    buttonText: {
        padding: 10,
        fontSize: 18,
        color: 'white'
    },
});

module.exports = {
    InputWithLabel: InputWithLabel,
    AppButton: AppButton,
}
