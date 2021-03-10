//import { NavigationHelpersContext } from '@react-navigation/native';
import React from 'react';
import '../components/user_info';
import {Component} from 'react';
import {
	Text,
	View,
	Image,
	StyleSheet,
	TextInput,
	TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';

// import CookieManager from 'react-native-cookies';
// import AsyncStorage from '@react-native-community/async-storage';
// const { signIn } = React.useContext(AuthContext);

// import UserContext from './user_context';

class PatientSignIn extends Component {
	state = {
		email: '',
		password: '',
		emailList: [],
		// passwordList: [],
		serverData: [],
		user: '',
	};

	handleEmail = (text) => {
		this.setState({email: text});
	};

	handlePassword = (text) => {
		this.setState({password: text});
	};

	// componentDidMount = () => {
	// 	axios
	// 		.get('http://54.183.200.234:5000/doctor')
	// 		.then((response) => {
	// 			this.setState({
	// 				serverData: response.data,
	// 			});

	// 			this.getEmailList();
	// 			// this.getPasswordList();
	// 		})
	// 		.catch((error) => {
	// 			console.log(error.data);
	// 		});
	// };

	async signin() {
		// axios.post("http://54.183.200.234:5000/patient/signin", {
		axios
			// .post('http://10.0.2.2:5000/patient/signin', {
			.post('http://54.176.99.202:5000/patient/signin', {
				email: this.state.email,
				password: this.state.password,
				// email: 'p@gmail.com',
				// password: '12345678',
			})
			.then((res) => {
				console.log(res.data);

				this.setState({
					user: res.data,
					cookie: res.headers['set-cookie'],
				});

				// UserContext.user.id = res.data;
				global.userID = res.data.user;
				console.log(global.userID);

				// CookieManager.get("http://54.183.200.234:5000/doctor/signin")
				//     .then((res) => {
				//         console.log('CookieManager.get =>', res); // => 'user_session=abcdefg; path=/;'
				//     });

				this.getUserInfo();

				// this.props.navigation.navigate('PatientHomeNavigator');
			})
			.catch((err) => {
				console.log(err.response.data);
				// alert(err.response.data.email + '\n' + err.response.data.password);
			});
	}

	async getUserInfo() {
		console.log('in get user info');

		// axios.get('http://10.0.2.2:5000/patient/' + global.userID, {
		axios
			.get('http://54.176.99.202:5000/patient/' + global.userID, {})
			.then((res) => {
				console.log('Getting patient data');
				console.log(res.data);
				global.first_name = res.data.first_name;
				global.last_name = res.data.last_name;
				global.age = res.data.age;
				global.appointments = res.data.appointments;
				global.email = res.data.email;
				global.gender = res.data.gender;
				global.weight = res.data.weight;
				global.height = res.data.height;

				// console.log(res.data);

				this.props.navigation.navigate('PatientHomeNavigator');
			})
			.catch((err) => {
				console.log(err.response);
			});
	}

	render() {
		return (
			<LinearGradient
				start={{x: 0.0, y: 0.25}}
				end={{x: 0.7, y: 1}}
				colors={['#ffffff', '#ffffff', 'rgba(2, 217, 188, 0.2)']}
				style={styles.LinearGradient}
			>
				<View style={styles.container}>
					<Image
						style={styles.logo}
						source={require('../assets/logo.png')}
						resizeMode="stretch"
					/>
					<View style={styles.toggle}>
						<View style={styles.toggleDoctor}>
							<TouchableOpacity
								style={styles.toggletextDoctor}
								onPress={() => this.props.navigation.navigate('DoctorSignIn')}
							>
								<Text>DOCTOR</Text>
							</TouchableOpacity>
						</View>
						<View style={styles.togglePatient}>
							<TouchableOpacity>
								<Text style={styles.buttonText}>PATIENT</Text>
							</TouchableOpacity>
						</View>
					</View>
					<View style={styles.loginbox}>
						<View>
							<TextInput
								testID="email"
								style={styles.text}
								underlineColorAndroid="gray"
								placeholder="Email"
								autoCapitalize="none"
								onChangeText={this.handleEmail}
								required
							/>
						</View>
						<View>
							<TextInput
								testID="password"
								style={styles.text}
								secureTextEntry={true}
								underlineColorAndroid="gray"
								placeholder="Password"
								autoCapitalize="none"
								onChangeText={this.handlePassword}
								required
							/>
						</View>

						<TouchableOpacity
							testID="signin_button"
							style={styles.submitButton}
							onPress={() => this.signin()}
						>
							<Text style={styles.submitButtonText}> LOGIN </Text>
						</TouchableOpacity>
					</View>
					{/* <Text>{this.state.serverData}</Text> */}
					{/* <View>{this.state.serverData.map(serverData =><Text key={serverData.password}>{serverData.email}</Text>)}</View> */}
				</View>
			</LinearGradient>
		);
	}
}

const styles = StyleSheet.create({
	LinearGradient: {
		width: '100%',
		height: '100%',
	},

	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		// margin: "15%",
		fontFamily: 'Iowan Old Style',
		width: '100%',
		height: '100%',
		// backgroundColor: linear-gradient(#00ff99 29%, #00ffff 100%);
	},

	loginbox: {
		alignSelf: 'center',
		backgroundColor: '#02f0c8',
		borderRadius: 10,
		shadowColor: 'black',
		shadowOpacity: 1,
		shadowRadius: 4.65,
		elevation: 8,
		// height: 300,
		width: 270,
		// marginTop: 20,
		padding: 20,
	},

	submitButton: {
		backgroundColor: 'white',
		padding: 10,
		margin: 15,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: 'black',
		borderRadius: 7,
	},

	submitButtonText: {
		fontFamily: 'Iowan Old Style',
		fontSize: 17,
		color: '#5c5c5c',
	},

	text: {
		color: '#5c5c5c',
		fontSize: 15,
	},

	toggle: {
		// alignItems: "center",
		// justifyContent: "center",
		flexDirection: 'row',
		backgroundColor: '#d9d9d9',
		width: 270,
		height: 40,
		borderRadius: 7,
		margin: 10,
	},

	togglePatient: {
		// color:"#5c5c5c",
		alignItems: 'center',
		justifyContent: 'center',
		width: 135,
		backgroundColor: '#02f0c8',
		borderRadius: 7,
		color: 'white',
	},

	toggleDoctor: {
		justifyContent: 'center',
		alignItems: 'center',
		width: 135,
		borderRadius: 7,
	},

	logo: {
		marginBottom: 0,
		height: 180,
		width: 180,
	},
});

export default PatientSignIn;
