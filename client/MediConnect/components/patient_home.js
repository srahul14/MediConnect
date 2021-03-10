//import { NavigationHelpersContext } from '@react-navigation/native';
import React from 'react';
import 'react-native-paper';
import {Component} from 'react';
import {
	Text,
	View,
	StyleSheet,
	TouchableOpacity,
	Image,
	ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import {Notifications} from 'react-native-notifications';
import {Calendar} from 'react-native-calendars';
import axios from 'axios';

class PatientHome extends Component {
	constructor(props) {
		super(props);
		this.state = {
			first_name: '',
			last_name: '',
			email: '',
			age: 0,
			gender: '',
			weight: 0,
			height: 0,
			appointmentsArray: [{id: '', createdAt: '', doctorId: '', end_time: ''}],
			appointmentDates: [null],
			no_appointments: true,
		};
		// this will fire every time Page 1 receives navigation focus
		this.props.navigation.addListener('focus', () => {
			this.setState({first_name: global.first_name});
			this.setState({last_name: global.last_name});
			this.setState({email: global.email});
			this.setState({age: global.age});
			this.setState({gender: global.gender});
			this.setState({weight: global.weight});
			this.setState({height: global.height});
		});

		if (global.age === 0 || global.rating === 0) {
			var title;
			var body;

			title = 'Update Account Information';
			body =
				"Don't forget to update your information on the Account Page in the Settings Tab.";
			// alert("Don't forget to update your information on the Account Page in the Settings Tab.")
			Notifications.postLocalNotification({
				title: title,
				body: body,
				// sound: "chime.aiff",
				silent: false,
			});

			axios
				.post(
					'http://54.176.99.202:5000/patient/notif/',
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
				})
				.catch((err) => {
					console.log(err.response);
				});
		}

		this.getDates();
	}

	async getDates() {
		const uid = global.userID;

		axios
			// .get("http://10.0.2.2:5000/patient/appointment/" + uid,
			.get(
				'http://54.176.99.202:5000/patient/appointment/' + uid,
				{},
				{
					headers: {
						Cookie: global.jwt,
					},
				},
			)
			.then((res) => {
				console.log(global.jwt);
				this.setState({
					serverData: Object.keys(res.data),
					no_appointments: res.data.appointments.length > 0 ? false : true,

					// appointmentsArray: Object.values(res.data.appointments),
				});

				var dates = [];

				if (this.state.no_appointments === false) {
					this.setState({
						appointmentsArray: Object.values(res.data.appointments),
					});

					for (
						var i = 0;
						i < Object.values(this.state.appointmentsArray).length;
						i++
					) {
						dates[i] = Object.values(this.state.appointmentsArray)[
							i
						].start_time.substring(0, 10);
					}
					var obj = dates.reduce(
						(c, v) => Object.assign(c, {[v]: {selected: true}}),
						{},
					);
					this.setState({appointmentDates: obj});

					console.log(this.state.appointmentDates);
				}
			})
			.catch((err) => console.log(err));
		//}).catch((err) => console.log(err));
	}

	refresh() {
		this.forceUpdate();
	}

	render() {
		console.log(global.first_name);
		return (
			<ScrollView style={styles.big}>
				<View testID="homepage" style={styles.container}>
					<View style={styles.welcome}>
						<View style={styles.welcomeImage}>
							<Image source={require('../assets/logo.png')} />
						</View>
						<LinearGradient
							start={{x: 0.8, y: 1}}
							end={{x: 0.7, y: 0.8}}
							colors={['#ffffff', '#ffffff', 'rgba(2, 217, 188, 0.2)']}
							// style={styles.welcomeTextContainer}
						>
							<Text style={styles.welcomeText}>
								Welcome, {global.first_name} {global.last_name}!
							</Text>
						</LinearGradient>
					</View>

					<TouchableOpacity
						testID="report_symptoms_button"
						style={styles.button}
					>
						<Text
							style={styles.buttonText}
							onPress={() => this.props.navigation.navigate('Symptoms')}
						>
							Report Symptoms
						</Text>
					</TouchableOpacity>

					<View style={styles.header}>
						<Icon style={styles.icon} name="user" size={25} color={'#5c5c5c'} />
						<Text style={styles.headerText}>Account Details</Text>
					</View>
					<View style={styles.infobox}>
						<View>
							{/* <Text style={styles.text}>First Name : {global.first_name}</Text>
						<Text style={styles.text}>Last Name : {global.last_name}</Text> */}
							<Text style={styles.text}>Email : {global.email}</Text>
							<Text style={styles.text}>Age : {global.age} years</Text>
							<Text style={styles.text}>Gender : {global.gender}</Text>
							<Text style={styles.text}>Height : {global.height} cm</Text>
							<Text style={styles.text}>Weight : {global.weight} kg</Text>
						</View>
					</View>

					<View style={styles.header}>
						<Icon
							style={styles.icon}
							name="calendar"
							size={25}
							color={'#5c5c5c'}
						/>
						<Text style={styles.headerText}>Upcoming Appointments</Text>
					</View>
					<View style={styles.appointmentsContainer}>
						<Calendar
							// onDayPress={this.onDayPress}
							style={styles.calendar}
							hideExtraDays
							markedDates={this.state.appointmentDates}
							theme={{
								selectedDayBackgroundColor: '#02d9b5',
								todayTextColor: '#02d9b5',
								arrowColor: '#02d9b5',
							}}
						/>
					</View>
				</View>
			</ScrollView>
		);
	}
}

const styles = StyleSheet.create({
	big: {
		backgroundColor: 'white',
	},

	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'white',
		fontFamily: 'Iowan Old Style',
		width: '100%',
		height: '100%',
	},

	welcome: {
		width: '100%',
		height: 220,
		// marginBottom: 10,
		marginTop: 10,
	},

	welcomeImage: {
		height: '75%',
		alignItems: 'center',
		justifyContent: 'center',
		// marginBottom: 20,
	},

	userIcon: {
		height: 100,
	},

	user_icon: {
		borderRadius: 5,
		shadowColor: 'black',
		shadowOpacity: 1,
		shadowRadius: 2.45,
		padding: 20,
		width: 20,
		height: 20,
	},

	infobox: {
		alignSelf: 'center',
		backgroundColor: '#02f0c8',
		borderRadius: 10,
		shadowColor: 'black',
		shadowOpacity: 0.5,
		shadowRadius: 4.65,
		elevation: 8,
		width: 330,
		padding: 20,
		marginBottom: 10,
	},

	button: {
		backgroundColor: '#02f0c8',
		padding: 10,
		marginTop: 25,
		marginBottom: 10,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: 'black',
		borderRadius: 7,
		shadowOpacity: 1.5,
		shadowRadius: 4.65,
		elevation: 8,
	},

	buttonText: {
		fontFamily: 'Iowan Old Style',
		fontSize: 21,
		color: '#5c5c5c',
	},

	text: {
		fontFamily: 'Iowan Old Style',
		color: '#5c5c5c',
		fontSize: 17,
	},

	welcomeText: {
		fontFamily: 'Iowan Old Style',
		color: '#5c5c5c',
		fontSize: 20,
		paddingLeft: 40,
		paddingTop: 10,
		paddingBottom: 10,
		// backgroundColor: '#d9d9d9',
	},

	doctor: {
		borderRadius: 7,
		backgroundColor: '#d9d9d9',
		height: 150,
		width: 270,
		margin: 20,
		shadowColor: 'black',
		shadowOpacity: 1,
		shadowRadius: 4.65,
		elevation: 8,
		padding: 20,
		alignSelf: 'center',
	},

	doctorinfo: {
		fontFamily: 'Iowan Old Style',
		color: 'black',
		fontSize: 12,
	},

	header: {
		flexDirection: 'row',
		paddingBottom: 10,
		marginTop: 20,
		width: '100%',
		paddingLeft: 40,
	},

	headerText: {
		fontSize: 20,
		fontFamily: 'Iowan Old Style',
		color: '#5c5c5c',
	},

	icon: {
		paddingRight: 10,
	},

	calendar: {
		borderTopWidth: 1,
		paddingTop: 5,
		borderBottomWidth: 1,
		borderColor: '#eee',
		height: 350,
	},

	appointmentsContainer: {
		marginTop: 20,
	},
});

export default PatientHome;
