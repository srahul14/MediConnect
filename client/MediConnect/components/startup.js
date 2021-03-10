//import { NavigationHelpersContext } from '@react-navigation/native';
import React from 'react';
import {Component} from 'react';
import {Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

class StartUp extends Component {
	render() {
		return (
			<LinearGradient
				testID="startup"
				start={{x: 0.0, y: 0.25}}
				end={{x: 0.7, y: 1}}
				colors={['#ffffff', '#ffffff', 'rgba(2, 217, 188, 0.2)']}
				style={styles.container}
			>
				<Image
					testID="logo"
					source={require('../assets/logo.png')}
					resizeMode="stretch"
				/>
				<TouchableOpacity testID="signup" style={styles.button}>
					<Text
						style={styles.buttonText}
						onPress={() => this.props.navigation.navigate('DoctorSignUp')}
					>
						Sign Up
					</Text>
				</TouchableOpacity>
				<TouchableOpacity testID="signin" style={styles.button}>
					<Text
						style={styles.buttonText}
						onPress={() => this.props.navigation.navigate('DoctorSignIn')}
					>
						Sign In
					</Text>
				</TouchableOpacity>
			</LinearGradient>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		// margin: "15%",
		backgroundColor: 'white',
		fontFamily: 'Iowan Old Style',
		width: '100%',
		height: '100%',
		// backgroundColor: linear-gradient(#00ff99 29%, #00ffff 100%);
	},

	button: {
		// backgroundColor: 'white',
		padding: 10,
		margin: 15,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: 'black',
		// borderRadius: 7,
		// borderColor: '#02d9bc',
		// borderStyle: 'solid',
	},

	buttonText: {
		fontFamily: 'Iowan Old Style',
		fontSize: 25,
		color: '#02d9bc',
	},
});

export default StartUp;
