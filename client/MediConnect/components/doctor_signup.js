import React from 'react';
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
import {Notifications} from 'react-native-notifications';

class DoctorSignUp extends Component {
	state = {
		firstName: '',
		lastName: '',
		email: '',
		password: '',
	};

	handleFirstName = (text) => {
		this.setState({firstName: text});
	};

	handleLastName = (text) => {
		this.setState({lastName: text});
	};

	handleEmail = (text) => {
		this.setState({email: text});
	};

	handlePassword = (text) => {
		this.setState({password: text});
	};

	async signup() {
		axios
			.post('http://54.176.99.202:5000/doctor/signup', {
				//  axios.post('http://10.0.2.2:5000/doctor/signup', {
				first_name: this.state.firstName,
				last_name: this.state.lastName,
				email: this.state.email,
				password: this.state.password,
			})
			.then((res) => {
				// console.log(res.data);
				global.userID = res.data.user;
				console.log(global.userID);

				global.first_name = res.data.first_name;
				global.last_name = res.data.last_name;
				global.rating = res.data.rating;
				global.specialization = res.data.specialization;
				global.verified = res.data.verified;
				global.age = res.data.age;
				global.appointments = res.data.appointments;
				global.email = res.data.email;
				global.years_of_experience = res.data.years_of_experience;

				this.handleNotif();
			})
			.catch((err) => {
				console.log(err.response);
				// alert(
				// 	err.response.data.first_name +
				// 		'\n' +
				// 		err.response.data.last_name +
				// 		'\n' +
				// 		err.response.data.email +
				// 		'\n' +
				// 		err.response.data.password,
				// );
			});
	}

	handleNotif = () => {
		// alert('You have signed up successfully!');
		console.log(global.userID);

		var title = 'Thank you for signing up';
		var body = "We are so glad that you've chosen to join MediConnect!";

		Notifications.postLocalNotification({
			title: title,
			body: body,
			// sound: "chime.aiff",
			silent: false,
		});

		axios
			.post(
				'http://54.176.99.202:5000/doctor/notif/',
				{
					// axios.post('http://10.0.2.2:5000/doctor/notif/', {
					userId: global.userID,
					title: title,
					text: body,
				},
				{
					headers: {
						Cookie: global.jwt,
					},
				},
			)
			.then((res) => {
				// console.log(res.data);
				console.log(res.data);

				this.props.navigation.navigate('DoctorSignIn');
			})
			.catch((err) => {
				console.log(err.response);
			});
	};

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
								testID="doctorToggle"
								style={styles.toggletextDoctor}
							>
								<Text>DOCTOR</Text>
							</TouchableOpacity>
						</View>
						<View style={styles.togglePatient}>
							<TouchableOpacity testID="patientToggle">
								<Text
									style={styles.buttonText}
									onPress={() =>
										this.props.navigation.navigate('PatientSignUp')
									}
								>
									PATIENT
								</Text>
							</TouchableOpacity>
						</View>
					</View>
					<View style={styles.accountbox}>
						<View>
							<TextInput
								testID="firstname"
								style={styles.text}
								underlineColorAndroid="gray"
								placeholder="First Name"
								autoCapitalize="none"
								onChangeText={this.handleFirstName}
								required
							/>
						</View>
						<View>
							<TextInput
								testID="lastname"
								style={styles.text}
								underlineColorAndroid="gray"
								placeholder="Last Name"
								autoCapitalize="none"
								onChangeText={this.handleLastName}
								required
							/>
						</View>
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
						<View>
							<TouchableOpacity
								testID="signup_button"
								style={styles.submitButton}
								onPress={() =>
									this.signup(
										this.state.firstName,
										this.state.lastName,
										this.state.email,
										this.state.password,
									)
								}
							>
								<Text style={styles.submitButtonText}> SIGN UP </Text>
							</TouchableOpacity>
						</View>
					</View>
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
		fontFamily: 'Iowan Old Style',
		width: '100%',
		height: '100%',
	},

	accountbox: {
		alignSelf: 'center',
		backgroundColor: '#02f0c8',
		borderRadius: 10,
		shadowColor: 'black',
		shadowOpacity: 1,
		shadowRadius: 4.65,
		elevation: 8,
		width: 270,
		marginTop: 0,
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
		fontFamily: 'Iowan Old Style',
		color: '#5c5c5c',
		fontSize: 15,
	},

	toggle: {
		flexDirection: 'row',
		backgroundColor: '#d9d9d9',
		width: 270,
		height: 40,
		borderRadius: 7,
		margin: 10,
		fontFamily: 'Iowan Old Style',
	},

	toggleDoctor: {
		alignItems: 'center',
		justifyContent: 'center',
		width: 135,
		backgroundColor: '#02f0c8',
		borderRadius: 7,
		color: 'white',
		fontSize: 50,
	},

	togglePatient: {
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

export default DoctorSignUp;
